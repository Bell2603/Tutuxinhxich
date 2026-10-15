"use client";

import { Star } from "lucide-react";
import * as m from "motion/react-m";
import { useId, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { RATING_LABELS } from "../domain";

/** Chọn số sao: rê chuột xem trước, bấm để chọn (sao nảy), phím ←→ để đổi. */
export function StarInput({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  const [hover, setHover] = useState(0);
  const id = useId();
  const shown = hover || value;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(Math.min(5, (value || 0) + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(Math.max(1, (value || 2) - 1));
    }
  }

  return (
    <div>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-describedby={error ? `${id}-error` : undefined}
        className="flex flex-col gap-1"
        onKeyDown={onKeyDown}
        onPointerLeave={() => setHover(0)}
      >
        <span id={`${id}-label`} className="sr-only">
          Số sao đánh giá
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} sao — ${RATING_LABELS[n]}`}
              tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
              onClick={() => onChange(n)}
              onPointerEnter={() => setHover(n)}
              className="rounded-lg p-0.5 focus-ring"
              data-testid={`star-${n}`}
            >
              <m.span
                className="block"
                animate={value === n ? { scale: [1, 1.4, 1], rotate: [0, -12, 0] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Star
                  className={cn(
                    "size-8 transition-colors",
                    n <= shown ? "fill-gold text-gold" : "text-pink-100",
                  )}
                  aria-hidden
                />
              </m.span>
            </button>
          ))}
        </div>
        <span className="h-6 text-sm font-semibold whitespace-nowrap text-ink" aria-live="polite">
          {shown ? RATING_LABELS[shown] : "Chọn số sao"}
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
