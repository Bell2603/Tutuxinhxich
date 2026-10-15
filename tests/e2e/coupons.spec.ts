import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { ADMIN, createCustomer, dbProduct, formatVND, login, service, visible } from "./support";

async function addToCart(page: Page, slug: string) {
  await page.goto(`/san-pham/${slug}`);
  await visible(page.getByTestId("add-to-cart")).first().click();
  await expect(page.getByTestId("cart-drawer").getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
}

async function fillShipping(page: Page) {
  const form = page.getByTestId("checkout-form");
  await form.getByLabel("Họ và tên người nhận").fill("Lê Thị Mã");
  await form.getByLabel("Số điện thoại").fill("0912345678");
  await form.getByLabel("Số nhà, tên đường").fill("5 Đường Khuyến Mãi");
  await form.getByLabel("Phường / Xã").fill("Phường Bến Nghé");
  await form.getByLabel("Tỉnh / Thành phố").fill("TP. Hồ Chí Minh");
}

test.describe("Mã giảm giá", () => {
  test("áp mã LENTAU10 ở checkout → tổng tiền giảm đúng → đơn lưu giảm giá; dùng lại bị từ chối @mobile", async ({
    page,
  }) => {
    const customer = await createCustomer("Khách Săn Mã");
    const nganHa = await dbProduct("TTXX-005");
    await login(page, customer.email, customer.password);
    await addToCart(page, nganHa.slug);
    await page.goto("/thanh-toan");

    const coupon = page.getByTestId("coupon-field");
    await coupon.getByTestId("coupon-input").fill("khongco99");
    await coupon.getByTestId("coupon-apply").click();
    await expect(coupon.getByTestId("coupon-error")).toHaveText(
      "Mã giảm giá không tồn tại hoặc đã ngừng áp dụng.",
    );

    await coupon.getByTestId("coupon-input").fill("lentau10");
    await coupon.getByTestId("coupon-input").press("Enter");
    await expect(coupon.getByTestId("coupon-applied")).toHaveText("LENTAU10");
    // 10% của 459.000₫ = 45.900₫ → làm tròn xuống 45.000₫; dưới 500.000₫ nên phí ship 30.000₫.
    const discount = 45_000;
    const total = nganHa.price + 30_000 - discount;
    await expect(page.getByTestId("checkout-discount")).toHaveText(`−${formatVND(discount)}`);
    await expect(page.getByTestId("checkout-total")).toHaveText(formatVND(total));

    await fillShipping(page);
    await page.getByTestId("place-order").click();
    await expect(page).toHaveURL(/\/tai-khoan\/don-hang\/TT\d{10}\?moi=1$/);
    await expect(page.getByTestId("order-discount")).toHaveText(`−${formatVND(discount)}`);
    await expect(page.getByTestId("order-total")).toHaveText(formatVND(total));
    const { data: order } = await service
      .from("orders")
      .select("discount, coupon_code, total")
      .eq("user_id", customer.id)
      .single();
    expect(order).toEqual({ discount, coupon_code: "LENTAU10", total });

    await addToCart(page, nganHa.slug);
    await page.goto("/thanh-toan");
    await page.getByTestId("coupon-input").fill("LENTAU10");
    await page.getByTestId("coupon-apply").click();
    await expect(page.getByTestId("coupon-error")).toHaveText("Bạn đã dùng mã này rồi.");
  });

  test("đơn chưa đủ giá trị tối thiểu thì không áp được mã", async ({ page }) => {
    const customer = await createCustomer();
    await login(page, customer.email, customer.password);
    await addToCart(page, "hoa-cuc-san-ga");
    await page.goto("/thanh-toan");
    await page.getByTestId("coupon-input").fill("LENTAU10");
    await page.getByTestId("coupon-apply").click();
    await expect(page.getByTestId("coupon-error")).toHaveText(
      "Mã này áp dụng cho đơn từ 300.000₫ (chưa tính phí ship).",
    );
    await expect(page.getByTestId("checkout-discount")).toHaveCount(0);
  });

  test("admin tạo, tắt và xóa mã", async ({ page }) => {
    const code = `E2E${randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
    await login(page, ADMIN.email, ADMIN.password, "/admin/ma-giam-gia");
    const form = visible(page.getByTestId("coupon-create-form"));
    await form.getByLabel("Mã", { exact: false }).first().fill(code.toLowerCase());
    await form.getByLabel("Loại giảm").selectOption("fixed");
    await form.getByLabel("Mức giảm (₫)").fill("25000");
    await form.getByLabel("Đơn tối thiểu (₫)").fill("100000");
    await form.getByTestId("coupon-create-submit").click();
    await expect(page.getByText(`Đã tạo mã ${code}.`)).toBeVisible();

    const row = visible(page.locator(`[data-testid="coupon-row"][data-code="${code}"]`));
    await expect(row.getByTestId("coupon-status")).toHaveText("Đang áp dụng");
    await expect(row.getByText("Giảm 25.000₫ cho đơn từ 100.000₫")).toBeVisible();
    await row.getByRole("switch").click();
    await expect(row.getByTestId("coupon-status")).toHaveText("Đã tắt");
    await expect
      .poll(
        async () =>
          (await service.from("coupons").select("is_active").eq("code", code).single()).data
            ?.is_active,
      )
      .toBe(false);

    await row.getByRole("button", { name: `Xóa mã ${code}` }).click();
    await expect(page.getByText("Đã xóa mã.")).toBeVisible();
    await expect(page.locator(`[data-testid="coupon-row"][data-code="${code}"]`)).toHaveCount(0);
  });
});
