"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  max,
  min = 1,
  onChange,
  label,
  size = "md",
  className,
}: {
  value: number;
  max: number;
  min?: number;
  onChange: (value: number) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  const [synced, setSynced] = useState(value);
  // Giá trị từ ngoài thay đổi (VD bấm +/−, giỏ được đối chiếu lại) → cập nhật ô nhập.
  if (synced !== value) {
    setSynced(value);
    setDraft(String(value));
  }

  function commit(raw: string) {
    const parsed = Number.parseInt(raw, 10);
    const next = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, min), Math.max(min, max))
      : value;
    setDraft(String(next));
    if (next !== value) onChange(next);
  }

  const btn =
    "grid place-items-center rounded-full text-ink transition-[background-color,transform] duration-200 hover:bg-pink-100 active:scale-90 disabled:pointer-events-none disabled:opacity-35 focus-ring";
  const dim = size === "sm" ? "size-8" : "size-10";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-line bg-white p-1",
        className,
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={cn(btn, dim)}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Giảm số lượng"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <input
        className={cn(
          "w-9 bg-transparent text-center font-semibold tabular-nums outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-lilac",
          size === "sm" ? "text-sm" : "text-base",
        )}
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Số lượng"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 2))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(e.currentTarget.value);
          }
        }}
      />
      <button
        type="button"
        className={cn(btn, dim)}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Tăng số lượng"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
