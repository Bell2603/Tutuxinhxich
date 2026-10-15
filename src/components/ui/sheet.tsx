"use client";

import { X } from "lucide-react";
import { AnimatePresence, type TargetAndTransition } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

type Side = "right" | "left" | "top" | "center";

const panelMotion: Record<
  Side,
  { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }
> = {
  right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
  left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
  top: { initial: { y: "-100%" }, animate: { y: 0 }, exit: { y: "-100%" } },
  center: {
    initial: { opacity: 0, scale: 0.94, y: 24 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 12 },
  },
};

const panelPosition: Record<Side, string> = {
  right: "inset-y-0 right-0 h-dvh w-full max-w-md rounded-l-[2rem]",
  left: "inset-y-0 left-0 h-dvh w-full max-w-sm rounded-r-[2rem]",
  top: "inset-x-0 top-0 max-h-[85dvh] w-full rounded-b-[2rem]",
  center:
    "top-1/2 left-1/2 max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[2rem]",
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Ngăn kéo/hộp thoại có hiệu ứng trượt, khóa cuộn trang, bẫy focus, đóng bằng Esc. */
export function Sheet({
  open,
  onClose,
  side = "right",
  title,
  hideTitle = false,
  children,
  className,
  initialFocusRef,
  testId,
}: {
  open: boolean;
  onClose: () => void;
  side?: Side;
  title: ReactNode;
  hideTitle?: boolean;
  children: ReactNode;
  className?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  testId?: string;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const mounted = useMounted();

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const focusTimer = window.setTimeout(() => {
      const target =
        initialFocusRef?.current ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus();
    }, 50);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose, initialFocusRef]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60]" data-testid={testId}>
          <m.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              "absolute flex flex-col overflow-hidden bg-cream shadow-float",
              panelPosition[side],
              className,
            )}
            {...panelMotion[side]}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div
              className={cn(
                "flex items-center justify-between gap-4 px-5 pt-5 pb-3 sm:px-6",
                hideTitle && "sr-only",
              )}
            >
              <h2 id={titleId} className="text-2xl font-extrabold">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="grid size-10 place-items-center rounded-full bg-white text-ink shadow-sm focus-ring transition-transform duration-300 hover:rotate-90"
                aria-label="Đóng"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            {children}
          </m.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
