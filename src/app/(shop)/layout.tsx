import { Suspense } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AccountMenu, AccountMenuSkeleton } from "@/features/auth/components/account-menu";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { CartFlightLayer } from "@/features/cart/components/cart-flight-layer";
import { CartHydrator } from "@/features/cart/components/cart-hydrator";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader
        account={
          <Suspense fallback={<AccountMenuSkeleton />}>
            <AccountMenu />
          </Suspense>
        }
      />
      <main id="noi-dung" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
      <CartFlightLayer />
      <CartHydrator />
    </>
  );
}
