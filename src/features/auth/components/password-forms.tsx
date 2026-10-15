"use client";

import { KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useId, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { changePasswordAction, requestPasswordResetAction, resetPasswordAction } from "../actions";
import { FormBanner } from "./auth-forms";
import { PasswordInput } from "./password-input";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, undefined);
  const id = useId();
  const error = state?.fieldErrors?.email?.[0];
  return (
    <form action={action} className="flex flex-col gap-5" noValidate data-testid="forgot-form">
      <FormBanner state={state} />
      <Field id={`${id}-email`} label="Email đã đăng ký" error={error} required>
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-email-error` : undefined}
          placeholder="ban@email.com"
          required
        />
      </Field>
      <Button type="submit" size="lg" disabled={pending} data-testid="forgot-submit">
        {pending ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <KeyRound className="size-5" aria-hidden />
        )}
        {pending ? "Đang gửi…" : "Gửi link đặt lại mật khẩu"}
      </Button>
      <p className="text-center text-sm text-ink-soft">
        Nhớ ra rồi?{" "}
        <Link href="/dang-nhap" className="font-bold text-berry hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}

function NewPasswordFields({
  errors,
  id,
}: {
  errors?: Partial<Record<string, string[]>>;
  id: string;
}) {
  return (
    <>
      <Field
        id={`${id}-password`}
        label="Mật khẩu mới"
        error={errors?.password?.[0]}
        hint="Ít nhất 8 ký tự, có chữ và số."
        required
      >
        <PasswordInput
          id={`${id}-password`}
          name="password"
          autoComplete="new-password"
          aria-invalid={errors?.password ? true : undefined}
          aria-describedby={errors?.password ? `${id}-password-error` : `${id}-password-hint`}
          required
        />
      </Field>
      <Field
        id={`${id}-confirm`}
        label="Nhập lại mật khẩu mới"
        error={errors?.confirmPassword?.[0]}
        required
      >
        <PasswordInput
          id={`${id}-confirm`}
          name="confirmPassword"
          autoComplete="new-password"
          aria-invalid={errors?.confirmPassword ? true : undefined}
          aria-describedby={errors?.confirmPassword ? `${id}-confirm-error` : undefined}
          required
        />
      </Field>
    </>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);
  const id = useId();
  return (
    <form action={action} className="flex flex-col gap-5" noValidate data-testid="reset-form">
      <FormBanner state={state} />
      <NewPasswordFields errors={state?.fieldErrors} id={id} />
      <Button type="submit" size="lg" disabled={pending} data-testid="reset-submit">
        {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
        {pending ? "Đang lưu…" : "Lưu mật khẩu mới"}
      </Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      toast.success(state.success ?? "Đã đổi mật khẩu.");
      formRef.current?.reset();
    }
  }, [state]);
  const errors = state?.fieldErrors;
  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-4"
      noValidate
      data-testid="change-password-form"
    >
      {state?.error ? <FormBanner state={{ error: state.error }} /> : null}
      <Field
        id={`${id}-current`}
        label="Mật khẩu hiện tại"
        error={errors?.currentPassword?.[0]}
        required
      >
        <PasswordInput
          id={`${id}-current`}
          name="currentPassword"
          autoComplete="current-password"
          aria-invalid={errors?.currentPassword ? true : undefined}
          aria-describedby={errors?.currentPassword ? `${id}-current-error` : undefined}
          required
        />
      </Field>
      <NewPasswordFields errors={errors} id={id} />
      <Button
        type="submit"
        variant="outline"
        disabled={pending}
        data-testid="change-password-submit"
      >
        {pending ? "Đang đổi…" : "Đổi mật khẩu"}
      </Button>
    </form>
  );
}
