import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTransition } from "@/components/motion/page-transition";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/password-forms";
import { getSessionUser } from "@/features/auth/session";

export const metadata: Metadata = { title: "Đặt mật khẩu mới", robots: { index: false } };

async function Reset() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="space-y-5" data-testid="reset-expired">
        <p className="rounded-2xl bg-pink-50 px-4 py-3 text-sm font-semibold text-danger">
          Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
        </p>
        <ButtonLink href="/quen-mat-khau" variant="primary">
          Yêu cầu link mới
        </ButtonLink>
      </div>
    );
  }
  return (
    <>
      <p className="mb-5 text-sm text-ink-soft">
        Tài khoản: <strong className="text-ink">{user.email}</strong>
      </p>
      <ResetPasswordForm />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <PageTransition>
      <AuthShell
        title="Đặt mật khẩu mới"
        subtitle="Chọn mật khẩu mới cho tài khoản Tu Tu Xình Xịch của bạn."
      >
        <Suspense fallback={<Skeleton className="h-72" />}>
          <Reset />
        </Suspense>
      </AuthShell>
    </PageTransition>
  );
}
