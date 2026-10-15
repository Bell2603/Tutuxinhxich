import { z } from "zod";

const email = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  z.email({ message: "Email chưa đúng định dạng" }).max(254, "Email quá dài"),
);

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Vui lòng nhập mật khẩu").max(72, "Mật khẩu quá dài"),
  next: z.string().max(512).optional(),
});

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Họ tên cần ít nhất 2 ký tự")
      .max(100, "Họ tên tối đa 100 ký tự"),
    email,
    password: z
      .string()
      .min(8, "Mật khẩu cần ít nhất 8 ký tự")
      .max(72, "Mật khẩu tối đa 72 ký tự")
      .regex(/[A-Za-zÀ-ỹ]/, "Mật khẩu cần có chữ cái")
      .regex(/\d/, "Mật khẩu cần có chữ số"),
    confirmPassword: z.string(),
    next: z.string().max(512).optional(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại không khớp",
  });

export type AuthFormState =
  | {
      error?: string;
      success?: string;
      fieldErrors?: Partial<
        Record<"fullName" | "email" | "password" | "confirmPassword", string[]>
      >;
      values?: { email?: string; fullName?: string };
    }
  | undefined;
