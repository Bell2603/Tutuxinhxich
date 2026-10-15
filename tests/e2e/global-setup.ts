import { execFileSync } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

/** Reset database local về dữ liệu demo + tài khoản mẫu để E2E luôn chạy trên trạng thái biết trước. */
export default function globalSetup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!/^http:\/\/(127\.0\.0\.1|localhost)/.test(url)) {
    throw new Error(
      "E2E chỉ chạy với Supabase local (chạy `npm run db:start` và `npm run env:local`).",
    );
  }
  if (process.env.E2E_SKIP_RESET === "1") return;
  execFileSync("npx", ["supabase", "db", "reset"], { stdio: "ignore" });
  execFileSync("npx", ["tsx", "scripts/seed-users.ts"], { stdio: "inherit" });
}
