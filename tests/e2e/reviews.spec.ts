import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import {
  ADMIN,
  createCustomer,
  dbProduct,
  login,
  service,
  signedInClient,
  visible,
} from "./support";

/** Tạo đơn chứa sản phẩm và đưa tới trạng thái "Đã giao" (thao tác như admin thật). */
async function deliveredOrder(email: string, password: string, sku: string) {
  const customer = await signedInClient(email, password);
  const admin = await signedInClient(ADMIN.email, ADMIN.password);
  const product = await dbProduct(sku);
  const { data, error } = await customer.rpc("place_order", {
    p_items: [{ product_id: product.id, quantity: 1 }],
    p_shipping: {
      recipient_name: "Khách Đánh Giá",
      phone: "0912000111",
      address: "9 Ga Đà Nẵng",
      ward: "Phường Hải Châu",
      province: "TP. Đà Nẵng",
      note: "",
    },
    p_payment_method: "cod",
    p_client_request_id: randomUUID(),
  });
  if (error) throw error;
  for (const status of ["confirmed", "shipping", "delivered"] as const) {
    const { error: statusError } = await admin.rpc("admin_update_order_status", {
      p_order_id: data![0]!.order_id,
      p_status: status,
    });
    if (statusError) throw statusError;
  }
  return { product, code: data![0]!.order_code };
}

test.describe("Đánh giá thật từ khách đã mua", () => {
  test.afterEach(async () => {
    await service
      .from("product_reviews")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
  });

  test("khách đã nhận hàng viết đánh giá → hiện trên trang, thẻ sản phẩm và dữ liệu có cấu trúc", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop");
    const customer = await createCustomer("Nguyễn Thị Hoa");
    const { product, code } = await deliveredOrder(customer.email, customer.password, "TTXX-006");

    await login(page, customer.email, customer.password, `/tai-khoan/don-hang/${code}`);
    await visible(page.getByTestId("write-review-link")).click();
    await expect(page).toHaveURL(new RegExp(`/san-pham/${product.slug}#danh-gia$`));

    const form = visible(page.getByTestId("review-form"));
    await form
      .getByLabel("Cảm nhận về chiếc khăn")
      .fill("Vải loang màu đẹp, mát và mềm. Quàng đi biển rất hợp!");
    await form.getByTestId("submit-review").click();
    await expect(form.getByRole("alert").filter({ hasText: "Chọn số sao" })).toBeVisible();
    await form.getByTestId("star-5").click();
    await form.getByTestId("submit-review").click();

    await expect(visible(page.getByTestId("my-review"))).toBeVisible();
    const list = visible(page.getByTestId("review-list"));
    await expect(
      list.getByText("Vải loang màu đẹp, mát và mềm. Quàng đi biển rất hợp!"),
    ).toBeVisible();
    await expect(list.getByText("Hoa N.")).toBeVisible();
    await expect(visible(page.getByTestId("review-average"))).toHaveText("5,0");

    const jsonLd = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}",
    );
    expect(jsonLd.aggregateRating).toMatchObject({ ratingValue: 5, reviewCount: 1 });

    await page.goto("/bo-suu-tap");
    const card = visible(page.locator(`[data-testid="product-card"][data-sku="TTXX-006"]`));
    await expect(card.getByTestId("star-rating")).toHaveAttribute(
      "aria-label",
      "5,0 trên 5 sao, 1 đánh giá",
    );
  });

  test("chưa đăng nhập / chưa nhận hàng thì không có form đánh giá", async ({ page }) => {
    await page.goto("/san-pham/caro-dau-tay#danh-gia");
    await expect(visible(page.getByTestId("review-login"))).toBeVisible();
    await expect(visible(page.getByTestId("review-empty"))).toBeVisible();

    const customer = await createCustomer();
    await login(page, customer.email, customer.password, "/san-pham/caro-dau-tay");
    await expect(visible(page.getByTestId("review-not-eligible"))).toBeVisible();
    await expect(page.getByTestId("review-form")).toHaveCount(0);
  });

  test("admin ẩn đánh giá → khách khác không còn thấy", async ({ page, browser, isMobile }) => {
    test.skip(isMobile, "Desktop");
    const customer = await createCustomer("Trần Văn Gió");
    const { product } = await deliveredOrder(customer.email, customer.password, "TTXX-004");
    const client = await signedInClient(customer.email, customer.password);
    const { error } = await client.rpc("submit_review", {
      p_product_id: product.id,
      p_rating: 2,
      p_content: "Đánh giá cần kiểm duyệt thử nghiệm.",
    });
    expect(error).toBeNull();

    await login(page, ADMIN.email, ADMIN.password, "/admin/danh-gia");
    const row = visible(page.getByTestId("admin-review")).filter({
      hasText: "Đánh giá cần kiểm duyệt thử nghiệm.",
    });
    await expect(row).toBeVisible();
    await row.getByRole("switch").click();
    await expect(page.getByText("Đã ẩn đánh giá.")).toBeVisible();

    const guest = await browser.newContext();
    const guestPage = await guest.newPage();
    await guestPage.goto(`/san-pham/${product.slug}`);
    await expect(visible(guestPage.getByTestId("review-empty"))).toBeVisible();
    await expect(guestPage.getByText("Đánh giá cần kiểm duyệt thử nghiệm.")).toHaveCount(0);
    await guest.close();
  });
});
