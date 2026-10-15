export type Review = {
  id: string;
  productId: string;
  rating: number;
  content: string;
  authorName: string;
  createdAt: string;
};

export type RatingSummary = {
  count: number;
  average: number;
  /** Số đánh giá theo số sao, chỉ số 0 = 1 sao … 4 = 5 sao. */
  distribution: [number, number, number, number, number];
};

export function summarizeReviews(reviews: Pick<Review, "rating">[]): RatingSummary {
  const distribution: RatingSummary["distribution"] = [0, 0, 0, 0, 0];
  let total = 0;
  for (const { rating } of reviews) {
    const r = Math.round(rating);
    if (r < 1 || r > 5) continue;
    distribution[r - 1]! += 1;
    total += r;
  }
  const count = distribution.reduce((a, b) => a + b, 0);
  return { count, average: count ? Math.round((total / count) * 10) / 10 : 0, distribution };
}

/** 4.5 → "4,5" (dấu phẩy thập phân kiểu Việt Nam). */
export function formatRating(value: number): string {
  return value.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export const RATING_LABELS: Record<number, string> = {
  1: "Chưa ưng",
  2: "Tạm được",
  3: "Ổn",
  4: "Rất thích",
  5: "Mê lắm!",
};
