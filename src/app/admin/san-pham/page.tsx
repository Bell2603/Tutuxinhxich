import { Pencil } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ProductBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessDenied } from "@/features/admin/components/access-denied";
import { VisibilityToggle } from "@/features/admin/components/visibility-toggle";
import { getAdminProducts } from "@/features/admin/queries";
import { getAdminUser } from "@/features/auth/session";
import { stockLabel, stockStatus } from "@/features/catalog/domain";
import { formatVND, toaLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Sản phẩm" };

async function ProductList() {
  if (!(await getAdminUser("/admin/san-pham"))) return <AccessDenied />;
  const products = await getAdminProducts();
  return (
    <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" data-testid="admin-products">
      {products.map((p) => {
        const status = stockStatus(p.stock);
        return (
          <li
            key={p.id}
            className={cn(
              "flex gap-4 rounded-[2rem] bg-white p-4 shadow-card ring-1 ring-line",
              !p.isVisible && "opacity-70",
            )}
            data-testid="admin-product"
            data-sku={p.sku}
          >
            <span className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-2xl bg-pink-50">
              <Image src={p.imageUrl} alt="" fill sizes="96px" className="object-cover" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="text-xs font-bold tracking-wider text-ink-soft">
                {toaLabel(p.sortOrder)} · {p.sku}
              </p>
              <p className="truncate font-display text-lg font-extrabold">{p.name}</p>
              <p className="text-sm">
                <strong>{formatVND(p.price)}</strong>
                {p.compareAtPrice ? (
                  <s className="ml-2 text-ink-faint">{formatVND(p.compareAtPrice)}</s>
                ) : null}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-bold",
                    status === "in_stock" && "bg-mint-100 text-success",
                    status === "low_stock" && "bg-sun-100 text-warning",
                    status === "out_of_stock" && "bg-pink-100 text-danger",
                  )}
                >
                  Kho: {p.stock} · {stockLabel(p.stock)}
                </span>
                {p.badge ? <ProductBadge badge={p.badge} className="px-2 py-0.5" /> : null}
              </div>
              <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <VisibilityToggle productId={p.id} visible={p.isVisible} name={p.name} />
                  {p.isVisible ? "Đang hiển thị" : "Đang ẩn"}
                </span>
                <Link
                  href={`/admin/san-pham/${p.id}` as Route}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-cream focus-ring hover:bg-[#3d1a60]"
                  data-testid="edit-product"
                >
                  <Pencil className="size-3.5" aria-hidden /> Sửa
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-extrabold">Sản phẩm</h1>
        <p className="mt-1 text-ink-soft">
          Cửa hàng bán đúng 6 mã khăn. Bấm “Sửa” để đổi giá, ảnh, tồn kho, mô tả, màu sắc; bật/tắt
          công tắc để ẩn/hiện.
        </p>
      </header>
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-40 rounded-[2rem]" />
            ))}
          </div>
        }
      >
        <ProductList />
      </Suspense>
    </div>
  );
}
