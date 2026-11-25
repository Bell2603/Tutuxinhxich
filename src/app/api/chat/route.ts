import { NextResponse } from "next/server";
import { getVisibleProducts } from "@/features/catalog/queries";
import { CHAT_BODY_MAX_BYTES, liveChannels, trimHistory } from "@/features/chatbot/domain";
import { geminiConfigFromEnv, generateReply } from "@/features/chatbot/gemini";
import { buildSystemPrompt } from "@/features/chatbot/prompt";
import { clientIp, hashIp, hitChatRate } from "@/features/chatbot/rate-limit";
import { chatRequestSchema } from "@/features/chatbot/schemas";
import { siteUrl } from "@/lib/env";

type ErrorCode =
  | "FORBIDDEN"
  | "TOO_LARGE"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "NOT_CONFIGURED"
  | "TIMEOUT"
  | "UNAVAILABLE";

function fail(status: number, code: ErrorCode, error: string, headers?: HeadersInit) {
  return NextResponse.json(
    { error, code },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}

const BLOCKED_REPLY =
  "Tu Tu chỉ có thể hỗ trợ các câu hỏi về khăn, đơn hàng và chính sách của cửa hàng thôi nè. Bạn cần gì về khăn quàng cứ hỏi mình nhé!";

/** Chatbot tư vấn: kiểm tra nguồn gọi → kích thước → dữ liệu → tần suất theo IP → gọi Gemini (server). */
export async function POST(request: Request) {
  // Chỉ nhận yêu cầu từ chính website (giảm việc trang khác dùng chùa quota).
  const origin = request.headers.get("origin");
  const allowed = new Set([new URL(request.url).origin, new URL(siteUrl()).origin]);
  if (!origin || !allowed.has(origin)) return fail(403, "FORBIDDEN", "Yêu cầu không hợp lệ.");

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > CHAT_BODY_MAX_BYTES) return fail(413, "TOO_LARGE", "Tin nhắn quá dài.");
  const raw = await request.text();
  if (raw.length > CHAT_BODY_MAX_BYTES) return fail(413, "TOO_LARGE", "Tin nhắn quá dài.");

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail(400, "VALIDATION", "Dữ liệu gửi lên không hợp lệ.");
  }
  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "VALIDATION", parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }

  const config = geminiConfigFromEnv();
  if (!config) {
    return fail(
      503,
      "NOT_CONFIGURED",
      "Trợ lý Tu Tu đang nghỉ giải lao. Bạn bấm “Chat với nhân viên” để được hỗ trợ nhé!",
    );
  }

  try {
    const rate = await hitChatRate(hashIp(clientIp(request.headers)));
    if (!rate.allowed) {
      return fail(
        429,
        "RATE_LIMITED",
        "Bạn hỏi nhanh quá, Tu Tu chưa kịp thở! Thử lại sau ít phút hoặc chat với nhân viên nhé.",
        { "Retry-After": String(rate.retryAfter) },
      );
    }
  } catch (error) {
    console.error("[chat] Không kiểm tra được giới hạn tần suất:", error);
    return fail(503, "UNAVAILABLE", "Trợ lý đang bận, bạn thử lại sau chút nhé.");
  }

  let system: string;
  try {
    system = buildSystemPrompt({
      products: await getVisibleProducts(),
      channels: liveChannels(),
    });
  } catch (error) {
    console.error("[chat] Không tải được dữ liệu cửa hàng:", error);
    return fail(503, "UNAVAILABLE", "Trợ lý đang bận, bạn thử lại sau chút nhé.");
  }

  const result = await generateReply({
    config,
    system,
    messages: trimHistory(parsed.data.messages),
  });

  if (result.ok) {
    return NextResponse.json({ reply: result.text }, { headers: { "Cache-Control": "no-store" } });
  }
  if (result.reason === "blocked") {
    return NextResponse.json(
      { reply: BLOCKED_REPLY },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  if (result.reason === "timeout") {
    return fail(504, "TIMEOUT", "Tu Tu nghĩ hơi lâu… bạn gửi lại câu hỏi giúp mình nhé.");
  }
  return fail(
    502,
    "UNAVAILABLE",
    "Trợ lý đang bận, bạn thử lại sau chút hoặc chat với nhân viên nhé.",
  );
}
