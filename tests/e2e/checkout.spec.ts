import { expect, test, type Page } from "@playwright/test";
import {
  createCustomer,
  dbProduct,
  formatVND,
  login,
  service,
  updateProduct,
  visible,
} from "./support";
import { bank } from "../../src/config/bank";
import { isBankConfigured, transferContent } from "../../src/features/payments/bank-transfer";

const BANK_READY = isBankConfigured();

async function addToCart(page: Page, slug: string, quantity = 1) {
  await page.goto(`/san-pham/${slug}`);
  const qty = visible(page.getByRole("textbox", { name: "Số lượng" })).first();
  await qty.fill(String(quantity));
  await qty.press("Enter");
  await visible(page.getByTestId("add-to-cart")).first().click();
  await expect(page.getByTestId("cart-drawer").getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
}

async function fillShipping(page: Page) {
  const form = page.getByTestId("checkout-form");
  await form.getByLabel("Họ và tên người nhận").fill("Nguyễn Thị Xinh");
  await form.getByLabel("Số điện thoại").fill("0912 345 678");
  await form.getByLabel("Số nhà, tên đường").fill("12 Đường Hoa Cúc");
  await form.getByLabel("Phường / Xã").fill("Phường Bến Thành");
  await form.getByLabel("Tỉnh / Thành phố").fill("TP. Hồ Chí Minh");
}

test.describe("Thanh toán (thử nghiệm)", () => {
  test("khách vãng lai → đăng nhập (giữ giỏ) → đặt hàng → theo dõi → hủy đơn @mobile", async ({
    page,
  }) => {
    const customer = await createCustomer("Khách Đặt Hàng");
    const hoaCuc = await dbProduct("TTXX-003");
    const mayHong = await dbProduct("TTXX-001");

    await addToCart(page, hoaCuc.slug, 2);
    await addToCart(page, mayHong.slug, 1);
    await visible(page.getByTestId("cart-button")).click();
    await page
      .getByTestId("cart-drawer")
      .getByRole("link", { name: /Thanh toán/ })
      .click();

    await expect(page).toHaveURL(/\/dang-nhap\?next=%2Fthanh-toan/);
    const form = visible(page.getByTestId("signin-form"));
    await form.getByLabel("Email").fill(customer.email);
    await form.getByLabel(/^Mật khẩu/).fill(customer.password);
    await form.getByTestId("signin-submit").click();
    await expect(page).toHaveURL(/\/thanh-toan$/);

    const subtotal = hoaCuc.price * 2 + mayHong.price;
    await expect(page.getByTestId("checkout-subtotal")).toHaveText(formatVND(subtotal));
    await expect(page.getByTestId("checkout-shipping")).toHaveText("Miễn phí");
    await expect(page.getByTestId("checkout-total")).toHaveText(formatVND(subtotal));

    await fillShipping(page);
    // Chưa điền tài khoản ngân hàng thật (src/config/bank.ts) → chỉ có COD.
    const payment = BANK_READY ? "bank_transfer_mock" : "cod";
    await expect(page.getByTestId("payment-bank_transfer_mock")).toHaveCount(BANK_READY ? 1 : 0);
    await page.getByTestId(`payment-${payment}`).check({ force: true });
    await page.getByTestId("place-order").click();

    await expect(page).toHaveURL(/\/tai-khoan\/don-hang\/TT\d{10}\?moi=1$/);
    await expect(page.getByTestId("order-success")).toBeVisible();
    await expect(visible(page.getByTestId("order-status")).first()).toHaveText("Chờ xác nhận");
    await expect(page.getByTestId("order-total")).toHaveText(formatVND(subtotal));
    await expect(visible(page.getByTestId("cart-count"))).toHaveCount(0);

    expect((await dbProduct("TTXX-003")).stock).toBe(hoaCuc.stock - 2);
    expect((await dbProduct("TTXX-001")).stock).toBe(mayHong.stock - 1);
    const code = (await page.getByTestId("order-code").textContent())!.replace("Đơn #", "").trim();
    const { data: order } = await service
      .from("orders")
      .select("total, payment_method, phone, user_id")
      .eq("code", code)
      .single();
    expect(order).toMatchObject({
      total: subtotal,
      payment_method: payment,
      phone: "0912345678",
      user_id: customer.id,
    });

    await page.goto("/tai-khoan");
    const orders = visible(page.getByTestId("orders-list"));
    await expect(orders.getByText(`#${code}`)).toBeVisible();
    await orders.getByText(`#${code}`).click();
    await visible(page.getByTestId("cancel-order")).click();
    await visible(page.getByTestId("confirm-cancel")).click();
    await expect(visible(page.getByTestId("order-status")).first()).toHaveText("Đã hủy");
    expect((await dbProduct("TTXX-003")).stock).toBe(hoaCuc.stock);
    expect((await dbProduct("TTXX-001")).stock).toBe(mayHong.stock);
  });

  test("chuyển khoản: thông tin tài khoản, nội dung, QR và nút sao chép trên trang đơn @mobile", async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(!BANK_READY, "Chưa điền tài khoản ngân hàng thật trong src/config/bank.ts");
    test.skip(browserName !== "chromium", "Quyền clipboard chỉ cấp được trên Chromium");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const customer = await createCustomer();
    await login(page, customer.email, customer.password);
    const hoaCuc = await dbProduct("TTXX-003");
    await addToCart(page, hoaCuc.slug, 1);
    await page.goto("/thanh-toan");
    await fillShipping(page);
    await page.getByTestId("payment-bank_transfer_mock").check({ force: true });
    await page.getByTestId("place-order").click();
    await expect(page).toHaveURL(/\/tai-khoan\/don-hang\/TT\d{10}\?moi=1$/);

    const code = (await page.getByTestId("order-code").textContent())!.replace("Đơn #", "").trim();
    const content = transferContent(code, "Nguyễn Thị Xinh", "0912345678");
    expect(content).toBe(`${code} - NGUYEN THI XINH - 0912345678`);
    const panel = visible(page.getByTestId("bank-transfer"));
    await expect(panel.getByTestId("bank-account")).toHaveText(bank.accountNumber);
    await expect(panel.getByTestId("bank-amount")).toHaveText(formatVND(hoaCuc.price + 30_000));
    await expect(panel.getByTestId("bank-content")).toHaveText(content);
    await expect(panel.getByTestId("bank-qr")).toHaveAttribute("src", /^data:image\/svg\+xml/);
    await panel.getByRole("button", { name: "Sao chép nội dung chuyển khoản" }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(content);

    // Hủy đơn → không còn hướng dẫn chuyển khoản.
    await visible(page.getByTestId("cancel-order")).click();
    await visible(page.getByTestId("confirm-cancel")).click();
    await expect(visible(page.getByTestId("order-status")).first()).toHaveText("Đã hủy");
    await expect(page.getByTestId("bank-transfer")).toHaveCount(0);
  });

  test("đơn COD không có khối chuyển khoản", async ({ page }) => {
    const customer = await createCustomer();
    await login(page, customer.email, customer.password);
    await addToCart(page, "hoa-cuc-san-ga", 1);
    await page.goto("/thanh-toan");
    await fillShipping(page);
    await page.getByTestId("payment-cod").check({ force: true });
    await page.getByTestId("place-order").click();
    await expect(page).toHaveURL(/\/tai-khoan\/don-hang\/TT\d{10}\?moi=1$/);
    await expect(page.getByTestId("order-success")).toBeVisible();
    await expect(page.getByTestId("bank-transfer")).toHaveCount(0);
  });

  test("kiểm tra dữ liệu nhận hàng và phí ship dưới 500.000₫", async ({ page }) => {
    const customer = await createCustomer();
    await login(page, customer.email, customer.password);
    const hoaCuc = await dbProduct("TTXX-003");
    await addToCart(page, hoaCuc.slug, 1);
    await page.goto("/thanh-toan");
    await expect(page.getByTestId("checkout-shipping")).toHaveText(formatVND(30_000));
    await expect(page.getByTestId("checkout-total")).toHaveText(formatVND(hoaCuc.price + 30_000));

    const form = page.getByTestId("checkout-form");
    await form.getByLabel("Họ và tên người nhận").fill("");
    await form.getByLabel("Số điện thoại").fill("12345");
    await page.getByTestId("place-order").click();
    await expect(form.getByText("Vui lòng nhập họ tên người nhận")).toBeVisible();
    await expect(form.getByText("Số điện thoại chưa đúng (VD: 0912345678)")).toBeVisible();
    await expect(form.getByText("Vui lòng nhập số nhà, tên đường")).toBeVisible();
    await expect(page).toHaveURL(/\/thanh-toan$/);
    const { count } = await service
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", customer.id);
    expect(count).toBe(0);
  });

  test("server chặn đặt vượt tồn kho nếu kho thay đổi ngay lúc thanh toán", async ({ page }) => {
    const customer = await createCustomer();
    await login(page, customer.email, customer.password);
    await addToCart(page, "ngan-ha-lap-lanh", 3);
    await page.goto("/thanh-toan");
    await expect(page.getByTestId("checkout-total")).toBeVisible();
    await fillShipping(page);
    await updateProduct("TTXX-005", { stock: 1 });
    try {
      await page.getByTestId("place-order").click();
      await expect(page.getByTestId("checkout-error")).toHaveText(
        "“Ngân Hà Lấp Lánh” chỉ còn 1 sản phẩm. Vui lòng giảm số lượng.",
      );
      expect((await dbProduct("TTXX-005")).stock).toBe(1);
      // Giỏ tự đối chiếu lại theo tồn kho mới.
      await expect(page.getByTestId("checkout-subtotal")).toHaveText(
        formatVND((await dbProduct("TTXX-005")).price),
      );
    } finally {
      await updateProduct("TTXX-005", { stock: 5 });
    }
  });

  test("giỏ trống thì không thanh toán", async ({ page }) => {
    const customer = await createCustomer();
    await login(page, customer.email, customer.password, "/thanh-toan");
    await expect(page.getByTestId("checkout-empty")).toBeVisible();
  });
});
