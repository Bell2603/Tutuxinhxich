import { expect, test } from "@playwright/test";
import { trackErrors, visible } from "./support";

test.describe("Lightbox ảnh sản phẩm", () => {
  test("mở toàn màn hình, chuyển ảnh bằng phím, đóng bằng Esc và giữ ảnh đang xem", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop");
    const errors = trackErrors(page);
    await page.goto("/san-pham/ngan-ha-lap-lanh");
    await visible(page.getByTestId("gallery-main")).click();
    const lightbox = page.getByTestId("lightbox");
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByText("1 / 4 · Ngân Hà Lấp Lánh")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(lightbox.getByText("2 / 4 · Ngân Hà Lấp Lánh")).toBeVisible();
    await lightbox.getByTestId("lightbox-next").click();
    await expect(lightbox.getByText("3 / 4 · Ngân Hà Lấp Lánh")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(lightbox).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Xem ảnh 3", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(errors).toEqual([]);
  });

  test("chạm ảnh trên điện thoại để xem toàn màn hình @mobile", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile");
    await page.goto("/san-pham/may-hong-keo-bong");
    await visible(page.getByRole("button", { name: "Xem ảnh 1 toàn màn hình" })).click();
    const lightbox = page.getByTestId("lightbox");
    await expect(lightbox).toBeVisible();
    await lightbox.getByTestId("lightbox-close").click();
    await expect(lightbox).toHaveCount(0);
  });
});

test.describe("Danh sách yêu thích", () => {
  test("thả tim, đếm trên header, giữ sau khi tải lại, trang /yeu-thich, bỏ tim @mobile", async ({
    page,
  }) => {
    await page.goto("/bo-suu-tap");
    const card = visible(page.locator('[data-testid="product-card"][data-sku="TTXX-005"]'));
    const heart = card.getByTestId("wishlist-button");
    await expect(heart).toHaveAttribute("aria-pressed", "false");
    await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "true");
    await expect(visible(page.getByTestId("wishlist-count"))).toHaveText("1");

    await page.reload();
    await expect(visible(page.getByTestId("wishlist-count"))).toHaveText("1");

    await visible(page.getByTestId("wishlist-link")).click();
    await expect(page).toHaveURL(/\/yeu-thich$/);
    const grid = visible(page.getByTestId("wishlist-grid"));
    await expect(grid.getByTestId("product-card")).toHaveCount(1);
    await expect(grid.getByTestId("product-card")).toHaveAttribute("data-sku", "TTXX-005");

    await page.getByRole("button", { name: "Thêm tất cả vào giỏ" }).click();
    await expect(visible(page.getByTestId("cart-count"))).toHaveText("1");
    await page.keyboard.press("Escape");

    await grid.getByTestId("wishlist-button").click();
    await expect(visible(page.getByTestId("wishlist-empty"))).toBeVisible();
    await expect(visible(page.getByTestId("wishlist-count"))).toHaveCount(0);
  });

  test("thả tim ngay trên trang sản phẩm", async ({ page }) => {
    await page.goto("/san-pham/caro-dau-tay");
    const heart = visible(
      page
        .locator("main")
        .getByRole("button", { name: "Thêm “Caro Dâu Tây” vào danh sách yêu thích" }),
    );
    await heart.click();
    await expect(
      visible(
        page
          .locator("main")
          .getByRole("button", { name: "Bỏ “Caro Dâu Tây” khỏi danh sách yêu thích" }),
      ),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("Chuyển trang & gợi ý cách quàng", () => {
  test("điều hướng có hiệu ứng chuyển trang theo hướng, không lỗi JS", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/bo-suu-tap");
    await page.evaluate(() => {
      const w = window as unknown as { __vt: string[][] };
      w.__vt = [];
      const start = document.startViewTransition?.bind(document);
      if (!start) return;
      document.startViewTransition = ((
        arg: StartViewTransitionOptions | ViewTransitionUpdateCallback,
      ) => {
        w.__vt.push(typeof arg === "object" && arg?.types ? [...arg.types] : []);
        return start(arg as StartViewTransitionOptions);
      }) as typeof document.startViewTransition;
    });
    await visible(page.locator('[data-sku="TTXX-003"] h3 a')).click();
    await expect(page).toHaveURL(/\/san-pham\/hoa-cuc-san-ga$/);
    await expect(page.getByTestId("product-name")).toHaveText("Hoa Cúc Sân Ga");
    await visible(
      page.locator('nav[aria-label="Breadcrumb"]').getByRole("link", { name: "Bộ sưu tập" }),
    ).click();
    await expect(page).toHaveURL(/\/bo-suu-tap$/);
    const types = await page.evaluate(() =>
      (window as unknown as { __vt: string[][] }).__vt.flat(),
    );
    expect(types).toEqual(expect.arrayContaining(["nav-forward", "nav-back"]));
    expect(errors).toEqual([]);
  });

  test("gợi ý cách quàng theo dáng khăn", async ({ page }) => {
    await page.goto("/san-pham/may-hong-keo-bong");
    const tips = page.locator('section[aria-labelledby="styling-tips-title"]');
    await expect(tips.getByRole("heading", { name: "Nơ cổ áo" })).toBeVisible();
    await expect(tips.getByRole("heading", { name: "Thắt kiểu Paris" })).toHaveCount(0);
    await page.goto("/san-pham/soc-keo-cau-vong");
    const longTips = page.locator('section[aria-labelledby="styling-tips-title"]');
    await expect(longTips.getByRole("heading", { name: "Thắt kiểu Paris" })).toBeVisible();
    await expect(longTips.getByRole("heading", { name: "Nơ cổ áo" })).toHaveCount(0);
  });
});
