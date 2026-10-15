"use client";

import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { useMemo } from "react";

const COLORS = ["#FF4F9A", "#A98BFF", "#5CC8FF", "#FFCF3F", "#5FE0B7"];

/** Banner chúc mừng đặt hàng thành công + pháo giấy nhẹ (tự tắt khi giảm chuyển động). */
export function OrderCelebration({ code }: { code: string }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: (i * 37) % 100,
        rotate: (i * 47) % 360,
        delay: (i % 7) * 0.05,
        color: COLORS[i % COLORS.length],
      })),
    [],
  );
  return (
    <m.div
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="relative mb-8 overflow-hidden rounded-[2rem] bg-aurora p-6 text-ink shadow-pop sm:p-8"
      role="status"
      data-testid="order-success"
    >
      {!reduce
        ? pieces.map((p) => (
            <m.span
              key={p.id}
              aria-hidden
              className="absolute top-0 h-3 w-2 rounded-sm"
              style={{ left: `${p.x}%`, backgroundColor: p.color }}
              initial={{ y: -20, rotate: 0, opacity: 1 }}
              animate={{ y: 220, rotate: p.rotate + 360, opacity: 0 }}
              transition={{ duration: 1.8, delay: p.delay, ease: "easeOut" }}
            />
          ))
        : null}
      <p className="text-4xl" aria-hidden>
        🎉🚂
      </p>
      <p className="mt-2 font-display text-3xl font-extrabold">Đặt hàng thành công!</p>
      <p className="mt-1 font-medium text-ink/80">
        Mã đơn <strong>#{code}</strong>. Tu Tu sẽ liên hệ xác nhận sớm nhất. (Đơn thử nghiệm — không
        trừ tiền thật.)
      </p>
    </m.div>
  );
}
