import { PageTransition } from "@/components/motion/page-transition";
import { LogOut, Package } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Accent } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { signOutAction } from "@/features/auth/actions";
import { ChangePasswordForm } from "@/features/auth/components/password-forms";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { requireUser } from "@/features/auth/session";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { getMyOrders } from "@/features/orders/queries";
import { formatDateTime, formatVND } from "@/lib/format";

export const metadata: Metadata = { title: "Tài khoản của tôi", robots: { index: false } };

async function Account({
  searchParams,
}: {
  searchParams: PageProps<"/tai-khoan">["searchParams"];
}) {
  const [user, params] = await Promise.all([requireUser("/tai-khoan"), searchParams]);
  const passwordReset = params["mat-khau"] === "moi";
  const orders = await getMyOrders();
  return (
    <>
      {passwordReset ? (
        <p
          role="status"
          className="mb-6 rounded-2xl bg-mint-100 px-4 py-3 text-sm font-semibold text-success"
          data-testid="password-reset-done"
        >
          Đã đặt mật khẩu mới thành công!
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[22rem_1fr]">
        <aside className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
            <p className="text-sm font-semibold text-ink-soft">Xin chào,</p>
            <p className="font-display text-2xl font-extrabold" data-testid="account-name">
              {user.fullName || user.email}
            </p>
            <div className="mt-6">
              <ProfileForm fullName={user.fullName} phone={user.phone} email={user.email} />
            </div>
          </div>
          <details className="group rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
            <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-extrabold focus-ring [&::-webkit-details-marker]:hidden">
              Đổi mật khẩu
              <span
                aria-hidden
                className="grid size-8 place-items-center rounded-full bg-pink-50 text-xl transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="mt-5">
              <ChangePasswordForm />
            </div>
          </details>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" className="w-full" data-testid="signout">
              <LogOut className="size-4" aria-hidden />
              Đăng xuất
            </Button>
          </form>
        </aside>

        <section aria-labelledby="orders-title">
          <h2 id="orders-title" className="text-3xl font-extrabold">
            Lịch sử mua hàng
          </h2>
          {orders.length === 0 ? (
            <div
              className="mt-6 rounded-[2rem] bg-white p-10 text-center shadow-card ring-1 ring-line"
              data-testid="orders-empty"
            >
              <Package className="mx-auto size-12 text-berry" aria-hidden />
              <p className="mt-4 font-display text-xl font-extrabold">Bạn chưa có chuyến tàu nào</p>
              <p className="mt-1 text-ink-soft">Đơn hàng đầu tiên sẽ xuất hiện ở đây.</p>
              <ButtonLink href="/bo-suu-tap" variant="candy" className="mt-6">
                Chọn khăn ngay
              </ButtonLink>
            </div>
          ) : (
            <ul className="mt-6 space-y-4" data-testid="orders-list">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/tai-khoan/don-hang/${order.code}` as Route}
                    transitionTypes={["nav-forward"]}
                    className="group flex flex-wrap items-center gap-4 rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-line focus-ring transition-transform hover:-translate-y-1"
                  >
                    <div className="flex -space-x-3">
                      {order.order_items.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="relative size-14 overflow-hidden rounded-2xl bg-pink-50 ring-4 ring-white"
                        >
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : null}
                        </span>
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-extrabold">#{order.code}</p>
                      <p className="text-sm text-ink-soft">
                        {formatDateTime(order.created_at)} · {order.item_count} sản phẩm
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                    <span className="font-display text-lg font-extrabold">
                      {formatVND(order.total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

export default function AccountPage({ searchParams }: PageProps<"/tai-khoan">) {
  return (
    <PageTransition>
      <div className="container-page py-10">
        <h1 className="mb-8 text-5xl font-extrabold sm:text-6xl">
          Tài khoản <Accent>của bạn</Accent>
        </h1>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[22rem_1fr]">
              <Skeleton className="h-96 rounded-[2rem]" />
              <div className="space-y-4">
                <Skeleton className="h-24 rounded-[2rem]" />
                <Skeleton className="h-24 rounded-[2rem]" />
              </div>
            </div>
          }
        >
          <Account searchParams={searchParams} />
        </Suspense>
      </div>
    </PageTransition>
  );
}
