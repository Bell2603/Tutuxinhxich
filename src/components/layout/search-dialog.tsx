"use client";

import { ArrowRight, Search } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCatalog } from "@/features/catalog/client-store";
import { matchesQuery } from "@/features/catalog/domain";
import { formatVND, toaLabel } from "@/lib/format";

const SUGGESTIONS = ["satin", "len", "hoa cúc", "caro", "hồng", "xanh"];

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const { products, status } = useCatalog(open);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  const results = useMemo(
    () => (products ?? []).filter((p) => matchesQuery(p, query)),
    [products, query],
  );
  const close = () => onOpenChange(false);

  return (
    <Sheet
      open={open}
      onClose={close}
      side="top"
      title="Tìm khăn xinh"
      initialFocusRef={inputRef}
      testId="search-dialog"
    >
      <div className="container-page max-w-3xl pb-6">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            close();
            router.push(
              `/bo-suu-tap${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}` as Route,
            );
          }}
          className="relative"
        >
          <Search
            className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-ink-faint"
            aria-hidden
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tên khăn, màu sắc, chất liệu… (không cần dấu)"
            aria-label="Từ khóa tìm kiếm"
            className="h-14 w-full rounded-full border-2 border-line bg-white pr-5 pl-13 text-base outline-none focus:border-lilac focus:ring-4 focus:ring-lilac-100"
            maxLength={80}
          />
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="rounded-full bg-white px-3 py-1.5 text-sm font-medium ring-1 ring-line focus-ring transition-colors hover:bg-pink-50"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-5" aria-live="polite">
          {status === "loading" && !products ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="rounded-3xl bg-white p-6 text-center text-ink-soft">
              Chưa tìm thấy chiếc khăn nào khớp “{query}”. Thử từ khóa khác nhé!
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {results.map((product, i) => (
                <m.li
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={`/san-pham/${product.slug}` as Route}
                    transitionTypes={["nav-forward"]}
                    onClick={close}
                    className="group flex items-center gap-3 rounded-3xl bg-white p-2.5 pr-4 ring-1 ring-line focus-ring transition-all hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-pink-50">
                      <Image
                        src={product.imageUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold tracking-wider text-berry uppercase">
                        {toaLabel(product.sortOrder)}
                      </span>
                      <span className="block truncate font-semibold">{product.name}</span>
                      <span className="text-sm text-ink-soft">{formatVND(product.price)}</span>
                    </span>
                    <ArrowRight
                      className="size-4 text-ink-faint transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </Link>
                </m.li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Sheet>
  );
}
