import { Gift, Palette, RefreshCcw, Sparkles } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Accent, SectionHeading } from "@/components/ui/section-heading";

const REASONS = [
  {
    Icon: Sparkles,
    title: "Chất liệu chọn lọc",
    text: "Satin mềm rủ, len không xù, voan nhẹ tênh, cotton linen thoáng mát.",
    tone: "bg-pink-100",
  },
  {
    Icon: Palette,
    title: "Họa tiết độc quyền",
    text: "6 họa tiết do Tu Tu tự thiết kế — mây hồng, sọc kẹo, hoa cúc, caro, ngân hà, loang màu.",
    tone: "bg-lilac-100",
  },
  {
    Icon: Gift,
    title: "Gói quà miễn phí",
    text: "Mỗi chiếc khăn được gấp gọn trong hộp kèm vé tàu xinh — sẵn sàng để tặng.",
    tone: "bg-sun-100",
  },
  {
    Icon: RefreshCcw,
    title: "Đổi trả 7 ngày",
    text: "Chưa ưng màu? Đổi mẫu khác trong 7 ngày nếu khăn còn nguyên tem.",
    tone: "bg-mint-100",
  },
];

export function WhyUs() {
  return (
    <section className="container-page py-24" aria-labelledby="why-title">
      <SectionHeading
        id="why-title"
        eyebrow="Lý do chọn Tu Tu"
        title={
          <>
            Lên tàu là <Accent>yên tâm</Accent>
          </>
        }
      />
      <Stagger className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map(({ Icon, title, text, tone }) => (
          <StaggerItem key={title}>
            <div className="group h-full rounded-[2rem] bg-white p-7 shadow-card ring-1 ring-line transition-transform duration-500 ease-[var(--ease-bounce)] hover:-translate-y-2 hover:rotate-[-1deg]">
              <span
                className={`grid size-14 place-items-center rounded-2xl ${tone} transition-transform duration-500 ease-[var(--ease-bounce)] group-hover:scale-110 group-hover:rotate-12`}
              >
                <Icon className="size-7 text-ink" aria-hidden />
              </span>
              <h3 className="mt-6 text-xl font-extrabold">{title}</h3>
              <p className="mt-2 text-ink-soft">{text}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
      <p className="mt-6 text-center text-sm text-ink-faint">
        Chính sách mẫu — cập nhật theo chính sách thực tế của cửa hàng.
      </p>
    </section>
  );
}
