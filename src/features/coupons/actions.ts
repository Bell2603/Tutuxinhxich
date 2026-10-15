"use server";

import { z } from "zod";
import { getSessionUser } from "@/features/auth/session";
import { getVisibleProducts } from "@/features/catalog/queries";
import { parseAppError } from "@/lib/errors";
import { fail, ok, type ActionResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import { normalizeCouponCode, parseCouponTerms, type CouponTerms } from "./domain";

const previewSchema = z.object({
  code: z.string().max(40),
  items: z
    .array(z.object({ productId: z.uuid(), quantity: z.number().int().min(1).max(10) }))
    .max(6),
});

/** Kiểm tra mã ở trang thanh toán. Tạm tính lấy theo giá trong database (không tin giá từ trình duyệt). */
export async function previewCouponAction(
  input: unknown,
): Promise<ActionResult<{ terms: CouponTerms; discount: number }>> {
  if (!(await getSessionUser()))
    return fail("Bạn cần đăng nhập để dùng mã giảm giá.", { code: "AUTH_REQUIRED" });
  const parsed = previewSchema.safeParse(input);
  if (!parsed.success) return fail("Mã giảm giá không hợp lệ.");
  const code = normalizeCouponCode(parsed.data.code);
  if (code.length < 3) return fail("Vui lòng nhập mã giảm giá.");

  const products = await getVisibleProducts();
  const subtotal = parsed.data.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("preview_coupon", {
    p_code: code,
    p_subtotal: subtotal,
  });
  if (error) {
    const appError = parseAppError(error);
    return fail(appError.message, { code: appError.code });
  }
  const terms = parseCouponTerms(data);
  if (!terms) return fail("Không đọc được mã giảm giá.");
  return ok(
    { terms, discount: Number((data as { discount?: number }).discount) || 0 },
    `Đã áp dụng mã ${terms.code}`,
  );
}
