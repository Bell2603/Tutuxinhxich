"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useOptimistic, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Switch } from "@/features/admin/components/visibility-toggle";
import { formatDate, formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createCouponAction, deleteCouponAction, setCouponActiveAction } from "../admin-actions";
import { COUPON_STATUS_LABELS, couponLabel, couponStatus } from "../domain";
import type { AdminCoupon } from "../queries";
import { couponCreateSchema, type CouponCreateInput, type CouponCreateValues } from "../schemas";

const EMPTY: CouponCreateInput = {
  code: "",
  description: "",
  discountType: "percent",
  discountValue: "",
  maxDiscount: "",
  minSubtotal: "0",
  startsOn: "",
  endsOn: "",
  usageLimit: "",
  perCustomerLimit: "1",
};

export function CouponCreateForm() {
  const id = useId();
  const router = useRouter();
  const [pending, start] = useTransition();
  const { register, handleSubmit, control, reset, setError, formState } = useForm<
    CouponCreateInput,
    unknown,
    CouponCreateValues
  >({
    resolver: zodResolver(couponCreateSchema),
    defaultValues: EMPTY,
  });
  const type = useWatch({ control, name: "discountType" });
  const err = (name: keyof CouponCreateInput) =>
    formState.errors[name]?.message as string | undefined;

  const onSubmit = handleSubmit((values) =>
    start(async () => {
      const result = await createCouponAction(values);
      if (result.ok) {
        toast.success(result.message);
        reset(EMPTY);
        router.refresh();
      } else {
        toast.error(result.error);
        for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (messages?.[0]) setError(name as keyof CouponCreateInput, { message: messages[0] });
        }
      }
    }),
  );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line"
      data-testid="coupon-create-form"
    >
      <h2 className="text-xl font-extrabold">Tạo mã mới</h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field
          id={`${id}-code`}
          label="Mã"
          error={err("code")}
          hint="Chữ in hoa & số, VD TETXINH20"
          required
        >
          <Input id={`${id}-code`} {...register("code")} className="uppercase" />
        </Field>
        <Field id={`${id}-type`} label="Loại giảm">
          <Select id={`${id}-type`} {...register("discountType")}>
            <option value="percent">Theo %</option>
            <option value="fixed">Số tiền (₫)</option>
          </Select>
        </Field>
        <Field
          id={`${id}-value`}
          label={type === "percent" ? "Mức giảm (%)" : "Mức giảm (₫)"}
          error={err("discountValue")}
          required
        >
          <Input id={`${id}-value`} inputMode="numeric" {...register("discountValue")} />
        </Field>
        <Field
          id={`${id}-max`}
          label="Giảm tối đa (₫)"
          error={err("maxDiscount")}
          hint="Chỉ cho loại %, để trống = không giới hạn"
        >
          <Input
            id={`${id}-max`}
            inputMode="numeric"
            disabled={type !== "percent"}
            {...register("maxDiscount")}
          />
        </Field>
        <Field
          id={`${id}-min`}
          label="Đơn tối thiểu (₫)"
          error={err("minSubtotal")}
          hint="Tạm tính chưa gồm phí ship"
        >
          <Input id={`${id}-min`} inputMode="numeric" {...register("minSubtotal")} />
        </Field>
        <Field id={`${id}-start`} label="Bắt đầu (không bắt buộc)" error={err("startsOn")}>
          <Input id={`${id}-start`} type="date" {...register("startsOn")} />
        </Field>
        <Field id={`${id}-end`} label="Kết thúc (không bắt buộc)" error={err("endsOn")}>
          <Input id={`${id}-end`} type="date" {...register("endsOn")} />
        </Field>
        <Field
          id={`${id}-limit`}
          label="Tổng lượt dùng"
          error={err("usageLimit")}
          hint="Để trống = không giới hạn"
        >
          <Input id={`${id}-limit`} inputMode="numeric" {...register("usageLimit")} />
        </Field>
        <Field id={`${id}-per`} label="Mỗi khách dùng tối đa" error={err("perCustomerLimit")}>
          <Input id={`${id}-per`} inputMode="numeric" {...register("perCustomerLimit")} />
        </Field>
        <Field
          id={`${id}-desc`}
          label="Mô tả (nội bộ)"
          error={err("description")}
          className="sm:col-span-2 xl:col-span-3"
        >
          <Input
            id={`${id}-desc`}
            {...register("description")}
            placeholder="VD: Khuyến mãi khai trương"
          />
        </Field>
      </div>
      <Button type="submit" className="mt-5" disabled={pending} data-testid="coupon-create-submit">
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Plus className="size-4" aria-hidden />
        )}
        Tạo mã
      </Button>
    </form>
  );
}

function CouponRow({ coupon }: { coupon: AdminCoupon }) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useOptimistic(coupon.is_active);
  const [pending, start] = useTransition();
  const status = couponStatus({ ...coupon, is_active: optimistic });

  return (
    <li
      className={cn(
        "rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-line",
        status !== "active" && "opacity-80",
      )}
      data-testid="coupon-row"
      data-code={coupon.code}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xl font-extrabold tracking-wide">{coupon.code}</p>
          <p className="text-sm text-ink-soft">
            {couponLabel({
              discountType: coupon.discount_type,
              discountValue: coupon.discount_value,
              maxDiscount: coupon.max_discount,
              minSubtotal: coupon.min_subtotal,
            })}
          </p>
          {coupon.description ? (
            <p className="text-xs text-ink-faint">{coupon.description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              status === "active" && "bg-mint-100 text-success",
              status === "scheduled" && "bg-sky-100 text-[#0b5f8a]",
              (status === "expired" || status === "used_up") && "bg-sun-100 text-warning",
              status === "disabled" && "bg-pink-100 text-danger",
            )}
            data-testid="coupon-status"
          >
            {COUPON_STATUS_LABELS[status]}
          </span>
          <Switch
            checked={optimistic}
            disabled={pending}
            label={`Bật mã ${coupon.code}`}
            testId={`coupon-active-${coupon.code}`}
            onChange={(next) =>
              start(async () => {
                setOptimistic(next);
                const result = await setCouponActiveAction(coupon.id, next);
                if (result.ok) toast.success(result.message);
                else toast.error(result.error);
                router.refresh();
              })
            }
          />
          {coupon.used_count === 0 ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const result = await deleteCouponAction(coupon.id);
                  if (result.ok) toast.success(result.message);
                  else toast.error(result.error);
                  router.refresh();
                })
              }
              className="grid size-9 place-items-center rounded-full text-danger focus-ring hover:bg-pink-50"
              aria-label={`Xóa mã ${coupon.code}`}
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-soft">
        <div>
          <dt className="inline">Đã dùng: </dt>
          <dd className="inline font-semibold text-ink" data-testid="coupon-usage">
            {coupon.used_count}
            {coupon.usage_limit ? `/${coupon.usage_limit}` : ""}
          </dd>
        </div>
        <div>
          <dt className="inline">Mỗi khách: </dt>
          <dd className="inline font-semibold text-ink">{coupon.per_customer_limit} lần</dd>
        </div>
        <div>
          <dt className="inline">Thời gian: </dt>
          <dd className="inline font-semibold text-ink">
            {coupon.starts_at ? formatDate(coupon.starts_at) : "ngay"} →{" "}
            {coupon.ends_at ? formatDate(coupon.ends_at) : "không hạn"}
          </dd>
        </div>
        {coupon.max_discount ? (
          <div>
            <dt className="inline">Tối đa: </dt>
            <dd className="inline font-semibold text-ink">{formatVND(coupon.max_discount)}</dd>
          </div>
        ) : null}
      </dl>
    </li>
  );
}

export function CouponList({ coupons }: { coupons: AdminCoupon[] }) {
  if (coupons.length === 0) {
    return (
      <p className="rounded-[2rem] bg-white p-10 text-center text-ink-soft shadow-card ring-1 ring-line">
        Chưa có mã giảm giá nào.
      </p>
    );
  }
  return (
    <ul className="space-y-4" data-testid="coupon-list">
      {coupons.map((coupon) => (
        <CouponRow key={coupon.id} coupon={coupon} />
      ))}
    </ul>
  );
}
