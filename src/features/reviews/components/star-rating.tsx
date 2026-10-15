import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRating } from "../domain";

/** Hiển thị sao (hỗ trợ nửa sao) — chỉ đọc. */
export function StarRating({
  value,
  count,
  size = "sm",
  showValue = false,
  className,
}: {
  value: number;
  count?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const dim = { xs: "size-3", sm: "size-4", md: "size-5", lg: "size-7" }[size];
  const label = `${formatRating(value)} trên 5 sao${count !== undefined ? `, ${count} đánh giá` : ""}`;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={label}
      data-testid="star-rating"
    >
      <span className="relative inline-flex">
        <span className="flex text-pink-100">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={cn(dim, "fill-current")} aria-hidden />
          ))}
        </span>
        <span
          className="absolute inset-y-0 left-0 flex overflow-hidden text-gold"
          style={{ width: `${pct}%` }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={cn(dim, "shrink-0 fill-current")} aria-hidden />
          ))}
        </span>
      </span>
      {showValue ? (
        <span className="font-display font-extrabold text-ink">{formatRating(value)}</span>
      ) : null}
      {count !== undefined ? <span className="text-ink-soft">({count})</span> : null}
    </span>
  );
}
