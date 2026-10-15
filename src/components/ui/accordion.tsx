import type { ReactNode } from "react";

/** Accordion bằng <details> (không cần JS, hỗ trợ bàn phím sẵn). */
export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group border-b border-line py-1 [&_summary::-webkit-details-marker]:hidden"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl py-4 font-display text-lg font-bold focus-ring">
        {title}
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-full bg-pink-50 text-xl leading-none transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="pb-5 text-ink-soft">{children}</div>
    </details>
  );
}
