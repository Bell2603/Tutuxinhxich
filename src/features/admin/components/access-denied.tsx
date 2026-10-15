import { ShieldAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="grid min-h-[50dvh] place-items-center text-center" data-testid="access-denied">
      <div>
        <ShieldAlert className="mx-auto size-14 text-danger" aria-hidden />
        <h1 className="mt-4 text-3xl font-extrabold">Không có quyền truy cập</h1>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          Khu vực này chỉ dành cho quản trị viên Tu Tu Xình Xịch. Nếu bạn là quản trị viên, hãy đăng
          nhập bằng tài khoản admin.
        </p>
        <ButtonLink href="/" variant="primary" className="mt-6">
          Về trang chủ
        </ButtonLink>
      </div>
    </div>
  );
}
