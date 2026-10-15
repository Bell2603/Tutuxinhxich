import { PageTransition } from "@/components/motion/page-transition";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/features/auth/session";
import { CancelOrderButton } from "@/features/orders/components/cancel-order-button";
import { OrderCelebration } from "@/features/orders/components/order-celebration";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { OrderItems, OrderTotals, ShippingInfo } from "@/features/orders/components/order-summary";
import { OrderTimeline } from "@/features/orders/components/order-timeline";
import { canCustomerCancel } from "@/features/orders/domain";
import { getMyOrderByCode } from "@/features/orders/queries";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Chi tiết đơn hàng", robots: { index: false } };

async function OrderView({ params, searchParams }: PageProps<"/tai-khoan/don-hang/[code]">) {
  const [{ code }, query] = await Promise.all([params, searchParams]);
  await requireUser(`/tai-khoan/don-hang/${code}`);
  const order = await getMyOrderByCode(code);
  if (!order) notFound();
  const isNew = query.moi === "1";

  return (
    <>
      {isNew ? <OrderCelebration code={order.code} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink-soft">
            Đặt lúc {formatDateTime(order.created_at)}
          </p>
          <h1 className="text-4xl font-extrabold sm:text-5xl" data-testid="order-code">
            Đơn #{order.code}
          </h1>
        </div>
        <OrderStatusBadge status={order.status} className="px-4 py-2 text-sm" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <section
            className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line"
            aria-labelledby="track-title"
          >
            <h2 id="track-title" className="text-2xl font-extrabold">
              Hành trình đơn hàng
            </h2>
            <OrderTimeline status={order.status} events={order.order_events} />
            {canCustomerCancel(order.status) ? (
              <div className="mt-4">
                <CancelOrderButton orderId={order.id} />
              </div>
            ) : null}
          </section>
          <section
            className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line"
            aria-labelledby="items-title"
          >
            <h2 id="items-title" className="text-2xl font-extrabold">
              Sản phẩm ({order.item_count})
            </h2>
            <OrderItems items={order.order_items} reviewLinks={order.status === "delivered"} />
          </section>
        </div>
        <div className="space-y-8">
          <section
            className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line"
            aria-labelledby="pay-title"
          >
            <h2 id="pay-title" className="mb-4 text-2xl font-extrabold">
              Thanh toán
            </h2>
            <OrderTotals
              subtotal={order.subtotal}
              shippingFee={order.shipping_fee}
              total={order.total}
            />
            <p className="mt-4 rounded-2xl bg-sun-100 px-4 py-3 text-xs font-semibold text-warning">
              Môi trường thử nghiệm — không phát sinh thanh toán thật.
            </p>
          </section>
          <section
            className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line"
            aria-labelledby="ship-title"
          >
            <h2 id="ship-title" className="mb-4 text-2xl font-extrabold">
              Giao hàng
            </h2>
            <ShippingInfo order={order} />
          </section>
        </div>
      </div>
    </>
  );
}

export default function OrderPage(props: PageProps<"/tai-khoan/don-hang/[code]">) {
  return (
    <PageTransition>
      <div className="container-page py-10">
        <Link
          href="/tai-khoan"
          transitionTypes={["nav-back"]}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden /> Tài khoản & đơn hàng
        </Link>
        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-14 w-80" />
              <Skeleton className="h-64 rounded-[2rem]" />
            </div>
          }
        >
          <OrderView {...props} />
        </Suspense>
      </div>
    </PageTransition>
  );
}
