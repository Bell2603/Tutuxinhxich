"use client";

import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { AnimatePresence, type PanInfo } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 450;

/**
 * Xem ảnh toàn màn hình. Khung ảnh dùng chung `layoutId` với ảnh trong gallery nên ảnh "bay" ra/vào
 * (shared-element). Vuốt/phím ←→ để đổi ảnh, bấm vào ảnh để phóng to 2× tại điểm bấm, kéo để xem chi tiết.
 */
export function Lightbox({
  images,
  name,
  index,
  layoutId,
  onIndexChange,
  onClose,
}: {
  images: string[];
  name: string;
  index: number;
  layoutId: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const mounted = useMounted();
  const [direction, setDirection] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const count = images.length;

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setZoom(null);
      setDirection(delta);
      onIndexChange((index + delta + count) % count);
    },
    [count, index, onIndexChange],
  );

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "Tab") {
        // Giữ focus trong lightbox.
        const items = [...document.querySelectorAll<HTMLElement>("[data-lightbox] button")];
        if (items.length === 0) return;
        const first = items[0]!;
        const last = items[items.length - 1]!;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      restoreRef.current?.focus?.();
    };
  }, [go, onClose]);

  function toggleZoom(event: MouseEvent<HTMLDivElement>) {
    if (zoom) {
      setZoom(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (zoom) return;
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) go(1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) go(-1);
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`Ảnh sản phẩm ${name}`}
      data-lightbox
      data-testid="lightbox"
    >
      <m.div
        className="absolute inset-0 bg-night/95 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden
      />

      <div className="relative z-10 flex items-center justify-between px-4 pt-4 text-cream sm:px-6">
        <p className="text-sm font-semibold" aria-live="polite">
          <span className="font-display text-lg">{index + 1}</span> / {count} · {name}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setZoom(zoom ? null : { x: 50, y: 50 })}
            className="grid size-11 place-items-center rounded-full bg-white/10 focus-ring hover:bg-white/20"
            aria-label={zoom ? "Thu nhỏ" : "Phóng to"}
          >
            {zoom ? (
              <ZoomOut className="size-5" aria-hidden />
            ) : (
              <ZoomIn className="size-5" aria-hidden />
            )}
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full bg-white/10 focus-ring transition-transform duration-300 hover:rotate-90 hover:bg-white/20"
            aria-label="Đóng xem ảnh"
            data-testid="lightbox-close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-20">
        <m.div
          layoutId={layoutId}
          className="relative aspect-[4/5] h-full max-h-[calc(100dvh-11rem)] max-w-full overflow-hidden rounded-[2rem] bg-pink-50 shadow-float"
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <m.div
              key={images[index]}
              custom={direction}
              className={cn("absolute inset-0", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
              variants={{
                enter: (d: number) => ({ x: d > 0 ? "60%" : d < 0 ? "-60%" : 0, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d > 0 ? "-60%" : d < 0 ? "60%" : 0, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              drag={zoom ? true : "x"}
              dragSnapToOrigin={!zoom}
              dragElastic={zoom ? 0.2 : 0.6}
              dragConstraints={
                zoom ? { left: -220, right: 220, top: -260, bottom: 260 } : { left: 0, right: 0 }
              }
              onDragEnd={onDragEnd}
              onClick={toggleZoom}
              data-testid="lightbox-image"
            >
              <m.div
                className="absolute inset-0"
                animate={{ scale: zoom ? 2 : 1 }}
                style={{ transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%" }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              >
                <Image
                  src={images[index]!}
                  alt={`${name} — ảnh ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 70vh, 100vw"
                  quality={90}
                  draggable={false}
                  className="pointer-events-none object-cover select-none"
                />
              </m.div>
            </m.div>
          </AnimatePresence>
        </m.div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-float focus-ring transition-transform hover:scale-110 sm:left-6 sm:grid"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="size-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute top-1/2 right-2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-float focus-ring transition-transform hover:scale-110 sm:right-6 sm:grid"
              aria-label="Ảnh tiếp theo"
              data-testid="lightbox-next"
            >
              <ChevronRight className="size-6" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <m.div
          className="relative z-10 flex justify-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i - index)}
              aria-label={`Xem ảnh ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "relative size-14 overflow-hidden rounded-xl ring-2 focus-ring transition-all",
                i === index
                  ? "scale-105 ring-bubblegum"
                  : "opacity-60 ring-transparent hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </m.div>
      ) : null}
      <p className="sr-only">Dùng phím mũi tên trái/phải để đổi ảnh, Esc để đóng.</p>
    </div>,
    document.body,
  );
}
