import { discountPercent, formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  price,
  compareAtPrice,
  size = "md",
  className,
  tone = "dark",
}: {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  tone?: "dark" | "light";
}) {
  const discount = discountPercent(price, compareAtPrice);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span
        className={cn(
          "font-display font-extrabold tracking-tight",
          size === "sm" && "text-base",
          size === "md" && "text-lg",
          size === "lg" && "text-3xl sm:text-4xl",
          tone === "light" ? "text-white" : "text-ink",
        )}
        data-testid="price"
      >
        {formatVND(price)}
      </span>
      {discount > 0 && compareAtPrice ? (
        <>
          <span className="sr-only">Giá gốc</span>
          <s
            className={cn(
              "font-medium",
              size === "lg" ? "text-lg" : "text-sm",
              tone === "light" ? "text-white/70" : "text-ink-faint",
            )}
            data-testid="compare-at-price"
          >
            {formatVND(compareAtPrice)}
          </s>
          <span className="rounded-full bg-bubblegum px-2 py-0.5 text-xs font-bold text-ink">
            -{discount}%
          </span>
        </>
      ) : null}
    </div>
  );
}
