import "server-only";
import { requireAdmin } from "@/features/auth/session";
import { toProduct } from "@/features/catalog/mappers";
import type { OrderStatus } from "@/features/orders/domain";
import { createClient } from "@/lib/supabase/server";
import { sanitizeOrderSearch } from "./schemas";

export type DashboardStats = {
  orders_total: number;
  orders_pending: number;
  orders_by_status: Partial<Record<OrderStatus, number>>;
  revenue_delivered: number;
  revenue_open: number;
  units_in_stock: number;
  low_stock: number;
  out_of_stock: number;
  hidden_products: number;
};

// Mọi truy vấn admin tự kiểm tra quyền (layout & page render song song) — RLS là lớp bảo vệ cuối.

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_dashboard_stats");
  if (error) throw new Error(error.message);
  return data as DashboardStats;
}

export async function getAdminProducts() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data.map(toProduct);
}

export async function getAdminProduct(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toProduct(data) : null;
}

export async function getAdminOrders({ status, q }: { status?: OrderStatus; q?: string } = {}) {
  await requireAdmin();
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, code, status, total, item_count, created_at, recipient_name, phone, province, payment_method",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (status) query = query.eq("status", status);
  const term = q ? sanitizeOrderSearch(q) : "";
  if (term)
    query = query.or(`code.ilike.%${term}%,phone.ilike.%${term}%,recipient_name.ilike.%${term}%`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminOrder(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), order_events(id, status, note, created_at)")
    .eq("id", id)
    .order("id", { referencedTable: "order_events", ascending: true })
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
