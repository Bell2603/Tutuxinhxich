"use client";

import * as m from "motion/react-m";

/**
 * Tiêu đề xuất hiện từng chữ (theo từ để không vỡ dấu tiếng Việt).
 * Trình đọc màn hình đọc nguyên câu (bản sr-only), phần chữ chuyển động bị ẩn khỏi cây truy cập.
 */
export function SplitText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
}: {
  text: string;
  className?: string;
  wordClassName?: (word: string, index: number) => string | undefined;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          // Chỉ cắt mép dưới (chữ trượt lên từ dưới) — để dấu tiếng Việt chồng tầng phía trên không bị cắt.
          className="inline-block pb-[0.12em] align-bottom [clip-path:inset(-60%_-12%_0_-12%)]"
          aria-hidden
        >
          <m.span
            className={`inline-block ${wordClassName?.(word, i) ?? ""}`}
            initial={{ y: "110%", rotate: 6, opacity: 0 }}
            animate={{ y: "0%", rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 20, delay: delay + i * stagger }}
          >
            {word}
          </m.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
