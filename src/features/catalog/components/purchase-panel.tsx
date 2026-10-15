"use client";

import { Gift, RefreshCcw, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { QuantityStepper } from "@/features/cart/components/quantity-stepper";
import { maxPurchasable } from "@/features/cart/domain";
import { useCart } from "@/features/cart/store";
import { cn } from "@/lib/utils";
import { stockLabel, stockStatus } from "../domain";
import type { Product } from "../types";

export function PurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const inCart = useCart((s) => s.lines.find((l) => l.productId === product.id)?.quantity ?? 0);
  const add = useCart((s) => s.add);
  const remaining = Math.max(0, maxPurchasable(product.stock) - inCart);
  const [quantity, setQuantity] = useState(1);
  const qty = Math.min(quantity, Math.max(1, remaining));
  const status = stockStatus(product.stock);
  const soldOut = status === "out_of_stock";

  return (
    <div className="flex flex-col gap-6">
      <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />

      <p
        className={cn(
          "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold",
          status === "in_stock" && "bg-mint-100 text-success",
          status === "low_stock" && "bg-sun-100 text-warning",
          status === "out_of_stock" && "bg-pink-100 text-danger",
        )}
        data-testid="stock-status"
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {stockLabel(product.stock)}
      </p>

      {!soldOut ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={qty}
              min={1}
              max={Math.max(1, remaining)}
              onChange={setQuantity}
              label={`Chọn số lượng ${product.name}`}
            />
            <AddToCartButton product={product} quantity={qty} className="flex-1" openDrawer />
          </div>
          {remaining === 0 ? (
            <p className="text-sm font-medium text-warning" role="status">
              Bạn đã có {inCart} chiếc trong giỏ — đây là số lượng tối đa có thể mua.
            </p>
          ) : inCart > 0 ? (
            <p className="text-sm text-ink-soft">Đã có {inCart} chiếc trong giỏ.</p>
          ) : null}
          <Button
            variant="outline"
            size="lg"
            disabled={remaining === 0 && inCart === 0}
            onClick={() => {
              if (remaining > 0) add(product.id, qty, product.stock);
              router.push("/thanh-toan");
            }}
          >
            Mua ngay
          </Button>
        </div>
      ) : (
        <Button variant="primary" size="lg" disabled>
          Tạm hết hàng
        </Button>
      )}

      <ul className="grid gap-3 rounded-[2rem] bg-white p-5 ring-1 ring-line sm:grid-cols-3">
        {[
          { Icon: Truck, text: "Free ship từ 500K" },
          { Icon: Gift, text: "Gói quà miễn phí" },
          { Icon: RefreshCcw, text: "Đổi trả 7 ngày" },
        ].map(({ Icon, text }) => (
          <li key={text} className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pink-50 text-berry">
              <Icon className="size-4" aria-hidden />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Thanh mua nhanh dính đáy màn hình trên mobile. */
export function MobileBuyBar({ product }: { product: Product }) {
  if (product.stock <= 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{product.name}</p>
          <Price price={product.price} size="sm" />
        </div>
        <AddToCartButton product={product} size="md" variant="candy" />
      </div>
    </div>
  );
}
