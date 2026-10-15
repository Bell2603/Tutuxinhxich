"use client";

import { Loader2, TicketPercent, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useId, useState, useTransition } from "react";
import { formatVND } from "@/lib/format";
import { previewCouponAction } from "../actions";
import { couponLabel, normalizeCouponCode, type CouponTerms } from "../domain";

/** Ô nhập mã giảm giá trong trang thanh toán (không phải <form> lồng — Enter để áp dụng). */
export function CouponField({
  items,
  coupon,
  subtotal,
  onApply,
  onRemove,
}: {
  items: { productId: string; quantity: number }[];
  coupon: CouponTerms | null;
  subtotal: number;
  onApply: (terms: CouponTerms) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function apply() {
    const normalized = normalizeCouponCode(code);
    if (normalized.length < 3) {
      setError("Vui lòng nhập mã giảm giá.");
      return;
    }
    setError(null);
    start(async () => {
      const result = await previewCouponAction({ code: normalized, items });
      if (result.ok) {
        onApply(result.data.terms);
        setCode("");
      } else {
        setError(result.error);
      }
    });
  }

  const belowMin = coupon ? subtotal < coupon.minSubtotal : false;

  return (
    <div className="rounded-2xl bg-cream p-4" data-testid="coupon-field">
      <AnimatePresence mode="wait" initial={false}>
        {coupon ? (
          <m.div
            key="applied"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            className="flex items-start gap-3"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-aurora text-ink">
              <TicketPercent className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span
                className="block font-display font-extrabold tracking-wide"
                data-testid="coupon-applied"
              >
                {coupon.code}
              </span>
              <span className="block text-xs text-ink-soft">{couponLabel(coupon)}</span>
              {belowMin ? (
                <span className="mt-1 block text-xs font-semibold text-warning" role="status">
                  Mua thêm {formatVND(coupon.minSubtotal - subtotal)} để dùng mã này.
                </span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={onRemove}
              className="grid size-8 place-items-center rounded-full text-ink-soft focus-ring hover:bg-white"
              aria-label={`Bỏ mã ${coupon.code}`}
            >
              <X className="size-4" aria-hidden />
            </button>
          </m.div>
        ) : (
          <m.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <label htmlFor={`${id}-code`} className="text-sm font-semibold">
              Mã giảm giá
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id={`${id}-code`}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 20))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    apply();
                  }
                }}
                placeholder="VD: LENTAU10"
                autoComplete="off"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className="h-11 min-w-0 flex-1 rounded-xl border-2 border-line bg-white px-3 font-semibold tracking-wide uppercase outline-none focus:border-lilac focus:ring-4 focus:ring-lilac-100"
                data-testid="coupon-input"
              />
              <button
                type="button"
                onClick={apply}
                disabled={pending}
                className="h-11 rounded-xl bg-ink px-4 text-sm font-semibold text-cream focus-ring transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                data-testid="coupon-apply"
              >
                {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Áp dụng"}
              </button>
            </div>
            {error ? (
              <p
                id={`${id}-error`}
                className="mt-1.5 text-sm font-medium text-danger"
                role="alert"
                data-testid="coupon-error"
              >
                {error}
              </p>
            ) : null}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
