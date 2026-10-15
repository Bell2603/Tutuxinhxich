"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

/** Bộ ảnh sản phẩm: ảnh lớn có kính lúp khi rê chuột, vuốt ngang trên mobile, thumbnail chọn ảnh. */
export function ProductGallery({
  images,
  name,
  productId,
}: {
  images: string[];
  name: string;
  productId: string;
}) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const current = images[index] ?? images[0] ?? "";

  function onMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[5rem_minmax(0,1fr)]">
      {/* Desktop: ảnh lớn + kính lúp */}
      <div
        className="relative hidden aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-[2.5rem] bg-pink-50 shadow-card lg:col-start-2 lg:row-start-1 lg:block"
        onPointerMove={onMove}
        onPointerLeave={() => setZoom(null)}
        data-flight-source={productId}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <m.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Image
              src={current}
              alt={`${name} — ảnh ${index + 1}`}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 45vw, 1px"
              quality={90}
              className="object-cover transition-transform duration-200 ease-out"
              style={
                zoom
                  ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                  : undefined
              }
            />
          </m.div>
        </AnimatePresence>
      </div>

      {/* Mobile: vuốt ngang */}
      <div className="relative min-w-0 lg:hidden">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto rounded-[2rem] [&::-webkit-scrollbar]:hidden"
          data-flight-source={productId}
        >
          {images.map((src, i) => (
            <div key={src} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-pink-50">
              <Image
                src={src}
                alt={`${name} — ảnh ${i + 1}`}
                fill
                loading={i === 0 ? "eager" : "lazy"}
                sizes="(max-width: 1023px) 100vw, 1px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2" aria-hidden>
          {images.map((src, i) => (
            <span
              key={src}
              className={cn(
                "h-2 rounded-full bg-white/80 transition-all",
                i === index ? "w-6 bg-ink" : "w-2",
              )}
            />
          ))}
        </div>
      </div>

      <div
        className="hidden gap-3 lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col"
        role="group"
        aria-label="Chọn ảnh sản phẩm"
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Xem ảnh ${i + 1}`}
            aria-pressed={i === index}
            className={cn(
              "relative size-20 overflow-hidden rounded-2xl ring-2 focus-ring transition-all duration-300",
              i === index ? "scale-105 ring-ink" : "opacity-70 ring-transparent hover:opacity-100",
            )}
          >
            <Image src={src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
