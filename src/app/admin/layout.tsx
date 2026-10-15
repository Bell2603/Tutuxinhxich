import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { getSessionUser } from "@/features/auth/session";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s · Quản trị Tu Tu" },
  robots: { index: false, follow: false },
};

async function AdminUserBadge() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return null;
  return (
    <p className="mt-6 hidden rounded-2xl bg-cream p-3 text-xs text-ink-soft lg:block">
      Đăng nhập: <strong className="block truncate text-ink">{user.email}</strong>
    </p>
  );
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh bg-[#fbf3f7]">
      <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-6 p-4 lg:grid-cols-[15rem_1fr] lg:p-6">
        <aside className="rounded-[2rem] bg-white p-4 shadow-card ring-1 ring-line lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)] lg:p-5">
          <Link
            href="/admin"
            className="group mb-4 block rounded-2xl focus-ring lg:mb-8"
            aria-label="Trang quản trị"
          >
            <Logo />
          </Link>
          <Suspense fallback={<Skeleton className="h-40" />}>
            <AdminNav />
          </Suspense>
          <Suspense fallback={<Skeleton className="mt-6 hidden h-14 lg:block" />}>
            <AdminUserBadge />
          </Suspense>
        </aside>
        <main id="noi-dung" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
