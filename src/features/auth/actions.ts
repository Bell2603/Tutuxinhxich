"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authErrorMessage } from "@/lib/errors";
import { siteUrl } from "@/lib/env";
import { normalizePhone, VN_PHONE_REGEX } from "@/lib/text";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  type AuthFormState,
  type PasswordFormState,
} from "./schemas";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = {
    email: field(formData, "email"),
    password: field(formData, "password"),
    next: field(formData, "next"),
  };
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values: { email: raw.email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: authErrorMessage(error), values: { email: raw.email } };

  redirect(safeRedirectPath(parsed.data.next, "/tai-khoan") as Route);
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = {
    fullName: field(formData, "fullName"),
    email: field(formData, "email"),
    password: field(formData, "password"),
    confirmPassword: field(formData, "confirmPassword"),
    next: field(formData, "next"),
  };
  const parsed = signUpSchema.safeParse(raw);
  const values = { email: raw.email, fullName: raw.fullName };
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };

  const next = safeRedirectPath(parsed.data.next, "/tai-khoan");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: authErrorMessage(error), values };

  // Production bật xác nhận email → chưa có phiên đăng nhập.
  if (!data.session) {
    return {
      success: "Tu tu! Vui lòng kiểm tra hộp thư để xác nhận email, sau đó đăng nhập nhé.",
      values,
    };
  }
  redirect(next as Route);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên cần ít nhất 2 ký tự")
    .max(100, "Họ tên tối đa 100 ký tự"),
  phone: z
    .string()
    .trim()
    .transform((v) => (v ? normalizePhone(v) : ""))
    .refine((v) => v === "" || VN_PHONE_REGEX.test(v), "Số điện thoại chưa đúng (VD: 0912345678)"),
});

export type ProfileFormState =
  | { ok?: boolean; error?: string; fieldErrors?: Partial<Record<"fullName" | "phone", string[]>> }
  | undefined;

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse({
    fullName: field(formData, "fullName"),
    phone: field(formData, "phone"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { error: "Bạn cần đăng nhập." };
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone })
    .eq("id", userId);
  if (error) return { error: "Không lưu được thông tin, vui lòng thử lại." };
  return { ok: true };
}

/** Gửi email đặt lại mật khẩu. Luôn trả cùng một thông báo để không lộ email nào đã đăng ký. */
export async function requestPasswordResetAction(
  _prev: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const raw = { email: field(formData, "email") };
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success)
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values: raw };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/dat-lai-mat-khau`,
  });
  if (error?.code?.startsWith("over_")) return { error: authErrorMessage(error), values: raw };
  if (error) console.error("[resetPasswordForEmail]", error.code);
  return {
    success:
      "Nếu email này đã đăng ký, Tu Tu vừa gửi link đặt lại mật khẩu (hiệu lực 1 giờ). Kiểm tra cả mục Spam nhé!",
    values: raw,
  };
}

/** Đặt mật khẩu mới sau khi mở link trong email (đã có phiên đăng nhập tạm từ link). */
export async function resetPasswordAction(
  _prev: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: field(formData, "password"),
    confirmPassword: field(formData, "confirmPassword"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub)
    return { error: "Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu link mới." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: authErrorMessage(error) };
  redirect("/tai-khoan?mat-khau=moi");
}

/** Đổi mật khẩu trong trang tài khoản: xác minh lại mật khẩu hiện tại trước. */
export async function changePasswordAction(
  _prev: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: field(formData, "currentPassword"),
    password: field(formData, "password"),
    confirmPassword: field(formData, "confirmPassword"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  if (!email) return { error: "Bạn cần đăng nhập lại." };

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.currentPassword,
  });
  if (verifyError) return { fieldErrors: { currentPassword: ["Mật khẩu hiện tại không đúng"] } };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: authErrorMessage(error) };
  return { ok: true, success: "Đã đổi mật khẩu. Lần sau hãy đăng nhập bằng mật khẩu mới nhé!" };
}
