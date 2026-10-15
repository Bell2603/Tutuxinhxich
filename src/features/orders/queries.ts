import "server-only";
import { getSessionUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

export const ORDER_CODE_REGEX = /^TT\d{10}$/;

export async function getMyOrders() {
  const user = await getSessionUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, code, status, total, item_count, created_at, payment_method, order_items(product_name, image_url, quantity)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(`Không tải được đơn hàng: ${error.message}`);
  return data;
}

export async function getMyOrderByCode(code: string) {
  if (!ORDER_CODE_REGEX.test(code)) return null;
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), order_events(id, status, note, created_at)")
    .eq("code", code)
    .eq("user_id", user.id)
    .order("id", { referencedTable: "order_events", ascending: true })
    .maybeSingle();
  if (error) throw new Error(`Không tải được đơn hàng: ${error.message}`);
  return data;
}

export type MyOrder = NonNullable<Awaited<ReturnType<typeof getMyOrderByCode>>>;

/** Địa chỉ nhận hàng của đơn gần nhất → điền sẵn ở checkout. */
export async function getLastShipping() {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("recipient_name, phone, address, ward, province")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
