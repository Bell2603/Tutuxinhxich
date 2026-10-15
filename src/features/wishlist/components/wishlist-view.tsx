"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/components/ui/button";
import { useCart, useCartUI } from "@/features/cart/store";
import { useCatalog } from "@/features/catalog/client-store";
import { ProductCard, ProductCardSkeleton } from "@/features/catalog/components/product-card";
import { useWishlist } from "../store";

export function WishlistView() {
  const ids = useWishlist((s) => s.ids);
  const hydrated = useWishlist((s) => s.hydrated);
  const { products, status } = useCatalog(hydrated && ids.length > 0);
  const add = useCart((s) => s.add);
  const setOpen = useCartUI((s) => s.setOpen);

  if (!hydrated || (ids.length > 0 && !products && status !== "error")) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: Math.max(1, ids.length || 3) }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Giữ thứ tự thả tim; bỏ sản phẩm đã ẩn/không còn.
  const items = ids.flatMap((id) => products?.find((p) => p.id === id) ?? []);

  if (items.length === 0) {
    return (
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] bg-white p-12 text-center shadow-card ring-1 ring-line"
        data-testid="wishlist-empty"
      >
        <Heart className="mx-auto size-14 text-bubblegum" aria-hidden />
        <p className="mt-4 font-display text-2xl font-extrabold">Chưa có toa nào được thả tim</p>
        <p className="mt-2 text-ink-soft">
          Bấm vào biểu tượng trái tim trên chiếc khăn bạn thích để lưu lại xem sau.
        </p>
        <ButtonLink href="/bo-suu-tap" variant="candy" className="mt-6">
          Khám phá 6 toa khăn
        </ButtonLink>
      </m.div>
    );
  }

  function addAll() {
    let added = 0;
    for (const product of items) {
      if (product.stock > 0) added += add(product.id, 1, product.stock) > 0 ? 1 : 0;
    }
    if (added > 0) {
      toast.success(`Đã thêm ${added} mẫu khăn vào giỏ`);
      setOpen(true);
    } else {
      toast.info("Các mẫu này đã có trong giỏ hoặc tạm hết hàng.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-ink-soft" data-testid="wishlist-count-text">
          {items.length} mẫu khăn được thả tim
        </p>
        <Button variant="primary" onClick={addAll}>
          <ShoppingBag className="size-4" aria-hidden /> Thêm tất cả vào giỏ
        </Button>
      </div>
      <m.ul
        layout
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="wishlist-grid"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((product) => (
            <m.li
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, rotate: -3 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <ProductCard product={product} />
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>
    </div>
  );
}
