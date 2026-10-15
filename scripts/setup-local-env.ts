/**
 * Tạo/cập nhật .env.local từ `supabase status` của Supabase LOCAL.
 * Giữ nguyên các biến khác đã có trong .env.local.
 * Chạy: npm run env:local
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_PATH = resolve(process.cwd(), ".env.local");

function parseEnv(text: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of text.split("\n")) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match?.[1]) map.set(match[1], (match[2] ?? "").replace(/^"(.*)"$/, "$1"));
  }
  return map;
}

let statusOutput: string;
try {
  statusOutput = execFileSync("npx", ["supabase", "status", "-o", "env"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
} catch {
  console.error("✖ Không đọc được trạng thái Supabase local. Hãy chạy `npm run db:start` trước.");
  process.exit(1);
}

const status = parseEnv(statusOutput);
const apiUrl = status.get("API_URL");
const publishable = status.get("PUBLISHABLE_KEY") ?? status.get("ANON_KEY");
const secret = status.get("SECRET_KEY") ?? status.get("SERVICE_ROLE_KEY");
if (!apiUrl || !publishable || !secret) {
  console.error("✖ `supabase status` không trả về đủ API_URL / PUBLISHABLE_KEY / SECRET_KEY.");
  process.exit(1);
}

const current = existsSync(ENV_PATH) ? parseEnv(readFileSync(ENV_PATH, "utf8")) : new Map();
const defaults: Record<string, string> = {
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  SEED_ADMIN_EMAIL: "admin@tutuxinhxich.local",
  SEED_ADMIN_PASSWORD: "TuTuAdmin@2026",
  SEED_CUSTOMER_EMAIL: "khach@tutuxinhxich.local",
  SEED_CUSTOMER_PASSWORD: "KhachXinh@2026",
};
for (const [key, value] of Object.entries(defaults)) if (!current.has(key)) current.set(key, value);
current.set("NEXT_PUBLIC_SUPABASE_URL", apiUrl);
current.set("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", publishable);
current.set("SUPABASE_SECRET_KEY", secret);

const body = [
  "# Tạo tự động bởi `npm run env:local` — chỉ dùng cho môi trường LOCAL. Không commit.",
  ...[...current.entries()].map(([k, v]) => `${k}=${v}`),
  "",
].join("\n");
writeFileSync(ENV_PATH, body, { mode: 0o600 });
console.log(`✔ Đã ghi ${ENV_PATH} (Supabase: ${apiUrl})`);
