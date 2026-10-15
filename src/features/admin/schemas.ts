import { z } from "zod";
import { COLOR_FAMILIES, FABRICS } from "@/features/catalog/types";
import { ORDER_STATUSES } from "@/features/orders/domain";

export const STORAGE_BUCKET = "product-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

/** Chỉ chấp nhận ảnh trong thư mục public/products hoặc trong bucket Supabase Storage của shop. */
export function isAllowedImageUrl(url: string): boolean {
  if (/^\/products\/[a-z0-9/_-]+\.(webp|png|jpe?g|avif)$/i.test(url)) return true;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return false;
  const prefix = `${base}/storage/v1/object/public/${STORAGE_BUCKET}/`;
  return (
    url.startsWith(prefix) && !url.includes("..") && /^[\w\-./%]+$/.test(url.slice(prefix.length))
  );
}

const imageUrl = z
  .string()
  .trim()
  .min(1, "Thiếu ảnh")
  .max(1000)
  .refine(isAllowedImageUrl, "Ảnh không hợp lệ (chỉ dùng ảnh tải lên qua trang quản trị)");

const toInt = (v: unknown) =>
  typeof v === "string" ? (v.trim() === "" ? Number.NaN : Number(v.replace(/[.\s,₫]/g, ""))) : v;
const toNullableInt = (v: unknown) => (v === "" || v === null || v === undefined ? null : toInt(v));

export const productColorSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên màu").max(40, "Tối đa 40 ký tự"),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Mã màu dạng #RRGGBB"),
  family: z.enum(COLOR_FAMILIES),
});

export const productUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "Tên cần ít nhất 2 ký tự").max(80, "Tên tối đa 80 ký tự"),
    shortDescription: z.string().trim().max(200, "Tối đa 200 ký tự"),
    description: z.string().trim().max(4000, "Tối đa 4000 ký tự"),
    material: z.string().trim().max(200, "Tối đa 200 ký tự"),
    fabric: z.enum(FABRICS),
    size: z.string().trim().max(80, "Tối đa 80 ký tự"),
    careInstructions: z.string().trim().max(1000, "Tối đa 1000 ký tự"),
    price: z.preprocess(
      toInt,
      z
        .number({ message: "Nhập giá bán" })
        .int("Giá phải là số nguyên")
        .min(1000, "Giá tối thiểu 1.000₫")
        .max(100_000_000, "Giá tối đa 100.000.000₫"),
    ),
    compareAtPrice: z.preprocess(
      toNullableInt,
      z
        .number({ message: "Giá gốc không hợp lệ" })
        .int()
        .max(100_000_000, "Giá tối đa 100.000.000₫")
        .nullable(),
    ),
    stock: z.preprocess(
      toInt,
      z
        .number({ message: "Nhập tồn kho" })
        .int("Tồn kho là số nguyên")
        .min(0, "Tồn kho không âm")
        .max(100_000, "Tối đa 100.000"),
    ),
    badge: z.preprocess(
      (v) => (v === "" ? null : v),
      z.enum(["new", "best_seller", "limited"]).nullable(),
    ),
    isVisible: z.boolean(),
    isFeatured: z.boolean(),
    sortOrder: z.preprocess(toInt, z.number({ message: "Nhập số thứ tự" }).int().min(0).max(99)),
    colors: z.array(productColorSchema).max(8, "Tối đa 8 màu"),
    imageUrl,
    gallery: z.array(imageUrl).max(8, "Tối đa 8 ảnh chi tiết"),
  })
  .refine((v) => v.compareAtPrice === null || v.compareAtPrice > v.price, {
    path: ["compareAtPrice"],
    message: "Giá gốc phải lớn hơn giá bán (hoặc để trống nếu không giảm giá)",
  });

export type ProductFormInput = z.input<typeof productUpdateSchema>;
export type ProductFormValues = z.output<typeof productUpdateSchema>;

export const orderStatusUpdateSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự").default(""),
});

/** Ký tự an toàn cho ô tìm đơn (tránh chèn cú pháp filter của PostgREST). */
export function sanitizeOrderSearch(q: string): string {
  return q
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .slice(0, 50);
}
