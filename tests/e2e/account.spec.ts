import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import {
  createCustomer,
  dbProduct,
  login,
  signedInClient,
  visible,
  waitForEmailLink,
} from "./support";

test.describe("Quên & đổi mật khẩu", () => {
  test("quên mật khẩu → email tiếng Việt → đặt mật khẩu mới → đăng nhập bằng mật khẩu mới", async ({
    page,
    baseURL,
  }) => {
    const customer = await createCustomer("Khách Quên Mật Khẩu");
    await page.goto("/dang-nhap");
    await visible(page.getByTestId("forgot-password-link")).click();
    await expect(page).toHaveURL(/\/quen-mat-khau$/);
    const form = visible(page.getByTestId("forgot-form"));
    await form.getByLabel("Email đã đăng ký").fill(customer.email);
    await form.getByTestId("forgot-submit").click();
    await expect(form.getByText(/Tu Tu vừa gửi link đặt lại mật khẩu/)).toBeVisible();

    const link = await waitForEmailLink(
      customer.email,
      /https?:\/\/[^"\s]+\/auth\/confirm\?token_hash=[^"\s]+/,
    );
    expect(link).toContain("type=recovery");
    // Link trong email trỏ tới SITE_URL (cổng dev) → mở trên server đang test.
    const url = new URL(link);
    await page.goto(`${baseURL}${url.pathname}${url.search}`);
    await expect(page).toHaveURL(/\/dat-lai-mat-khau$/);

    const reset = visible(page.getByTestId("reset-form"));
    await reset.getByLabel(/^Mật khẩu mới/).fill("KhanMoi2026");
    await reset.getByLabel("Nhập lại mật khẩu mới").fill("KhanMoi2026");
    await reset.getByTestId("reset-submit").click();
    await expect(page).toHaveURL(/\/tai-khoan\?mat-khau=moi$/);
    await expect(visible(page.getByTestId("password-reset-done"))).toBeVisible();

    await page.getByTestId("signout").click();
    await expect(page).toHaveURL(/\/$/);
    await login(page, customer.email, "KhanMoi2026");
    await expect(page).toHaveURL(/\/tai-khoan$/);
  });

  test("email chưa đăng ký nhận cùng thông báo (không lộ tài khoản)", async ({ page }) => {
    await page.goto("/quen-mat-khau");
    const form = visible(page.getByTestId("forgot-form"));
    await form
      .getByLabel("Email đã đăng ký")
      .fill(`khong-ton-tai-${randomUUID().slice(0, 6)}@tutuxinhxich.test`);
    await form.getByTestId("forgot-submit").click();
    await expect(form.getByText(/Tu Tu vừa gửi link đặt lại mật khẩu/)).toBeVisible();
  });

  test("mở trang đặt lại khi không có link hợp lệ", async ({ page }) => {
    await page.goto("/dat-lai-mat-khau");
    await expect(visible(page.getByTestId("reset-expired"))).toBeVisible();
  });

  test("đổi mật khẩu trong tài khoản (sai mật khẩu hiện tại bị từ chối)", async ({ page }) => {
    const customer = await createCustomer();
    await login(page, customer.email, customer.password);
    await visible(page.locator("summary", { hasText: "Đổi mật khẩu" })).click();
    const form = visible(page.getByTestId("change-password-form"));
    await form.getByLabel("Mật khẩu hiện tại").fill("sai-mat-khau-9");
    await form.getByLabel(/^Mật khẩu mới/).fill("DoiMoi2026x");
    await form.getByLabel("Nhập lại mật khẩu mới").fill("DoiMoi2026x");
    await form.getByTestId("change-password-submit").click();
    await expect(form.getByText("Mật khẩu hiện tại không đúng")).toBeVisible();

    await form.getByLabel("Mật khẩu hiện tại").fill(customer.password);
    await form.getByLabel(/^Mật khẩu mới/).fill("DoiMoi2026x");
    await form.getByLabel("Nhập lại mật khẩu mới").fill("DoiMoi2026x");
    await form.getByTestId("change-password-submit").click();
    await expect(page.getByText(/Đã đổi mật khẩu/)).toBeVisible();
    await expect(signedInClient(customer.email, "DoiMoi2026x")).resolves.toBeTruthy();
  });
});

test.describe("Checkout điền sẵn địa chỉ", () => {
  test("đơn thứ hai tự điền địa chỉ của đơn gần nhất", async ({ page }) => {
    const customer = await createCustomer("Khách Quen");
    const client = await signedInClient(customer.email, customer.password);
    const product = await dbProduct("TTXX-003");
    const { error } = await client.rpc("place_order", {
      p_items: [{ product_id: product.id, quantity: 1 }],
      p_shipping: {
        recipient_name: "Trần Thị Quen",
        phone: "0987123456",
        address: "88 Ga Hà Nội",
        ward: "Phường Văn Miếu",
        province: "TP. Hà Nội",
        note: "",
      },
      p_payment_method: "cod",
      p_client_request_id: randomUUID(),
    });
    expect(error).toBeNull();

    await login(page, customer.email, customer.password);
    await page.goto("/san-pham/hoa-cuc-san-ga");
    await visible(page.getByTestId("add-to-cart")).first().click();
    await page.keyboard.press("Escape");
    await page.goto("/thanh-toan");
    const form = page.getByTestId("checkout-form");
    await expect(page.getByTestId("prefill-note")).toBeVisible();
    await expect(form.getByLabel("Họ và tên người nhận")).toHaveValue("Trần Thị Quen");
    await expect(form.getByLabel("Số điện thoại")).toHaveValue("0987123456");
    await expect(form.getByLabel("Số nhà, tên đường")).toHaveValue("88 Ga Hà Nội");
    await expect(form.getByLabel("Tỉnh / Thành phố")).toHaveValue("TP. Hà Nội");
  });
});
