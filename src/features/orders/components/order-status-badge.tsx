import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "../domain";

const styles: Record<OrderStatus, string> = {
  pending: "bg-sun-100 text-warning",
  confirmed: "bg-sky-100 text-[#0b5f8a]",
  shipping: "bg-lilac-100 text-[#5b2fc2]",
  delivered: "bg-mint-100 text-success",
  cancelled: "bg-pink-100 text-danger",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        styles[status],
        className,
      )}
      data-testid="order-status"
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
