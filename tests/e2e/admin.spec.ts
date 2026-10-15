import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import {
  ADMIN,
  createCustomer,
  dbProduct,
  formatVND,
  login,
  signedInClient,
  updateProduct,
  visible,
} from "./support";

/** Phần tử theo data-testid đang hiển thị (React có thể tạm giữ bản sao ẩn khi stream). */
const tid = (page: Page, id: string) => visible(page.getByTestId(id));

test.describe("Phân quyền quản trị", () => {
  test("khách chưa đăng nhập bị chuyển về trang đăng nhập", async ({ page }) => {
    await page.goto("/admin/san-pham");
    await expect(page).toHaveURL(/\/dang-nhap\?next=%2Fadmin%2Fsan-pham$/);
  });

  test("người dùng thường không vào được trang admin @mobile", async ({ page }) => {
    const customer = await createCustomer();
    await login(page, customer.email, customer.password);
    for (const path of ["/admin", "/admin/san-pham", "/admin/don-hang"]) {
      await page.goto(path);
      await expect(visible(tid(page, "access-denied"))).toBeVisible();
      await expect(tid(page, "admin-products")).toHaveCount(0);
    }
    const product = await dbProduct("TTXX-001");
    await page.goto(`/admin/san-pham/${product.id}`);
    await expect(visible(tid(page, "access-denied"))).toBeVisible();
    await expect(tid(page, "product-form")).toHaveCount(0);
  });
});

test.describe("Quản trị sản phẩm", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password, "/admin");
  });

  test("dashboard và danh sách đúng 6 sản phẩm", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Tổng quan cửa hàng" })).toBeVisible();
    await expect(tid(page, "stats").locator("li")).toHaveCount(8);
    await page.goto("/admin/san-pham");
    await expect(tid(page, "admin-product")).toHaveCount(6);
  });

  test("sửa giá bán, giá gốc, tồn kho, tên → cửa hàng cập nhật ngay", async ({ page }) => {
    const before = await dbProduct("TTXX-001");
    try {
      await page.goto(`/admin/san-pham/${before.id}`);
      const form = tid(page, "product-form");
      await form.getByTestId("field-name").fill("Mây Hồng Phiên Bản Mới");
      await form.getByTestId("field-price").fill("299000");
      await form.getByTestId("field-compare").fill("259000");
      await form.getByTestId("field-stock").fill("7");
      await form.getByTestId("save-product").click();
      await expect(
        form.getByText("Giá gốc phải lớn hơn giá bán (hoặc để trống nếu không giảm giá)"),
      ).toBeVisible();

      await form.getByTestId("field-compare").fill("");
      await form.getByTestId("save-product").click();
      await expect(page.getByText("Đã lưu sản phẩm.")).toBeVisible();
      const after = await dbProduct("TTXX-001");
      expect(after).toMatchObject({
        name: "Mây Hồng Phiên Bản Mới",
        price: 299_000,
        compare_at_price: null,
        stock: 7,
      });
      // Hồi quy B-009: lưu form không được làm đổi các trường không sửa (màu, ảnh, mô tả).
      expect(after.colors).toEqual(before.colors);
      expect(after.image_url).toBe(before.image_url);
      expect(after.gallery).toEqual(before.gallery);
      expect(after.description).toBe(before.description);

      await page.goto(`/san-pham/${before.slug}`);
      await expect(tid(page, "product-name")).toHaveText("Mây Hồng Phiên Bản Mới");
      await expect(visible(page.locator("main").getByTestId("price")).first()).toHaveText(
        formatVND(299_000),
      );
      await expect(tid(page, "stock-status")).toHaveText("Còn hàng");
    } finally {
      await updateProduct("TTXX-001", {
        name: before.name,
        price: before.price,
        compare_at_price: before.compare_at_price,
        stock: before.stock,
        colors: before.colors,
      });
    }
  });

  test("ẩn/hiện sản phẩm bằng công tắc", async ({ page }) => {
    const product = await dbProduct("TTXX-006");
    try {
      await page.goto("/admin/san-pham");
      await tid(page, `visibility-${product.id}`).click();
      await expect(page.getByText("Đã ẩn sản phẩm.")).toBeVisible();
      await expect.poll(async () => (await dbProduct("TTXX-006")).is_visible).toBe(false);
      await page.goto("/bo-suu-tap");
      await expect(visible(tid(page, "product-card"))).toHaveCount(5);
    } finally {
      await updateProduct("TTXX-006", { is_visible: true });
    }
  });

  test("tải ảnh mới lên và đặt làm ảnh chính", async ({ page }) => {
    const before = await dbProduct("TTXX-002");
    try {
      await page.goto(`/admin/san-pham/${before.id}`);
      const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      );
      await tid(page, "image-upload-input").setInputFiles({
        name: `test-${randomUUID().slice(0, 6)}.png`,
        mimeType: "image/png",
        buffer: png,
      });
      await expect(page.getByText(/Đã tải 1 ảnh/)).toBeVisible();
      const images = tid(page, "image-list").locator("li img");
      await expect(images).toHaveCount(5);
      await tid(page, "image-list")
        .getByRole("button", { name: "Đặt làm ảnh chính" })
        .last()
        .click();
      await tid(page, "save-product").click();
      await expect(page.getByText("Đã lưu sản phẩm.")).toBeVisible();
      const after = await dbProduct("TTXX-002");
      expect(after.image_url).toMatch(/\/storage\/v1\/object\/public\/product-images\/ttxx-002\//);
      expect(after.gallery).toContain(before.image_url);
    } finally {
      await updateProduct("TTXX-002", { image_url: before.image_url, gallery: before.gallery });
    }
  });
});

test.describe("Quản trị đơn hàng", () => {
  test("admin cập nhật trạng thái, khách thấy trạng thái mới", async ({ page, browser }) => {
    const customer = await createCustomer("Khách Theo Dõi Đơn");
    const client = await signedInClient(customer.email, customer.password);
    const product = await dbProduct("TTXX-006");
    const { data, error } = await client.rpc("place_order", {
      p_items: [{ product_id: product.id, quantity: 1 }],
      p_shipping: {
        recipient_name: "Khách Theo Dõi",
        phone: "0987654321",
        address: "1 Ga Sài Gòn",
        ward: "Phường Bàn Cờ",
        province: "TP. Hồ Chí Minh",
        note: "",
      },
      p_payment_method: "cod",
      p_client_request_id: randomUUID(),
    });
    expect(error).toBeNull();
    const { order_id: orderId, order_code: code } = data![0]!;

    await login(page, ADMIN.email, ADMIN.password, "/admin/don-hang");
    await expect(tid(page, "admin-orders").getByText(`#${code}`)).toBeVisible();
    await page.goto(`/admin/don-hang/${orderId}`);
    await tid(page, "set-status-confirmed").click();
    await expect(page.getByText("Đã chuyển sang “Đã xác nhận”.")).toBeVisible();
    await tid(page, "set-status-shipping").click();
    await expect(page.getByText("Đã chuyển sang “Đang giao”.")).toBeVisible();
    await expect(tid(page, "set-status-delivered")).toBeVisible();

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await login(customerPage, customer.email, customer.password, `/tai-khoan/don-hang/${code}`);
    await expect(visible(customerPage.getByTestId("order-status")).first()).toHaveText("Đang giao");
    await expect(visible(customerPage.getByTestId("cancel-order"))).toHaveCount(0);
    await customerContext.close();
  });
});
