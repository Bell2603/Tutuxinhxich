import { z } from "zod";
import { COLOR_FAMILIES, type Product, type ProductColor, type ProductRow } from "./types";

const colorSchema = z.object({
  name: z.string().min(1).max(40),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  family: z.enum(COLOR_FAMILIES),
});

/** Đọc cột jsonb colors an toàn: bỏ qua phần tử sai định dạng thay vì làm hỏng cả trang. */
export function parseColors(value: unknown): ProductColor[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = colorSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    material: row.material,
    fabric: row.fabric,
    colors: parseColors(row.colors),
    size: row.size,
    careInstructions: row.care_instructions,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    stock: row.stock,
    imageUrl: row.image_url,
    gallery: row.gallery ?? [],
    badge: row.badge,
    isVisible: row.is_visible,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}
