import { describe, expect, it } from "vitest";
import { authErrorMessage, parseAppError } from "./errors";

describe("parseAppError", () => {
  it("đọc mã lỗi nghiệp vụ và ngữ cảnh JSON", () => {
    const parsed = parseAppError({
      message: "INSUFFICIENT_STOCK",
      details: '{"name":"Caro Dâu Tây","available":2}',
    });
    expect(parsed.code).toBe("INSUFFICIENT_STOCK");
    expect(parsed.message).toBe("“Caro Dâu Tây” chỉ còn 2 sản phẩm. Vui lòng giảm số lượng.");
  });
  it("hết hàng hoàn toàn", () => {
    expect(
      parseAppError({ message: "INSUFFICIENT_STOCK", details: '{"name":"A","available":0}' })
        .message,
    ).toContain("vừa hết hàng");
  });
  it("lỗi lạ không lộ chi tiết nội bộ", () => {
    const parsed = parseAppError({ message: 'relation "x" does not exist', details: "secret" });
    expect(parsed.code).toBe("UNKNOWN");
    expect(parsed.message).not.toContain("relation");
  });
  it("detail không phải JSON vẫn an toàn", () => {
    expect(parseAppError({ message: "PRODUCT_UNAVAILABLE", details: "oops" }).message).toContain(
      "không còn bán",
    );
    expect(parseAppError(null).code).toBe("UNKNOWN");
  });
});

describe("authErrorMessage", () => {
  it("dịch lỗi Supabase Auth", () => {
    expect(authErrorMessage({ code: "invalid_credentials" })).toBe(
      "Email hoặc mật khẩu không đúng.",
    );
    expect(authErrorMessage({ code: "user_already_exists" })).toContain("đã được đăng ký");
    expect(authErrorMessage(null)).toContain("thử lại");
  });
});
