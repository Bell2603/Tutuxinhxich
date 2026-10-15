"use client";

import * as m from "motion/react-m";
import { formatVND } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "../domain";

export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line">
      <p className="text-sm font-medium text-ink" aria-live="polite">
        {remaining > 0 ? (
          <>
            Mua thêm <strong className="text-berry">{formatVND(remaining)}</strong> để được miễn phí
            giao hàng
          </>
        ) : (
          <>
            <span aria-hidden>🎉 </span>Đơn của bạn được <strong>miễn phí giao hàng</strong>!
          </>
        )}
      </p>
      <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-pink-50" aria-hidden>
        <m.div
          className="absolute inset-y-0 left-0 rounded-full bg-aurora"
          initial={false}
          animate={{ width: `${Math.max(progress * 100, 4)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
        <m.span
          className="absolute top-1/2 -translate-y-1/2 text-xs"
          initial={false}
          animate={{ left: `calc(${Math.max(progress * 100, 4)}% - 10px)` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          🚂
        </m.span>
      </div>
    </div>
  );
}
