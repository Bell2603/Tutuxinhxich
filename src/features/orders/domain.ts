import type { Database } from "@/types/database";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "shipping",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  pending: "Tu Tu đã nhận đơn và sẽ gọi xác nhận trong giờ làm việc.",
  confirmed: "Đơn đã được xác nhận, khăn đang được gói quà.",
  shipping: "Khăn đã lên tàu, đang trên đường tới bạn.",
  delivered: "Giao hàng thành công. Chúc bạn quàng khăn thật xinh!",
  cancelled: "Đơn hàng đã được hủy.",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank_transfer_mock: "Chuyển khoản (giả lập — không trừ tiền thật)",
};

/** Luồng trạng thái hợp lệ — phải khớp hàm SQL public.can_transition_order. */
const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: OrderStatus): readonly OrderStatus[] {
  return TRANSITIONS[from];
}

export function canCustomerCancel(status: OrderStatus): boolean {
  return status === "pending";
}

/** Các bước hiển thị trên timeline; đơn hủy dừng tại bước đã đạt. */
export const PROGRESS_STEPS: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "shipping",
  "delivered",
];

export function progressIndex(status: OrderStatus): number {
  return PROGRESS_STEPS.indexOf(status);
}
