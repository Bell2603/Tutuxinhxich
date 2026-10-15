import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Sparkle } from "@/components/ui/sparkle";
import { site } from "@/config/site";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.6c.27 0 .53.04.77.12V9.77a5.7 5.7 0 1 0 4.91 5.63V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.24-1.48z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-night text-cream">
      <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-aurora" />
      <Sparkle className="absolute top-16 right-[8%] size-8 animate-twinkle text-gold" />
      <Sparkle className="absolute bottom-24 left-[6%] size-5 animate-twinkle text-lilac [animation-delay:1s]" />
      <div className="container-page grid grid-cols-1 gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link
            href="/"
            className="group inline-block rounded-2xl text-cream focus-ring"
            aria-label="Trang chủ"
          >
            <Logo onDark />
          </Link>
          <p className="mt-5 max-w-xs font-serif text-xl italic">“{site.slogan}”</p>
          <div className="mt-6 flex gap-3">
            {[
              { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
              { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
              { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-11 place-items-center rounded-full bg-white/10 focus-ring transition-all hover:-translate-y-1 hover:bg-bubblegum hover:text-ink"
              >
                <Icon className="size-5" />
              </a>
            ))}
          </div>
        </div>
        <nav aria-label="Mua sắm">
          <h2 className="text-sm font-bold tracking-[0.2em] text-sun uppercase">Mua sắm</h2>
          <ul className="mt-4 space-y-3 text-cream/85">
            <li>
              <Link className="hover:text-white hover:underline" href="/bo-suu-tap">
                Bộ sưu tập
              </Link>
            </li>
            <li>
              <Link className="hover:text-white hover:underline" href="/#lookbook">
                Lookbook
              </Link>
            </li>
            <li>
              <Link className="hover:text-white hover:underline" href="/#phoi-do">
                Cách phối khăn
              </Link>
            </li>
            <li>
              <Link className="hover:text-white hover:underline" href="/#cau-chuyen">
                Câu chuyện thương hiệu
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Hỗ trợ">
          <h2 className="text-sm font-bold tracking-[0.2em] text-sun uppercase">Hỗ trợ</h2>
          <ul className="mt-4 space-y-3 text-cream/85">
            <li>
              <Link className="hover:text-white hover:underline" href="/tai-khoan">
                Tài khoản & đơn hàng
              </Link>
            </li>
            <li>
              <Link className="hover:text-white hover:underline" href="/chinh-sach">
                Giao hàng & đổi trả
              </Link>
            </li>
            <li>
              <Link className="hover:text-white hover:underline" href="/chinh-sach#bao-quan">
                Bảo quản khăn
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-bold tracking-[0.2em] text-sun uppercase">Liên hệ</h2>
          <ul className="mt-4 space-y-3 text-cream/85">
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden />
              {site.contact.email}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden />
              {site.contact.phone}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {site.contact.address}
            </li>
          </ul>
          <p className="mt-3 text-sm text-cream/60">Thông tin liên hệ mẫu — {site.contact.hours}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {site.name}. Khăn xinh cho mọi chuyến đi.</p>
          <p data-testid="demo-notice">{site.demoNotice}</p>
        </div>
      </div>
    </footer>
  );
}
