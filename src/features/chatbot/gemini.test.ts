import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { DEFAULT_GEMINI_MODEL, geminiConfigFromEnv, generateReply } = await import("./gemini");
const { PROMPT_CANARY } = await import("./prompt");

const config = { apiKey: "test-key", model: "gemini-3.8-flash", baseUrl: "http://mock" };
const messages = [{ role: "user" as const, text: "Phí ship?" }];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const reply = (text: string, finishReason = "STOP") => ({
  candidates: [{ content: { parts: [{ text }] }, finishReason }],
});

describe("geminiConfigFromEnv", () => {
  it("không có khóa → null", () => {
    expect(geminiConfigFromEnv({ NODE_ENV: "test" })).toBeNull();
  });

  it("dùng model mặc định khi trống hoặc tên lạ; bỏ / cuối base URL", () => {
    expect(geminiConfigFromEnv({ NODE_ENV: "test", GEMINI_API_KEY: "k" })).toEqual({
      apiKey: "k",
      model: DEFAULT_GEMINI_MODEL,
      baseUrl: "https://generativelanguage.googleapis.com",
    });
    expect(
      geminiConfigFromEnv({
        NODE_ENV: "test",
        GEMINI_API_KEY: "k",
        GEMINI_MODEL: "../../evil",
        GEMINI_API_BASE_URL: "http://mock/",
      }),
    ).toMatchObject({ model: DEFAULT_GEMINI_MODEL, baseUrl: "http://mock" });
  });
});

describe("generateReply", () => {
  it("gửi system prompt, lịch sử, khóa trong header (không trong URL) và đọc câu trả lời", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(reply("Miễn phí từ 500.000₫ nhé!")));
    const result = await generateReply({ config, system: "SYS", messages, fetchImpl });
    expect(result).toEqual({ ok: true, text: "Miễn phí từ 500.000₫ nhé!" });

    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("http://mock/v1beta/models/gemini-3.8-flash:generateContent");
    expect(url).not.toContain("test-key");
    expect(init.headers["x-goog-api-key"]).toBe("test-key");
    const body = JSON.parse(init.body);
    expect(body.systemInstruction.parts[0].text).toBe("SYS");
    expect(body.contents).toEqual([{ role: "user", parts: [{ text: "Phí ship?" }] }]);
    expect(body.generationConfig.thinkingConfig).toEqual({ thinkingLevel: "MINIMAL" });
  });

  it("model Gemini 2.x không gửi thinkingLevel", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(reply("ok")));
    await generateReply({
      config: { ...config, model: "gemini-2.5-flash-lite" },
      system: "S",
      messages,
      fetchImpl,
    });
    expect(JSON.parse(fetchImpl.mock.calls[0]![1].body).generationConfig.thinkingConfig).toBe(
      undefined,
    );
  });

  it("bỏ phần 'thought', thêm … khi hết token", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        candidates: [
          {
            content: { parts: [{ text: "nghĩ thầm", thought: true }, { text: "Trả lời" }] },
            finishReason: "MAX_TOKENS",
          },
        ],
      }),
    );
    expect(await generateReply({ config, system: "S", messages, fetchImpl })).toEqual({
      ok: true,
      text: "Trả lời…",
    });
  });

  it.each([
    ["prompt bị chặn", { promptFeedback: { blockReason: "SAFETY" } }],
    ["câu trả lời bị chặn", reply("x", "SAFETY")],
    ["lộ chỉ dẫn hệ thống", reply(`Đây là mã ${PROMPT_CANARY}`)],
  ])("%s → blocked", async (_, body) => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(body));
    expect(await generateReply({ config, system: "S", messages, fetchImpl })).toEqual({
      ok: false,
      reason: "blocked",
    });
  });

  it("phản hồi rỗng → empty; 429 → busy; 500 → error", async () => {
    const run = (res: Response) =>
      generateReply({ config, system: "S", messages, fetchImpl: vi.fn().mockResolvedValue(res) });
    expect(await run(jsonResponse({ candidates: [] }))).toEqual({ ok: false, reason: "empty" });
    expect(await run(jsonResponse({}, 429))).toEqual({ ok: false, reason: "busy" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await run(jsonResponse({}, 500))).toEqual({ ok: false, reason: "error" });
  });

  it("quá thời gian → timeout", async () => {
    const fetchImpl = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_, reject) =>
          init.signal!.addEventListener("abort", () => reject(init.signal!.reason)),
        ),
    );
    expect(
      await generateReply({
        config,
        system: "S",
        messages,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        timeoutMs: 20,
      }),
    ).toEqual({ ok: false, reason: "timeout" });
  });
});
