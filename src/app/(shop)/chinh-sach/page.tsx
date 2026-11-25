import { PageTransition } from "@/components/motion/page-transition";
import type { Metadata } from "next";
import { Accent, Eyebrow } from "@/components/ui/section-heading";
import { POLICY_SECTIONS } from "@/features/policies/content";

export const metadata: Metadata = { title: "Giao hàng, đổi trả & bảo quản" };

export default function PolicyPage() {
  return (
    <PageTransition>
      <div className="container-page max-w-4xl py-12">
        <Eyebrow>Chính sách</Eyebrow>
        <h1 className="mt-5 text-5xl leading-[1.02] font-extrabold sm:text-6xl">
          Đi tàu <Accent>an tâm</Accent>
        </h1>
        <p className="mt-4 rounded-2xl bg-sun-100 px-4 py-3 text-sm font-semibold text-warning">
          Nội dung chính sách mẫu — cửa hàng cần cập nhật theo chính sách thực tế trước khi bán
          hàng.
        </p>
        <div className="mt-10 space-y-6">
          {POLICY_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 rounded-[2rem] bg-white p-7 shadow-card ring-1 ring-line"
            >
              <h2 className="text-2xl font-extrabold">{section.title}</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
