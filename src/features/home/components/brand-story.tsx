import { Reveal } from "@/components/motion/reveal";
import { Accent, Eyebrow } from "@/components/ui/section-heading";
import { LogoMark } from "@/components/brand/logo";

const BEATS = [
  {
    word: "Tu tu!",
    title: "Tiếng còi khởi hành",
    text: "Mỗi ngày là một chuyến đi mới — và bạn xứng đáng xuất hiện thật rạng rỡ ở mọi sân ga.",
  },
  {
    word: "Xình xịch",
    title: "Nhịp bánh xe vui tai",
    text: "Nhịp sống của người trẻ: nhanh, vui, nhiều màu sắc. Khăn của chúng mình cũng vậy.",
  },
  {
    word: "Khăn quàng",
    title: "Người bạn đồng hành",
    text: "Một phụ kiện nhỏ đủ đổi cả outfit, giữ ấm cổ và giữ luôn cá tính của bạn.",
  },
];

export function BrandStory() {
  return (
    <section
      id="cau-chuyen"
      className="container-page scroll-mt-24 py-24"
      aria-labelledby="story-title"
    >
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Câu chuyện thương hiệu</Eyebrow>
          <h2 id="story-title" className="mt-5 text-5xl leading-[1.02] font-extrabold sm:text-6xl">
            Vì sao lại là <Accent>Tu Tu Xình Xịch?</Accent>
          </h2>
          <p className="mt-6 text-lg text-ink-soft">
            Cái tên bắt đầu từ âm thanh tuổi thơ: tiếng còi “tu tu” và tiếng bánh xe “xình xịch” của
            những chuyến tàu đưa ta đến nơi mới. Tu Tu Xình Xịch muốn mỗi chiếc khăn là một tấm vé
            cho chuyến phiêu lưu phong cách của riêng bạn — vui tươi, rực rỡ và không ngại khác
            biệt.
          </p>
          <div className="mt-8 flex items-center gap-4 rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-line">
            <LogoMark className="size-16 shrink-0" />
            <p className="font-serif text-xl text-ink italic">
              “Quàng khăn lên, mình cùng khởi hành nhé!”
            </p>
          </div>
        </Reveal>
        <ol className="relative space-y-6 before:absolute before:top-4 before:bottom-4 before:left-[1.65rem] before:w-1 before:rounded-full before:bg-[repeating-linear-gradient(180deg,var(--color-ink)_0_10px,transparent_10px_20px)] before:opacity-20">
          {BEATS.map((beat, i) => (
            <Reveal as="li" key={beat.word} delay={i * 0.12} className="relative flex gap-5">
              <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full bg-aurora font-display text-lg font-extrabold text-ink shadow-pop">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
                <p className="font-serif text-2xl text-berry italic">{beat.word}</p>
                <h3 className="mt-1 text-xl font-extrabold">{beat.title}</h3>
                <p className="mt-2 text-ink-soft">{beat.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
