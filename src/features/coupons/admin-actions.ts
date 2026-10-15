"use server";

import { z } from "zod";
import { ForbiddenError, requireAdmin } from "@/features/auth/session";
import { fail, ok, type ActionResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import { couponCreateSchema, endOfDayVN, startOfDayVN } from "./schemas";

async function guard(): Promise<ActionResult<null> | null> {
  try {
    await requireAdmin();
    return null;
  } catch (error) {
    if (error instanceof ForbiddenError)
      return fail("Bạn không có quyền quản trị.", { code: "FORBIDDEN" });
    throw error;
  }
}

export async function createCouponAction(input: unknown): Promise<ActionResult<null>> {
  const denied = await guard();
  if (denied) return denied;
  const parsed = couponCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Dữ liệu chưa hợp lệ.", {
      code: "VALIDATION",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    });
  }
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").insert({
    code: v.code,
    description: v.description,
    discount_type: v.discountType,
    discount_value: v.discountValue,
    max_discount: v.discountType === "percent" ? v.maxDiscount : null,
    min_subtotal: v.minSubtotal,
    starts_at: v.startsOn ? startOfDayVN(v.startsOn) : null,
    ends_at: v.endsOn ? endOfDayVN(v.endsOn) : null,
    usage_limit: v.usageLimit,
    per_customer_limit: v.perCustomerLimit,
  });
  if (error) {
    if (error.code === "23505")
      return fail("Mã này đã tồn tại.", { fieldErrors: { code: ["Mã này đã tồn tại"] } });
    console.error("[createCoupon]", error);
    return fail("Không tạo được mã giảm giá.");
  }
  return ok(null, `Đã tạo mã ${v.code}.`);
}

export async function setCouponActiveAction(
  couponId: string,
  active: boolean,
): Promise<ActionResult<null>> {
  const denied = await guard();
  if (denied) return denied;
  if (!z.uuid().safeParse(couponId).success) return fail("Mã không hợp lệ.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .update({ is_active: active })
    .eq("id", couponId)
    .select("id");
  if (error || !data?.length) return fail("Không cập nhật được mã.");
  return ok(null, active ? "Đã bật mã." : "Đã tắt mã.");
}

export async function deleteCouponAction(couponId: string): Promise<ActionResult<null>> {
  const denied = await guard();
  if (denied) return denied;
  if (!z.uuid().safeParse(couponId).success) return fail("Mã không hợp lệ.");
  const supabase = await createClient();
  // RLS chỉ cho xóa mã chưa được dùng lần nào.
  const { data, error } = await supabase.from("coupons").delete().eq("id", couponId).select("id");
  if (error) return fail("Không xóa được mã.");
  if (!data?.length) return fail("Mã đã được dùng nên không xóa được — hãy tắt mã thay vì xóa.");
  return ok(null, "Đã xóa mã.");
}
