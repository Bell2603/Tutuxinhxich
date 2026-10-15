import { describe, expect, it } from "vitest";
import { normalizePhone, normalizeVietnamese, VN_PHONE_REGEX } from "./text";

describe("normalizeVietnamese", () => {
  it("bỏ dấu, đ → d, chữ thường, gộp khoảng trắng", () => {
    expect(normalizeVietnamese("  Hoa Cúc   Sân Ga ")).toBe("hoa cuc san ga");
    expect(normalizeVietnamese("Đỏ Dâu")).toBe("do dau");
    expect(normalizeVietnamese("Xình Xịch")).toBe("xinh xich");
  });
});

describe("normalizePhone", () => {
  it("chuẩn hóa về dạng 0xxxxxxxxx", () => {
    expect(normalizePhone("+84 912 345 678")).toBe("0912345678");
    expect(normalizePhone("84912345678")).toBe("0912345678");
    expect(normalizePhone("0912.345.678")).toBe("0912345678");
  });
  it("regex chỉ nhận đầu số di động hợp lệ", () => {
    expect(VN_PHONE_REGEX.test("0912345678")).toBe(true);
    expect(VN_PHONE_REGEX.test("0312345678")).toBe(true);
    expect(VN_PHONE_REGEX.test("0212345678")).toBe(false);
    expect(VN_PHONE_REGEX.test("091234567")).toBe(false);
  });
});
