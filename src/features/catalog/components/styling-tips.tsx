import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Accent } from "@/components/ui/section-heading";
import { scarfShape, stylesForShape } from "@/features/home/styling-data";

/** "Cách quàng hợp với chiếc khăn này" — chọn theo dáng khăn (vuông/dài). */
export function StylingTips({ size, name }: { size: string; name: string }) {
  const shape = scarfShape(size);
  const styles = stylesForShape(shape);
  return (
    <section className="mt-24" aria-labelledby="styling-tips-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="styling-tips-title" className="text-4xl font-extrabold sm:text-5xl">
          Quàng <Accent>{name}</Accent> thế nào?
        </h2>
        <Link
          href="/#phoi-do"
          className="group inline-flex items-center gap-2 font-semibold text-berry focus-ring hover:underline"
        >
          Xem cả 4 cách quàng
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>
      <p className="mt-2 text-ink-soft">
        {shape === "square" ? "Khăn vuông" : "Khăn dài"} ({size}) hợp nhất với {styles.length} cách
        dưới đây.
      </p>
      <Stagger
        className={`mt-8 grid grid-cols-1 gap-6 ${styles.length === 2 ? "max-w-4xl md:grid-cols-2" : "md:grid-cols-3"}`}
        gap={0.12}
      >
        {styles.map(({ key, label, lead, steps, Illustration }) => (
          <StaggerItem key={key}>
            <article className="group h-full rounded-[2rem] bg-white p-5 shadow-card ring-1 ring-line transition-transform duration-500 ease-[var(--ease-bounce)] hover:-translate-y-1.5">
              <div className="mx-auto w-40 overflow-hidden rounded-[1.75rem] transition-transform duration-500 ease-[var(--ease-bounce)] group-hover:scale-105 group-hover:-rotate-3">
                <Illustration />
              </div>
              <h3 className="mt-5 text-xl font-extrabold">{label}</h3>
              <p className="mt-1 text-sm text-ink-soft">{lead}</p>
              <ol className="mt-4 space-y-2 text-sm">
                {steps.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-pink-100 text-xs font-bold text-berry">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
