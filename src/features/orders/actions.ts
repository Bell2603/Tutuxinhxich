"use server";

import { z } from "zod";
import { getSessionUser } from "@/features/auth/session";
import { parseAppError } from "@/lib/errors";
import { fail, ok, type ActionResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";

export async function cancelMyOrderAction(orderId: string): Promise<ActionResult<null>> {
  if (!z.uuid().safeParse(orderId).success) return fail("Đơn hàng không hợp lệ.");
  const user = await getSessionUser();
  if (!user) return fail("Bạn cần đăng nhập.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_my_order", { p_order_id: orderId });
  if (error) return fail(parseAppError(error).message);
  return ok(null, "Đã hủy đơn hàng.");
}
