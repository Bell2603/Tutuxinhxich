import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: "customer" | "admin";
};

/**
 * Data Access Layer: người dùng hiện tại (đã xác thực JWT) + hồ sơ. Ghi nhớ trong một lần render.
 * Gọi bên trong <Suspense> (đọc cookie).
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    fullName: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    role: profile?.role === "admin" ? "admin" : "customer",
  };
});

export async function requireUser(nextPath: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/dang-nhap?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** Trả về admin hoặc null (không phải admin). Chưa đăng nhập → chuyển tới trang đăng nhập. */
export async function getAdminUser(nextPath = "/admin"): Promise<SessionUser | null> {
  const user = await requireUser(nextPath);
  return user.role === "admin" ? user : null;
}

export class ForbiddenError extends Error {
  constructor() {
    super("FORBIDDEN");
  }
}

/** Dùng trong mọi query/action admin: ném lỗi nếu không phải admin. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") throw new ForbiddenError();
  return user;
}
