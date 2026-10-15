import type { Metadata, Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessDenied } from "@/features/admin/components/access-denied";
import { ReviewVisibilityToggle } from "@/features/admin/components/review-visibility-toggle";
import { getAdminUser } from "@/features/auth/session";
import { StarRating } from "@/features/reviews/components/star-rating";
import { getAdminReviews } from "@/features/reviews/queries";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Đánh giá" };

async function ReviewList() {
  if (!(await getAdminUser("/admin/danh-gia"))) return <AccessDenied />;
  const reviews = await getAdminReviews();
  if (reviews.length === 0) {
    return (
      <p
        className="rounded-[2rem] bg-white p-10 text-center text-ink-soft shadow-card ring-1 ring-line"
        data-testid="admin-reviews-empty"
      >
        Chưa có đánh giá nào. Khách viết được đánh giá sau khi đơn hàng chuyển sang “Đã giao”.
      </p>
    );
  }
  return (
    <ul className="space-y-4" data-testid="admin-reviews">
      {reviews.map((review) => (
        <li
          key={review.id}
          className={cn(
            "rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-line",
            !review.is_visible && "opacity-70",
          )}
          data-testid="admin-review"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <StarRating value={review.rating} />
              <span className="font-semibold">{review.author_name}</span>
              {review.products ? (
                <Link
                  href={`/san-pham/${review.products.slug}#danh-gia` as Route}
                  className="text-sm text-berry hover:underline"
                >
                  {review.products.name}
                </Link>
              ) : null}
              <span className="text-xs text-ink-faint">{formatDateTime(review.created_at)}</span>
            </div>
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ReviewVisibilityToggle reviewId={review.id} visible={review.is_visible} />
              {review.is_visible ? "Đang hiển thị" : "Đang ẩn"}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-line text-ink-soft">{review.content}</p>
        </li>
      ))}
    </ul>
  );
}

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-extrabold">Đánh giá</h1>
        <p className="mt-1 text-ink-soft">
          Đánh giá do khách đã nhận hàng viết. Tắt công tắc để ẩn đánh giá vi phạm (spam, ngôn từ
          không phù hợp) — khách vẫn thấy đánh giá của chính mình.
        </p>
      </header>
      <Suspense fallback={<Skeleton className="h-96 rounded-[2rem]" />}>
        <ReviewList />
      </Suspense>
    </div>
  );
}
