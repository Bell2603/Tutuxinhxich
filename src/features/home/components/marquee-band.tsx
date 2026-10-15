import { Marquee } from "@/components/motion/marquee";
import { Sparkle } from "@/components/ui/sparkle";

const WORDS = [
  "Mây Hồng Kẹo Bông",
  "Sọc Kẹo Cầu Vồng",
  "Hoa Cúc Sân Ga",
  "Caro Dâu Tây",
  "Ngân Hà Lấp Lánh",
  "Bạc Hà Sương Sớm",
];

export function MarqueeBand() {
  return (
    <div className="relative z-10 -my-6 overflow-hidden py-6" aria-hidden>
      <div className="-mx-[5%] rotate-[-2deg] bg-ink py-4 text-cream shadow-float">
        <Marquee>
          {WORDS.map((word) => (
            <span
              key={word}
              className="flex items-center gap-6 pr-6 font-display text-2xl font-extrabold whitespace-nowrap sm:text-3xl"
            >
              {word}
              <Sparkle className="size-5 text-bubblegum" />
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
