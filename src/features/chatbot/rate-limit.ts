import "server-only";
import { createHash } from "node:crypto";
import { createPublicClient } from "@/lib/supabase/server";
import { CHAT_RATE_PER_DAY, CHAT_RATE_PER_MINUTE } from "./domain";

/**
 * IP của khách. Trên Vercel/proxy tin cậy, `x-real-ip` / phần tử đầu của `x-forwarded-for` do hạ tầng đặt.
 * (Nếu tự host không qua proxy, header này có thể bị giả mạo — xem docs/DEPLOY_GUIDE.md.)
 */
export function clientIp(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

let warnedNoSalt = false;

/** Băm IP + salt bí mật → không lưu IP thô trong database. */
export function hashIp(ip: string, salt = process.env.CHAT_IP_SALT ?? ""): string {
  if (!salt && !warnedNoSalt && process.env.NODE_ENV === "production") {
    warnedNoSalt = true;
    console.warn("[chat] Thiếu CHAT_IP_SALT — IP được băm không có salt.");
  }
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export type RateResult = { allowed: true } | { allowed: false; retryAfter: number };

/** Ghi 1 lượt hỏi cho IP và kiểm tra giới hạn (RPC chat_rate_hit, dùng chung mọi instance server). */
export async function hitChatRate(ipHash: string): Promise<RateResult> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase.rpc("chat_rate_hit", {
    p_ip_hash: ipHash,
    p_per_minute: CHAT_RATE_PER_MINUTE,
    p_per_day: CHAT_RATE_PER_DAY,
  });
  const row = data?.[0];
  if (error || !row) throw new Error(`chat_rate_hit: ${error?.message ?? "không có dữ liệu"}`);
  return row.allowed ? { allowed: true } : { allowed: false, retryAfter: row.retry_after_seconds };
}
