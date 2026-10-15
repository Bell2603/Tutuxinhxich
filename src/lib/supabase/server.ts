import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Client theo phiên đăng nhập của người dùng (đọc cookie) — mọi quyền do RLS quyết định.
 * Gọi trong Server Component (bên trong <Suspense>), Server Action hoặc Route Handler.
 */
export async function createClient() {
  // Supabase so sánh hạn token với Date.now(): phải đánh dấu render là động trước khi đọc.
  await connection();
  const cookieStore = await cookies();
  const env = publicEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component không ghi được cookie — proxy.ts đã làm mới phiên.
          }
        },
      },
    },
  );
}

/** Client ẩn danh (không cookie) cho dữ liệu công khai như danh sách sản phẩm. */
export async function createPublicClient() {
  await connection();
  const env = publicEnv();
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
}
