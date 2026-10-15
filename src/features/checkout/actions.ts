"use server";

import { z } from "zod";
import { getSessionUser } from "@/features/auth/session";
import { parseAppError } from "@/lib/errors";
import { fail, ok, type ActionResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "./schemas";

/** Đặt hàng thử nghiệm: kiểm tra đăng nhập + dữ liệu, giá/tồn kho do database tính (RPC place_order). */
export async function placeOrderAction(input: unknown): Promise<ActionResult<{ code: string }>> {
  const user = await getSessionUser();
  if (!user) return fail("Bạn cần đăng nhập để đặt hàng.", { code: "AUTH_REQUIRED" });

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    return fail(flat.formErrors[0] ?? "Thông tin đặt hàng chưa hợp lệ, vui lòng kiểm tra lại.", {
      code: "VALIDATION",
    });
  }
  const { shipping, paymentMethod, items, clientRequestId } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
    p_shipping: {
      recipient_name: shipping.recipientName,
      phone: shipping.phone,
      address: shipping.address,
      ward: shipping.ward,
      province: shipping.province,
      note: shipping.note,
    },
    p_payment_method: paymentMethod,
    p_client_request_id: clientRequestId,
  });
  if (error || !data?.[0]) {
    const appError = parseAppError(error);
    if (appError.code === "UNKNOWN") console.error("[place_order]", error);
    return fail(appError.message, { code: appError.code });
  }

  // Lưu họ tên/SĐT vào hồ sơ để lần sau điền sẵn (không chặn đơn nếu lỗi).
  if (!user.phone || !user.fullName) {
    await supabase
      .from("profiles")
      .update({
        full_name: user.fullName || shipping.recipientName,
        phone: user.phone || shipping.phone,
      })
      .eq("id", user.id);
  }

  return ok({ code: data[0].order_code });
}
