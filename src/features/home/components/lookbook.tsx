"use client";

import { useScroll, useTransform } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useRef } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Accent, Eyebrow } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type Shot = { src: string; caption: string; tape: string; rotate: string };

const COLUMNS: { speed: number; shots: Shot[]; className?: string }[] = [
  {
    speed: 60,
    shots: [
      {
        src: "/products/ttxx-003/main.webp",
        caption: "Toa 03 × váy hoa nhí — picnic cuối tuần",
        tape: "bg-sun/70",
        rotate: "-rotate-3",
      },
      {
        src: "/products/ttxx-006/detail-1.webp",
        caption: "Bạc Hà loang nắng sớm",
        tape: "bg-mint/70",
        rotate: "rotate-2",
      },
    ],
  },
  {
    speed: -40,
    className: "md:pt-24",
    shots: [
      {
        src: "/products/ttxx-004/main.webp",
        caption: "Caro Dâu Tây × blazer kem",
        tape: "bg-pink-100/80",
        rotate: "rotate-2",
      },
      {
        src: "/products/ttxx-005/detail-1.webp",
        caption: "Ánh nhũ dưới đèn sân ga",
        tape: "bg-lilac/60",
        rotate: "-rotate-2",
      },
    ],
  },
  {
    speed: 90,
    className: "hidden lg:block",
    shots: [
      {
        src: "/products/ttxx-001/detail-2.webp",
        caption: "Gói quà xinh cho bạn thân",
        tape: "bg-sky/50",
        rotate: "-rotate-2",
      },
      {
        src: "/products/ttxx-002/detail-1.webp",
        caption: "Sọc kẹo — ấm áp mùa se lạnh",
        tape: "bg-peach/60",
        rotate: "rotate-3",
      },
    ],
  },
];

function Polaroid({ shot }: { shot: Shot }) {
  return (
    <figure
      className={cn(
        "relative rounded-md bg-white p-3 pb-4 shadow-float transition-transform duration-500 hover:scale-[1.02] hover:rotate-0",
        shot.rotate,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-4deg] rounded-sm",
          shot.tape,
        )}
      />
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
        <Image
          src={shot.src}
          alt={shot.caption}
          fill
          sizes="(min-width: 1024px) 26vw, (min-width: 768px) 40vw, 85vw"
          className="object-cover"
        />
      </div>
      <figcaption className="mt-3 text-center font-serif text-lg text-ink italic">
        {shot.caption}
      </figcaption>
    </figure>
  );
}

function Column({ speed, shots, className }: (typeof COLUMNS)[number]) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  return (
    <m.div ref={ref} style={{ y }} className={cn("flex flex-col gap-12", className)}>
      {shots.map((shot) => (
        <Polaroid key={shot.src} shot={shot} />
      ))}
    </m.div>
  );
}

export function Lookbook() {
  return (
    <section
      id="lookbook"
      className="relative scroll-mt-24 overflow-hidden py-28"
      aria-labelledby="lookbook-title"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,var(--color-pink-100),transparent_45%),radial-gradient(circle_at_90%_70%,var(--color-sky-100),transparent_45%)]"
      />
      <div className="container-page grid gap-16 lg:grid-cols-[0.8fr_2fr]">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Lookbook · Sân ga mùa thu</Eyebrow>
          <h2
            id="lookbook-title"
            className="mt-5 text-5xl leading-[1.02] font-extrabold sm:text-6xl"
          >
            Một chiếc khăn, <Accent>ngàn</Accent> cách điệu
          </h2>
          <p className="mt-5 text-lg text-ink-soft">
            Quàng hờ, thắt nơ, buộc túi hay làm băng đô — mỗi toa khăn mở ra một phong cách mới. Đây
            là vài khoảnh khắc trên chuyến tàu mùa thu của Tu Tu Xình Xịch.
          </p>
          <p className="mt-6 text-sm text-ink-faint">Ảnh minh họa sản phẩm (demo).</p>
        </Reveal>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {COLUMNS.map((column, i) => (
            <Column key={i} {...column} />
          ))}
        </div>
      </div>
    </section>
  );
}
