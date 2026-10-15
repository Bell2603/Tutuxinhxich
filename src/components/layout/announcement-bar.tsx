import { Marquee } from "@/components/motion/marquee";
import { site } from "@/config/site";

export function AnnouncementBar() {
  return (
    <div className="relative z-40 bg-ink text-cream" role="region" aria-label="Thông báo">
      <p className="sr-only">{site.announcements.join(". ")}</p>
      <Marquee className="py-2 text-[0.8rem] font-semibold tracking-wide">
        {site.announcements.map((text) => (
          <span key={text} className="flex items-center gap-6 pr-6" aria-hidden>
            <span className="text-sun">✦</span>
            {text}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
