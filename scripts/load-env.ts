// Nạp .env.local cho scripts/ và tests/ (ngoài Next.js).
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu biến môi trường ${name} (chạy \`npm run env:local\`).`);
  return value;
}

/** Chặn chạy script phá dữ liệu trên Supabase không phải local. */
export function assertLocalSupabase(url: string): void {
  const host = new URL(url).hostname;
  if (!["127.0.0.1", "localhost"].includes(host)) {
    throw new Error(`Từ chối chạy: ${url} không phải Supabase local.`);
  }
}
