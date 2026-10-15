import { cn } from "@/lib/utils";

/** Ngôi sao 4 cánh trang trí (không mang nội dung). */
export function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("pointer-events-none", className)}
      style={style}
    >
      <path
        d="M12 0 Q13.6 10.4 24 12 Q13.6 13.6 12 24 Q10.4 13.6 0 12 Q10.4 10.4 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
