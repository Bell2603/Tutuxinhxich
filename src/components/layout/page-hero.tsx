import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/section-heading";

/** Phần đầu trang con (cùng kiểu /bo-suu-tap): nền candy, eyebrow, h1 và đoạn mô tả. */
export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pt-8 pb-10">
      <div aria-hidden className="absolute inset-0 -z-10 bg-candy" />
      <div className="container-page">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-3xl text-5xl leading-[1.02] font-extrabold sm:text-7xl">
          {title}
        </h1>
        {description ? <p className="mt-4 max-w-2xl text-lg text-ink-soft">{description}</p> : null}
      </div>
    </section>
  );
}
