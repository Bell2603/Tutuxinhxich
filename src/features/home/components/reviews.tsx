import { BadgeCheck } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Accent, SectionHeading } from "@/components/ui/section-heading";
import { StarRating } from "@/features/reviews/components/star-rating";
import { getLatestReviews } from "@/features/reviews/queries";

/** NỘI DUNG DEMO — đánh giá minh họa, không phải phản hồi của khách hàng thật. */
const DEMO_REVIEWS = [
  {
    name: "Minh Anh",
    tag: "Toa 01 · Mây Hồng",
    text: "Khăn mềm và màu ngoài đời xinh y hình. Thắt nơ với sơ mi trắng đi học được khen quá trời!",
    tone: "bg-pink-50",
    rotate: "-rotate-1",
  },
  {
    name: "Gia Huy",
    tag: "Toa 04 · Caro Dâu Tây",
    text: "Mua tặng bạn gái, hộp quà có cả vé tàu nhỏ siêu cute. Khăn dày, ấm mà không bị ngứa.",
    tone: "bg-sun-100",
    rotate: "rotate-1",
  },
  {
    name: "Thảo Vy",
    tag: "Toa 05 · Ngân Hà",
    text: "Ánh nhũ lấp lánh nhẹ, không bị lố. Buộc lên quai túi là cả set đồ sáng bừng.",
    tone: "bg-lilac-100",
    rotate: "-rotate-1",
  },
];

const TONES = ["bg-pink-50", "bg-sun-100", "bg-lilac-100"];
const ROTATES = ["-rotate-1", "rotate-1", "-rotate-1"];

type Card = { key: string; name: string; tag: string; text: string; rating: number; href?: string };

/** Đánh giá thật (≥ 3 đánh giá 4–5 sao đang hiển thị) hoặc nội dung DEMO được ghi rõ. */
export async function Reviews() {
  const latest = await getLatestReviews(3);
  const real = latest.length >= 3;
  const cards: Card[] = real
    ? latest.map((r) => ({
        key: r.id,
        name: r.authorName,
        tag: r.productName,
        text: r.content,
        rating: r.rating,
        href: `/san-pham/${r.productSlug}#danh-gia`,
      }))
    : DEMO_REVIEWS.map((r) => ({ key: r.name, name: r.name, tag: r.tag, text: r.text, rating: 5 }));

  return (
    <section className="container-page py-24" aria-labelledby="reviews-title">
      <SectionHeading
        id="reviews-title"
        eyebrow="Hành khách nói gì"
        title={
          <>
            Những chuyến đi <Accent>rạng rỡ</Accent>
          </>
        }
      />
      {real ? (
        <p
          className="mx-auto mt-4 flex w-fit items-center gap-1.5 rounded-full bg-mint-100 px-4 py-1.5 text-sm font-semibold text-success"
          data-testid="reviews-real-label"
        >
          <BadgeCheck className="size-4" aria-hidden /> Đánh giá thật từ khách đã nhận hàng
        </p>
      ) : (
        <p
          className="mx-auto mt-4 w-fit rounded-full bg-sun-100 px-4 py-1.5 text-sm font-semibold text-warning"
          data-testid="reviews-demo-label"
        >
          Nội dung demo — đánh giá minh họa, sẽ thay bằng phản hồi thật của khách hàng
        </p>
      )}
      <Stagger className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((review, i) => (
          <StaggerItem key={review.key}>
            <figure
              className={`h-full rounded-[2rem] ${TONES[i % 3]} ${ROTATES[i % 3]} p-7 shadow-card ring-1 ring-line transition-transform duration-500 hover:rotate-0`}
            >
              <StarRating value={review.rating} size="md" />
              <blockquote className="mt-4 line-clamp-5 font-serif text-xl leading-snug text-ink italic">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-white font-display font-extrabold text-berry shadow-sm">
                  {review.name[0]}
                </span>
                <span>
                  <span className="block font-bold">{review.name}</span>
                  {review.href ? (
                    <Link
                      href={review.href as Route}
                      className="text-sm text-ink-soft hover:text-berry hover:underline"
                    >
                      {review.tag}
                    </Link>
                  ) : (
                    <span className="text-sm text-ink-soft">{review.tag}</span>
                  )}
                </span>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function ReviewsSkeleton() {
  return (
    <section className="container-page py-24" aria-busy="true" aria-label="Đang tải đánh giá">
      <div className="mx-auto h-14 w-2/3 max-w-xl skeleton rounded-full" />
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-56 skeleton rounded-[2rem]" />
        ))}
      </div>
    </section>
  );
}
