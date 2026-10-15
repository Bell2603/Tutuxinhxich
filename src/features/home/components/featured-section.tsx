import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Parallax } from "@/components/motion/parallax";
import { ImageReveal, Reveal } from "@/components/motion/reveal";
import { ProductBadge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { Sparkle } from "@/components/ui/sparkle";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { stockLabel, stockStatus } from "@/features/catalog/domain";
import { getFeaturedProduct } from "@/features/catalog/queries";
import { toaLabel } from "@/lib/format";

const STARS = [
  "top-[8%] left-[6%] size-4",
  "top-[18%] left-[44%] size-3",
  "top-[12%] right-[10%] size-6",
  "bottom-[20%] left-[12%] size-5",
  "bottom-[10%] right-[30%] size-3",
  "top-[48%] right-[4%] size-4",
];

export async function FeaturedSection() {
  const product = await getFeaturedProduct();
  if (!product) return null;
  const href = `/san-pham/${product.slug}` as Route;
  const status = stockStatus(product.stock);

  return (
    <section
      className="relative isolate overflow-hidden bg-night py-24 text-cream"
      aria-labelledby="featured-title"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[20%] size-[36rem] rounded-full bg-night-2 blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-30%] size-[30rem] rounded-full bg-[#4b2a8a]/60 blur-3xl" />
        {STARS.map((pos, i) => (
          <Sparkle
            key={pos}
            className={`absolute ${pos} animate-twinkle text-gold`}
            style={{ animationDelay: `${i * 0.45}s` }}
          />
        ))}
      </div>
      <div className="container-page grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <Parallax speed={40} className="relative">
          <ImageReveal className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2.5rem] ring-1 ring-white/10">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 28rem, 90vw"
              className="object-cover"
            />
          </ImageReveal>
          <div className="absolute -right-2 bottom-10 hidden rounded-3xl bg-cream px-5 py-4 text-ink shadow-float sm:block lg:-right-6">
            <p className="text-xs font-bold tracking-[0.2em] text-berry uppercase">
              {toaLabel(product.sortOrder)}
            </p>
            <p className="font-display text-lg font-extrabold">Chuyến tàu đêm</p>
          </div>
        </Parallax>

        <Reveal>
          <p className="text-sm font-bold tracking-[0.25em] text-gold uppercase">
            ✦ Toa đặc biệt của mùa
          </p>
          <h2
            id="featured-title"
            className="mt-4 text-5xl leading-[1.02] font-extrabold sm:text-6xl"
          >
            {product.name}
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {product.badge ? (
              <ProductBadge badge={product.badge} className="bg-gold text-ink" />
            ) : null}
            {status !== "in_stock" ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cream ring-1 ring-white/20">
                {stockLabel(product.stock)}
              </span>
            ) : null}
          </div>
          <p className="mt-6 max-w-xl text-lg text-cream/80">{product.shortDescription}</p>
          <p className="mt-3 max-w-xl text-cream/70">{product.description.split("\n")[0]}</p>
          <Price
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="lg"
            tone="light"
            className="mt-8"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <AddToCartButton product={product} variant="aurora" />
            <Link
              href={href}
              className="group inline-flex h-14 items-center gap-2 rounded-full px-6 font-semibold text-cream ring-2 ring-white/30 focus-ring transition-colors hover:bg-white/10"
            >
              Xem chi tiết
              <ArrowRight
                className="size-5 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FeaturedSkeleton() {
  return (
    <section className="bg-night py-24" aria-busy="true" aria-label="Đang tải sản phẩm nổi bật">
      <div className="container-page grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div className="mx-auto aspect-[4/5] w-full max-w-md rounded-[2.5rem] bg-white/10" />
        <div className="space-y-4">
          <div className="h-4 w-40 rounded-full bg-white/10" />
          <div className="h-14 w-3/4 rounded-full bg-white/10" />
          <div className="h-20 w-full rounded-3xl bg-white/10" />
        </div>
      </div>
    </section>
  );
}
