import { Star } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Accent, SectionHeading } from "@/components/ui/section-heading";

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

export function Reviews() {
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
      <p
        className="mx-auto mt-4 w-fit rounded-full bg-sun-100 px-4 py-1.5 text-sm font-semibold text-warning"
        data-testid="reviews-demo-label"
      >
        Nội dung demo — đánh giá minh họa, sẽ thay bằng phản hồi thật của khách hàng
      </p>
      <Stagger className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {DEMO_REVIEWS.map((review) => (
          <StaggerItem key={review.name}>
            <figure
              className={`h-full rounded-[2rem] ${review.tone} ${review.rotate} p-7 shadow-card ring-1 ring-line transition-transform duration-500 hover:rotate-0`}
            >
              <div className="flex gap-1 text-gold" role="img" aria-label="5 trên 5 sao (minh họa)">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-5 fill-current" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-4 font-serif text-xl leading-snug text-ink italic">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-white font-display font-extrabold text-berry shadow-sm">
                  {review.name[0]}
                </span>
                <span>
                  <span className="block font-bold">{review.name}</span>
                  <span className="text-sm text-ink-soft">{review.tag}</span>
                </span>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
