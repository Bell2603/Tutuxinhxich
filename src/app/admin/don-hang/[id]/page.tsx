import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessDenied } from "@/features/admin/components/access-denied";
import { OrderStatusPanel } from "@/features/admin/components/order-status-panel";
import { getAdminOrder } from "@/features/admin/queries";
import { getAdminUser } from "@/features/auth/session";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { OrderItems, OrderTotals, ShippingInfo } from "@/features/orders/components/order-summary";
import { OrderTimeline } from "@/features/orders/components/order-timeline";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Chi tiết đơn hàng" };

async function AdminOrder({ params }: { params: PageProps<"/admin/don-hang/[id]">["params"] }) {
  const { id } = await params;
  if (!(await getAdminUser(`/admin/don-hang/${id}`))) return <AccessDenied />;
  const order = await getAdminOrder(id);
  if (!order) notFound();
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink-soft">Đặt lúc {formatDateTime(order.created_at)}</p>
          <h1 className="text-4xl font-extrabold">Đơn #{order.code}</h1>
        </div>
        <OrderStatusBadge status={order.status} className="px-4 py-2 text-sm" />
      </header>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
            <h2 className="text-xl font-extrabold">Cập nhật trạng thái</h2>
            <div className="mt-4">
              <OrderStatusPanel orderId={order.id} status={order.status} />
            </div>
            <div className="mt-6">
              <OrderTimeline status={order.status} events={order.order_events} />
            </div>
          </section>
          <section className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
            <h2 className="text-xl font-extrabold">Sản phẩm ({order.item_count})</h2>
            <OrderItems items={order.order_items} />
          </section>
        </div>
        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
            <h2 className="mb-4 text-xl font-extrabold">Thanh toán</h2>
            <OrderTotals
              subtotal={order.subtotal}
              shippingFee={order.shipping_fee}
              total={order.total}
            />
          </section>
          <section className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
            <h2 className="mb-4 text-xl font-extrabold">Giao hàng</h2>
            <ShippingInfo order={order} />
          </section>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrderPage({ params }: PageProps<"/admin/don-hang/[id]">) {
  return (
    <div>
      <Link
        href="/admin/don-hang"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden /> Danh sách đơn hàng
      </Link>
      <Suspense fallback={<Skeleton className="h-[30rem] rounded-[2rem]" />}>
        <AdminOrder params={params} />
      </Suspense>
    </div>
  );
}
