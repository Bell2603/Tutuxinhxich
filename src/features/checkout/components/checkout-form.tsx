"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, Loader2, Lock, QrCode } from "lucide-react";
import Image from "next/image";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { FreeShippingMeter } from "@/features/cart/components/free-shipping-meter";
import { useCart } from "@/features/cart/store";
import { useCartSummary } from "@/features/cart/use-cart-summary";
import { useCatalogStore } from "@/features/catalog/client-store";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { placeOrderAction } from "../actions";
import { PROVINCES, shippingSchema, type ShippingInput, type ShippingValues } from "../schemas";

type PaymentMethod = "cod" | "bank_transfer_mock";

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  title: string;
  text: string;
  Icon: typeof Banknote;
}[] = [
  {
    value: "cod",
    title: "Thanh toán khi nhận hàng (COD)",
    text: "Trả tiền mặt cho shipper khi nhận khăn.",
    Icon: Banknote,
  },
  {
    value: "bank_transfer_mock",
    title: "Chuyển khoản (giả lập)",
    text: "Mô phỏng thanh toán chuyển khoản — không trừ tiền thật.",
    Icon: QrCode,
  },
];

export function CheckoutForm({ defaults }: { defaults: { fullName: string; phone: string } }) {
  const id = useId();
  const router = useRouter();
  const clear = useCart((s) => s.clear);
  const { summary, isLoading, hydrated, lines } = useCartSummary({ reconcile: true });
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [requestId] = useState(() => crypto.randomUUID());
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [placed, setPlaced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingInput, unknown, ShippingValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      recipientName: defaults.fullName,
      phone: defaults.phone,
      address: "",
      ward: "",
      province: "",
      note: "",
    },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit((shipping) => {
    setServerError(null);
    startSubmit(async () => {
      const result = await placeOrderAction({
        shipping,
        paymentMethod: payment,
        items: summary.items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        clientRequestId: requestId,
      });
      if (result.ok) {
        setPlaced(true);
        clear();
        void useCatalogStore.getState().load(true);
        router.push(`/tai-khoan/don-hang/${result.data.code}?moi=1` as Route);
        return;
      }
      setServerError(result.error);
      toast.error(result.error);
      if (
        result.code === "INSUFFICIENT_STOCK" ||
        result.code === "PRODUCT_UNAVAILABLE" ||
        result.code === "INVALID_QUANTITY"
      ) {
        await useCatalogStore.getState().load(true);
      }
    });
  });

  if (!hydrated || isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]" aria-busy="true">
        <Skeleton className="h-[32rem] rounded-[2rem]" />
        <Skeleton className="h-96 rounded-[2rem]" />
      </div>
    );
  }

  if ((lines.length === 0 || summary.items.length === 0) && !placed) {
    return (
      <div
        className="rounded-[2rem] bg-white p-12 text-center shadow-card ring-1 ring-line"
        data-testid="checkout-empty"
      >
        <p className="text-5xl" aria-hidden>
          🧳
        </p>
        <p className="mt-4 font-display text-2xl font-extrabold">Giỏ hàng đang trống</p>
        <p className="mt-2 text-ink-soft">
          Hãy chọn ít nhất một chiếc khăn trước khi thanh toán nhé.
        </p>
        <ButtonLink href="/bo-suu-tap" variant="candy" className="mt-6">
          Xem bộ sưu tập
        </ButtonLink>
      </div>
    );
  }

  const err = (name: keyof ShippingInput) => errors[name]?.message;
  const aria = (name: keyof ShippingInput) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-8 lg:grid-cols-[1.3fr_1fr]"
      data-testid="checkout-form"
    >
      <div className="space-y-8">
        <section
          className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line sm:p-8"
          aria-labelledby={`${id}-ship`}
        >
          <h2 id={`${id}-ship`} className="text-2xl font-extrabold">
            1. Thông tin nhận hàng
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field
              id={`${id}-recipientName`}
              label="Họ và tên người nhận"
              error={err("recipientName")}
              required
            >
              <Input
                id={`${id}-recipientName`}
                autoComplete="name"
                {...register("recipientName")}
                {...aria("recipientName")}
              />
            </Field>
            <Field id={`${id}-phone`} label="Số điện thoại" error={err("phone")} required>
              <Input
                id={`${id}-phone`}
                inputMode="tel"
                autoComplete="tel"
                placeholder="0912345678"
                {...register("phone")}
                {...aria("phone")}
              />
            </Field>
            <Field
              id={`${id}-address`}
              label="Số nhà, tên đường"
              error={err("address")}
              required
              className="sm:col-span-2"
            >
              <Input
                id={`${id}-address`}
                autoComplete="street-address"
                placeholder="12 Đường Hoa Cúc"
                {...register("address")}
                {...aria("address")}
              />
            </Field>
            <Field id={`${id}-ward`} label="Phường / Xã" error={err("ward")} required>
              <Input
                id={`${id}-ward`}
                placeholder="Phường Bến Thành"
                {...register("ward")}
                {...aria("ward")}
              />
            </Field>
            <Field id={`${id}-province`} label="Tỉnh / Thành phố" error={err("province")} required>
              <Input
                id={`${id}-province`}
                list={`${id}-provinces`}
                placeholder="TP. Hồ Chí Minh"
                autoComplete="address-level1"
                {...register("province")}
                {...aria("province")}
              />
              <datalist id={`${id}-provinces`}>
                {PROVINCES.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Field>
            <Field
              id={`${id}-note`}
              label="Ghi chú cho shipper (không bắt buộc)"
              error={err("note")}
              className="sm:col-span-2"
            >
              <Textarea
                id={`${id}-note`}
                rows={3}
                placeholder="VD: Gọi trước khi giao, gói quà tặng bạn thân…"
                {...register("note")}
                {...aria("note")}
              />
            </Field>
          </div>
        </section>

        <section
          className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line sm:p-8"
          aria-labelledby={`${id}-pay`}
        >
          <h2 id={`${id}-pay`} className="text-2xl font-extrabold">
            2. Phương thức thanh toán
          </h2>
          <div className="mt-6 grid gap-3" role="radiogroup" aria-labelledby={`${id}-pay`}>
            {PAYMENT_OPTIONS.map(({ value, title, text, Icon }) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-3xl p-4 ring-2 transition-all has-[:focus-visible]:ring-lilac",
                  payment === value
                    ? "bg-pink-50 ring-bubblegum"
                    : "bg-cream ring-transparent hover:ring-line",
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value={value}
                  checked={payment === value}
                  onChange={() => setPayment(value)}
                  className="sr-only"
                  data-testid={`payment-${value}`}
                />
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-2xl",
                    payment === value ? "bg-bubblegum" : "bg-white",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="text-sm text-ink-soft">{text}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 rounded-2xl bg-sun-100 px-4 py-3 text-sm font-semibold text-warning">
            <Lock className="size-4 shrink-0" aria-hidden />
            Môi trường thử nghiệm: đơn hàng là thật trong hệ thống nhưng không phát sinh thanh toán
            thật.
          </p>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <section
          className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line sm:p-8"
          aria-labelledby={`${id}-sum`}
        >
          <h2 id={`${id}-sum`} className="text-2xl font-extrabold">
            Đơn hàng ({summary.itemCount})
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {summary.items.map((item) => (
              <li key={item.product.id} className="flex items-center gap-3 py-3">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-pink-50">
                  <Image
                    src={item.product.imageUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                  <span className="absolute -top-0 -right-0 grid size-5 place-items-center rounded-bl-xl bg-ink text-[0.65rem] font-bold text-cream">
                    {item.quantity}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{item.product.name}</span>
                  <span className="text-sm text-ink-soft">
                    {formatVND(item.product.price)} × {item.quantity}
                  </span>
                </span>
                <span className="font-semibold">{formatVND(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <FreeShippingMeter subtotal={summary.subtotal} />
          </div>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Tạm tính</dt>
              <dd className="font-semibold" data-testid="checkout-subtotal">
                {formatVND(summary.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Phí giao hàng</dt>
              <dd className="font-semibold" data-testid="checkout-shipping">
                {summary.shippingFee === 0 ? "Miễn phí" : formatVND(summary.shippingFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-bold">Tổng thanh toán</dt>
              <dd className="font-display text-2xl font-extrabold" data-testid="checkout-total">
                {formatVND(summary.total)}
              </dd>
            </div>
          </dl>
          {serverError ? (
            <p
              role="alert"
              className="mt-4 rounded-2xl bg-pink-50 px-4 py-3 text-sm font-semibold text-danger"
              data-testid="checkout-error"
            >
              {serverError}
            </p>
          ) : null}
          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full"
            disabled={submitting || placed}
            data-testid="place-order"
          >
            {submitting || placed ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
            {submitting || placed ? "Đang đặt hàng…" : `Đặt hàng · ${formatVND(summary.total)}`}
          </Button>
          <p className="mt-3 text-center text-xs text-ink-faint">
            Giá và tồn kho được kiểm tra lại khi đặt hàng.
          </p>
        </section>
      </aside>
    </form>
  );
}
