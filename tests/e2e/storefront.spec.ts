import { expect, test } from "@playwright/test";
import { dbProducts, formatVND, trackErrors, updateProduct, visible } from "./support";

test.describe("Trang chủ", () => {
  test("hiển thị thương hiệu và đúng 6 SKU với giá chính xác @mobile", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Xinh từng nút thắt");
    await expect(
      page.getByRole("link", { name: /Tu Tu Xình Xịch — Trang chủ/ }).first(),
    ).toBeVisible();

    const cards = page.locator('#bo-suu-tap [data-testid="product-card"]');
    await expect(cards).toHaveCount(6);
    expect(await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-sku")))).toEqual([
      "TTXX-001",
      "TTXX-002",
      "TTXX-003",
      "TTXX-004",
      "TTXX-005",
      "TTXX-006",
    ]);
    for (const product of await dbProducts()) {
      const card = page.locator(`#bo-suu-tap [data-sku="${product.sku}"]`);
      await expect(card.getByTestId("price")).toHaveText(formatVND(product.price));
      if (product.compare_at_price)
        await expect(card.getByTestId("compare-at-price")).toHaveText(
          formatVND(product.compare_at_price),
        );
    }
    await expect(page.getByTestId("reviews-demo-label")).toBeVisible();
    await expect(page.getByTestId("demo-notice")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("các section chính có mặt", async ({ page }) => {
    await page.goto("/");
    for (const id of ["#bo-suu-tap", "#lookbook", "#cau-chuyen", "#phoi-do"]) {
      await expect(page.locator(id)).toHaveCount(1);
    }
    await expect(page.getByRole("heading", { name: "Ngân Hà Lấp Lánh", level: 2 })).toBeVisible();
    const tabs = page.getByRole("tablist", { name: "Cách quàng khăn" });
    await tabs.getByRole("tab", { name: "Băng đô tóc" }).click();
    await expect(page.getByRole("heading", { name: "Băng đô tóc", level: 3 })).toBeVisible();
  });

  test("menu di động mở được và điều hướng tới bộ sưu tập @mobile", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Chỉ chạy trên mobile");
    await page.goto("/");
    await page.getByRole("button", { name: "Mở menu" }).click();
    const menu = page.getByTestId("mobile-menu");
    await expect(menu.getByRole("dialog")).toBeVisible();
    await menu.getByRole("link", { name: /Bộ sưu tập/ }).click();
    await expect(page).toHaveURL(/\/bo-suu-tap$/);
    await expect(visible(page.getByTestId("product-card"))).toHaveCount(6);
  });

  test("ô tìm kiếm trên header tìm không dấu", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("search-button").click();
    const dialog = page.getByTestId("search-dialog");
    await dialog.getByLabel("Từ khóa tìm kiếm").fill("ngan ha");
    await expect(dialog.getByRole("link", { name: /Ngân Hà Lấp Lánh/ })).toBeVisible();
    await dialog.getByLabel("Từ khóa tìm kiếm").press("Enter");
    await expect(page).toHaveURL(/\/bo-suu-tap\?q=ngan(\+|%20)ha/);
    await expect(visible(page.getByTestId("product-card"))).toHaveCount(1);
  });
});

test.describe("Bộ sưu tập — lọc & tìm kiếm", () => {
  test("lọc theo màu, chất liệu, giá và cập nhật URL", async ({ page }) => {
    await page.goto("/bo-suu-tap");
    const cards = visible(page.getByTestId("product-card"));
    await expect(cards).toHaveCount(6);

    await page.getByTestId("filter-color-do").click();
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toHaveAttribute("data-sku", "TTXX-004");
    await expect(page).toHaveURL(/mau=do/);
    await expect(page.getByTestId("result-count")).toHaveText("Hiển thị 1/6 mẫu khăn");

    await page.getByTestId("filter-color-do").click();
    await page.getByTestId("filter-price-tren-400k").click();
    await expect(cards).toHaveCount(2);

    await page.getByTestId("filter-price-tren-400k").click();
    await page.getByTestId("filter-fabric-satin").click();
    await expect(cards).toHaveCount(2);
    expect(
      await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-sku")).sort()),
    ).toEqual(["TTXX-001", "TTXX-005"]);
  });

  test("tìm kiếm không dấu, sắp xếp giá, trạng thái rỗng", async ({ page }) => {
    await page.goto("/bo-suu-tap");
    const cards = visible(page.getByTestId("product-card"));
    await page.getByTestId("collection-search").fill("hoa cuc");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toHaveAttribute("data-sku", "TTXX-003");

    await page.getByTestId("collection-search").fill("");
    await page.getByTestId("collection-sort").selectOption("gia-tang");
    await expect(cards).toHaveCount(6);
    await expect(cards.first()).toHaveAttribute("data-sku", "TTXX-003");

    await page.getByTestId("filter-color-tim").click();
    await page.getByTestId("filter-price-duoi-250k").click();
    await expect(page.getByTestId("empty-results")).toBeVisible();
    await page.getByRole("button", { name: "Xem tất cả 6 mẫu" }).click();
    await expect(cards).toHaveCount(6);
  });

  test("mở link có bộ lọc sẵn", async ({ page }) => {
    await page.goto("/bo-suu-tap?mau=xanh&chat-lieu=cotton");
    const cards = visible(page.getByTestId("product-card"));
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toHaveAttribute("data-sku", "TTXX-006");
  });

  test("bộ lọc trên mobile nằm trong ngăn kéo @mobile", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Chỉ chạy trên mobile");
    await page.goto("/bo-suu-tap");
    await page.getByTestId("open-filters").click();
    const sheet = page.getByTestId("filter-sheet");
    await sheet.getByTestId("filter-fabric-len").click();
    await sheet.getByRole("button", { name: /Xem 2 mẫu/ }).click();
    await expect(visible(page.getByTestId("product-card"))).toHaveCount(2);
  });
});

test.describe("Trang chi tiết sản phẩm", () => {
  test("hiển thị đủ thông tin, giá đúng, dữ liệu có cấu trúc @mobile", async ({ page }) => {
    const errors = trackErrors(page);
    const product = (await dbProducts()).find((p) => p.sku === "TTXX-004")!;
    await page.goto(`/san-pham/${product.slug}`);
    await expect(page.getByTestId("product-name")).toHaveText(product.name);
    const main = page.locator("main");
    await expect(visible(main.getByTestId("price")).first()).toHaveText(formatVND(product.price));
    await expect(visible(main.getByTestId("compare-at-price")).first()).toHaveText(
      formatVND(product.compare_at_price!),
    );
    await expect(main.getByText(`SKU: ${product.sku}`)).toBeVisible();
    await expect(page.getByTestId("stock-status")).toHaveText("Còn hàng");
    await expect(main.getByText(product.material).first()).toBeAttached();
    const jsonLd = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}",
    );
    expect(jsonLd).toMatchObject({
      "@type": "Product",
      sku: product.sku,
      offers: { price: product.price, priceCurrency: "VND" },
    });
    expect(errors).toEqual([]);
  });

  test("sản phẩm không tồn tại hoặc đang ẩn → 404", async ({ page }) => {
    // Trang được stream (Partial Prerender) nên mã HTTP giữ 200; Next.js gắn noindex cho trang 404.
    await page.goto("/san-pham/khong-ton-tai");
    await expect(page.getByText("Tàu đi lạc sân ga")).toBeVisible();
    expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(
      0,
    );

    await updateProduct("TTXX-006", { is_visible: false });
    try {
      await page.goto("/san-pham/bac-ha-suong-som");
      await expect(page.getByText("Tàu đi lạc sân ga")).toBeVisible();
      await page.goto("/");
      await expect(page.locator('#bo-suu-tap [data-testid="product-card"]')).toHaveCount(5);
    } finally {
      await updateProduct("TTXX-006", { is_visible: true });
    }
  });
});
