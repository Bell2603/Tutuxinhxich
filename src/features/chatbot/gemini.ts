import "server-only";
import type { ChatMessage } from "./domain";
import { PROMPT_CANARY } from "./prompt";

/** Model mặc định — Gemini Flash bản ổn định mới nhất (11/2026). Đổi qua biến GEMINI_MODEL. */
export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";
const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com";
const TIMEOUT_MS = 15_000;
const MAX_OUTPUT_TOKENS = 700;

export type GeminiConfig = {
  apiKey: string;
  model: string;
  /** Chỉ dùng cho test (server giả lập); mặc định là API của Google. */
  baseUrl: string;
};

/** Đọc cấu hình từ biến môi trường (server). null khi chưa có GEMINI_API_KEY. */
export function geminiConfigFromEnv(env: NodeJS.ProcessEnv = process.env): GeminiConfig | null {
  const apiKey = env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  const model = env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  return {
    apiKey,
    model: /^[a-z0-9][a-z0-9.-]{1,60}$/.test(model) ? model : DEFAULT_GEMINI_MODEL,
    baseUrl: (env.GEMINI_API_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/, ""),
  };
}

export type GeminiResult =
  | { ok: true; text: string }
  | { ok: false; reason: "blocked" | "timeout" | "busy" | "error" | "empty" };

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
};

/** Gọi Gemini generateContent (không stream). Không ném lỗi — luôn trả GeminiResult. */
export async function generateReply({
  config,
  system,
  messages,
  fetchImpl = fetch,
  timeoutMs = TIMEOUT_MS,
}: {
  config: GeminiConfig;
  system: string;
  messages: readonly ChatMessage[];
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<GeminiResult> {
  // Gemini 2.x không hỗ trợ thinkingLevel → chỉ gửi cho Gemini 3 trở lên.
  const supportsThinkingLevel = !/^gemini-(1|2)\./.test(config.model);
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      ...(supportsThinkingLevel ? { thinkingConfig: { thinkingLevel: "MINIMAL" } } : {}),
    },
  };

  let response: Response;
  try {
    response = await fetchImpl(
      `${config.baseUrl}/v1beta/models/${encodeURIComponent(config.model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": config.apiKey },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      },
    );
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "TimeoutError" || name === "AbortError") return { ok: false, reason: "timeout" };
    console.error("[chat] Không gọi được Gemini:", error);
    return { ok: false, reason: "error" };
  }

  if (!response.ok) {
    // Không log body (có thể chứa thông tin cấu hình); chỉ log mã lỗi.
    console.error(`[chat] Gemini trả mã ${response.status}`);
    return {
      ok: false,
      reason: response.status === 429 || response.status === 503 ? "busy" : "error",
    };
  }

  let data: GeminiResponse;
  try {
    data = (await response.json()) as GeminiResponse;
  } catch {
    return { ok: false, reason: "error" };
  }

  if (data.promptFeedback?.blockReason) return { ok: false, reason: "blocked" };
  const candidate = data.candidates?.[0];
  if (
    candidate?.finishReason &&
    ["SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII"].includes(candidate.finishReason)
  )
    return { ok: false, reason: "blocked" };

  const text = (candidate?.content?.parts ?? [])
    .filter((part) => !part.thought && typeof part.text === "string")
    .map((part) => part.text)
    .join("")
    .trim();
  if (!text) return { ok: false, reason: "empty" };
  // Bot lỡ lặp lại chỉ dẫn hệ thống → không trả về khách.
  if (text.includes(PROMPT_CANARY)) return { ok: false, reason: "blocked" };
  return { ok: true, text: candidate?.finishReason === "MAX_TOKENS" ? `${text}…` : text };
}
