import { normalizeVietnamese } from "@/lib/text";
import {
  COLOR_FAMILIES,
  COLOR_FAMILY_LABELS,
  FABRIC_LABELS,
  FABRICS,
  type ColorFamily,
  type Fabric,
  type Product,
} from "./types";

export const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

export function stockLabel(stock: number): string {
  switch (stockStatus(stock)) {
    case "out_of_stock":
      return "Hết hàng";
    case "low_stock":
      return `Chỉ còn ${stock} chiếc`;
    default:
      return "Còn hàng";
  }
}

export const PRICE_RANGES = {
  "duoi-250k": { label: "Dưới 250.000₫", min: 0, max: 249_999 },
  "250k-400k": { label: "250.000₫ – 400.000₫", min: 250_000, max: 400_000 },
  "tren-400k": { label: "Trên 400.000₫", min: 400_001, max: Number.MAX_SAFE_INTEGER },
} as const;
export type PriceRangeKey = keyof typeof PRICE_RANGES;

export const SORT_OPTIONS = {
  "noi-bat": "Nổi bật",
  "gia-tang": "Giá tăng dần",
  "gia-giam": "Giá giảm dần",
  "ten-a-z": "Tên A → Z",
} as const;
export type SortKey = keyof typeof SORT_OPTIONS;

export type CatalogFilters = {
  q: string;
  colors: ColorFamily[];
  fabrics: Fabric[];
  price: PriceRangeKey | null;
  sort: SortKey;
};

export const DEFAULT_FILTERS: CatalogFilters = {
  q: "",
  colors: [],
  fabrics: [],
  price: null,
  sort: "noi-bat",
};

type SearchParamsLike = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function listOf<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T[] {
  const raw = first(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return allowed.filter((item) => raw.includes(item));
}

/** Đọc bộ lọc từ URL; giá trị lạ bị bỏ qua (không lỗi). */
export function parseFilters(params: SearchParamsLike): CatalogFilters {
  const price = first(params.gia);
  const sort = first(params["sap-xep"]);
  return {
    q: first(params.q).slice(0, 80).trim(),
    colors: listOf(params.mau, COLOR_FAMILIES),
    fabrics: listOf(params["chat-lieu"], FABRICS),
    price: price in PRICE_RANGES ? (price as PriceRangeKey) : null,
    sort: sort in SORT_OPTIONS ? (sort as SortKey) : "noi-bat",
  };
}

/** Ghi bộ lọc ra query string (bỏ giá trị mặc định để URL gọn). */
export function serializeFilters(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.colors.length) params.set("mau", filters.colors.join(","));
  if (filters.fabrics.length) params.set("chat-lieu", filters.fabrics.join(","));
  if (filters.price) params.set("gia", filters.price);
  if (filters.sort !== "noi-bat") params.set("sap-xep", filters.sort);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function countActiveFilters(filters: CatalogFilters): number {
  return (
    filters.colors.length + filters.fabrics.length + (filters.price ? 1 : 0) + (filters.q ? 1 : 0)
  );
}

function searchableText(product: Product): string {
  return normalizeVietnamese(
    [
      product.name,
      product.sku,
      product.shortDescription,
      product.material,
      FABRIC_LABELS[product.fabric],
      ...product.colors.map((c) => `${c.name} ${COLOR_FAMILY_LABELS[c.family].label}`),
    ].join(" "),
  );
}

/** Tìm kiếm không dấu: mọi từ khóa phải xuất hiện. */
export function matchesQuery(product: Product, query: string): boolean {
  const tokens = normalizeVietnamese(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = searchableText(product);
  return tokens.every((token) => haystack.includes(token));
}

export function filterProducts(products: Product[], filters: CatalogFilters): Product[] {
  const range = filters.price ? PRICE_RANGES[filters.price] : null;
  const result = products.filter((product) => {
    if (!matchesQuery(product, filters.q)) return false;
    if (filters.colors.length && !product.colors.some((c) => filters.colors.includes(c.family)))
      return false;
    if (filters.fabrics.length && !filters.fabrics.includes(product.fabric)) return false;
    if (range && (product.price < range.min || product.price > range.max)) return false;
    return true;
  });
  return sortProducts(result, filters.sort);
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case "gia-tang":
      return copy.sort((a, b) => a.price - b.price || a.sortOrder - b.sortOrder);
    case "gia-giam":
      return copy.sort((a, b) => b.price - a.price || a.sortOrder - b.sortOrder);
    case "ten-a-z":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    default:
      return copy.sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

/** Ảnh hiển thị trên trang chi tiết: ảnh chính + bộ ảnh chi tiết, bỏ trùng/rỗng. */
export function productImages(product: Pick<Product, "imageUrl" | "gallery">): string[] {
  return [
    ...new Set([product.imageUrl, ...product.gallery].filter((src) => src.trim().length > 0)),
  ];
}

/** Màu có trong danh mục hiện tại (để hiển thị bộ lọc). */
export function availableColorFamilies(products: Product[]): ColorFamily[] {
  const families = new Set(products.flatMap((p) => p.colors.map((c) => c.family)));
  return COLOR_FAMILIES.filter((f) => families.has(f));
}

export function availableFabrics(products: Product[]): Fabric[] {
  const fabrics = new Set(products.map((p) => p.fabric));
  return FABRICS.filter((f) => fabrics.has(f));
}
