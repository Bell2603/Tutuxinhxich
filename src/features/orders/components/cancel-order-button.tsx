"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelMyOrderAction } from "../actions";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(true)}
        data-testid="cancel-order"
      >
        Hủy đơn hàng
      </Button>
    );
  }
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-2xl bg-pink-50 p-3"
      role="group"
      aria-label="Xác nhận hủy đơn"
    >
      <span className="text-sm font-semibold">Bạn chắc chắn muốn hủy đơn này?</span>
      <Button
        variant="danger"
        size="sm"
        disabled={pending}
        data-testid="confirm-cancel"
        onClick={() =>
          startTransition(async () => {
            const result = await cancelMyOrderAction(orderId);
            if (result.ok) {
              toast.success("Đã hủy đơn hàng.");
              router.refresh();
            } else {
              toast.error(result.error);
            }
            setConfirming(false);
          })
        }
      >
        {pending ? "Đang hủy…" : "Hủy đơn"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Giữ lại
      </Button>
    </div>
  );
}
