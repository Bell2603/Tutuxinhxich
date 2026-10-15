"use client";

import { ShoppingBag } from "lucide-react";
import * as m from "motion/react-m";
import { cn } from "@/lib/utils";
import { selectItemCount, useCart, useCartUI } from "../store";

export function CartButton({ className }: { className?: string }) {
  const count = useCart(selectItemCount);
  const hydrated = useCart((s) => s.hydrated);
  const bump = useCartUI((s) => s.bump);
  const setOpen = useCartUI((s) => s.setOpen);
  const shown = hydrated ? count : 0;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      data-cart-target
      data-testid="cart-button"
      className={cn(
        "relative grid size-11 place-items-center rounded-full bg-ink text-cream focus-ring transition-transform duration-300 ease-[var(--ease-bounce)] hover:-translate-y-0.5 hover:rotate-[-6deg] active:scale-95",
        className,
      )}
      aria-label={`Mở giỏ hàng, ${shown} sản phẩm`}
    >
      <m.span
        key={bump}
        animate={bump ? { rotate: [0, -14, 10, -6, 0], scale: [1, 1.15, 1] } : undefined}
        transition={{ duration: 0.6 }}
      >
        <ShoppingBag className="size-5" aria-hidden />
      </m.span>
      {shown > 0 ? (
        <m.span
          key={`count-${bump}-${shown}`}
          initial={{ scale: 0.4 }}
          animate={{ scale: [1.5, 1] }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="absolute -top-1 -right-1 grid min-w-6 place-items-center rounded-full bg-bubblegum px-1.5 text-xs leading-6 font-bold text-ink ring-2 ring-cream"
          data-testid="cart-count"
        >
          {shown}
        </m.span>
      ) : null}
    </button>
  );
}
