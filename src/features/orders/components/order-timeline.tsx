"use client";

import { Check, PackageCheck, Truck, X, ClipboardCheck, Clock } from "lucide-react";
import * as m from "motion/react-m";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_DESCRIPTIONS,
  ORDER_STATUS_LABELS,
  PROGRESS_STEPS,
  progressIndex,
  type OrderStatus,
} from "../domain";

const ICONS: Record<OrderStatus, typeof Check> = {
  pending: Clock,
  confirmed: ClipboardCheck,
  shipping: Truck,
  delivered: PackageCheck,
  cancelled: X,
};

type Event = { id: number; status: OrderStatus; note: string; created_at: string };

/** Thanh tiến trình đơn hàng: con tàu chạy tới trạng thái hiện tại. */
export function OrderTimeline({ status, events }: { status: OrderStatus; events: Event[] }) {
  const cancelled = status === "cancelled";
  const reached = cancelled
    ? Math.max(
        ...events.filter((e) => e.status !== "cancelled").map((e) => progressIndex(e.status)),
        0,
      )
    : progressIndex(status);
  const pct = (reached / (PROGRESS_STEPS.length - 1)) * 100;
  const eventFor = (s: OrderStatus) => events.find((e) => e.status === s);

  return (
    <div>
      <div className="relative px-4 pt-8 pb-2">
        <div
          className="absolute top-[3.1rem] right-8 left-8 h-2 rounded-full bg-pink-50"
          aria-hidden
        />
        <m.div
          aria-hidden
          className={cn(
            "absolute top-[3.1rem] left-8 h-2 rounded-full",
            cancelled ? "bg-ink-faint" : "bg-aurora",
          )}
          initial={{ width: 0 }}
          animate={{ width: `calc((100% - 4rem) * ${pct / 100})` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
        {!cancelled ? (
          <m.span
            aria-hidden
            className="absolute top-3 text-2xl"
            initial={{ left: "1rem" }}
            animate={{ left: `calc(1rem + (100% - 4rem) * ${pct / 100})` }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            🚂
          </m.span>
        ) : null}
        <ol className="relative grid grid-cols-4 gap-2">
          {PROGRESS_STEPS.map((step, i) => {
            const done = i <= reached && !(cancelled && i > reached);
            const Icon = ICONS[step];
            const event = eventFor(step);
            return (
              <li key={step} className="flex flex-col items-center gap-2 pt-6 text-center">
                <span
                  className={cn(
                    "relative z-10 grid size-10 place-items-center rounded-full ring-4 ring-white transition-colors",
                    done ? "bg-ink text-cream" : "bg-pink-50 text-ink-faint",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <span
                  className={cn(
                    "text-xs font-bold sm:text-sm",
                    done ? "text-ink" : "text-ink-faint",
                  )}
                >
                  {ORDER_STATUS_LABELS[step]}
                </span>
                {event ? (
                  <span className="hidden text-[0.7rem] text-ink-soft sm:block">
                    {formatDateTime(event.created_at)}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
      <p
        className={cn(
          "mt-4 rounded-2xl px-4 py-3 text-sm font-medium",
          cancelled ? "bg-pink-50 text-danger" : "bg-cream text-ink",
        )}
      >
        {ORDER_STATUS_DESCRIPTIONS[status]}
      </p>
      {events.length > 0 ? (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-semibold text-ink-soft hover:text-ink">
            Lịch sử cập nhật ({events.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {events.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap gap-x-3 rounded-xl bg-white px-3 py-2 ring-1 ring-line"
              >
                <span className="font-semibold">{ORDER_STATUS_LABELS[e.status]}</span>
                <span className="text-ink-soft">{formatDateTime(e.created_at)}</span>
                {e.note ? <span className="w-full text-ink-soft">{e.note}</span> : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
