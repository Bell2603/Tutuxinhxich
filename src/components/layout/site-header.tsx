"use client";

import { Menu, Search } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { Suspense, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { site } from "@/config/site";
import { CartButton } from "@/features/cart/components/cart-button";
import { cn } from "@/lib/utils";
import { DesktopNav, DesktopNavFallback } from "./desktop-nav";
import { MobileMenu } from "./mobile-menu";
import { SearchDialog } from "./search-dialog";

export function SiteHeader({ account }: { account: ReactNode }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    setHidden(y > 320 && y > previous + 4);
    if (y < previous - 4) setHidden(false);
  });

  return (
    <>
      <m.header
        className="sticky top-0 z-50"
        animate={{ y: hidden && !menuOpen && !searchOpen ? "-110%" : "0%" }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
      >
        <div
          className={cn(
            "transition-[background-color,box-shadow,backdrop-filter] duration-300",
            scrolled
              ? "bg-cream/85 shadow-[0_10px_30px_-20px_rgb(43_17_69/0.35)] backdrop-blur-xl"
              : "bg-transparent",
          )}
        >
          <div className="container-page flex h-[4.5rem] items-center gap-3">
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full bg-white/70 text-ink shadow-sm focus-ring lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Mở menu"
              aria-expanded={menuOpen}
            >
              <Menu className="size-5" aria-hidden />
            </button>

            <Link
              href="/"
              className="group mr-auto rounded-2xl focus-ring lg:mr-0"
              aria-label={`${site.name} — Trang chủ`}
            >
              <Logo />
            </Link>

            <Suspense fallback={<DesktopNavFallback />}>
              <DesktopNav />
            </Suspense>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="grid size-11 place-items-center rounded-full bg-white/70 text-ink shadow-sm focus-ring transition-transform hover:scale-105"
                aria-label="Tìm kiếm khăn"
                data-testid="search-button"
              >
                <Search className="size-5" aria-hidden />
              </button>
              <div className="hidden sm:block">{account}</div>
              <CartButton />
            </div>
          </div>
        </div>
      </m.header>
      <Suspense fallback={null}>
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} account={account} />
      </Suspense>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
