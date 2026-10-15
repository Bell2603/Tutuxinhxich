import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  EyeOff,
  PackageX,
  ShoppingBag,
  Timer,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessDenied } from "@/features/admin/components/access-denied";
import { getAdminOrders, getAdminProducts, getDashboardStats } from "@/features/admin/queries";
import { getAdminUser } from "@/features/auth/session";
import { stockStatus } from "@/features/catalog/domain";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { formatDateTime, formatVND, toaLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

async function Dashboard() {
  const admin = await getAdminUser("/admin");
  if (!admin) return <AccessDenied />;
  const [stats, products, orders] = await Promise.all([
    getDashboardStats(),
    getAdminProducts(),
    getAdminOrders(),
  ]);
  const maxStock = Math.max(...products.map((p) => p.stock), 1);
  const cards = [
    { label: "Tổng đơn hàng", value: stats.orders_total, Icon: ShoppingBag, tone: "bg-lilac-100" },
    { label: "Chờ xác nhận", value: stats.orders_pending, Icon: Timer, tone: "bg-sun-100" },
    {
      label: "Doanh thu (đã giao)",
      value: formatVND(stats.revenue_delivered),
      Icon: CircleDollarSign,
      tone: "bg-mint-100",
    },
    {
      label: "Đơn đang xử lý",
      value: formatVND(stats.revenue_open),
      Icon: Wallet,
      tone: "bg-sky-100",
    },
    {
      label: "Tổng tồn kho",
      value: `${stats.units_in_stock} chiếc`,
      Icon: Boxes,
      tone: "bg-pink-100",
    },
    { label: "Sắp hết (≤ 5)", value: stats.low_stock, Icon: AlertTriangle, tone: "bg-sun-100" },
    { label: "Hết hàng", value: stats.out_of_stock, Icon: PackageX, tone: "bg-pink-100" },
    { label: "Đang ẩn", value: stats.hidden_products, Icon: EyeOff, tone: "bg-cream" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-ink-soft">
          Xin chào {admin.fullName || "quản trị viên"} 👋
        </p>
        <h1 className="text-4xl font-extrabold">Tổng quan cửa hàng</h1>
      </header>
      <p className="rounded-2xl bg-sun-100 px-4 py-3 text-sm font-semibold text-warning">
        Đang dùng dữ liệu demo — 6 sản phẩm mẫu. Sửa tên, giá, ảnh, tồn kho tại mục “Sản phẩm”.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="stats">
        {cards.map(({ label, value, Icon, tone }) => (
          <li
            key={label}
            className="flex items-center gap-4 rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-line"
          >
            <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", tone)}>
              <Icon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm text-ink-soft">{label}</span>
              <span className="font-display text-2xl font-extrabold">{value}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 xl:grid-cols-2">
        <section
          className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line"
          aria-labelledby="stock-title"
        >
          <div className="flex items-center justify-between">
            <h2 id="stock-title" className="text-xl font-extrabold">
              Tồn kho 6 toa
            </h2>
            <Link
              href="/admin/san-pham"
              className="text-sm font-semibold text-berry hover:underline"
            >
              Quản lý sản phẩm
            </Link>
          </div>
          <ul className="mt-5 space-y-3">
            {products.map((p) => {
              const status = stockStatus(p.stock);
              return (
                <li key={p.id}>
                  <Link
                    href={`/admin/san-pham/${p.id}` as Route}
                    className="flex items-center gap-3 rounded-2xl p-1 focus-ring hover:bg-cream"
                  >
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-pink-50">
                      <Image src={p.imageUrl} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                    <span className="w-36 shrink-0 truncate text-sm font-semibold sm:w-48">
                      {toaLabel(p.sortOrder)} · {p.name}
                    </span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-pink-50">
                      <span
                        className={cn(
                          "block h-full rounded-full",
                          status === "out_of_stock"
                            ? "bg-danger"
                            : status === "low_stock"
                              ? "bg-sun"
                              : "bg-mint",
                        )}
                        style={{ width: `${Math.max((p.stock / maxStock) * 100, 3)}%` }}
                      />
                    </span>
                    <span className="w-10 text-right text-sm font-bold tabular-nums">
                      {p.stock}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line"
          aria-labelledby="recent-title"
        >
          <div className="flex items-center justify-between">
            <h2 id="recent-title" className="text-xl font-extrabold">
              Đơn hàng gần đây
            </h2>
            <Link
              href="/admin/don-hang"
              className="text-sm font-semibold text-berry hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-cream p-6 text-center text-ink-soft">
              Chưa có đơn hàng nào.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/don-hang/${o.id}` as Route}
                    className="flex flex-wrap items-center gap-3 py-3 focus-ring hover:bg-cream"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">#{o.code}</span>
                      <span className="text-xs text-ink-soft">
                        {o.recipient_name} · {formatDateTime(o.created_at)}
                      </span>
                    </span>
                    <OrderStatusBadge status={o.status} />
                    <span className="w-28 text-right font-bold">{formatVND(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AdminHome() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-12 w-72" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-24 rounded-[1.75rem]" />
            ))}
          </div>
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}
