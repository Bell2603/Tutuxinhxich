"use client";

import { Heart } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWishlist } from "../store";

const BURST = [0, 60, 120, 180, 240, 300];
const BURST_COLORS = ["#FF4F9A", "#A98BFF", "#5CC8FF", "#FFCF3F", "#FF4F9A", "#5FE0B7"];

/** Nút "thả tim": tim bật nảy + chùm tim nhỏ bay ra khi thêm vào yêu thích. */
export function WishlistButton({
  productId,
  name,
  className,
  size = "md",
}: {
  productId: string;
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const hydrated = useWishlist((s) => s.hydrated);
  const active = useWishlist((s) => s.ids.includes(productId)) && hydrated;
  const toggle = useWishlist((s) => s.toggle);
  const [burst, setBurst] = useState(0);
  const router = useRouter();

  function onClick() {
    const added = toggle(productId);
    if (added) {
      setBurst((n) => n + 1);
      toast.success(`Đã thả tim “${name}”`, {
        action: { label: "Xem", onClick: () => router.push("/yeu-thich") },
      });
    }
  }

  const dim = size === "sm" ? "size-9" : size === "lg" ? "size-14" : "size-11";
  const icon = size === "lg" ? "size-6" : "size-5";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={
        active ? `Bỏ “${name}” khỏi danh sách yêu thích` : `Thêm “${name}” vào danh sách yêu thích`
      }
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full bg-white/90 text-ink shadow-sm ring-1 ring-line focus-ring backdrop-blur transition-[transform,background-color] duration-300 ease-[var(--ease-bounce)] hover:scale-110 active:scale-95",
        active && "bg-pink-50 text-berry",
        dim,
        className,
      )}
      data-testid="wishlist-button"
    >
      <m.span
        key={`heart-${burst}`}
        animate={burst ? { scale: [1, 1.45, 0.85, 1.1, 1] } : undefined}
        transition={{ duration: 0.55 }}
      >
        <Heart className={cn(icon, active && "fill-current")} aria-hidden />
      </m.span>
      <AnimatePresence>
        {burst ? (
          <m.span
            key={`burst-${burst}`}
            className="pointer-events-none absolute inset-0"
            aria-hidden
          >
            {BURST.map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <m.span
                  key={angle}
                  className="absolute top-1/2 left-1/2 -mt-1 -ml-1 size-2 rounded-full"
                  style={{ backgroundColor: BURST_COLORS[i] }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(rad) * 26, y: Math.sin(rad) * 26, opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              );
            })}
          </m.span>
        ) : null}
      </AnimatePresence>
    </button>
  );
}

/** Lối tắt trên header tới /yeu-thich, kèm số lượng. */
export function WishlistLink({ className }: { className?: string }) {
  const hydrated = useWishlist((s) => s.hydrated);
  const count = useWishlist((s) => s.ids.length);
  const shown = hydrated ? count : 0;
  return (
    <Link
      href="/yeu-thich"
      className={cn(
        "relative grid size-10 place-items-center rounded-full bg-white/70 text-ink shadow-sm focus-ring transition-transform hover:scale-105 sm:size-11",
        className,
      )}
      aria-label={`Danh sách yêu thích, ${shown} sản phẩm`}
      data-testid="wishlist-link"
    >
      <Heart className={cn("size-5", shown > 0 && "fill-bubblegum text-berry")} aria-hidden />
      {shown > 0 ? (
        <m.span
          key={shown}
          initial={{ scale: 0.4 }}
          animate={{ scale: [1.4, 1] }}
          className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.65rem] leading-5 font-bold text-cream ring-2 ring-cream"
          data-testid="wishlist-count"
        >
          {shown}
        </m.span>
      ) : null}
    </Link>
  );
}
