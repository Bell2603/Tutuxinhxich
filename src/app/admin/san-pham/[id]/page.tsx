import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessDenied } from "@/features/admin/components/access-denied";
import { ProductEditForm } from "@/features/admin/components/product-edit-form";
import { getAdminProduct } from "@/features/admin/queries";
import { getAdminUser } from "@/features/auth/session";
import { toaLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Sửa sản phẩm" };

async function Editor({ params }: { params: PageProps<"/admin/san-pham/[id]">["params"] }) {
  const { id } = await params;
  if (!(await getAdminUser(`/admin/san-pham/${id}`))) return <AccessDenied />;
  const product = await getAdminProduct(id);
  if (!product) notFound();
  return (
    <>
      <header className="mb-6">
        <p className="text-sm font-bold tracking-wider text-ink-soft">
          {toaLabel(product.sortOrder)} · SKU {product.sku} (cố định)
        </p>
        <h1 className="text-4xl font-extrabold">{product.name}</h1>
      </header>
      <ProductEditForm product={product} />
    </>
  );
}

export default function EditProductPage({ params }: PageProps<"/admin/san-pham/[id]">) {
  return (
    <div>
      <Link
        href="/admin/san-pham"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden /> Danh sách sản phẩm
      </Link>
      <Suspense fallback={<Skeleton className="h-[40rem] rounded-[2rem]" />}>
        <Editor params={params} />
      </Suspense>
    </div>
  );
}
