import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { createClient } from "@supabase/supabase-js";

/** Sitemap: trang tĩnh + sản phẩm đang hiển thị (đọc trực tiếp, không cookie). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/bo-suu-tap`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/chinh-sach`, changeFrequency: "monthly", priority: 0.3 },
  ];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return entries;
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_visible", true)
      .order("sort_order");
    for (const p of data ?? []) {
      entries.push({
        url: `${base}/san-pham/${p.slug}`,
        lastModified: p.updated_at,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // Không có database lúc build → sitemap chỉ gồm trang tĩnh.
  }
  return entries;
}
