import type { ProductBadge as ProductBadgeType } from "@/features/catalog/types";
import { BADGE_LABELS } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

const styles: Record<ProductBadgeType, string> = {
  new: "bg-mint text-ink",
  best_seller: "bg-sun text-ink",
  limited: "bg-night text-gold",
};

const icons: Record<ProductBadgeType, string> = { new: "✦", best_seller: "★", limited: "◆" };

export function ProductBadge({
  badge,
  className,
}: {
  badge: ProductBadgeType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.7rem] font-bold tracking-wider uppercase shadow-sm",
        styles[badge],
        className,
      )}
    >
      <span aria-hidden>{icons[badge]}</span>
      {BADGE_LABELS[badge]}
    </span>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-xs font-semibold tracking-wide text-ink backdrop-blur",
        className,
      )}
    >
      {children}
    </span>
  );
}
