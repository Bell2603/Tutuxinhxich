import { createHash, randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { CHAT_RATE_PER_DAY, CHAT_RATE_PER_MINUTE } from "@/features/chatbot/domain";
import { anon, service } from "./helpers";

const hashes: string[] = [];
function newHash() {
  const hash = createHash("sha256").update(randomUUID()).digest("hex");
  hashes.push(hash);
  return hash;
}

async function hit(hash: string, perMinute = CHAT_RATE_PER_MINUTE, perDay = CHAT_RATE_PER_DAY) {
  const { data, error } = await anon().rpc("chat_rate_hit", {
    p_ip_hash: hash,
    p_per_minute: perMinute,
    p_per_day: perDay,
  });
  if (error) throw error;
  return data[0]!;
}

afterAll(async () => {
  await service.from("chat_rate_limits").delete().in("ip_hash", hashes);
});

describe("chat_rate_hit — giới hạn tần suất chatbot theo IP", () => {
  it(`cho phép ${CHAT_RATE_PER_MINUTE} lượt/phút, lượt kế tiếp bị chặn kèm thời gian chờ ≤ 60s`, async () => {
    const hash = newHash();
    for (let i = 0; i < CHAT_RATE_PER_MINUTE; i++) {
      expect(await hit(hash)).toEqual({ allowed: true, retry_after_seconds: 0 });
    }
    const blocked = await hit(hash);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retry_after_seconds).toBeGreaterThan(0);
    expect(blocked.retry_after_seconds).toBeLessThanOrEqual(60);
  });

  it("giới hạn theo ngày: chờ tới đầu ngày hôm sau (giờ Việt Nam)", async () => {
    const hash = newHash();
    await hit(hash, 60, 2);
    await hit(hash, 60, 2);
    const blocked = await hit(hash, 60, 2);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retry_after_seconds).toBeGreaterThan(0);
    expect(blocked.retry_after_seconds).toBeLessThanOrEqual(24 * 3600);
  });

  it("mỗi IP đếm riêng", async () => {
    const a = newHash();
    const b = newHash();
    await hit(a, 1, 10);
    expect((await hit(a, 1, 10)).allowed).toBe(false);
    expect((await hit(b, 1, 10)).allowed).toBe(true);
  });

  it("từ chối IP chưa băm và giới hạn bất thường", async () => {
    for (const [hash, perMinute, perDay] of [
      ["127.0.0.1", 10, 60],
      [newHash(), 0, 60],
      [newHash(), 10, 100000],
    ] as const) {
      const { error } = await anon().rpc("chat_rate_hit", {
        p_ip_hash: hash,
        p_per_minute: perMinute,
        p_per_day: perDay,
      });
      expect(error?.message).toContain("INVALID_INPUT");
    }
  });

  it("khách không đọc/ghi trực tiếp được bảng đếm", async () => {
    const client = anon();
    const read = await client.from("chat_rate_limits").select("*");
    expect(read.error).not.toBeNull();
    const write = await client
      .from("chat_rate_limits")
      .insert({ ip_hash: newHash(), bucket: "minute", window_start: new Date().toISOString() });
    expect(write.error).not.toBeNull();
  });
});
