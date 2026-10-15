import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { CUSTOMER, login, visible } from "./support";

test.describe("Đăng ký / đăng nhập", () => {
  test("đăng ký tài khoản mới, đăng xuất rồi đăng nhập lại @mobile", async ({ page }) => {
    const email = `e2e-dk-${randomUUID().slice(0, 8)}@tutuxinhxich.test`;
    await page.goto("/dang-ky");
    const form = visible(page.getByTestId("signup-form"));
    await form.getByLabel("Họ và tên").fill("Bé Xinh Thử Nghiệm");
    await form.getByLabel("Email").fill(email);
    await form.getByLabel(/^Mật khẩu/).fill("KhanXinh2026");
    await form.getByLabel("Nhập lại mật khẩu").fill("KhanXinh2026");
    await form.getByTestId("signup-submit").click();

    await expect(page).toHaveURL(/\/tai-khoan$/);
    await expect(page.getByTestId("account-name")).toHaveText("Bé Xinh Thử Nghiệm");
    await expect(page.getByTestId("orders-empty")).toBeVisible();

    await page.getByTestId("signout").click();
    await expect(page).toHaveURL(/\/$/);
    await login(page, email, "KhanXinh2026");
    await expect(page).toHaveURL(/\/tai-khoan$/);
  });

  test("báo lỗi khi nhập sai", async ({ page }) => {
    await page.goto("/dang-ky");
    const signup = visible(page.getByTestId("signup-form"));
    await signup.getByTestId("signup-submit").click();
    await expect(signup.getByText("Họ tên cần ít nhất 2 ký tự")).toBeVisible();
    await expect(signup.getByText("Email chưa đúng định dạng")).toBeVisible();
    await expect(signup.getByText("Mật khẩu cần ít nhất 8 ký tự")).toBeVisible();

    await page.goto("/dang-nhap");
    const signin = visible(page.getByTestId("signin-form"));
    await signin.getByLabel("Email").fill(CUSTOMER.email);
    await signin.getByLabel(/^Mật khẩu/).fill("sai-mat-khau-1");
    await signin.getByTestId("signin-submit").click();
    await expect(signin.getByTestId("form-error")).toHaveText("Email hoặc mật khẩu không đúng.");
  });

  test("email đã đăng ký thì không tạo trùng", async ({ page }) => {
    await page.goto("/dang-ky");
    const form = visible(page.getByTestId("signup-form"));
    await form.getByLabel("Họ và tên").fill("Trùng Email");
    await form.getByLabel("Email").fill(CUSTOMER.email);
    await form.getByLabel(/^Mật khẩu/).fill("KhanXinh2026");
    await form.getByLabel("Nhập lại mật khẩu").fill("KhanXinh2026");
    await form.getByTestId("signup-submit").click();
    await expect(form.getByTestId("form-error")).toContainText("đã được đăng ký");
  });

  test("trang cần đăng nhập chuyển về trang đăng nhập kèm next", async ({ page }) => {
    await page.goto("/tai-khoan");
    await expect(page).toHaveURL(/\/dang-nhap\?next=%2Ftai-khoan$/);
    await page.goto("/thanh-toan");
    await expect(page).toHaveURL(/\/dang-nhap\?next=%2Fthanh-toan$/);
    await expect(
      visible(page.getByText("Đăng nhập để thanh toán — giỏ hàng của bạn vẫn được giữ nguyên.")),
    ).toBeVisible();
  });

  test("không cho chuyển hướng ra ngoài qua tham số next", async ({ page }) => {
    await login(page, CUSTOMER.email, CUSTOMER.password, "https://evil.example.com");
    await expect(page).toHaveURL(/localhost:\d+\/tai-khoan$/);
  });
});
