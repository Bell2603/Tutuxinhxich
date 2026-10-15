"use client";

import {
  LayoutDashboard,
  MessageSquareHeart,
  Package,
  ShoppingBag,
  Store,
  TicketPercent,
} from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Tổng quan", Icon: LayoutDashboard },
  { href: "/admin/san-pham", label: "Sản phẩm", Icon: Package },
  { href: "/admin/don-hang", label: "Đơn hàng", Icon: ShoppingBag },
  { href: "/admin/danh-gia", label: "Đánh giá", Icon: MessageSquareHeart },
  { href: "/admin/ma-giam-gia", label: "Mã giảm giá", Icon: TicketPercent },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  return (
    <nav aria-label="Quản trị" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href) ? "page" : undefined}
          className={cn(
            "relative flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold focus-ring transition-colors",
            active(href) ? "text-cream" : "text-ink hover:bg-pink-50",
          )}
        >
          {active(href) ? (
            <m.span layoutId="admin-nav" className="absolute inset-0 rounded-2xl bg-ink" />
          ) : null}
          <Icon className="relative size-4" aria-hidden />
          <span className="relative">{label}</span>
        </Link>
      ))}
      <Link
        href="/"
        className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink-soft focus-ring hover:bg-pink-50 lg:mt-4"
      >
        <Store className="size-4" aria-hidden />
        Về cửa hàng
      </Link>
    </nav>
  );
}
