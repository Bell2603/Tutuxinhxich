"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

const loadFeatures = () => import("./features").then((mod) => mod.default);

/**
 * - LazyMotion strict: chỉ dùng component `m.*` (nhẹ), tính năng tải sau.
 * - reducedMotion="user": tự tắt chuyển động transform khi hệ điều hành bật "Giảm chuyển động".
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
