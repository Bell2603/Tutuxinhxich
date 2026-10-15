import { expect, type Locator, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import type { Database } from "../../src/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const options = { auth: { persistSession: false, autoRefreshToken: false } } as const;

/** Client service role — CHỈ dùng trong test để chuẩn bị/kiểm tra dữ liệu (giả lập thao tác ngoài giao diện). */
export const service = createClient<Database>(url, process.env.SUPABASE_SECRET_KEY!, options);

export const ADMIN = {
  email: process.env.SEED_ADMIN_EMAIL!,
  password: process.env.SEED_ADMIN_PASSWORD!,
};
export const CUSTOMER = {
  email: process.env.SEED_CUSTOMER_EMAIL!,
  password: process.env.SEED_CUSTOMER_PASSWORD!,
};

const vnd = new Intl.NumberFormat("vi-VN");
export const formatVND = (n: number) => `${vnd.format(n)}₫`;

export async function dbProduct(sku: string) {
  const { data, error } = await service.from("products").select("*").eq("sku", sku).single();
  if (error) throw error;
  return data;
}

export async function dbProducts() {
  const { data, error } = await service.from("products").select("*").order("sort_order");
  if (error) throw error;
  return data;
}

export async function updateProduct(
  sku: string,
  patch: Database["public"]["Tables"]["products"]["Update"],
) {
  const { error } = await service.from("products").update(patch).eq("sku", sku);
  if (error) throw error;
}

/** Tạo khách hàng mới (đã xác nhận email) để test không phụ thuộc nhau. */
export async function createCustomer(fullName = "Khách E2E") {
  const email = `e2e-${randomUUID().slice(0, 8)}@tutuxinhxich.test`;
  const password = `Xinh-${randomUUID().slice(0, 8)}9`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;
  return { id: data.user.id, email, password, fullName };
}

/** Client đăng nhập như một khách hàng (gọi RPC giống trình duyệt). */
export async function signedInClient(email: string, password: string) {
  const client = createClient<Database>(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    options,
  );
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

/** Next.js (Cache Components) giữ trang cũ ẩn trong DOM → chỉ thao tác với phần tử đang hiển thị. */
export function visible(locator: Locator): Locator {
  return locator.filter({ visible: true });
}

export async function login(page: Page, email: string, password: string, next?: string) {
  await page.goto(next ? `/dang-nhap?next=${encodeURIComponent(next)}` : "/dang-nhap");
  const form = visible(page.getByTestId("signin-form"));
  await form.getByLabel("Email").fill(email);
  await form.getByLabel(/^Mật khẩu/).fill(password);
  await form.getByTestId("signin-submit").click();
  await expect(page).not.toHaveURL(/\/dang-nhap/);
}

/** Ghi lại lỗi JavaScript/console để khẳng định trang không có lỗi nghiêm trọng. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    // Trình duyệt tự log khi trang 404 cố ý — không phải lỗi JavaScript.
    if (text.includes("status of 404")) return;
    errors.push(`console: ${text}`);
  });
  return errors;
}

export async function cartCount(page: Page) {
  return visible(page.getByTestId("cart-count"));
}

/** Đợi các animation có hạn (fade/trượt) chạy xong; bỏ qua animation lặp vô hạn (marquee) và gắn với cuộn trang. */
export async function settleAnimations(page: Page) {
  await page.waitForFunction(
    () =>
      document.getAnimations().every(
        (a) =>
          a.playState !== "running" ||
          a.effect?.getTiming().iterations === Infinity ||
          // Animation gắn với thanh cuộn (parallax) luôn ở trạng thái "running".
          a.timeline !== document.timeline,
      ),
    undefined,
    { timeout: 5_000 },
  );
  await page.waitForTimeout(150);
}

const MAILPIT = process.env.MAILPIT_URL ?? "http://127.0.0.1:54424";

/** Đợi email gửi tới địa chỉ này trong Mailpit (hộp thư local của Supabase) và trả về link đầu tiên khớp mẫu. */
export async function waitForEmailLink(
  to: string,
  pattern: RegExp,
  timeoutMs = 15_000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const search = await fetch(
      `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`,
    );
    const { messages } = (await search.json()) as { messages: { ID: string }[] };
    if (messages.length > 0) {
      const message = (await (
        await fetch(`${MAILPIT}/api/v1/message/${messages[0]!.ID}`)
      ).json()) as { HTML: string; Text: string };
      const html = message.HTML.replace(/&amp;/g, "&");
      const link = html.match(pattern)?.[0];
      if (link) return link;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Không nhận được email cho ${to}`);
}
