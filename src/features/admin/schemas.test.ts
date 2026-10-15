import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isAllowedImageUrl, productUpdateSchema, sanitizeOrderSearch } from "./schemas";

const base = {
  name: "Mây Hồng Kẹo Bông",
  shortDescription: "",
  description: "",
  material: "Satin",
  fabric: "satin",
  size: "70 × 70 cm",
  careInstructions: "",
  price: "289.000",
  compareAtPrice: "",
  stock: "24",
  badge: "",
  isVisible: true,
  isFeatured: false,
  sortOrder: "1",
  colors: [{ name: "Hồng", hex: "#FFB3D1", family: "hong" }],
  imageUrl: "/products/ttxx-001/main.webp",
  gallery: [],
};

let previous: string | undefined;
beforeEach(() => {
  previous = process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54421";
});
afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = previous;
});

describe("productUpdateSchema", () => {
  it("đọc giá dạng 289.000, giá gốc trống → null, nhãn trống → null", () => {
    const v = productUpdateSchema.parse(base);
    expect(v.price).toBe(289_000);
    expect(v.compareAtPrice).toBeNull();
    expect(v.badge).toBeNull();
    expect(v.stock).toBe(24);
  });
  it("giá gốc phải lớn hơn giá bán", () => {
    const r = productUpdateSchema.safeParse({ ...base, compareAtPrice: "200000" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["compareAtPrice"]);
    expect(productUpdateSchema.safeParse({ ...base, compareAtPrice: "349000" }).success).toBe(true);
  });
  it("chặn tồn kho âm, giá quá thấp, chữ thay số", () => {
    expect(productUpdateSchema.safeParse({ ...base, stock: "-1" }).success).toBe(false);
    expect(productUpdateSchema.safeParse({ ...base, price: "500" }).success).toBe(false);
    expect(productUpdateSchema.safeParse({ ...base, price: "abc" }).success).toBe(false);
  });
});

describe("isAllowedImageUrl", () => {
  it("chỉ nhận ảnh nội bộ hoặc trong bucket của shop", () => {
    expect(isAllowedImageUrl("/products/ttxx-001/main.webp")).toBe(true);
    expect(
      isAllowedImageUrl(
        "http://127.0.0.1:54421/storage/v1/object/public/product-images/ttxx-001/1-abc.webp",
      ),
    ).toBe(true);
    expect(isAllowedImageUrl("https://evil.com/x.webp")).toBe(false);
    expect(
      isAllowedImageUrl("http://127.0.0.1:54421/storage/v1/object/public/other-bucket/x.webp"),
    ).toBe(false);
    expect(
      isAllowedImageUrl("http://127.0.0.1:54421/storage/v1/object/public/product-images/../x.webp"),
    ).toBe(false);
    expect(isAllowedImageUrl("/products/../../etc/passwd")).toBe(false);
  });
});

describe("sanitizeOrderSearch", () => {
  it("bỏ ký tự có thể chèn cú pháp lọc", () => {
    expect(sanitizeOrderSearch("TT2610,status.eq.x)")).toBe("TT2610statuseqx");
    expect(sanitizeOrderSearch("  Nguyễn Xinh ")).toBe("Nguyễn Xinh");
  });
});
