import { describe, expect, it } from "vitest";
import { couponDiscount, couponLabel, normalizeCouponCode, parseCouponTerms } from "./domain";

const tenPercent = {
  discountType: "percent" as const,
  discountValue: 10,
  maxDiscount: 50_000,
  minSubtotal: 300_000,
};
const fixed30k = {
  discountType: "fixed" as const,
  discountValue: 30_000,
  maxDiscount: null,
  minSubtotal: 199_000,
};

describe("tính tiền giảm", () => {
  it("phần trăm làm tròn xuống 1.000₫ và không vượt mức tối đa", () => {
    expect(couponDiscount(tenPercent, 359_000)).toBe(35_000);
    expect(couponDiscount(tenPercent, 289_999)).toBe(28_000);
    expect(couponDiscount(tenPercent, 918_000)).toBe(50_000);
    expect(couponDiscount({ ...tenPercent, maxDiscount: null }, 918_000)).toBe(91_000);
  });
  it("số tiền cố định không vượt tạm tính", () => {
    expect(couponDiscount(fixed30k, 199_000)).toBe(30_000);
    expect(couponDiscount(fixed30k, 20_000)).toBe(20_000);
    expect(couponDiscount(fixed30k, 0)).toBe(0);
  });
});

describe("hiển thị & nhập mã", () => {
  it("mô tả điều kiện", () => {
    expect(couponLabel(tenPercent)).toBe("Giảm 10% (tối đa 50.000₫) cho đơn từ 300.000₫");
    expect(couponLabel({ ...fixed30k, minSubtotal: 0 })).toBe("Giảm 30.000₫");
  });
  it("chuẩn hóa mã khách nhập", () => {
    expect(normalizeCouponCode("  lentau 10 ")).toBe("LENTAU10");
    expect(normalizeCouponCode("chào-bạn")).toBe("CHOBN");
  });
  it("đọc kết quả RPC an toàn", () => {
    expect(
      parseCouponTerms({
        code: "LENTAU10",
        description: "",
        discount_type: "percent",
        discount_value: 10,
        max_discount: 50000,
        min_subtotal: 300000,
      }),
    ).toEqual({
      code: "LENTAU10",
      description: "",
      ...tenPercent,
    });
    expect(parseCouponTerms({ code: "X", discount_type: "free" })).toBeNull();
    expect(parseCouponTerms(null)).toBeNull();
  });
});
