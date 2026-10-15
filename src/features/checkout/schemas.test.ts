import { describe, expect, it } from "vitest";
import { checkoutSchema, shippingSchema } from "./schemas";

const valid = {
  recipientName: "  Nguyễn Thị Xinh ",
  phone: "+84 912 345 678",
  address: "12 Đường Hoa Cúc",
  ward: "Phường Bến Thành",
  province: "TP. Hồ Chí Minh",
  note: "",
};

describe("shippingSchema", () => {
  it("chuẩn hóa họ tên và số điện thoại", () => {
    const parsed = shippingSchema.parse(valid);
    expect(parsed.recipientName).toBe("Nguyễn Thị Xinh");
    expect(parsed.phone).toBe("0912345678");
  });
  it("báo lỗi tiếng Việt cho từng trường", () => {
    const result = shippingSchema.safeParse({
      ...valid,
      phone: "12345",
      address: "x",
      ward: "",
      province: "",
    });
    expect(result.success).toBe(false);
    const fields = result.error!.issues.map((i) => i.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["phone", "address", "ward", "province"]));
    expect(result.error!.issues.find((i) => i.path[0] === "phone")?.message).toContain(
      "Số điện thoại",
    );
  });
});

describe("checkoutSchema", () => {
  const base = {
    shipping: valid,
    paymentMethod: "cod",
    items: [{ productId: "00000000-0000-4000-8000-000000000001", quantity: 2 }],
    clientRequestId: "11111111-1111-4111-8111-111111111111",
  };
  it("hợp lệ", () => {
    expect(checkoutSchema.safeParse(base).success).toBe(true);
  });
  it("từ chối giỏ trống, số lượng > 10, phương thức lạ, id sai", () => {
    expect(checkoutSchema.safeParse({ ...base, items: [] }).success).toBe(false);
    expect(
      checkoutSchema.safeParse({
        ...base,
        items: [{ productId: base.items[0]!.productId, quantity: 11 }],
      }).success,
    ).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, paymentMethod: "momo_real" }).success).toBe(false);
    expect(
      checkoutSchema.safeParse({ ...base, items: [{ productId: "abc", quantity: 1 }] }).success,
    ).toBe(false);
  });
});
