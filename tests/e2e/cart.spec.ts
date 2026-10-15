import { expect, test } from "@playwright/test";
import { dbProduct, formatVND, updateProduct, visible } from "./support";

test.describe("Giỏ hàng", () => {
  test("thêm, đổi số lượng, tính tiền, xóa và giữ sau khi tải lại @mobile", async ({ page }) => {
    const hoaCuc = await dbProduct("TTXX-003");
    await page.goto(`/san-pham/${hoaCuc.slug}`);
    await visible(page.getByTestId("add-to-cart")).first().click();

    const drawer = page.getByTestId("cart-drawer");
    await expect(drawer.getByRole("dialog")).toBeVisible();
    const line = drawer.getByTestId("cart-line");
    await expect(line).toHaveCount(1);
    await expect(drawer.getByTestId("cart-subtotal")).toHaveText(formatVND(hoaCuc.price));
    await expect(drawer.getByTestId("cart-total")).toHaveText(formatVND(hoaCuc.price + 30_000));
    await expect(visible(page.getByTestId("cart-count"))).toHaveText("1");

    await line.getByRole("button", { name: "Tăng số lượng" }).click();
    await line.getByRole("button", { name: "Tăng số lượng" }).click();
    await expect(line.getByTestId("line-total")).toHaveText(formatVND(hoaCuc.price * 3));
    // 3 × 199.000 = 597.000 ≥ 500.000 → miễn phí giao hàng
    await expect(drawer.getByTestId("cart-total")).toHaveText(formatVND(hoaCuc.price * 3));
    await expect(drawer.getByText("Miễn phí", { exact: true })).toBeVisible();

    await page.keyboard.press("Escape");
    await page.reload();
    await expect(visible(page.getByTestId("cart-count"))).toHaveText("3");

    await visible(page.getByTestId("cart-button")).click();
    await drawer.getByRole("button", { name: `Xóa ${hoaCuc.name} khỏi giỏ` }).click();
    await expect(drawer.getByText("Toa hàng còn trống!")).toBeVisible();
    await expect(visible(page.getByTestId("cart-count"))).toHaveCount(0);
  });

  test("thêm nhanh từ thẻ sản phẩm có hiệu ứng và thông báo", async ({ page }) => {
    await page.goto("/bo-suu-tap");
    const card = visible(page.locator('[data-testid="product-card"][data-sku="TTXX-001"]'));
    await card.getByTestId("add-to-cart").click();
    await expect(page.getByText(/Đã thêm “Mây Hồng Kẹo Bông” vào giỏ/)).toBeVisible();
    await expect(visible(page.getByTestId("cart-count"))).toHaveText("1");
  });

  test("không thể mua vượt tồn kho", async ({ page }) => {
    const nganHa = await dbProduct("TTXX-005");
    expect(nganHa.stock).toBe(5);
    await page.goto(`/san-pham/${nganHa.slug}`);
    await expect(page.getByTestId("stock-status")).toHaveText("Chỉ còn 5 chiếc");

    const qty = visible(page.getByRole("textbox", { name: "Số lượng" })).first();
    await qty.fill("9");
    await qty.press("Enter");
    await expect(qty).toHaveValue("5");
    await visible(page.getByTestId("add-to-cart")).first().click();

    const drawer = page.getByTestId("cart-drawer");
    const line = drawer.getByTestId("cart-line");
    await expect(line.getByRole("textbox", { name: "Số lượng" })).toHaveValue("5");
    await expect(line.getByRole("button", { name: "Tăng số lượng" })).toBeDisabled();
    await expect(line.getByText("Đã đạt số lượng tối đa có thể mua.")).toBeVisible();
    await page.keyboard.press("Escape");

    await expect(
      visible(page.getByText("Bạn đã có 5 chiếc trong giỏ — đây là số lượng tối đa có thể mua.")),
    ).toBeVisible();
    // Đạt giới hạn → nút thêm bị khóa, số lượng giỏ không đổi.
    await expect(visible(page.getByTestId("add-to-cart")).first()).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(visible(page.getByTestId("cart-count"))).toHaveText("5");
  });

  test("sản phẩm hết hàng không thêm được vào giỏ", async ({ page }) => {
    await updateProduct("TTXX-002", { stock: 0 });
    try {
      await page.goto("/san-pham/soc-keo-cau-vong");
      await expect(page.getByTestId("stock-status")).toHaveText("Hết hàng");
      await expect(page.getByRole("button", { name: "Tạm hết hàng" })).toBeDisabled();
      await page.goto("/bo-suu-tap");
      const card = visible(page.locator('[data-testid="product-card"][data-sku="TTXX-002"]'));
      await expect(card.getByTestId("add-to-cart")).toBeDisabled();
    } finally {
      await updateProduct("TTXX-002", { stock: 18 });
    }
  });

  test("giỏ tự cập nhật khi tồn kho giảm sau khi đã thêm", async ({ page }) => {
    await page.goto("/san-pham/caro-dau-tay");
    const qty = visible(page.getByRole("textbox", { name: "Số lượng" })).first();
    await qty.fill("4");
    await qty.press("Enter");
    await visible(page.getByTestId("add-to-cart")).first().click();
    await page.keyboard.press("Escape");
    await updateProduct("TTXX-004", { stock: 2 });
    try {
      await page.reload();
      await visible(page.getByTestId("cart-button")).click();
      await expect(
        page.getByText("“Caro Dâu Tây” chỉ còn 2 chiếc — đã cập nhật số lượng trong giỏ."),
      ).toBeVisible();
      await expect(
        page.getByTestId("cart-drawer").getByRole("textbox", { name: "Số lượng" }),
      ).toHaveValue("2");
    } finally {
      await updateProduct("TTXX-004", { stock: 12 });
    }
  });
});
