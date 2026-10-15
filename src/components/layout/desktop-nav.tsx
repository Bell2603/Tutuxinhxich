"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav } from "@/config/site";
import { cn } from "@/lib/utils";

export function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return !href.includes("#") && pathname.startsWith(href);
}

/** Menu chính (desktop) — viên nhấn trượt theo con trỏ / trang hiện tại. Đọc URL nên phải nằm trong <Suspense>. */
export function DesktopNav() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <NavList onLeave={() => setHovered(null)}>
      {nav.map((item) => {
        const active = isActiveHref(pathname, item.href);
        const highlight = hovered ? hovered === item.href : active;
        return (
          <li key={item.href} className="relative">
            {highlight ? (
              <m.span
                layoutId="nav-pill"
                className={cn(
                  "absolute inset-0 rounded-full",
                  active && !hovered ? "bg-ink" : "bg-pink-100",
                )}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <Link
              href={item.href}
              onPointerEnter={() => setHovered(item.href)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative z-10 block rounded-full px-4 py-2 text-sm font-semibold focus-ring transition-colors",
                active && !hovered ? "text-cream" : "text-ink",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </NavList>
  );
}

/** Bản tĩnh (không trạng thái active) hiển thị ngay trong khi chờ URL. */
export function DesktopNavFallback() {
  return (
    <NavList>
      {nav.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="block rounded-full px-4 py-2 text-sm font-semibold text-ink focus-ring"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </NavList>
  );
}

function NavList({ children, onLeave }: { children: React.ReactNode; onLeave?: () => void }) {
  return (
    <nav aria-label="Điều hướng chính" className="mx-auto hidden lg:block" onPointerLeave={onLeave}>
      <ul className="flex items-center gap-1 rounded-full bg-white/60 p-1.5 shadow-sm ring-1 ring-line backdrop-blur">
        {children}
      </ul>
    </nav>
  );
}
