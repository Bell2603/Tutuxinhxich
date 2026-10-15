import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SignUpForm } from "@/features/auth/components/auth-forms";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { getSessionUser } from "@/features/auth/session";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Đăng ký", robots: { index: false } };

async function SignUp({ searchParams }: { searchParams: PageProps<"/dang-ky">["searchParams"] }) {
  const params = await searchParams;
  const next = safeRedirectPath(
    typeof params.next === "string" ? params.next : undefined,
    "/tai-khoan",
  );
  if (await getSessionUser()) redirect(next as Route);
  return <SignUpForm next={next} />;
}

export default function SignUpPage({ searchParams }: PageProps<"/dang-ky">) {
  return (
    <AuthShell
      title="Mua vé lên tàu"
      subtitle="Tạo tài khoản miễn phí để đặt hàng và theo dõi đơn."
    >
      <Suspense fallback={<Skeleton className="h-96" />}>
        <SignUp searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
