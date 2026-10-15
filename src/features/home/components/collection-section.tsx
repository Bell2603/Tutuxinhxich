import { ArrowRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Accent, SectionHeading } from "@/components/ui/section-heading";
import { ProductCard, ProductCardSkeleton } from "@/features/catalog/components/product-card";
import { getVisibleProducts } from "@/features/catalog/queries";
import { site } from "@/config/site";

function Heading() {
  return (
    <SectionHeading
      id="bo-suu-tap-title"
      eyebrow={`Bộ sưu tập · ${site.collectionName}`}
      title={
        <>
          6 toa khăn, <Accent>6 cá tính</Accent>
        </>
      }
      description="Mỗi chiếc khăn là một toa tàu mang màu sắc riêng — chọn toa hợp gu bạn nhất và khởi hành thôi!"
    />
  );
}

export async function CollectionSection() {
  const products = await getVisibleProducts();
  return (
    <section
      id="bo-suu-tap"
      className="container-page scroll-mt-24 py-24"
      aria-labelledby="bo-suu-tap-title"
    >
      <Heading />
      <Stagger
        className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        gap={0.1}
      >
        {products.map((product, i) => (
          <StaggerItem key={product.id} className={i % 3 === 1 ? "lg:translate-y-10" : undefined}>
            <ProductCard product={product} />
          </StaggerItem>
        ))}
      </Stagger>
      <div className="mt-20 flex justify-center">
        <ButtonLink href="/bo-suu-tap" variant="outline" size="lg" className="group">
          Lọc theo màu, chất liệu & giá
          <ArrowRight
            className="size-5 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </ButtonLink>
      </div>
    </section>
  );
}

export function CollectionSkeleton() {
  return (
    <section className="container-page py-24" aria-busy="true" aria-label="Đang tải bộ sưu tập">
      <Heading />
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {Array.from({ length: 6 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
