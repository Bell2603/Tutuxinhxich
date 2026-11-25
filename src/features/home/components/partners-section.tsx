"use client";

import { useScroll, useTransform } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useRef, useSyncExternalStore } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Accent, Eyebrow } from "@/components/ui/section-heading";
import { PARTNERS, type Partner } from "@/config/partners";
import { cn } from "@/lib/utils";

type Decor = { tape: string; rotate: string };

/** Kiểu polaroid lặp theo thứ tự đối tác (giữ nguyên phong cách Lookbook cũ). */
const DECOR: readonly Decor[] = [
  { tape: "bg-sun/70", rotate: "-rotate-3" },
  { tape: "bg-pink-100/80", rotate: "rotate-2" },
  { tape: "bg-sky/50", rotate: "-rotate-2" },
  { tape: "bg-mint/70", rotate: "rotate-2" },
  { tape: "bg-lilac/60", rotate: "-rotate-2" },
  { tape: "bg-peach/60", rotate: "rotate-3" },
];

/**
 * 3 cột parallax với tốc độ khác nhau (như Lookbook cũ). Khác Lookbook: không ẩn cột 3 trên màn hình nhỏ
 * — mỗi thẻ là một link đối tác nên phải luôn hiển thị.
 */
const COLUMNS: readonly { speed: number; className?: string }[] = [
  { speed: 60 },
  { speed: -40, className: "md:pt-24" },
  { speed: 90 },
];

type Card = { partner: Partner; decor: Decor };

/**
 * Parallax chỉ bật khi 3 cột nằm cạnh nhau (≥ lg). Khi cột xếp chồng (mobile/tablet), các cột trượt
 * ngược chiều sẽ đè lên nhau và che tên đối tác.
 */
const PARALLAX_QUERY = "(min-width: 1024px)";

function subscribeParallax(onChange: () => void) {
  const query = window.matchMedia(PARALLAX_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useParallaxEnabled() {
  return useSyncExternalStore(
    subscribeParallax,
    () => window.matchMedia(PARALLAX_QUERY).matches,
    () => false,
  );
}

/** Chia đối tác lần lượt vào tối đa 3 cột. */
export function distribute(partners: readonly Partner[]): Card[][] {
  const columnCount = Math.min(partners.length, COLUMNS.length);
  const columns: Card[][] = Array.from({ length: columnCount }, () => []);
  partners.forEach((partner, i) => {
    columns[i % columnCount]!.push({ partner, decor: DECOR[i % DECOR.length]! });
  });
  return columns;
}

function Polaroid({ partner, decor }: Card) {
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Mở website ${partner.name} (mở tab mới)`}
      data-testid="partner-link"
      className="block rounded-md focus-ring"
    >
      <figure
        className={cn(
          "relative rounded-md bg-white p-3 pb-4 shadow-float transition-transform duration-500 hover:scale-[1.02] hover:rotate-0",
          decor.rotate,
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-4deg] rounded-sm",
            decor.tape,
          )}
        />
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-white">
          <Image
            src={partner.logo}
            alt={`Logo ${partner.name}`}
            fill
            sizes="(min-width: 1024px) 26vw, (min-width: 768px) 40vw, 85vw"
            className="object-contain"
          />
        </div>
        <figcaption className="mt-3 text-center font-serif text-lg text-ink italic">
          {partner.name}
        </figcaption>
      </figure>
    </a>
  );
}

function Column({
  speed,
  className,
  cards,
}: (typeof COLUMNS)[number] & { cards: readonly Card[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  return (
    <m.div ref={ref} style={{ y }} className={cn("flex flex-col gap-12", className)}>
      {cards.map((card) => (
        <Polaroid key={card.partner.url} {...card} />
      ))}
    </m.div>
  );
}

/** Khu vực đối tác trên trang chủ — hiệu ứng parallax polaroid của Lookbook cũ. Không có đối tác → không render. */
export function PartnersSection({ partners = PARTNERS }: { partners?: readonly Partner[] }) {
  const parallax = useParallaxEnabled();
  if (partners.length === 0) return null;
  const columns = distribute(partners);
  return (
    <section
      id="doi-tac"
      className="relative scroll-mt-24 overflow-hidden py-28"
      aria-labelledby="partners-title"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,var(--color-pink-100),transparent_45%),radial-gradient(circle_at_90%_70%,var(--color-sky-100),transparent_45%)]"
      />
      <div className="container-page grid grid-cols-1 gap-16 lg:grid-cols-[0.8fr_2fr]">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Đối tác · Cùng chuyến tàu</Eyebrow>
          <h2
            id="partners-title"
            className="mt-5 text-5xl leading-[1.02] font-extrabold sm:text-6xl"
          >
            Những người bạn <Accent>đồng hành</Accent>
          </h2>
          <p className="mt-5 text-lg text-ink-soft">
            Tu Tu Xình Xịch không đi một mình — đây là những cửa hàng, thương hiệu trẻ cùng chung
            chuyến tàu. Ghé thăm họ nhé!
          </p>
        </Reveal>
        <div
          className={cn(
            "grid grid-cols-1 gap-10",
            columns.length === 1 ? "md:max-w-sm" : "md:grid-cols-2",
            columns.length === 3 && "lg:grid-cols-3",
          )}
        >
          {columns.map((cards, i) => (
            <Column
              // Đổi key khi bật/tắt parallax → dựng lại useTransform với biên độ mới.
              key={`${i}-${parallax}`}
              {...COLUMNS[i]!}
              speed={parallax ? COLUMNS[i]!.speed : 0}
              cards={cards}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
