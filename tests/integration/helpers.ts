import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import type { Database } from "@/types/database";

export type Client = SupabaseClient<Database>;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu ${name} — chạy \`npm run env:local\` (cần Supabase local).`);
  return value;
}

export const SUPABASE_URL = env("NEXT_PUBLIC_SUPABASE_URL");
if (!/^http:\/\/(127\.0\.0\.1|localhost)/.test(SUPABASE_URL)) {
  throw new Error("Integration test chỉ chạy với Supabase local.");
}

const options = { auth: { persistSession: false, autoRefreshToken: false } } as const;

export const service: Client = createClient<Database>(
  SUPABASE_URL,
  env("SUPABASE_SECRET_KEY"),
  options,
);

export function anon(): Client {
  return createClient<Database>(SUPABASE_URL, env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), options);
}

export type TestUser = { id: string; email: string; client: Client };

const created: string[] = [];

export async function createUser(role: "customer" | "admin" = "customer"): Promise<TestUser> {
  const email = `test-${randomUUID().slice(0, 8)}@tutuxinhxich.test`;
  const password = `Test-${randomUUID()}`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Người Test" },
  });
  if (error) throw error;
  created.push(data.user.id);
  if (role === "admin") {
    const { error: roleError } = await service
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", data.user.id);
    if (roleError) throw roleError;
  }
  const client = anon();
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  return { id: data.user.id, email, client };
}

/** Xóa user test + đơn hàng của họ (đơn có user_id → set null nên xóa thủ công trước). */
export async function cleanupUsers(): Promise<void> {
  while (created.length) {
    const id = created.pop()!;
    await service.from("orders").delete().eq("user_id", id);
    await service.auth.admin.deleteUser(id);
  }
}

export async function products() {
  const { data, error } = await service.from("products").select("*").order("sort_order");
  if (error) throw error;
  return data;
}

/** Chụp lại trạng thái sản phẩm để khôi phục sau test. */
export async function snapshotProducts() {
  const rows = await products();
  return async () => {
    for (const row of rows) {
      const { error } = await service
        .from("products")
        .update({
          stock: row.stock,
          price: row.price,
          compare_at_price: row.compare_at_price,
          is_visible: row.is_visible,
          name: row.name,
        })
        .eq("id", row.id);
      if (error) throw error;
    }
  };
}

export const SHIPPING = {
  recipient_name: "Nguyễn Thị Xinh",
  phone: "0912345678",
  address: "12 Đường Hoa Cúc",
  ward: "Phường Bến Thành",
  province: "TP. Hồ Chí Minh",
  note: "",
};

export function placeOrder(
  client: Client,
  items: { product_id: string; quantity: number }[],
  overrides: {
    shipping?: Partial<typeof SHIPPING>;
    requestId?: string;
    payment?: "cod" | "bank_transfer_mock";
  } = {},
) {
  return client.rpc("place_order", {
    p_items: items,
    p_shipping: { ...SHIPPING, ...overrides.shipping },
    p_payment_method: overrides.payment ?? "cod",
    p_client_request_id: overrides.requestId ?? randomUUID(),
  });
}
