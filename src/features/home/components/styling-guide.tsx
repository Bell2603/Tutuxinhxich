"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import type { Route } from "next";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Accent, SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import {
  BagIllustration,
  BowIllustration,
  HeadbandIllustration,
  ParisIllustration,
} from "./styling-illustrations";

const STYLES = [
  {
    key: "no-co",
    label: "Nơ cổ áo",
    Illustration: BowIllustration,
    lead: "Kiểu kinh điển cho áo sơ mi và blouse — thanh lịch nhưng vẫn rất đáng yêu.",
    steps: [
      "Gấp khăn vuông thành dải dài khoảng 5 cm.",
      "Vòng quanh cổ dưới cổ áo, bắt chéo hai đầu.",
      "Thắt nơ, kéo hai cánh nơ cân đối và tỉa đuôi.",
    ],
    suggest: { name: "Mây Hồng Kẹo Bông", slug: "may-hong-keo-bong" },
  },
  {
    key: "paris",
    label: "Thắt kiểu Paris",
    Illustration: ParisIllustration,
    lead: "Gọn gàng, giữ ấm tốt và hợp mọi áo khoác — kiểu thắt nhanh nhất cho khăn dài.",
    steps: [
      "Gấp đôi khăn theo chiều dài.",
      "Vòng qua gáy, để phần vòng gấp ở một bên.",
      "Luồn hai đầu khăn qua vòng gấp rồi chỉnh độ lỏng.",
    ],
    suggest: { name: "Sọc Kẹo Cầu Vồng", slug: "soc-keo-cau-vong" },
  },
  {
    key: "tui",
    label: "Buộc quai túi",
    Illustration: BagIllustration,
    lead: "Biến chiếc túi quen thuộc thành món phụ kiện mới chỉ trong 30 giây.",
    steps: [
      "Gấp khăn thành dải nhỏ khoảng 3 cm.",
      "Thắt nút đơn quanh chân quai túi.",
      "Quấn hoặc thắt nơ, để hai đuôi khăn bay nhẹ.",
    ],
    suggest: { name: "Ngân Hà Lấp Lánh", slug: "ngan-ha-lap-lanh" },
  },
  {
    key: "bang-do",
    label: "Băng đô tóc",
    Illustration: HeadbandIllustration,
    lead: "Giữ tóc gọn gàng ngày nắng, thêm điểm nhấn màu sắc cho khuôn mặt.",
    steps: [
      "Gấp chéo khăn vuông thành hình tam giác rồi cuộn thành dải.",
      "Đặt dải khăn qua đỉnh đầu, đưa hai đầu ra sau gáy.",
      "Thắt nút hoặc nơ nhỏ lệch một bên cho tinh nghịch.",
    ],
    suggest: { name: "Hoa Cúc Sân Ga", slug: "hoa-cuc-san-ga" },
  },
] as const;

export function StylingGuide() {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const style = STYLES[active]!;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (active + delta + STYLES.length) % STYLES.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <section
      id="phoi-do"
      className="relative scroll-mt-24 overflow-hidden bg-white py-24"
      aria-labelledby="styling-title"
    >
      <div className="container-page">
        <SectionHeading
          id="styling-title"
          eyebrow="Hướng dẫn phối khăn"
          title={
            <>
              4 cách quàng, <Accent>xinh</Accent> cả tuần
            </>
          }
          description="Một chiếc khăn Tu Tu có thể theo bạn từ giảng đường, văn phòng tới buổi hẹn cuối tuần."
        />
        <div
          role="tablist"
          aria-label="Cách quàng khăn"
          onKeyDown={onKeyDown}
          className="mx-auto mt-12 flex w-full max-w-2xl gap-1 overflow-x-auto rounded-full bg-cream p-1.5 ring-1 ring-line"
        >
          {STYLES.map((item, i) => (
            <button
              key={item.key}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${i}`}
              aria-selected={active === i}
              aria-controls={`${baseId}-panel`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "relative flex-1 rounded-full px-4 py-3 text-sm font-bold whitespace-nowrap focus-ring transition-colors",
                active === i ? "text-cream" : "text-ink hover:bg-pink-50",
              )}
            >
              {active === i ? (
                <m.span
                  layoutId="styling-tab"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              ) : null}
              <span className="relative">{item.label}</span>
            </button>
          ))}
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active}`}
          className="mt-12"
        >
          <AnimatePresence mode="wait">
            <m.div
              key={style.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 items-center gap-10 md:grid-cols-[0.9fr_1.1fr]"
            >
              <m.div
                className="mx-auto w-full max-w-sm"
                initial={{ rotate: -6, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 12 }}
              >
                <div className="overflow-hidden rounded-[2.5rem] shadow-float">
                  <style.Illustration />
                </div>
              </m.div>
              <div>
                <h3 className="text-3xl font-extrabold sm:text-4xl">{style.label}</h3>
                <p className="mt-3 text-lg text-ink-soft">{style.lead}</p>
                <ol className="mt-6 space-y-3">
                  {style.steps.map((step, i) => (
                    <m.li
                      key={step}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      className="flex items-start gap-4 rounded-3xl bg-cream p-4"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-bubblegum font-display font-extrabold text-ink">
                        {i + 1}
                      </span>
                      <span className="pt-1.5">{step}</span>
                    </m.li>
                  ))}
                </ol>
                <Link
                  href={`/san-pham/${style.suggest.slug}` as Route}
                  className="group mt-6 inline-flex items-center gap-2 font-semibold text-berry focus-ring hover:underline"
                >
                  Gợi ý: thử với khăn {style.suggest.name}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </div>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
