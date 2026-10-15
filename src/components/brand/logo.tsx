import { cn } from "@/lib/utils";

/** Biểu tượng: đầu tàu nhỏ quàng khăn — khăn bay như làn khói "tu tu xình xịch". */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id="ttxx-logo-scarf" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#FF4F9A" />
          <stop offset=".55" stopColor="#A98BFF" />
          <stop offset="1" stopColor="#5CC8FF" />
        </linearGradient>
      </defs>
      <path
        className="logo-scarf"
        d="M45 17.5 C 38 9.5, 31 16, 24 9 S 13 7.5, 8 4.5"
        stroke="url(#ttxx-logo-scarf)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M45 20 C 39 13.5, 33 18, 27 12.5"
        stroke="url(#ttxx-logo-scarf)"
        strokeWidth="3.6"
        strokeLinecap="round"
        fill="none"
        opacity=".9"
      />
      <rect x="41" y="13" width="8" height="15" rx="2.2" fill="#2B1145" />
      <rect x="39.5" y="17" width="11" height="5" rx="2.5" fill="#FF4F9A" />
      <rect x="26" y="27" width="30" height="18" rx="8" fill="#FF4F9A" />
      <circle cx="49" cy="35.5" r="3.2" fill="#FFF8F1" />
      <rect x="8" y="18" width="22" height="28" rx="5" fill="#2B1145" />
      <rect x="6" y="14.5" width="26" height="5" rx="2.5" fill="#A98BFF" />
      <rect x="12" y="23" width="14" height="10" rx="3" fill="#FFF8F1" />
      <rect x="5" y="43" width="54" height="5.5" rx="2.75" fill="#2B1145" />
      <circle cx="18" cy="51" r="6.5" fill="#2B1145" />
      <circle cx="18" cy="51" r="2.4" fill="#FFCF3F" />
      <circle cx="44" cy="51" r="6.5" fill="#2B1145" />
      <circle cx="44" cy="51" r="2.4" fill="#FFCF3F" />
    </svg>
  );
}

export function Logo({
  className,
  compact = false,
  onDark = false,
}: {
  className?: string;
  compact?: boolean;
  onDark?: boolean;
}) {
  const mark = (
    <LogoMark className="size-9 shrink-0 transition-transform duration-500 ease-[var(--ease-bounce)] group-hover:scale-110 group-hover:-rotate-6 sm:size-10" />
  );
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {onDark ? <span className="rounded-2xl bg-cream p-1">{mark}</span> : mark}
      <span
        className={cn(
          "font-display leading-none font-extrabold tracking-tight",
          compact && "sr-only sm:not-sr-only",
        )}
      >
        <span
          className={cn(
            "block text-[0.7rem] font-bold tracking-[0.32em] uppercase",
            onDark ? "text-bubblegum" : "text-berry",
          )}
        >
          Tu Tu
        </span>
        <span className="block text-lg whitespace-nowrap sm:text-xl">Xình Xịch</span>
      </span>
    </span>
  );
}
