"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  availableColorFamilies,
  availableFabrics,
  countActiveFilters,
  DEFAULT_FILTERS,
  filterProducts,
  PRICE_RANGES,
  serializeFilters,
  SORT_OPTIONS,
  type CatalogFilters,
  type PriceRangeKey,
  type SortKey,
} from "../domain";
import {
  COLOR_FAMILY_LABELS,
  FABRIC_LABELS,
  type ColorFamily,
  type Fabric,
  type Product,
} from "../types";
import { ProductCard } from "./product-card";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const chip =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-all duration-200 focus-ring active:scale-95";
const chipOn = "bg-ink text-cream ring-ink";
const chipOff = "bg-white text-ink ring-line hover:ring-pink-100 hover:bg-pink-50";

export function CollectionExplorer({
  products,
  initialFilters,
}: {
  products: Product[];
  initialFilters: CatalogFilters;
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const results = useMemo(() => filterProducts(products, filters), [products, filters]);
  const colors = useMemo(() => availableColorFamilies(products), [products]);
  const fabrics = useMemo(() => availableFabrics(products), [products]);
  const active = countActiveFilters(filters);

  function update(next: Partial<CatalogFilters>) {
    const merged = { ...filters, ...next };
    setFilters(merged);
    // Giữ bộ lọc trên URL để chia sẻ/quay lại được (không tải lại trang).
    window.history.replaceState(null, "", `/bo-suu-tap${serializeFilters(merged)}`);
  }

  const controls = (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-3 text-xs font-bold tracking-[0.2em] text-ink-soft uppercase">
          Màu sắc
        </legend>
        <div className="flex flex-wrap gap-2">
          {colors.map((family: ColorFamily) => {
            const on = filters.colors.includes(family);
            return (
              <button
                key={family}
                type="button"
                aria-pressed={on}
                onClick={() => update({ colors: toggle(filters.colors, family) })}
                className={cn(chip, on ? chipOn : chipOff)}
                data-testid={`filter-color-${family}`}
              >
                <span
                  className="size-4 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: COLOR_FAMILY_LABELS[family].swatch }}
                />
                {COLOR_FAMILY_LABELS[family].label}
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-xs font-bold tracking-[0.2em] text-ink-soft uppercase">
          Chất liệu
        </legend>
        <div className="flex flex-wrap gap-2">
          {fabrics.map((fabric: Fabric) => {
            const on = filters.fabrics.includes(fabric);
            return (
              <button
                key={fabric}
                type="button"
                aria-pressed={on}
                onClick={() => update({ fabrics: toggle(filters.fabrics, fabric) })}
                className={cn(chip, on ? chipOn : chipOff)}
                data-testid={`filter-fabric-${fabric}`}
              >
                {FABRIC_LABELS[fabric]}
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-xs font-bold tracking-[0.2em] text-ink-soft uppercase">
          Mức giá
        </legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRICE_RANGES) as PriceRangeKey[]).map((key) => {
            const on = filters.price === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => update({ price: on ? null : key })}
                className={cn(chip, on ? chipOn : chipOff)}
                data-testid={`filter-price-${key}`}
              >
                {PRICE_RANGES[key].label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );

  return (
    <div className="container-page pb-10">
      <div className="sticky top-[4.75rem] z-30 -mx-2 rounded-[2rem] bg-cream/85 px-2 py-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-0 flex-1 basis-56">
            <span className="sr-only">Tìm trong bộ sưu tập</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-faint"
              aria-hidden
            />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => update({ q: e.target.value.slice(0, 80) })}
              placeholder="Tìm khăn: “hoa cúc”, “satin”, “xanh”…"
              className="h-12 w-full rounded-full border-2 border-line bg-white pr-4 pl-12 outline-none focus:border-lilac focus:ring-4 focus:ring-lilac-100"
              data-testid="collection-search"
            />
          </label>
          <Button
            variant="light"
            className="lg:hidden"
            onClick={() => setSheetOpen(true)}
            data-testid="open-filters"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Bộ lọc{active > 0 ? ` (${active})` : ""}
          </Button>
          <label className="flex items-center gap-2">
            <span className="text-sm font-semibold text-ink-soft">Sắp xếp</span>
            <select
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as SortKey })}
              className="h-12 rounded-full border-2 border-line bg-white px-4 font-semibold outline-none focus:border-lilac focus:ring-4 focus:ring-lilac-100"
              data-testid="collection-sort"
            >
              {(Object.keys(SORT_OPTIONS) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_OPTIONS[key]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block" aria-label="Bộ lọc sản phẩm">
          <div className="sticky top-44 rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
            {controls}
            {active > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-6 w-full"
                onClick={() => update({ ...DEFAULT_FILTERS, sort: filters.sort })}
              >
                <X className="size-4" aria-hidden /> Xóa bộ lọc
              </Button>
            ) : null}
          </div>
        </aside>

        <div>
          <p
            className="mb-5 text-sm font-semibold text-ink-soft"
            aria-live="polite"
            data-testid="result-count"
          >
            Hiển thị {results.length}/{products.length} mẫu khăn
          </p>
          {results.length === 0 ? (
            <m.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[2rem] bg-white p-12 text-center shadow-card ring-1 ring-line"
              data-testid="empty-results"
            >
              <p className="text-5xl" aria-hidden>
                🚉
              </p>
              <p className="mt-4 font-display text-2xl font-extrabold">
                Sân ga này chưa có toa nào phù hợp
              </p>
              <p className="mt-2 text-ink-soft">
                Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác nhé.
              </p>
              <Button variant="candy" className="mt-6" onClick={() => update(DEFAULT_FILTERS)}>
                Xem tất cả 6 mẫu
              </Button>
            </m.div>
          ) : (
            <m.ul
              layout
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
              data-testid="product-grid"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((product, i) => (
                  <m.li
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  >
                    <ProductCard product={product} priority={i < 3} />
                  </m.li>
                ))}
              </AnimatePresence>
            </m.ul>
          )}
        </div>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        side="right"
        title="Bộ lọc"
        testId="filter-sheet"
      >
        <div className="flex-1 overflow-y-auto px-5 pb-6">{controls}</div>
        <div className="flex gap-3 border-t border-line bg-white px-5 py-4">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => update({ ...DEFAULT_FILTERS, sort: filters.sort })}
          >
            Xóa lọc
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => setSheetOpen(false)}>
            Xem {results.length} mẫu
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
