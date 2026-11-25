import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Accent, Eyebrow } from "@/components/ui/section-heading";
import { site } from "@/config/site";

const ROWS = [
  {
    Icon: Phone,
    label: "Điện thoại",
    value: site.contact.phone,
    href: `tel:${site.contact.phone}`,
  },
  {
    Icon: Mail,
    label: "Email",
    value: site.contact.email,
    href: `mailto:${site.contact.email}`,
  },
  { Icon: MapPin, label: "Cửa hàng", value: site.contact.address },
  { Icon: Clock, label: "Giờ mở cửa", value: site.contact.hours },
] as const;

/** Thông tin liên hệ + bản đồ cửa hàng (iframe Google Maps — CSP frame-src https://www.google.com). */
export function ContactSection() {
  return (
    <section
      id="lien-he"
      className="container-page scroll-mt-24 py-16"
      aria-labelledby="contact-title"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <Eyebrow>Liên hệ</Eyebrow>
          <h2
            id="contact-title"
            className="mt-5 text-4xl leading-[1.05] font-extrabold sm:text-5xl"
          >
            Ghé <Accent>sân ga</Accent> Tu Tu nhé!
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Cần tư vấn chọn khăn, hỏi về đơn hàng hay muốn tận tay sờ thử chất vải — cứ gọi, nhắn
            hoặc ghé cửa hàng.
          </p>
          <ul className="mt-8 space-y-4" data-testid="contact-info">
            {ROWS.map(({ Icon, label, value, ...rest }) => (
              <li
                key={label}
                className="flex items-start gap-4 rounded-[1.5rem] bg-white p-4 shadow-card ring-1 ring-line"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-pink-50 text-berry">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-soft">{label}</p>
                  <p className="font-display text-lg font-bold text-ink">
                    {"href" in rest ? (
                      <a href={rest.href} className="focus-ring hover:text-berry hover:underline">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="h-full min-h-80 overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-line">
            <iframe
              src={site.contact.mapEmbedUrl}
              title={`Bản đồ cửa hàng ${site.name} — ${site.contact.address}`}
              className="size-full min-h-80 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
