import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("giữ đường dẫn nội bộ", () => {
    expect(safeRedirectPath("/thanh-toan")).toBe("/thanh-toan");
    expect(safeRedirectPath("/tai-khoan/don-hang/TT2610150001?moi=1")).toBe(
      "/tai-khoan/don-hang/TT2610150001?moi=1",
    );
  });
  it("chặn open redirect", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/");
    expect(safeRedirectPath("//evil.com")).toBe("/");
    expect(safeRedirectPath("/\\evil.com")).toBe("/");
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/");
    expect(safeRedirectPath("/ok\n")).toBe("/");
  });
  it("dùng fallback khi rỗng/sai kiểu", () => {
    expect(safeRedirectPath(undefined, "/tai-khoan")).toBe("/tai-khoan");
    expect(safeRedirectPath("", "/tai-khoan")).toBe("/tai-khoan");
    expect(safeRedirectPath(42, "/x")).toBe("/x");
  });
});
