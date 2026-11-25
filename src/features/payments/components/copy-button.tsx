"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Nút "Sao chép" cho số tài khoản / nội dung chuyển khoản. */
export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  /** Tên trường, dùng cho nhãn trợ năng và thông báo (VD "nội dung chuyển khoản"). */
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`Đã sao chép ${label}`);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không sao chép được — bạn hãy chọn và sao chép thủ công nhé.");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Sao chép ${label}`}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold text-berry focus-ring transition-colors hover:bg-pink-100",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      {copied ? "Đã chép" : "Sao chép"}
    </button>
  );
}
