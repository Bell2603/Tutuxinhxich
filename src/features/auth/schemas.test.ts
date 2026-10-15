import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "./schemas";

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

describe("đặt lại / đổi mật khẩu", () => {
  it("email quên mật khẩu phải hợp lệ", () => {
    expect(forgotPasswordSchema.safeParse({ email: " KHACH@Mail.com " }).data?.email).toBe(
      "khach@mail.com",
    );
    expect(forgotPasswordSchema.safeParse({ email: "abc" }).success).toBe(false);
  });
  it("mật khẩu mới theo cùng quy tắc với đăng ký và phải nhập lại khớp", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "KhanMoi2026", confirmPassword: "KhanMoi2026" })
        .success,
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({ password: "ngan1", confirmPassword: "ngan1" }).success,
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({ password: "KhanMoi2026", confirmPassword: "khac2026" }).error
        ?.issues[0]?.path,
    ).toEqual(["confirmPassword"]);
  });
  it("đổi mật khẩu: cần mật khẩu hiện tại và mật khẩu mới phải khác", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "",
        password: "KhanMoi2026",
        confirmPassword: "KhanMoi2026",
      }).success,
    ).toBe(false);
    const same = changePasswordSchema.safeParse({
      currentPassword: "KhanCu2026",
      password: "KhanCu2026",
      confirmPassword: "KhanCu2026",
    });
    expect(same.error?.issues.map((i) => i.path[0])).toContain("password");
  });
});
