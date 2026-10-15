import type { Metadata, Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessDenied } from "@/features/admin/components/access-denied";
import { getAdminOrders } from "@/features/admin/queries";
import { getAdminUser } from "@/features/auth/session";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { ORDER_STATUS_LABELS, ORDER_STATUSES, type OrderStatus } from "@/features/orders/domain";
import { formatDateTime, formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Đơn hàng" };

async function Orders({
  searchParams,
}: {
  searchParams: PageProps<"/admin/don-hang">["searchParams"];
}) {
  if (!(await getAdminUser("/admin/don-hang"))) return <AccessDenied />;
  const params = await searchParams;
  const status = (ORDER_STATUSES as readonly string[]).includes(String(params.trang_thai))
    ? (params.trang_thai as OrderStatus)
    : undefined;
  const q = typeof params.q === "string" ? params.q : "";
  const orders = await getAdminOrders({ status, q });
  const tab = (value?: OrderStatus) => {
    const sp = new URLSearchParams();
    if (value) sp.set("trang_thai", value);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return `/admin/don-hang${qs ? `?${qs}` : ""}` as Route;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
          {[undefined, ...ORDER_STATUSES].map((s) => (
            <Link
              key={s ?? "all"}
              href={tab(s)}
              aria-current={status === s ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold ring-1 focus-ring transition-colors",
                status === s ? "bg-ink text-cream ring-ink" : "bg-white ring-line hover:bg-pink-50",
              )}
            >
              {s ? ORDER_STATUS_LABELS[s] : "Tất cả"}
            </Link>
          ))}
        </nav>
        <form className="ml-auto flex gap-2" role="search">
          {status ? <input type="hidden" name="trang_thai" value={status} /> : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="Mã đơn, SĐT, tên…"
            aria-label="Tìm đơn hàng"
            className="h-10 w-56 rounded-full border-2 border-line bg-white px-4 text-sm outline-none focus:border-lilac"
          />
          <button className="h-10 rounded-full bg-ink px-4 text-sm font-semibold text-cream">
            Tìm
          </button>
        </form>
      </div>
      {orders.length === 0 ? (
        <p
          className="rounded-[2rem] bg-white p-10 text-center text-ink-soft shadow-card ring-1 ring-line"
          data-testid="admin-orders-empty"
        >
          Không có đơn hàng phù hợp.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] bg-white shadow-card ring-1 ring-line">
          <table className="w-full min-w-[44rem] text-left text-sm" data-testid="admin-orders">
            <thead className="bg-cream text-xs tracking-wider text-ink-soft uppercase">
              <tr>
                <th scope="col" className="px-5 py-3">
                  Mã đơn
                </th>
                <th scope="col" className="px-5 py-3">
                  Khách nhận
                </th>
                <th scope="col" className="px-5 py-3">
                  Thời gian
                </th>
                <th scope="col" className="px-5 py-3">
                  Trạng thái
                </th>
                <th scope="col" className="px-5 py-3 text-right">
                  Tổng tiền
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-cream">
                  <td className="px-5 py-3 font-semibold">
                    <Link
                      href={`/admin/don-hang/${o.id}` as Route}
                      className="text-berry hover:underline"
                    >
                      #{o.code}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    {o.recipient_name}
                    <span className="block text-xs text-ink-soft">
                      {o.phone} · {o.province}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{formatDateTime(o.created_at)}</td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3 text-right font-bold">{formatVND(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage({ searchParams }: PageProps<"/admin/don-hang">) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-extrabold">Đơn hàng</h1>
        <p className="mt-1 text-ink-soft">
          100 đơn gần nhất. Bấm mã đơn để xem chi tiết và cập nhật trạng thái.
        </p>
      </header>
      <Suspense fallback={<Skeleton className="h-96 rounded-[2rem]" />}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
