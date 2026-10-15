"use client";

import { Check, ShoppingBag } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { useCatalogStore } from "@/features/catalog/client-store";
import { cn } from "@/lib/utils";
import { maxPurchasable } from "../domain";
import { useCart, useCartFlights, useCartUI } from "../store";

type Props = {
  product: { id: string; name: string; stock: number; imageUrl: string };
  quantity?: number;
  variant?: "primary" | "candy" | "aurora" | "light";
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm";
  className?: string;
  /** Mở giỏ hàng sau khi thêm (mặc định: hiện thông báo). */
  openDrawer?: boolean;
  compact?: boolean;
};

export function AddToCartButton({
  product,
  quantity = 1,
  variant = "primary",
  size = "lg",
  className,
  openDrawer = false,
  compact = false,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const [justAdded, setJustAdded] = useState(false);
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.lines.find((l) => l.productId === product.id)?.quantity ?? 0);
  const launch = useCartFlights((s) => s.launch);
  const setOpen = useCartUI((s) => s.setOpen);
  const soldOut = product.stock <= 0;
  const max = maxPurchasable(product.stock);

  function handleClick() {
    if (soldOut) return;
    const added = add(product.id, quantity, product.stock);
    if (added === 0) {
      toast.error(
        `Bạn đã có ${inCart} chiếc “${product.name}” trong giỏ — đây là số lượng tối đa có thể mua.`,
      );
      return;
    }
    void useCatalogStore.getState().load();

    const source = [
      ...document.querySelectorAll<HTMLElement>(`[data-flight-source="${product.id}"]`),
    ].find((el) => el.getClientRects().length > 0 && el.getBoundingClientRect().width > 0);
    const rect = (source ?? ref.current)?.getBoundingClientRect();
    if (rect && product.imageUrl) launch(product.imageUrl, rect);

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);

    const partial = added < quantity ? ` (chỉ thêm được ${added} vì giới hạn tồn kho)` : "";
    if (openDrawer) {
      window.setTimeout(() => setOpen(true), 650);
    } else {
      toast.success(`Đã thêm “${product.name}” vào giỏ${partial}`, {
        action: { label: "Xem giỏ", onClick: () => setOpen(true) },
      });
    }
  }

  const label = soldOut ? "Hết hàng" : justAdded ? "Đã thêm!" : "Thêm vào giỏ";

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      aria-disabled={inCart >= max && !soldOut ? true : undefined}
      aria-label={compact ? `${label}: ${product.name}` : undefined}
      className={cn(buttonVariants({ variant, size }), "overflow-hidden", className)}
      data-testid="add-to-cart"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={justAdded ? "done" : "idle"}
          className="inline-flex items-center gap-2"
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -18, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
        >
          {justAdded ? (
            <Check className="size-5" aria-hidden />
          ) : (
            <ShoppingBag className="size-5" aria-hidden />
          )}
          {compact ? null : label}
        </m.span>
      </AnimatePresence>
    </button>
  );
}
