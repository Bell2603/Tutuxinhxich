import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ADMIN, createCustomer, dbProduct, login, trackErrors } from "./support";

const PAGES = ["/", "/bo-suu-tap", "/san-pham/may-hong-keo-bong", "/dang-nhap", "/chinh-sach"];

test.describe("Chất lượng", () => {
  for (const path of PAGES) {
    test(`không có lỗi a11y nghiêm trọng: ${path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(
        serious.map(
          (v) =>
            `${v.id}: ${v.nodes
              .map((n) => n.target.join(" "))
              .slice(0, 3)
              .join(" | ")}`,
        ),
      ).toEqual([]);
    });
  }

  test("không tràn ngang trên màn hình 375px @mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    for (const path of [...PAGES, "/dang-ky"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const scrollX = await page.evaluate(() => {
        window.scrollTo(400, window.scrollY);
        return window.scrollX;
      });
      expect(scrollX, path).toBe(0);
    }
  });

  test("trang cần đăng nhập (tài khoản, thanh toán, admin) không tràn ngang ở 375px @mobile", async ({
    page,
    browser,
  }) => {
    const noScrollX = async (p: typeof page, path: string) => {
      await p.goto(path);
      await p.waitForLoadState("networkidle");
      const overflow = await p.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        window.scrollTo(400, window.scrollY);
        const main = document.querySelector("main");
        return {
          scrollX: window.scrollX,
          mainRight: main ? main.getBoundingClientRect().right : 0,
          vw,
        };
      });
      expect(overflow.scrollX, path).toBe(0);
      expect(overflow.mainRight, path).toBeLessThanOrEqual(overflow.vw + 1);
    };
    await page.setViewportSize({ width: 375, height: 800 });
    const customer = await createCustomer();
    await login(page, customer.email, customer.password);
    for (const path of ["/tai-khoan", "/thanh-toan"]) await noScrollX(page, path);

    const adminContext = await browser.newContext({ viewport: { width: 375, height: 800 } });
    const admin = await adminContext.newPage();
    await login(admin, ADMIN.email, ADMIN.password, "/admin");
    const product = await dbProduct("TTXX-001");
    for (const path of [
      "/admin",
      "/admin/san-pham",
      `/admin/san-pham/${product.id}`,
      "/admin/don-hang",
    ])
      await noScrollX(admin, path);
    await adminContext.close();
  });

  test("bật giảm chuyển động vẫn hiển thị đầy đủ, không lỗi JS", async ({ page }) => {
    const errors = trackErrors(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.mouse.wheel(0, 4000);
    await expect(page.locator('#bo-suu-tap [data-testid="product-card"]').first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("duyệt nhanh các trang không phát sinh lỗi JavaScript @mobile", async ({ page }) => {
    const errors = trackErrors(page);
    for (const path of [
      ...PAGES,
      "/dang-ky",
      "/san-pham/ngan-ha-lap-lanh",
      "/bo-suu-tap?mau=hong",
    ]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
    }
    expect(errors).toEqual([]);
  });

  test("header bảo mật, robots, sitemap", async ({ request }) => {
    const home = await request.get("/");
    expect(home.headers()["x-frame-options"]).toBe("DENY");
    expect(home.headers()["x-content-type-options"]).toBe("nosniff");
    expect(home.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(home.headers()["x-powered-by"]).toBeUndefined();
    expect(home.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");

    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /admin");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/san-pham/may-hong-keo-bong");
    expect(sitemap.match(/\/san-pham\//g)).toHaveLength(6);
  });

  test("API danh mục chỉ trả về sản phẩm công khai", async ({ request }) => {
    const res = await request.get("/api/catalog");
    expect(res.status()).toBe(200);
    const json = (await res.json()) as { products: { sku: string }[] };
    expect(json.products).toHaveLength(6);
  });
});
