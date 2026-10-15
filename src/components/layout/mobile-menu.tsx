"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Sheet } from "@/components/ui/sheet";
import { nav, site } from "@/config/site";
import { cn } from "@/lib/utils";
import { isActiveHref } from "./desktop-nav";

export function MobileMenu({
  open,
  onClose,
  account,
}: {
  open: boolean;
  onClose: () => void;
  account: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => isActiveHref(pathname, href);
  return (
    <Sheet open={open} onClose={onClose} side="left" title="Menu" testId="mobile-menu">
      <nav aria-label="Menu di động" className="flex-1 overflow-y-auto px-5">
        <m.ul
          className="space-y-2"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
          }}
        >
          {nav.map((item, i) => (
            <m.li
              key={item.href}
              variants={{ hidden: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0 } }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-3xl px-5 py-4 font-display text-2xl font-extrabold focus-ring transition-colors",
                  isActive(item.href) ? "bg-ink text-cream" : "bg-white text-ink hover:bg-pink-50",
                )}
              >
                {item.label}
                <span className="text-sm font-bold text-berry" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </Link>
            </m.li>
          ))}
        </m.ul>
        <div className="mt-6" onClick={onClose}>
          {account}
        </div>
      </nav>
      <div className="m-5 flex items-center gap-3 rounded-3xl bg-aurora p-4 text-ink">
        <LogoMark className="size-12 shrink-0" />
        <p className="text-sm font-semibold">{site.slogan}</p>
      </div>
    </Sheet>
  );
}
