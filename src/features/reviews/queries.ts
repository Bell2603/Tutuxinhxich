import "server-only";
import { cache } from "react";
import { requireAdmin } from "@/features/auth/session";
import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { Review } from "./domain";

type ReviewRow = {
  id: string;
  product_id: string;
  rating: number;
  content: string;
  author_name: string;
  created_at: string;
};

const COLUMNS = "id, product_id, rating, content, author_name, created_at";

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    rating: row.rating,
    content: row.content,
    authorName: row.author_name,
    createdAt: row.created_at,
  };
}

/** Đánh giá đang hiển thị của một sản phẩm (mới nhất trước). */
export const getProductReviews = cache(async (productId: string): Promise<Review[]> => {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select(COLUMNS)
    .eq("product_id", productId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(`Không tải được đánh giá: ${error.message}`);
  return data.map(toReview);
});

/** Điểm trung bình + số đánh giá của mọi sản phẩm. */
export const getRatingStats = cache(
  async (): Promise<Map<string, { average: number; count: number }>> => {
    const supabase = await createPublicClient();
    const { data, error } = await supabase
      .from("product_review_stats")
      .select("product_id, review_count, average_rating");
    if (error) throw new Error(`Không tải được điểm đánh giá: ${error.message}`);
    return new Map(
      data.flatMap((row) =>
        row.product_id
          ? [
              [
                row.product_id,
                { average: row.average_rating ?? 0, count: row.review_count ?? 0 },
              ] as const,
            ]
          : [],
      ),
    );
  },
);

/** Đánh giá mới nhất trên toàn cửa hàng (trang chủ). */
export async function getLatestReviews(
  limit = 3,
): Promise<(Review & { productName: string; productSlug: string })[]> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select(`${COLUMNS}, products(name, slug, sort_order)`)
    .eq("is_visible", true)
    .gte("rating", 4)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Không tải được đánh giá: ${error.message}`);
  return data.flatMap((row) =>
    row.products
      ? [{ ...toReview(row), productName: row.products.name, productSlug: row.products.slug }]
      : [],
  );
}

export type MyReviewStatus = {
  eligible: boolean;
  review: {
    id: string;
    rating: number;
    content: string;
    is_visible: boolean;
    created_at: string;
  } | null;
};

/** Người đang đăng nhập: được viết đánh giá chưa / đã viết gì. null nếu chưa đăng nhập. */
export async function getMyReviewStatus(productId: string): Promise<MyReviewStatus | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return null;
  const { data, error } = await supabase.rpc("review_status_for_me", { p_product_id: productId });
  if (error) throw new Error(`Không kiểm tra được quyền đánh giá: ${error.message}`);
  return data as MyReviewStatus;
}

export async function getAdminReviews() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, rating, content, author_name, is_visible, created_at, products(name, slug)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data;
}
