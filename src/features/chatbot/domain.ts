/**
 * Chatbot — hằng số & logic thuần dùng chung client/server (không gọi mạng).
 */
import { site } from "@/config/site";

/** Độ dài tối đa một tin nhắn của khách. */
export const CHAT_MESSAGE_MAX = 500;
/** Độ dài tối đa một câu trả lời của bot được gửi lại làm lịch sử. */
export const CHAT_REPLY_MAX = 2000;
/** Số lượt (khách + bot) tối đa gửi lên server mỗi lần. */
export const CHAT_HISTORY_MAX = 10;
/** Kích thước body tối đa của POST /api/chat (byte). */
export const CHAT_BODY_MAX_BYTES = 16_000;
/** Giới hạn tần suất theo IP — RPC chat_rate_hit nhận 2 giá trị này. */
export const CHAT_RATE_PER_MINUTE = 10;
export const CHAT_RATE_PER_DAY = 60;

export type ChatRole = "user" | "model";
export type ChatMessage = { role: ChatRole; text: string };

/** Giữ CHAT_HISTORY_MAX lượt gần nhất và bắt đầu bằng tin của khách (Gemini yêu cầu lượt đầu là "user"). */
export function trimHistory(messages: readonly ChatMessage[]): ChatMessage[] {
  const recent = messages.slice(-CHAT_HISTORY_MAX);
  const firstUser = recent.findIndex((m) => m.role === "user");
  return firstUser === -1 ? [] : recent.slice(firstUser);
}

// ——— Hiển thị câu trả lời: chỉ biến đường dẫn NỘI BỘ thành link (không render HTML/markdown từ AI) ———

export type ReplySegment = { type: "text"; value: string } | { type: "link"; href: string };

const INTERNAL_LINK =
  /(?<![\w/.:-])(\/(?:san-pham\/[a-z0-9-]{1,80}|bo-suu-tap|chinh-sach|hoi-dap|phoi-khan|ve-chung-toi)(?:#[a-z0-9-]{1,40})?)(?![\w/-])/g;

export function splitReply(text: string): ReplySegment[] {
  const segments: ReplySegment[] = [];
  let last = 0;
  for (const match of text.matchAll(INTERNAL_LINK)) {
    const start = match.index;
    if (start > last) segments.push({ type: "text", value: text.slice(last, start) });
    segments.push({ type: "link", href: match[1]! });
    last = start + match[0].length;
  }
  if (last < text.length) segments.push({ type: "text", value: text.slice(last) });
  return segments;
}

// ——— Live chat: nút "Chat với nhân viên" mở Zalo / Messenger ———

export type LiveChannel = { key: "zalo" | "messenger"; label: string; href: string };

const ZALO_LINK = /^https:\/\/zalo\.me\/[A-Za-z0-9._-]+$/;
const MESSENGER_LINK = /^https:\/\/m\.me\/[A-Za-z0-9._-]+$/;

/** Kênh live chat hợp lệ (link mẫu/chưa điền → bỏ qua, không hiện nút hỏng). */
export function liveChannels(
  social: { zalo?: string; messenger?: string } = site.social,
): LiveChannel[] {
  const channels: LiveChannel[] = [];
  if (social.zalo && ZALO_LINK.test(social.zalo))
    channels.push({ key: "zalo", label: "Nhắn Zalo", href: social.zalo });
  if (social.messenger && MESSENGER_LINK.test(social.messenger))
    channels.push({ key: "messenger", label: "Nhắn Messenger", href: social.messenger });
  return channels;
}
