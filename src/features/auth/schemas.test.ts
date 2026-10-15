import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "./schemas";

describe("signUpSchema", () => {
  const base = {
    fullName: "Minh Anh",
    email: " MinhAnh@Email.com ",
    password: "khanxinh123",
    confirmPassword: "khanxinh123",
  };
  it("chuẩn hóa email", () => {
    expect(signUpSchema.parse(base).email).toBe("minhanh@email.com");
  });
  it("mật khẩu cần ≥ 8 ký tự, có chữ và số; nhập lại phải khớp", () => {
    expect(
      signUpSchema.safeParse({ ...base, password: "abc1", confirmPassword: "abc1" }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({ ...base, password: "abcdefgh", confirmPassword: "abcdefgh" })
        .success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({ ...base, password: "12345678", confirmPassword: "12345678" })
        .success,
    ).toBe(false);
    const mismatch = signUpSchema.safeParse({ ...base, confirmPassword: "khac12345" });
    expect(mismatch.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });
});

describe("signInSchema", () => {
  it("báo lỗi email sai và mật khẩu trống", () => {
    const result = signInSchema.safeParse({ email: "abc", password: "" });
    expect(result.success).toBe(false);
    expect(result.error!.issues.map((i) => i.path[0])).toEqual(["email", "password"]);
  });
});
