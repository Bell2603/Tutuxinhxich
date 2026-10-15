import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessDenied } from "@/features/admin/components/access-denied";
import { getAdminUser } from "@/features/auth/session";
import { CouponCreateForm, CouponList } from "@/features/coupons/components/coupon-admin";
import { getAdminCoupons } from "@/features/coupons/queries";

export const metadata: Metadata = { title: "Mã giảm giá" };

async function Coupons() {
  if (!(await getAdminUser("/admin/ma-giam-gia"))) return <AccessDenied />;
  const coupons = await getAdminCoupons();
  return (
    <div className="space-y-6">
      <CouponCreateForm />
      <CouponList coupons={coupons} />
    </div>
  );
}

export default function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-extrabold">Mã giảm giá</h1>
        <p className="mt-1 text-ink-soft">
          Giảm theo % hoặc số tiền, có thể đặt đơn tối thiểu, thời gian và số lượt. Số tiền giảm
          được tính lại trong database khi khách đặt hàng; hủy đơn sẽ trả lại lượt dùng. Mã đã được
          dùng không xóa được — hãy tắt mã.
        </p>
      </header>
      <Suspense fallback={<Skeleton className="h-96 rounded-[2rem]" />}>
        <Coupons />
      </Suspense>
    </div>
  );
}
