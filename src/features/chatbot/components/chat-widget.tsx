"use client";

import { Headset, Loader2, MessageCircleHeart, RotateCcw, Send } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Sheet } from "@/components/ui/sheet";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  CHAT_HISTORY_MAX,
  CHAT_MESSAGE_MAX,
  CHAT_REPLY_MAX,
  liveChannels,
  splitReply,
  type ChatMessage,
} from "../domain";

const STORAGE_KEY = "ttxx-chat";
const SUGGESTIONS = [
  "Phí giao hàng bao nhiêu?",
  "Khăn nào hợp đi học?",
  "Đổi trả thế nào?",
  "Có những màu nào?",
];
const CHANNELS = liveChannels();

function loadHistory(): ChatMessage[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is ChatMessage =>
          typeof m === "object" &&
          m !== null &&
          (m.role === "user" || m.role === "model") &&
          typeof m.text === "string" &&
          m.text.length > 0,
      )
      .map((m) => ({ role: m.role, text: m.text.slice(0, CHAT_REPLY_MAX) }))
      .slice(-30);
  } catch {
    return [];
  }
}

function ReplyText({ text }: { text: string }) {
  return (
    <>
      {splitReply(text).map((segment, i) =>
        segment.type === "link" ? (
          <Link
            key={i}
            href={segment.href as Route}
            className="font-semibold text-berry underline underline-offset-2"
          >
            {segment.href}
          </Link>
        ) : (
          <span key={i}>{segment.value}</span>
        ),
      )}
    </>
  );
}

/** Nút chat nổi + khung chat với Trợ lý Tu Tu (Gemini qua /api/chat) và nút "Chat với nhân viên". */
export function ChatWidget() {
  const pathname = usePathname();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  // Lịch sử chỉ sống trong tab hiện tại (sessionStorage). Khung chat (Sheet) chỉ render sau khi mount
  // nên đọc storage ngay lúc khởi tạo không gây lệch hydrate.
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    typeof window === "undefined" ? [] : loadHistory(),
  );
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffOpen, setStaffOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Trình duyệt chặn storage → vẫn chat được trong phiên.
    }
  }, [messages]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, pending, error, open]);

  const close = useCallback(() => setOpen(false), []);

  async function send(text: string) {
    const question = text.trim();
    if (!question || pending) return;
    if (question.length > CHAT_MESSAGE_MAX) {
      setError(`Câu hỏi tối đa ${CHAT_MESSAGE_MAX} ký tự.`);
      return;
    }
    const next: ChatMessage[] = [...messages, { role: "user", text: question }];
    setMessages(next);
    setInput("");
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .slice(-CHAT_HISTORY_MAX)
            .map((m) => ({ role: m.role, text: m.text.slice(0, CHAT_REPLY_MAX) })),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (response.ok && data.reply) {
        setMessages((current) => [...current, { role: "model", text: data.reply! }]);
      } else {
        setError(data.error ?? "Trợ lý đang bận, bạn thử lại sau chút nhé.");
        // Trả câu hỏi về ô nhập để khách gửi lại, bỏ khỏi lịch sử (server chưa trả lời).
        setMessages((current) => current.slice(0, -1));
        setInput(question);
      }
    } catch {
      setError("Mất kết nối mạng — bạn kiểm tra lại rồi gửi lại nhé.");
      setMessages((current) => current.slice(0, -1));
      setInput(question);
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  // Trang sản phẩm có thanh mua nhanh cố định ở đáy màn hình mobile → nâng nút chat lên.
  const aboveBuyBar = pathname.startsWith("/san-pham/");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở trợ lý chat Tu Tu"
        data-testid="chat-open"
        className={cn(
          "fixed right-4 z-40 flex items-center gap-2 rounded-full bg-ink py-3 pr-4 pl-3 font-bold text-cream shadow-pop focus-ring transition-transform hover:-translate-y-0.5 sm:right-6",
          aboveBuyBar
            ? "bottom-28 lg:bottom-6"
            : "bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6",
        )}
      >
        <MessageCircleHeart className="size-6 text-bubblegum" aria-hidden />
        <span className="hidden sm:inline">Hỏi Tu Tu</span>
      </button>

      <Sheet
        open={open}
        onClose={close}
        title="Trợ lý Tu Tu"
        testId="chat-panel"
        initialFocusRef={inputRef}
      >
        <div
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto px-5 pb-4 sm:px-6"
          aria-live="polite"
          data-testid="chat-messages"
        >
          <p className="max-w-[85%] rounded-3xl rounded-tl-md bg-white px-4 py-3 text-sm shadow-card ring-1 ring-line">
            Tu tu! Mình là trợ lý ảo của Tu Tu Xình Xịch. Bạn cần tư vấn chọn khăn, phí ship hay đổi
            trả cứ hỏi mình nhé.
          </p>
          {messages.length === 0 ? (
            <div className="flex flex-wrap gap-2" aria-label="Gợi ý câu hỏi">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-semibold text-berry ring-1 ring-pink-100 focus-ring hover:bg-pink-100"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
          {messages.map((m, i) => (
            <p
              key={i}
              data-testid={m.role === "user" ? "chat-user" : "chat-bot"}
              className={cn(
                "max-w-[85%] rounded-3xl px-4 py-3 text-sm break-words whitespace-pre-line",
                m.role === "user"
                  ? "ml-auto rounded-tr-md bg-ink text-cream"
                  : "rounded-tl-md bg-white shadow-card ring-1 ring-line",
              )}
            >
              {m.role === "model" ? <ReplyText text={m.text} /> : m.text}
            </p>
          ))}
          {pending ? (
            <p className="inline-flex items-center gap-2 rounded-3xl bg-white px-4 py-3 text-sm text-ink-soft shadow-card ring-1 ring-line">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Tu Tu đang soạn câu trả lời…
            </p>
          ) : null}
          {error ? (
            <p
              role="alert"
              data-testid="chat-error"
              className="rounded-2xl bg-sun-100 px-4 py-3 text-sm font-semibold text-warning"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="border-t border-line bg-white/70 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStaffOpen((v) => !v)}
              aria-expanded={staffOpen}
              data-testid="chat-staff"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink ring-1 ring-line focus-ring hover:bg-pink-50"
            >
              <Headset className="size-4" aria-hidden /> Chat với nhân viên
            </button>
            {messages.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setError(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft focus-ring hover:text-ink"
              >
                <RotateCcw className="size-3.5" aria-hidden /> Cuộc trò chuyện mới
              </button>
            ) : null}
          </div>
          {staffOpen ? (
            <div className="mb-3 flex flex-wrap gap-2" data-testid="chat-staff-links">
              {CHANNELS.map((c) => (
                <a
                  key={c.key}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold text-ink focus-ring hover:bg-sky/40"
                >
                  {c.label}
                </a>
              ))}
              <a
                href={`tel:${site.contact.phone}`}
                className="rounded-full bg-mint/30 px-3 py-1.5 text-xs font-bold text-ink focus-ring hover:bg-mint/50"
              >
                Gọi {site.contact.phone}
              </a>
            </div>
          ) : null}
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <label htmlFor={inputId} className="sr-only">
              Câu hỏi cho trợ lý
            </label>
            <textarea
              ref={inputRef}
              id={inputId}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              maxLength={CHAT_MESSAGE_MAX}
              rows={2}
              placeholder="Nhập câu hỏi về khăn, đơn hàng…"
              data-testid="chat-input"
              className="min-h-12 flex-1 resize-none rounded-2xl bg-white px-4 py-2.5 text-sm ring-1 ring-line focus:ring-2 focus:ring-lilac focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending || input.trim().length === 0}
              aria-label="Gửi câu hỏi"
              data-testid="chat-send"
              className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-cream focus-ring transition-opacity disabled:opacity-40"
            >
              {pending ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : (
                <Send className="size-5" aria-hidden />
              )}
            </button>
          </form>
          <p className="mt-2 flex justify-between gap-2 text-xs text-ink-soft">
            <span>Trợ lý AI có thể nhầm — thông tin chính thức ở trang Chính sách.</span>
            <span data-testid="chat-count">
              {input.length}/{CHAT_MESSAGE_MAX}
            </span>
          </p>
        </div>
      </Sheet>
    </>
  );
}
