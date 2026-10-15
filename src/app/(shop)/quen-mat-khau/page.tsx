import type { Metadata } from "next";
import { PageTransition } from "@/components/motion/page-transition";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/password-forms";

export const metadata: Metadata = { title: "Quên mật khẩu", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <PageTransition>
      <AuthShell
        title="Quên mật khẩu?"
        subtitle="Nhập email đã đăng ký, Tu Tu sẽ gửi link để bạn đặt mật khẩu mới."
      >
        <ForgotPasswordForm />
      </AuthShell>
    </PageTransition>
  );
}
