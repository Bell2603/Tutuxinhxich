const vndFormatter = new Intl.NumberFormat("vi-VN");

/** 289000 → "289.000₫" */
export function formatVND(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `${vndFormatter.format(safe)}₫`;
}

/** Phần trăm giảm giá làm tròn, 0 nếu không có giá gốc hợp lệ. */
export function discountPercent(price: number, compareAtPrice: number | null | undefined): number {
  if (!compareAtPrice || compareAtPrice <= price || price <= 0) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** Toa 01 … Toa 06 */
export function toaLabel(sortOrder: number): string {
  return `Toa ${String(Math.max(0, sortOrder)).padStart(2, "0")}`;
}
