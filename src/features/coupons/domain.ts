import { formatVND } from "@/lib/format";

/** Điều kiện của một mã giảm giá (từ RPC preview_coupon). */
export type CouponTerms = {
  code: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  maxDiscount: number | null;
  minSubtotal: number;
};

/**
 * Số tiền giảm — phải khớp hàm SQL public.coupon_discount_amount:
 * % làm tròn xuống tới 1.000₫ và không vượt mức tối đa; số tiền cố định không vượt tạm tính.
 */
export function couponDiscount(
  terms: Pick<CouponTerms, "discountType" | "discountValue" | "maxDiscount">,
  subtotal: number,
): number {
  const raw =
    terms.discountType === "percent"
      ? Math.min(
          Math.floor((subtotal * terms.discountValue) / 100 / 1000) * 1000,
          terms.maxDiscount ?? Number.MAX_SAFE_INTEGER,
        )
      : terms.discountValue;
  return Math.max(0, Math.min(subtotal, raw));
}

export function couponLabel(
  terms: Pick<CouponTerms, "discountType" | "discountValue" | "maxDiscount" | "minSubtotal">,
): string {
  const main =
    terms.discountType === "percent"
      ? `Giảm ${terms.discountValue}%${terms.maxDiscount ? ` (tối đa ${formatVND(terms.maxDiscount)})` : ""}`
      : `Giảm ${formatVND(terms.discountValue)}`;
  return terms.minSubtotal > 0 ? `${main} cho đơn từ ${formatVND(terms.minSubtotal)}` : main;
}

/** "  lentau 10 " → "LENTAU10" */
export function normalizeCouponCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 20);
}

export function parseCouponTerms(value: unknown): CouponTerms | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.code !== "string" || (v.discount_type !== "percent" && v.discount_type !== "fixed"))
    return null;
  return {
    code: v.code,
    description: typeof v.description === "string" ? v.description : "",
    discountType: v.discount_type,
    discountValue: Number(v.discount_value) || 0,
    maxDiscount:
      v.max_discount === null || v.max_discount === undefined ? null : Number(v.max_discount),
    minSubtotal: Number(v.min_subtotal) || 0,
  };
}

export type CouponStatus = "active" | "scheduled" | "expired" | "used_up" | "disabled";

export const COUPON_STATUS_LABELS: Record<CouponStatus, string> = {
  active: "Đang áp dụng",
  scheduled: "Chưa bắt đầu",
  expired: "Hết hạn",
  used_up: "Hết lượt",
  disabled: "Đã tắt",
};

export function couponStatus(
  c: {
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    usage_limit: number | null;
    used_count: number;
  },
  now: Date = new Date(),
): CouponStatus {
  if (!c.is_active) return "disabled";
  if (c.ends_at && now >= new Date(c.ends_at)) return "expired";
  if (c.starts_at && now < new Date(c.starts_at)) return "scheduled";
  if (c.usage_limit !== null && c.used_count >= c.usage_limit) return "used_up";
  return "active";
}
