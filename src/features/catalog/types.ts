import type { Database } from "@/types/database";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type Fabric = Database["public"]["Enums"]["fabric_type"];
export type ProductBadge = Database["public"]["Enums"]["product_badge"];

export const COLOR_FAMILIES = ["hong", "tim", "xanh", "vang", "do", "trang"] as const;
export type ColorFamily = (typeof COLOR_FAMILIES)[number];

export type ProductColor = { name: string; hex: string; family: ColorFamily };

export type Product = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  material: string;
  fabric: Fabric;
  colors: ProductColor[];
  size: string;
  careInstructions: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string;
  gallery: string[];
  badge: ProductBadge | null;
  isVisible: boolean;
  isFeatured: boolean;
  sortOrder: number;
  updatedAt: string;
};

export const FABRICS: readonly Fabric[] = ["satin", "len", "voan", "cotton"];

export const FABRIC_LABELS: Record<Fabric, string> = {
  satin: "Lụa satin",
  len: "Len & dạ",
  voan: "Voan",
  cotton: "Cotton linen",
};

export const COLOR_FAMILY_LABELS: Record<ColorFamily, { label: string; swatch: string }> = {
  hong: { label: "Hồng", swatch: "#FF8DC1" },
  tim: { label: "Tím", swatch: "#B79BFF" },
  xanh: { label: "Xanh", swatch: "#6FCFF5" },
  vang: { label: "Vàng", swatch: "#FFD447" },
  do: { label: "Đỏ", swatch: "#E8344E" },
  trang: { label: "Trắng & kem", swatch: "#FFF4E2" },
};

export const BADGE_LABELS: Record<ProductBadge, string> = {
  new: "New",
  best_seller: "Best Seller",
  limited: "Limited",
};
