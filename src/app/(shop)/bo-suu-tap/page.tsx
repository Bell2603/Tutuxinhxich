import { ContentEnter, PageTransition, SkeletonExit } from "@/components/motion/page-transition";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCardSkeleton } from "@/features/catalog/components/product-card";
import { CollectionExplorer } from "@/features/catalog/components/collection-explorer";
import { parseFilters, serializeFilters } from "@/features/catalog/domain";
import { getVisibleProducts } from "@/features/catalog/queries";
import { PageHero } from "@/components/layout/page-hero";
import { Accent } from "@/components/ui/section-heading";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Bộ sưu tập khăn quàng cổ",
  description: `6 mẫu khăn quàng cổ của ${site.name}: lụa satin, len, voan, cotton linen. Lọc theo màu sắc, chất liệu và mức giá.`,
};

async function Explorer({
  searchParams,
}: {
  searchParams: PageProps<"/bo-suu-tap">["searchParams"];
}) {
  const [products, params] = await Promise.all([getVisibleProducts(), searchParams]);
  const filters = parseFilters(params);
  return (
    <CollectionExplorer
      key={serializeFilters(filters)}
      products={products}
      initialFilters={filters}
    />
  );
}

function ExplorerSkeleton() {
  return (
    <div className="container-page" aria-busy="true" aria-label="Đang tải sản phẩm">
      <div className="h-12 skeleton rounded-full" />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[17rem_1fr]">
        <div className="hidden h-96 skeleton rounded-[2rem] lg:block" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CollectionPage({ searchParams }: PageProps<"/bo-suu-tap">) {
  return (
    <PageTransition>
      <>
        <PageHero
          eyebrow={site.collectionName}
          title={
            <>
              Chọn toa khăn <Accent>hợp gu</Accent> bạn
            </>
          }
          description="Đúng 6 mẫu khăn — mỗi mẫu một cá tính. Lọc theo màu, chất liệu, mức giá hoặc gõ tìm không cần dấu."
        />
        <Suspense
          fallback={
            <SkeletonExit>
              <ExplorerSkeleton />
            </SkeletonExit>
          }
        >
          <ContentEnter>
            <Explorer searchParams={searchParams} />
          </ContentEnter>
        </Suspense>
      </>
    </PageTransition>
  );
}
