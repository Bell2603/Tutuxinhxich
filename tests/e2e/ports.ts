/** Cổng dùng chung giữa playwright.config.ts và các spec (không import config vào spec). */
export const E2E_PORT = Number(process.env.E2E_PORT ?? 3100);
/** Server Gemini GIẢ LẬP do tests/e2e/chatbot.spec.ts dựng — E2E không gọi Google, không tốn quota. */
export const GEMINI_MOCK_PORT = Number(process.env.E2E_GEMINI_PORT ?? 3199);
