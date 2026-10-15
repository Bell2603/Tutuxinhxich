"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { signInAction, signUpAction } from "../actions";
import type { AuthFormState } from "../schemas";
import { PasswordInput } from "./password-input";

function FormBanner({ state }: { state: AuthFormState }) {
  if (state?.error) {
    return (
      <p
        role="alert"
        className="rounded-2xl bg-pink-50 px-4 py-3 text-sm font-semibold text-danger ring-1 ring-pink-100"
        data-testid="form-error"
      >
        {state.error}
      </p>
    );
  }
  if (state?.success) {
    return (
      <p
        role="status"
        className="rounded-2xl bg-mint-100 px-4 py-3 text-sm font-semibold text-success"
      >
        {state.success}
      </p>
    );
  }
  return null;
}

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signInAction, undefined);
  const id = useId();
  const errors = state?.fieldErrors;
  return (
    <form action={action} className="flex flex-col gap-5" noValidate data-testid="signin-form">
      <input type="hidden" name="next" value={next} />
      <FormBanner state={state} />
      <Field id={`${id}-email`} label="Email" error={errors?.email?.[0]} required>
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
          aria-invalid={errors?.email ? true : undefined}
          aria-describedby={errors?.email ? `${id}-email-error` : undefined}
          placeholder="ban@email.com"
          required
        />
      </Field>
      <Field id={`${id}-password`} label="Mật khẩu" error={errors?.password?.[0]} required>
        <PasswordInput
          id={`${id}-password`}
          name="password"
          autoComplete="current-password"
          aria-invalid={errors?.password ? true : undefined}
          aria-describedby={errors?.password ? `${id}-password-error` : undefined}
          required
        />
      </Field>
      <Button type="submit" size="lg" disabled={pending} data-testid="signin-submit">
        {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
      <p className="text-center text-sm text-ink-soft">
        Chưa có tài khoản?{" "}
        <Link
          href={
            `/dang-ky${next !== "/tai-khoan" ? `?next=${encodeURIComponent(next)}` : ""}` as Route
          }
          className="font-bold text-berry hover:underline"
        >
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signUpAction, undefined);
  const id = useId();
  const errors = state?.fieldErrors;
  const described = (name: keyof NonNullable<typeof errors>) =>
    errors?.[name] ? `${id}-${name}-error` : undefined;
  return (
    <form action={action} className="flex flex-col gap-5" noValidate data-testid="signup-form">
      <input type="hidden" name="next" value={next} />
      <FormBanner state={state} />
      <Field id={`${id}-fullName`} label="Họ và tên" error={errors?.fullName?.[0]} required>
        <Input
          id={`${id}-fullName`}
          name="fullName"
          autoComplete="name"
          defaultValue={state?.values?.fullName}
          aria-invalid={errors?.fullName ? true : undefined}
          aria-describedby={described("fullName")}
          required
        />
      </Field>
      <Field id={`${id}-email`} label="Email" error={errors?.email?.[0]} required>
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
          aria-invalid={errors?.email ? true : undefined}
          aria-describedby={described("email")}
          placeholder="ban@email.com"
          required
        />
      </Field>
      <Field
        id={`${id}-password`}
        label="Mật khẩu"
        error={errors?.password?.[0]}
        hint="Ít nhất 8 ký tự, có chữ và số."
        required
      >
        <PasswordInput
          id={`${id}-password`}
          name="password"
          autoComplete="new-password"
          aria-invalid={errors?.password ? true : undefined}
          aria-describedby={described("password") ?? `${id}-password-hint`}
          required
        />
      </Field>
      <Field
        id={`${id}-confirmPassword`}
        label="Nhập lại mật khẩu"
        error={errors?.confirmPassword?.[0]}
        required
      >
        <PasswordInput
          id={`${id}-confirmPassword`}
          name="confirmPassword"
          autoComplete="new-password"
          aria-invalid={errors?.confirmPassword ? true : undefined}
          aria-describedby={described("confirmPassword")}
          required
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        variant="candy"
        disabled={pending}
        data-testid="signup-submit"
      >
        {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
        {pending ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
      </Button>
      <p className="text-center text-sm text-ink-soft">
        Đã có tài khoản?{" "}
        <Link
          href={
            `/dang-nhap${next !== "/tai-khoan" ? `?next=${encodeURIComponent(next)}` : ""}` as Route
          }
          className="font-bold text-berry hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
