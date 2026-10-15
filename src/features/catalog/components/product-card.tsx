"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { TiltCard } from "@/components/motion/tilt-card";
import { ProductBadge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";
import { toaLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { stockLabel, stockStatus } from "../domain";
import type { Product } from "../types";

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const href = `/san-pham/${product.slug}` as Route;
  const hoverImage = product.gallery[0];
  const status = stockStatus(product.stock);

  return (
    <article
      className={cn("group relative h-full", className)}
      data-testid="product-card"
      data-sku={product.sku}
    >
      <TiltCard className="relative flex h-full flex-col rounded-[2rem] bg-white p-2 shadow-card ring-1 ring-line/70">
        <div className="relative">
          <Link
            href={href}
            transitionTypes={["nav-forward"]}
            className="relative block aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-pink-50 focus-ring"
            aria-label={`${product.name} — xem chi tiết`}
          >
            <span className="absolute inset-0" data-flight-source={product.id}>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                loading={priority ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                className={cn(
                  "object-cover transition-[transform,opacity] duration-700 ease-[var(--ease-smooth)] group-hover:scale-110",
                  hoverImage && "group-hover:opacity-0",
                )}
              />
            </span>
            {hoverImage ? (
              <Image
                src={hoverImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                className="scale-110 object-cover opacity-0 transition-[transform,opacity] duration-700 ease-[var(--ease-smooth)] group-hover:scale-100 group-hover:opacity-100"
              />
            ) : null}
            <span className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
              {product.badge ? <ProductBadge badge={product.badge} /> : null}
            </span>
            <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 font-display text-xs font-extrabold tracking-wider text-ink shadow-sm backdrop-blur">
              {toaLabel(product.sortOrder)}
            </span>
            {status === "out_of_stock" ? (
              <span className="absolute right-14 bottom-3 left-3 rounded-full bg-ink/85 py-2 text-center text-sm font-bold text-cream backdrop-blur">
                Hết hàng
              </span>
            ) : status === "low_stock" ? (
              <span className="absolute bottom-3 left-3 rounded-full bg-sun px-3 py-1 text-xs font-bold text-ink shadow-sm">
                {stockLabel(product.stock)}
              </span>
            ) : null}
          </Link>
          <WishlistButton
            productId={product.id}
            name={product.name}
            size="sm"
            className="absolute right-3 bottom-3"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 px-3 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl leading-tight font-extrabold">
              <Link
                href={href}
                transitionTypes={["nav-forward"]}
                className="focus-ring hover:text-berry"
              >
                {product.name}
              </Link>
            </h3>
            <div
              className="mt-1 flex shrink-0 -space-x-1.5"
              aria-label={`Màu: ${product.colors.map((c) => c.name).join(", ")}`}
            >
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color.name}
                  className="size-4 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <p className="line-clamp-2 text-sm text-ink-soft">{product.shortDescription}</p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} />
            <AddToCartButton product={product} size="icon" variant="candy" compact />
          </div>
        </div>
      </TiltCard>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-[2rem] bg-white p-2 shadow-card ring-1 ring-line/70" aria-hidden>
      <div className="aspect-[4/5] skeleton rounded-[1.6rem]" />
      <div className="space-y-3 px-3 pt-4 pb-3">
        <div className="h-6 w-2/3 skeleton rounded-full" />
        <div className="h-4 w-full skeleton rounded-full" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-24 skeleton rounded-full" />
          <div className="size-11 skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}
