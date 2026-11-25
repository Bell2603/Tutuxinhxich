import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import { E2E_PORT, GEMINI_MOCK_PORT } from "./tests/e2e/ports";

config({ path: ".env.local", quiet: true });

const PORT = E2E_PORT;

/**
 * E2E chạy trên bản build production (next start) ở cổng 3100 với Supabase local.
 * Trước khi chạy: database được reset về dữ liệu demo (bỏ qua bằng E2E_SKIP_RESET=1).
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 } },
    },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
  webServer: {
    command: process.env.E2E_SKIP_BUILD
      ? `npx next start -p ${PORT}`
      : `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
    // Ghi đè khóa thật (nếu có trong .env.local) để E2E luôn dùng server giả lập.
    env: {
      GEMINI_API_KEY: "e2e-test-key",
      GEMINI_MODEL: "gemini-3.8-flash",
      GEMINI_API_BASE_URL: `http://127.0.0.1:${GEMINI_MOCK_PORT}`,
      CHAT_IP_SALT: "e2e-salt",
    },
  },
});
