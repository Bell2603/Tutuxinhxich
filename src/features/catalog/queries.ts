import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { toProduct } from "./mappers";
import type { Product } from "./types";

/** 6 sản phẩm đang hiển thị, theo thứ tự toa. Đọc động để giá/tồn kho luôn mới nhất. */
export const getVisibleProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .limit(6);
  if (error) throw new Error(`Không tải được danh sách sản phẩm: ${error.message}`);
  return data.map(toProduct);
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const products = await getVisibleProducts();
  return products.find((p) => p.slug === slug) ?? null;
});

export async function getFeaturedProduct(): Promise<Product | null> {
  const products = await getVisibleProducts();
  return (
    products.find((p) => p.isFeatured) ??
    products.find((p) => p.badge === "limited") ??
    products[0] ??
    null
  );
}
