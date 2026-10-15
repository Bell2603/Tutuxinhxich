"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setProductVisibilityAction } from "../actions";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  testId,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full focus-ring transition-colors duration-300 disabled:opacity-50",
        checked ? "bg-success" : "bg-ink-faint/40",
      )}
      data-testid={testId}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow transition-transform duration-300 ease-[var(--ease-bounce)]",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

export function VisibilityToggle({
  productId,
  visible,
  name,
}: {
  productId: string;
  visible: boolean;
  name: string;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useOptimistic(visible);
  const [pending, start] = useTransition();
  return (
    <Switch
      checked={optimistic}
      disabled={pending}
      label={`Hiển thị ${name} trên cửa hàng`}
      testId={`visibility-${productId}`}
      onChange={(next) =>
        start(async () => {
          setOptimistic(next);
          const result = await setProductVisibilityAction(productId, next);
          if (result.ok) toast.success(result.message);
          else toast.error(result.error);
          router.refresh();
        })
      }
    />
  );
}
