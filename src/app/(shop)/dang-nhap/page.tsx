import { PageTransition } from "@/components/motion/page-transition";
import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SignInForm } from "@/features/auth/components/auth-forms";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { getSessionUser } from "@/features/auth/session";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Đăng nhập", robots: { index: false } };

async function SignIn({ searchParams }: { searchParams: PageProps<"/dang-nhap">["searchParams"] }) {
  const params = await searchParams;
  const next = safeRedirectPath(
    typeof params.next === "string" ? params.next : undefined,
    "/tai-khoan",
  );
  if (await getSessionUser()) redirect(next as Route);
  const isDev = process.env.NODE_ENV === "development";
  return (
    <>
      {params.loi === "xac-nhan" ? (
        <p
          role="alert"
          className="mb-5 rounded-2xl bg-pink-50 px-4 py-3 text-sm font-semibold text-danger"
        >
          Link xác nhận không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập hoặc đăng ký lại.
        </p>
      ) : null}
      {next === "/thanh-toan" ? (
        <p className="mb-5 rounded-2xl bg-sun-100 px-4 py-3 text-sm font-semibold text-ink">
          Đăng nhập để thanh toán — giỏ hàng của bạn vẫn được giữ nguyên.
        </p>
      ) : null}
      <SignInForm next={next} />
      {isDev && process.env.SEED_CUSTOMER_EMAIL ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-line p-4 text-xs text-ink-soft">
          <p className="font-bold text-ink">Tài khoản thử (chỉ hiện ở môi trường dev):</p>
          <p>
            Khách: {process.env.SEED_CUSTOMER_EMAIL} / {process.env.SEED_CUSTOMER_PASSWORD}
          </p>
          <p>
            Admin: {process.env.SEED_ADMIN_EMAIL} / {process.env.SEED_ADMIN_PASSWORD}
          </p>
        </div>
      ) : null}
    </>
  );
}

export default function SignInPage({ searchParams }: PageProps<"/dang-nhap">) {
  return (
    <PageTransition>
      <AuthShell
        title="Chào mừng lên tàu!"
        subtitle="Đăng nhập vào tài khoản Tu Tu Xình Xịch của bạn."
      >
        <Suspense fallback={<Skeleton className="h-80" />}>
          <SignIn searchParams={searchParams} />
        </Suspense>
      </AuthShell>
    </PageTransition>
  );
}
