import { describe, expect, it } from "vitest";
import {
  addLine,
  clampQuantity,
  FREE_SHIPPING_THRESHOLD,
  maxPurchasable,
  MAX_QTY_PER_ITEM,
  reconcileCart,
  removeLine,
  sanitizeLines,
  setLineQuantity,
  SHIPPING_FEE,
  shippingFeeFor,
  summarizeCart,
  type CartProduct,
} from "./domain";

const A = "00000000-0000-4000-8000-00000000000a";
const B = "00000000-0000-4000-8000-00000000000b";
const C = "00000000-0000-4000-8000-00000000000c";

function product(
  id: string,
  price: number,
  stock: number,
  overrides: Partial<CartProduct> = {},
): CartProduct {
  return {
    id,
    slug: id,
    sku: "TTXX-001",
    name: `SP ${id.slice(-1)}`,
    price,
    compareAtPrice: null,
    stock,
    imageUrl: "/x.webp",
    isVisible: true,
    ...overrides,
  };
}

describe("phí giao hàng", () => {
  it("30.000₫ dưới 500.000₫, miễn phí từ 500.000₫, 0 khi giỏ trống", () => {
    expect(shippingFeeFor(0)).toBe(0);
    expect(shippingFeeFor(199_000)).toBe(SHIPPING_FEE);
    expect(shippingFeeFor(FREE_SHIPPING_THRESHOLD - 1)).toBe(SHIPPING_FEE);
    expect(shippingFeeFor(FREE_SHIPPING_THRESHOLD)).toBe(0);
  });
});

describe("giới hạn số lượng", () => {
  it("tối đa min(tồn kho, 10)", () => {
    expect(maxPurchasable(5)).toBe(5);
    expect(maxPurchasable(24)).toBe(MAX_QTY_PER_ITEM);
    expect(maxPurchasable(0)).toBe(0);
    expect(maxPurchasable(-3)).toBe(0);
  });
  it("clampQuantity kẹp trong khoảng hợp lệ", () => {
    expect(clampQuantity(7, 5)).toBe(5);
    expect(clampQuantity(-1, 5)).toBe(0);
    expect(clampQuantity(2.7, 5)).toBe(2);
    expect(clampQuantity(Number.NaN, 5)).toBe(1);
  });
});

describe("addLine / setLineQuantity / removeLine", () => {
  it("thêm mới và gộp dòng trùng", () => {
    const first = addLine([], A, 2, 24);
    expect(first).toEqual({ lines: [{ productId: A, quantity: 2 }], added: 2 });
    const second = addLine(first.lines, A, 3, 24);
    expect(second).toEqual({ lines: [{ productId: A, quantity: 5 }], added: 3 });
  });
  it("không vượt tồn kho — báo số lượng thực sự thêm được", () => {
    const { lines } = addLine([], A, 4, 5);
    const more = addLine(lines, A, 3, 5);
    expect(more.added).toBe(1);
    expect(more.lines[0]?.quantity).toBe(5);
    const none = addLine(more.lines, A, 1, 5);
    expect(none.added).toBe(0);
    expect(none.lines).toBe(more.lines);
  });
  it("không thêm sản phẩm hết hàng", () => {
    expect(addLine([], A, 1, 0)).toEqual({ lines: [], added: 0 });
  });
  it("đặt số lượng, về 0 thì xóa dòng", () => {
    const lines = [
      { productId: A, quantity: 2 },
      { productId: B, quantity: 1 },
    ];
    expect(setLineQuantity(lines, A, 4, 24)).toEqual([
      { productId: A, quantity: 4 },
      { productId: B, quantity: 1 },
    ]);
    expect(setLineQuantity(lines, A, 99, 3)).toEqual([
      { productId: A, quantity: 3 },
      { productId: B, quantity: 1 },
    ]);
    expect(setLineQuantity(lines, A, 0, 24)).toEqual([{ productId: B, quantity: 1 }]);
    expect(removeLine(lines, B)).toEqual([{ productId: A, quantity: 2 }]);
  });
});

describe("summarizeCart", () => {
  const products = new Map([
    [A, product(A, 289_000, 24)],
    [B, product(B, 199_000, 30)],
    [C, product(C, 459_000, 5, { isVisible: false })],
  ]);

  it("tính tạm tính, phí ship, tổng", () => {
    const summary = summarizeCart([{ productId: A, quantity: 1 }], products);
    expect(summary).toMatchObject({
      subtotal: 289_000,
      shippingFee: 30_000,
      total: 319_000,
      itemCount: 1,
      amountToFreeShipping: 211_000,
    });
  });
  it("miễn phí ship khi đủ 500.000₫", () => {
    const summary = summarizeCart(
      [
        { productId: A, quantity: 1 },
        { productId: B, quantity: 2 },
      ],
      products,
    );
    expect(summary.subtotal).toBe(687_000);
    expect(summary.shippingFee).toBe(0);
    expect(summary.total).toBe(687_000);
    expect(summary.amountToFreeShipping).toBe(0);
  });
  it("bỏ qua sản phẩm ẩn/không tồn tại và kẹp theo tồn kho", () => {
    const summary = summarizeCart(
      [
        { productId: C, quantity: 1 },
        { productId: "missing", quantity: 1 },
        { productId: B, quantity: 50 },
      ],
      products,
    );
    expect(summary.items).toHaveLength(1);
    expect(summary.items[0]?.quantity).toBe(MAX_QTY_PER_ITEM);
    expect(summary.subtotal).toBe(1_990_000);
  });
  it("giỏ trống", () => {
    expect(summarizeCart([], products)).toMatchObject({
      subtotal: 0,
      shippingFee: 0,
      total: 0,
      itemCount: 0,
    });
  });
});

describe("reconcileCart", () => {
  it("báo và sửa: ngừng bán, hết hàng, giảm số lượng", () => {
    const products = new Map([
      [A, product(A, 1000, 2)],
      [B, product(B, 1000, 0)],
      [C, product(C, 1000, 9, { isVisible: false })],
    ]);
    const result = reconcileCart(
      [
        { productId: A, quantity: 5 },
        { productId: B, quantity: 1 },
        { productId: C, quantity: 1 },
      ],
      products,
    );
    expect(result.lines).toEqual([{ productId: A, quantity: 2 }]);
    expect(result.issues.map((i) => i.issue)).toEqual(["reduced", "out_of_stock", "unavailable"]);
  });
  it("giỏ hợp lệ không thay đổi", () => {
    const products = new Map([[A, product(A, 1000, 9)]]);
    expect(reconcileCart([{ productId: A, quantity: 2 }], products)).toEqual({
      lines: [{ productId: A, quantity: 2 }],
      issues: [],
    });
  });
});

describe("sanitizeLines (dữ liệu localStorage)", () => {
  it("loại dữ liệu hỏng, gộp trùng, giới hạn 10 và 6 dòng", () => {
    expect(sanitizeLines(null)).toEqual([]);
    expect(sanitizeLines("abc")).toEqual([]);
    expect(
      sanitizeLines([
        { productId: A, quantity: 3 },
        { productId: A, quantity: 9 },
        { productId: "not-a-uuid", quantity: 1 },
        { productId: B, quantity: -1 },
        { productId: B, quantity: "2" },
        null,
      ]),
    ).toEqual([{ productId: A, quantity: 10 }]);
  });
});
