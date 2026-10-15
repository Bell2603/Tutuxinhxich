import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const CARRIAGES = [
  { body: "#FFB3D1", stripe: "#FF4F9A" },
  { body: "#FFE066", stripe: "#FF9F7A" },
  { body: "#FFF4D6", stripe: "#FFD447" },
  { body: "#FFC2D4", stripe: "#E8344E" },
  { body: "#2C3A8C", stripe: "#F2C14E" },
  { body: "#9EEBD0", stripe: "#5CC8FF" },
];

function Carriage({ body, stripe, index }: { body: string; stripe: string; index: number }) {
  return (
    <svg viewBox="0 0 72 48" className="h-12 w-[4.5rem] shrink-0" aria-hidden>
      <rect
        x="2"
        y="6"
        width="68"
        height="30"
        rx="8"
        fill={body}
        stroke="#2B1145"
        strokeWidth="3"
      />
      <rect x="2" y="27" width="68" height="5" fill={stripe} />
      <rect
        x="10"
        y="12"
        width="14"
        height="11"
        rx="3"
        fill="#FFF8F1"
        stroke="#2B1145"
        strokeWidth="2"
      />
      <rect
        x="29"
        y="12"
        width="14"
        height="11"
        rx="3"
        fill="#FFF8F1"
        stroke="#2B1145"
        strokeWidth="2"
      />
      <rect
        x="48"
        y="12"
        width="14"
        height="11"
        rx="3"
        fill="#FFF8F1"
        stroke="#2B1145"
        strokeWidth="2"
      />
      <text
        x="36"
        y="22"
        textAnchor="middle"
        fontSize="8"
        fontWeight="800"
        fill="#2B1145"
        fontFamily="sans-serif"
      >
        {String(index + 1).padStart(2, "0")}
      </text>
      <g className="origin-center animate-wheel [transform-box:fill-box]">
        <circle cx="16" cy="40" r="6" fill="#2B1145" />
        <circle cx="16" cy="40" r="2" fill="#FFCF3F" />
      </g>
      <g className="origin-center animate-wheel [transform-box:fill-box]">
        <circle cx="56" cy="40" r="6" fill="#2B1145" />
        <circle cx="56" cy="40" r="2" fill="#FFCF3F" />
      </g>
    </svg>
  );
}

/** Đoàn tàu "Tu Tu Xình Xịch" 6 toa chạy trên đường ray (trang trí). */
export function Train({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none relative h-20 overflow-hidden", className)} aria-hidden>
      <div className="absolute inset-x-0 bottom-3 h-1.5 rounded-full bg-ink/80" />
      <div className="absolute inset-x-0 bottom-0 h-3 bg-[repeating-linear-gradient(90deg,rgb(43_17_69/0.55)_0_6px,transparent_6px_22px)]" />
      <div className="absolute bottom-4 flex animate-[ride_22s_linear_infinite] items-end gap-1 motion-reduce:left-4 motion-reduce:animate-none">
        {CARRIAGES.map((c, i) => (
          <div key={i} className="animate-chug" style={{ animationDelay: `${i * 80}ms` }}>
            <Carriage {...c} index={5 - i} />
          </div>
        ))}
        <div className="animate-chug">
          <LogoMark className="h-16 w-16" />
        </div>
      </div>
    </div>
  );
}
