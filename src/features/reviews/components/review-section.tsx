import { BadgeCheck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Accent } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { formatRating, summarizeReviews } from "../domain";
import { getMyReviewStatus, getProductReviews } from "../queries";
import { ReviewForm } from "./review-form";
import { StarRating } from "./star-rating";

export async function ReviewSection({
  productId,
  slug,
  name,
}: {
  productId: string;
  slug: string;
  name: string;
}) {
  const [reviews, status] = await Promise.all([
    getProductReviews(productId),
    getMyReviewStatus(productId),
  ]);
  const summary = summarizeReviews(reviews);
  return (
    <section
      id="danh-gia"
      className="mt-24 scroll-mt-28"
      aria-labelledby="reviews-section-title"
      data-testid="review-section"
    >
      <h2 id="reviews-section-title" className="text-4xl font-extrabold sm:text-5xl">
        Hành khách <Accent>nói gì</Accent>
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
            {summary.count > 0 ? (
              <>
                <p className="font-display text-6xl font-extrabold" data-testid="review-average">
                  {formatRating(summary.average)}
                </p>
                <StarRating value={summary.average} size="md" className="mt-2" />
                <p className="mt-1 text-sm text-ink-soft" data-testid="review-count">
                  {summary.count} đánh giá từ khách đã nhận hàng
                </p>
                <ul className="mt-5 space-y-2" aria-label="Phân bố số sao">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const n = summary.distribution[star - 1]!;
                    return (
                      <li key={star} className="flex items-center gap-3 text-sm">
                        <span className="w-10 font-semibold">{star} ★</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-pink-50">
                          <span
                            className="block h-full rounded-full bg-gold"
                            style={{ width: `${(n / summary.count) * 100}%` }}
                          />
                        </span>
                        <span className="w-6 text-right text-ink-soft tabular-nums">{n}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <p className="text-ink-soft" data-testid="review-empty">
                Chưa có đánh giá cho <strong className="text-ink">{name}</strong>. Hãy là hành khách
                đầu tiên chia sẻ cảm nhận!
              </p>
            )}
          </div>
          <ReviewForm productId={productId} slug={slug} status={status} />
        </div>
        <ul className="space-y-4" data-testid="review-list">
          {reviews.slice(0, 20).map((review, i) => (
            <Reveal as="li" key={review.id} delay={Math.min(i, 4) * 0.06}>
              <figure className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StarRating value={review.rating} />
                  <span className="text-xs text-ink-faint">{formatDate(review.createdAt)}</span>
                </div>
                <blockquote className="mt-3 whitespace-pre-line text-ink">
                  {review.content}
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-2 text-sm">
                  <span className="grid size-8 place-items-center rounded-full bg-aurora font-display font-extrabold text-ink">
                    {review.authorName[0]}
                  </span>
                  <span className="font-semibold">{review.authorName}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2 py-0.5 text-xs font-semibold text-success">
                    <BadgeCheck className="size-3.5" aria-hidden /> Đã mua hàng
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
      <p className="sr-only">Điểm trung bình {formatRating(summary.average)} trên 5.</p>
    </section>
  );
}

export function ReviewSectionSkeleton() {
  return (
    <div
      className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-[20rem_1fr]"
      aria-busy="true"
      aria-label="Đang tải đánh giá"
    >
      <Skeleton className="h-64 rounded-[2rem]" />
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-[2rem]" />
        <Skeleton className="h-32 rounded-[2rem]" />
      </div>
    </div>
  );
}
