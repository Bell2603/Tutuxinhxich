/**
 * Tạo tài khoản mẫu cho môi trường LOCAL: 1 admin + 1 khách hàng.
 * Chạy tự động sau `npm run db:reset`. Từ chối chạy nếu Supabase không phải local.
 */
import { createClient } from "@supabase/supabase-js";
import { assertLocalSupabase, requireEnv } from "./load-env";

const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
assertLocalSupabase(url);
const admin = createClient(url, requireEnv("SUPABASE_SECRET_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function ensureUser(
  email: string,
  password: string,
  fullName: string,
  role: "admin" | "customer",
) {
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;
  let user = list.users.find((u) => u.email === email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw error;
    user = data.user;
  }
  const { error } = await admin
    .from("profiles")
    .update({ role, full_name: fullName })
    .eq("id", user.id);
  if (error) throw error;
  console.log(`✔ ${role.padEnd(8)} ${email}`);
}

await ensureUser(
  requireEnv("SEED_ADMIN_EMAIL"),
  requireEnv("SEED_ADMIN_PASSWORD"),
  "Quản trị Tu Tu",
  "admin",
);
await ensureUser(
  requireEnv("SEED_CUSTOMER_EMAIL"),
  requireEnv("SEED_CUSTOMER_PASSWORD"),
  "Khách Xinh Xắn",
  "customer",
);
