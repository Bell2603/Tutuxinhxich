"use client";

import { useActionState, useEffect, useId } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { updateProfileAction } from "../actions";

export function ProfileForm({
  fullName,
  phone,
  email,
}: {
  fullName: string;
  phone: string;
  email: string;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined);
  const id = useId();
  useEffect(() => {
    if (state?.ok) toast.success("Đã lưu thông tin tài khoản.");
    if (state?.error) toast.error(state.error);
  }, [state]);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field id={`${id}-email`} label="Email">
        <Input id={`${id}-email`} value={email} disabled readOnly />
      </Field>
      <Field id={`${id}-name`} label="Họ và tên" error={state?.fieldErrors?.fullName?.[0]}>
        <Input
          id={`${id}-name`}
          name="fullName"
          defaultValue={fullName}
          autoComplete="name"
          aria-invalid={state?.fieldErrors?.fullName ? true : undefined}
        />
      </Field>
      <Field id={`${id}-phone`} label="Số điện thoại" error={state?.fieldErrors?.phone?.[0]}>
        <Input
          id={`${id}-phone`}
          name="phone"
          defaultValue={phone}
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={state?.fieldErrors?.phone ? true : undefined}
        />
      </Field>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Đang lưu…" : "Lưu thông tin"}
      </Button>
    </form>
  );
}
