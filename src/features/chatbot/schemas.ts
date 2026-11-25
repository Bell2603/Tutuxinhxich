import { z } from "zod";
import { CHAT_HISTORY_MAX, CHAT_MESSAGE_MAX, CHAT_REPLY_MAX } from "./domain";

const userMessage = z.object({
  role: z.literal("user"),
  text: z
    .string()
    .trim()
    .min(1, "Bạn chưa nhập câu hỏi")
    .max(CHAT_MESSAGE_MAX, `Câu hỏi tối đa ${CHAT_MESSAGE_MAX} ký tự`),
});

const modelMessage = z.object({
  role: z.literal("model"),
  text: z.string().trim().min(1).max(CHAT_REPLY_MAX),
});

/** Body POST /api/chat: lịch sử ngắn, tin cuối là câu hỏi mới của khách. */
export const chatRequestSchema = z.object({
  messages: z
    .array(z.discriminatedUnion("role", [userMessage, modelMessage]))
    .min(1)
    .max(CHAT_HISTORY_MAX, `Tối đa ${CHAT_HISTORY_MAX} lượt hội thoại`)
    .refine((list) => list.at(-1)?.role === "user", "Tin nhắn cuối phải là câu hỏi của bạn"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
