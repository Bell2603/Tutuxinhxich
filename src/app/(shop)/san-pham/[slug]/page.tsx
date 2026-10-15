import { ContentEnter, PageTransition, SkeletonExit } from "@/components/motion/page-transition";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AccordionItem } from "@/components/ui/accordion";
import { ProductBadge } from "@/components/ui/badge";
import { Accent } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/features/catalog/components/product-card";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { StylingTips } from "@/features/catalog/components/styling-tips";
import { ReviewSection, ReviewSectionSkeleton } from "@/features/reviews/components/review-section";
import { StarRating } from "@/features/reviews/components/star-rating";
import { MobileBuyBar, PurchasePanel } from "@/features/catalog/components/purchase-panel";
import { productImages } from "@/features/catalog/domain";
import { getProductBySlug, getVisibleProducts } from "@/features/catalog/queries";
import { FABRIC_LABELS } from "@/features/catalog/types";
import { siteUrl } from "@/lib/env";
import { toaLabel } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/san-pham/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Không tìm thấy sản phẩm" };
  return {
    title: `${product.name} — ${toaLabel(product.sortOrder)}`,
    description: product.shortDescription,
    alternates: { canonical: `/san-pham/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.imageUrl }],
    },
  };
}

async function ProductView({ params }: { params: PageProps<"/san-pham/[slug]">["params"] }) {
  const { slug } = await params;
  const [product, all] = await Promise.all([getProductBySlug(slug), getVisibleProducts()]);
  if (!product) notFound();
  const images = productImages(product);
  const related = all.filter((p) => p.id !== product.id).slice(0, 3);
  const careLines = product.careInstructions.split("\n").filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.shortDescription,
    image: images.map((src) => (src.startsWith("http") ? src : `${siteUrl()}${src}`)),
    material: product.material,
    color: product.colors.map((c) => c.name).join(", "),
    brand: { "@type": "Brand", name: "Tu Tu Xình Xịch" },
    ...(product.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.average,
            reviewCount: product.rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteUrl()}/san-pham/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="container-page pt-4 pb-28 lg:pb-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                transitionTypes={["nav-back"]}
                className="hover:text-ink hover:underline"
              >
                Trang chủ
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href="/bo-suu-tap"
                transitionTypes={["nav-back"]}
                className="hover:text-ink hover:underline"
              >
                Bộ sưu tập
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-semibold text-ink">
              {product.name}
            </li>
          </ol>
        </nav>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          <ProductGallery images={images} name={product.name} productId={product.id} />
          <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ink px-3 py-1 font-display text-xs font-extrabold tracking-wider text-cream">
                {toaLabel(product.sortOrder)}
              </span>
              {product.badge ? <ProductBadge badge={product.badge} /> : null}
              <span className="text-xs font-semibold tracking-wider text-ink-faint">
                SKU: {product.sku}
              </span>
            </div>
            <h1
              className="mt-4 text-5xl leading-[1.02] font-extrabold sm:text-6xl"
              data-testid="product-name"
            >
              {product.name}
            </h1>
            {product.rating ? (
              <a
                href="#danh-gia"
                className="mt-3 inline-flex text-sm focus-ring hover:underline"
                data-testid="product-rating"
              >
                <StarRating value={product.rating.average} count={product.rating.count} showValue />
              </a>
            ) : null}
            <p className="mt-4 text-lg text-ink-soft">{product.shortDescription}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Màu sắc">
              {product.colors.map((color) => (
                <span
                  key={color.name}
                  className="inline-flex items-center gap-2 rounded-full bg-white py-1 pr-3 pl-1 text-sm font-medium ring-1 ring-line"
                >
                  <span
                    className="size-6 rounded-full ring-1 ring-ink/10"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden
                  />
                  {color.name}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <PurchasePanel product={product} />
            </div>
            <div className="mt-8">
              <AccordionItem title="Mô tả sản phẩm" defaultOpen>
                <div className="space-y-3 whitespace-pre-line">{product.description}</div>
              </AccordionItem>
              <AccordionItem title="Chất liệu & kích thước">
                <dl className="grid grid-cols-[8rem_1fr] gap-y-2">
                  <dt className="font-semibold text-ink">Chất liệu</dt>
                  <dd>{product.material}</dd>
                  <dt className="font-semibold text-ink">Dòng vải</dt>
                  <dd>{FABRIC_LABELS[product.fabric]}</dd>
                  <dt className="font-semibold text-ink">Kích thước</dt>
                  <dd>{product.size}</dd>
                </dl>
              </AccordionItem>
              <AccordionItem title="Hướng dẫn bảo quản">
                <ul className="list-disc space-y-1 pl-5">
                  {careLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </AccordionItem>
              <AccordionItem title="Giao hàng & đổi trả">
                <p>
                  Miễn phí giao hàng cho đơn từ 500.000₫ (dưới mức này phí 30.000₫). Đổi mẫu trong 7
                  ngày nếu khăn còn nguyên tem. Chính sách mẫu — xem thêm tại trang Chính sách.
                </p>
              </AccordionItem>
            </div>
          </div>
        </div>

        <StylingTips size={product.size} name={product.name} />

        <Suspense fallback={<ReviewSectionSkeleton />}>
          <ReviewSection productId={product.id} slug={product.slug} name={product.name} />
        </Suspense>

        {related.length > 0 ? (
          <section className="mt-24" aria-labelledby="related-title">
            <h2 id="related-title" className="text-4xl font-extrabold sm:text-5xl">
              Có thể bạn cũng <Accent>mê</Accent>
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <MobileBuyBar product={product} />
    </>
  );
}

function ProductSkeleton() {
  return (
    <div className="container-page pt-4" aria-busy="true" aria-label="Đang tải sản phẩm">
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <Skeleton className="aspect-[4/5] rounded-[2.5rem]" />
        <div className="space-y-5">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-16 w-4/5" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ params }: PageProps<"/san-pham/[slug]">) {
  return (
    <PageTransition>
      <Suspense
        fallback={
          <SkeletonExit>
            <ProductSkeleton />
          </SkeletonExit>
        }
      >
        <ContentEnter>
          <ProductView params={params} />
        </ContentEnter>
      </Suspense>
    </PageTransition>
  );
}
