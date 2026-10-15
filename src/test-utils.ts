import type { Product } from "@/features/catalog/types";

/** Sản phẩm mẫu cho unit test. */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    sku: "TTXX-001",
    slug: "may-hong-keo-bong",
    name: "Mây Hồng Kẹo Bông",
    shortDescription: "Khăn lụa satin vuông in mây hồng",
    description: "",
    material: "Satin lụa",
    fabric: "satin",
    colors: [{ name: "Hồng phấn", hex: "#FFB3D1", family: "hong" }],
    size: "70 × 70 cm",
    careInstructions: "",
    price: 289_000,
    compareAtPrice: 349_000,
    stock: 24,
    imageUrl: "/products/ttxx-001/main.webp",
    gallery: ["/products/ttxx-001/detail-1.webp"],
    badge: "best_seller",
    isVisible: true,
    isFeatured: false,
    sortOrder: 1,
    updatedAt: "2026-10-15T00:00:00Z",
    rating: null,
    ...overrides,
  };
}
