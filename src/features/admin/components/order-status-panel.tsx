"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { nextStatuses, ORDER_STATUS_LABELS, type OrderStatus } from "@/features/orders/domain";
import { updateOrderStatusAction } from "../actions";

export function OrderStatusPanel({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [pending, start] = useTransition();
  const options = nextStatuses(status);

  function apply(next: OrderStatus) {
    start(async () => {
      const result = await updateOrderStatusAction({ orderId, status: next, note });
      if (result.ok) {
        toast.success(`Đã chuyển sang “${ORDER_STATUS_LABELS[next]}”.`);
        setNote("");
        setConfirmCancel(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (options.length === 0) {
    return (
      <p className="rounded-2xl bg-cream px-4 py-3 text-sm text-ink-soft">
        Đơn đã ở trạng thái cuối, không thể thay đổi.
      </p>
    );
  }

  return (
    <div className="space-y-4" data-testid="order-status-panel">
      <label className="block">
        <span className="text-sm font-semibold">Ghi chú (hiển thị trong lịch sử đơn)</span>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          rows={2}
          className="mt-1.5"
          placeholder="VD: Đã gọi xác nhận, mã vận đơn…"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {options
          .filter((s) => s !== "cancelled")
          .map((s) => (
            <Button
              key={s}
              disabled={pending}
              onClick={() => apply(s)}
              data-testid={`set-status-${s}`}
            >
              Chuyển sang “{ORDER_STATUS_LABELS[s]}”
            </Button>
          ))}
        {options.includes("cancelled") ? (
          confirmCancel ? (
            <span className="flex flex-wrap items-center gap-2 rounded-2xl bg-pink-50 p-2">
              <span className="px-2 text-sm font-semibold">Hủy đơn và hoàn kho?</span>
              <Button
                variant="danger"
                size="sm"
                disabled={pending}
                onClick={() => apply("cancelled")}
                data-testid="confirm-admin-cancel"
              >
                Xác nhận hủy
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(false)}>
                Không
              </Button>
            </span>
          ) : (
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => setConfirmCancel(true)}
              data-testid="set-status-cancelled"
            >
              Hủy đơn
            </Button>
          )
        ) : null}
      </div>
    </div>
  );
}
