"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import { SplitText } from "@/components/motion/split-text";
import { ButtonLink } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { site } from "@/config/site";
import { Train } from "./train";

const CARDS = [
  {
    src: "/products/ttxx-001/main.webp",
    alt: "Khăn Mây Hồng Kẹo Bông",
    className: "left-[4%] top-[6%] w-[52%] rotate-[-8deg]",
    depth: 28,
    delay: 0.35,
  },
  {
    src: "/products/ttxx-005/main.webp",
    alt: "Khăn Ngân Hà Lấp Lánh",
    className: "right-[2%] top-[0%] w-[46%] rotate-[7deg]",
    depth: 48,
    delay: 0.5,
  },
  {
    src: "/products/ttxx-002/main.webp",
    alt: "Khăn Sọc Kẹo Cầu Vồng",
    className: "left-[26%] bottom-[2%] w-[48%] rotate-[3deg]",
    depth: 64,
    delay: 0.65,
  },
];

const ACCENT_WORDS = new Set(["Xinh", "chất"]);

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 15 });
  const sy = useSpring(my, { stiffness: 60, damping: 15 });

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section
      ref={ref}
      className="relative isolate -mt-[4.5rem] overflow-hidden pt-[4.5rem]"
      aria-labelledby="hero-title"
    >
      {/* Nền: các khối màu loang chuyển động chậm */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-candy">
        <div className="absolute top-[-10%] left-[-10%] size-[32rem] animate-blob rounded-full bg-pink-100/80 blur-3xl" />
        <div className="absolute top-[20%] right-[-12%] size-[30rem] animate-blob rounded-full bg-lilac-100 blur-3xl [animation-delay:-6s]" />
        <div className="absolute bottom-[-15%] left-[30%] size-[28rem] animate-blob rounded-full bg-sky-100 blur-3xl [animation-delay:-12s]" />
      </div>

      <div className="container-page grid items-center gap-10 pt-10 pb-6 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pt-16">
        <m.div style={{ y: textY, opacity: fade }} className="relative z-10">
          <m.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold tracking-[0.2em] text-berry uppercase shadow-sm ring-1 ring-pink-100 backdrop-blur"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-bubblegum opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-bubblegum" />
            </span>
            BST {site.collectionName} · 2026
          </m.p>

          <h1
            id="hero-title"
            className="mt-6 text-[2.9rem] leading-[0.98] font-extrabold tracking-tight sm:text-7xl xl:text-[5.6rem]"
          >
            <SplitText
              text="Xinh từng nút thắt,"
              delay={0.2}
              wordClassName={(w) =>
                ACCENT_WORDS.has(w)
                  ? "font-serif font-semibold italic text-gradient pr-1"
                  : undefined
              }
            />
            <br />
            <SplitText
              text="chất từng chuyến đi."
              delay={0.45}
              wordClassName={(w) =>
                ACCENT_WORDS.has(w)
                  ? "font-serif font-semibold italic text-gradient pr-1"
                  : undefined
              }
            />
          </h1>

          <m.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 max-w-xl text-lg text-ink-soft sm:text-xl"
          >
            {site.tagline}. Lụa satin, len, voan, cotton linen — rực rỡ, đáng yêu và đầy cá tính.{" "}
            <strong className="font-semibold text-ink">Tu tu! Lên tàu thôi!</strong>
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <ButtonLink href="/bo-suu-tap" size="lg" variant="primary" className="group">
              Lên tàu mua sắm
              <ArrowRight
                className="size-5 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </ButtonLink>
            <ButtonLink href="/#lookbook" size="lg" variant="light">
              Xem lookbook
            </ButtonLink>
          </m.div>

          <m.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.15 }}
            className="mt-10 grid max-w-md grid-cols-3 gap-3"
          >
            {[
              ["06", "mẫu khăn độc quyền"],
              ["04", "chất liệu chọn lọc"],
              ["500K", "free ship từ"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-3xl bg-white/70 p-3 shadow-sm ring-1 ring-line backdrop-blur"
              >
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="block font-display text-2xl font-extrabold">{value}</span>
                  <span className="text-xs leading-tight text-ink-soft">{label}</span>
                </dd>
              </div>
            ))}
          </m.dl>
        </m.div>

        <m.div
          style={{ y: visualY }}
          className="relative mx-auto aspect-[1/1.05] w-full max-w-[34rem]"
          onPointerMove={onPointerMove}
        >
          <m.div
            aria-hidden
            className="absolute inset-[6%] rounded-[40%_60%_55%_45%/50%_40%_60%_50%] bg-aurora opacity-90"
            initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 0.9, rotate: 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 14, delay: 0.15 }}
          />
          <div
            aria-hidden
            className="absolute inset-[6%] animate-[spin-slow_40s_linear_infinite] rounded-full border-2 border-dashed border-white/60 motion-reduce:animate-none"
          />

          {CARDS.map((card) => (
            <HeroCard key={card.src} card={card} sx={sx} sy={sy} />
          ))}

          <div className="absolute -bottom-2 -left-2 hidden size-32 sm:block" aria-hidden>
            <svg
              viewBox="0 0 120 120"
              className="size-full animate-[spin-slow_18s_linear_infinite] motion-reduce:animate-none"
            >
              <defs>
                <path id="hero-circle" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
              </defs>
              <circle cx="60" cy="60" r="58" fill="#FFF8F1" />
              <text
                fontSize="11.5"
                fontWeight="800"
                letterSpacing="3.2"
                fill="#2B1145"
                fontFamily="var(--font-bricolage)"
              >
                <textPath href="#hero-circle">TU TU XÌNH XỊCH ✦ 6 TOA ✦ 2026 ✦</textPath>
              </text>
            </svg>
            <span className="absolute inset-0 grid place-items-center text-3xl">🚂</span>
          </div>

          <Sparkle className="absolute top-[8%] left-[42%] size-8 animate-twinkle text-white" />
          <Sparkle className="absolute top-[52%] right-[2%] size-6 animate-twinkle text-sun [animation-delay:0.8s]" />
          <Sparkle className="absolute bottom-[18%] left-[4%] size-5 animate-twinkle text-bubblegum [animation-delay:1.4s]" />
        </m.div>
      </div>

      <div className="container-page flex justify-center pb-2">
        <a
          href="#bo-suu-tap"
          className="flex flex-col items-center gap-1 text-xs font-semibold text-ink-soft focus-ring hover:text-ink"
        >
          Cuộn để xem 6 toa khăn
          <ArrowDown className="size-4 animate-bounce motion-reduce:animate-none" aria-hidden />
        </a>
      </div>
      <Train />
    </section>
  );
}

type Card = (typeof CARDS)[number];

function HeroCard({
  card,
  sx,
  sy,
}: {
  card: Card;
  sx: ReturnType<typeof useSpring>;
  sy: ReturnType<typeof useSpring>;
}) {
  const x = useTransform(sx, (v) => v * card.depth);
  const y = useTransform(sy, (v) => v * card.depth);
  return (
    <m.div className={`absolute ${card.className}`} style={{ x, y }}>
      <m.div
        initial={{ opacity: 0, y: 60, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 14, delay: card.delay }}
      >
        <div
          className="animate-float rounded-[1.8rem] bg-white p-2 shadow-float ring-1 ring-white/60 motion-reduce:animate-none"
          style={{ animationDelay: `${card.delay * -4}s` }}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem]">
            <Image
              src={card.src}
              alt={card.alt}
              fill
              loading="eager"
              sizes="(min-width: 1024px) 18rem, 45vw"
              className="object-cover"
            />
          </div>
        </div>
      </m.div>
    </m.div>
  );
}
