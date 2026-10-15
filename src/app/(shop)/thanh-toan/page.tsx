import { PageTransition } from "@/components/motion/page-transition";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Accent } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/features/auth/session";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { getLastShipping } from "@/features/orders/queries";

export const metadata: Metadata = { title: "Thanh toán", robots: { index: false } };

async function Checkout() {
  const user = await requireUser("/thanh-toan");
  const last = await getLastShipping();
  return (
    <CheckoutForm
      defaults={{
        fullName: last?.recipient_name || user.fullName,
        phone: last?.phone || user.phone,
        address: last?.address ?? "",
        ward: last?.ward ?? "",
        province: last?.province ?? "",
      }}
      prefilledFromLastOrder={Boolean(last)}
    />
  );
}

export default function CheckoutPage() {
  return (
    <PageTransition>
      <div className="container-page py-10">
        <h1 className="mb-8 text-5xl font-extrabold sm:text-6xl">
          Thanh toán <Accent>vé tàu</Accent>
        </h1>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
              <Skeleton className="h-[32rem] rounded-[2rem]" />
              <Skeleton className="h-96 rounded-[2rem]" />
            </div>
          }
        >
          <Checkout />
        </Suspense>
      </div>
    </PageTransition>
  );
}
