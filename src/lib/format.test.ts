import { describe, expect, it } from "vitest";
import { discountPercent, formatDate, formatDateTime, formatVND, toaLabel } from "./format";

describe("formatVND", () => {
  it("định dạng theo kiểu Việt Nam", () => {
    expect(formatVND(289000)).toBe("289.000₫");
    expect(formatVND(1_250_000)).toBe("1.250.000₫");
    expect(formatVND(0)).toBe("0₫");
  });
  it("làm tròn và xử lý giá trị không hợp lệ", () => {
    expect(formatVND(1999.6)).toBe("2.000₫");
    expect(formatVND(Number.NaN)).toBe("0₫");
  });
});

describe("discountPercent", () => {
  it("tính phần trăm giảm", () => {
    expect(discountPercent(289000, 349000)).toBe(17);
    expect(discountPercent(199000, 239000)).toBe(17);
  });
  it("trả 0 khi không giảm giá", () => {
    expect(discountPercent(289000, null)).toBe(0);
    expect(discountPercent(289000, 289000)).toBe(0);
    expect(discountPercent(289000, 100000)).toBe(0);
  });
});

describe("ngày giờ & nhãn toa", () => {
  it("dùng múi giờ Việt Nam", () => {
    expect(formatDateTime("2026-10-15T17:30:00Z")).toContain("16/10/2026");
    expect(formatDate("2026-10-15T17:30:00Z")).toBe("16/10/2026");
  });
  it("toaLabel đệm 2 chữ số", () => {
    expect(toaLabel(1)).toBe("Toa 01");
    expect(toaLabel(12)).toBe("Toa 12");
  });
});
