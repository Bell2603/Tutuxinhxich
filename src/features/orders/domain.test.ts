import { describe, expect, it } from "vitest";
import { canCustomerCancel, canTransition, nextStatuses, progressIndex } from "./domain";

describe("luồng trạng thái đơn hàng", () => {
  it("chỉ cho phép bước tiếp theo hoặc hủy", () => {
    expect(canTransition("pending", "confirmed")).toBe(true);
    expect(canTransition("pending", "delivered")).toBe(false);
    expect(canTransition("shipping", "delivered")).toBe(true);
    expect(canTransition("delivered", "cancelled")).toBe(false);
    expect(canTransition("cancelled", "pending")).toBe(false);
    expect(nextStatuses("confirmed")).toEqual(["shipping", "cancelled"]);
  });
  it("khách chỉ hủy được đơn chờ xác nhận", () => {
    expect(canCustomerCancel("pending")).toBe(true);
    expect(canCustomerCancel("confirmed")).toBe(false);
  });
  it("vị trí trên timeline", () => {
    expect(progressIndex("pending")).toBe(0);
    expect(progressIndex("delivered")).toBe(3);
    expect(progressIndex("cancelled")).toBe(-1);
  });
});
