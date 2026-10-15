"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { MotionProvider } from "@/components/motion/motion-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "!rounded-3xl !font-sans !shadow-float !border-0",
            actionButton: "!rounded-full !bg-ink !text-cream !font-semibold",
          },
        }}
      />
    </MotionProvider>
  );
}
