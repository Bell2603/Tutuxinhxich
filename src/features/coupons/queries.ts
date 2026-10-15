import "server-only";
import { requireAdmin } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function getAdminCoupons() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export type AdminCoupon = Awaited<ReturnType<typeof getAdminCoupons>>[number];
