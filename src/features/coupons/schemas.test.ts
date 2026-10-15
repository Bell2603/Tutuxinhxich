import { describe, expect, it } from "vitest";
import { couponStatus } from "./domain";
import { couponCreateSchema, endOfDayVN } from "./schemas";

const base = {
  code: " lentau10 ",
  description: "",
  discountType: "percent",
  discountValue: "10",
  maxDiscount: "50.000",
  minSubtotal: "300000",
  startsOn: "",
  endsOn: "",
  usageLimit: "",
  perCustomerLimit: "1",
};

describe("tạo mã giảm giá", () => {
  it("chuẩn hóa mã và số", () => {
    expect(couponCreateSchema.parse(base)).toMatchObject({
      code: "LENTAU10",
      discountValue: 10,
      maxDiscount: 50000,
      minSubtotal: 300000,
      startsOn: null,
      usageLimit: null,
    });
  });
  it("chặn mã có dấu/khoảng trắng, % quá 90, ngày kết thúc trước ngày bắt đầu", () => {
    expect(couponCreateSchema.safeParse({ ...base, code: "CHÀO BẠN" }).success).toBe(false);
    expect(
      couponCreateSchema.safeParse({ ...base, discountValue: "95" }).error?.issues[0]?.path,
    ).toEqual(["discountValue"]);
    expect(
      couponCreateSchema.safeParse({ ...base, startsOn: "2026-12-01", endsOn: "2026-11-01" }).error
        ?.issues[0]?.path,
    ).toEqual(["endsOn"]);
  });
  it("hết ngày theo giờ Việt Nam", () => {
    expect(endOfDayVN("2026-12-31")).toBe("2026-12-31T23:59:59+07:00");
  });
});

describe("trạng thái mã", () => {
  const now = new Date("2026-10-16T12:00:00Z");
  const c = { is_active: true, starts_at: null, ends_at: null, usage_limit: null, used_count: 0 };
  it("phân loại đúng", () => {
    expect(couponStatus(c, now)).toBe("active");
    expect(couponStatus({ ...c, is_active: false }, now)).toBe("disabled");
    expect(couponStatus({ ...c, ends_at: "2026-10-01T00:00:00Z" }, now)).toBe("expired");
    expect(couponStatus({ ...c, starts_at: "2026-11-01T00:00:00Z" }, now)).toBe("scheduled");
    expect(couponStatus({ ...c, usage_limit: 5, used_count: 5 }, now)).toBe("used_up");
  });
});
