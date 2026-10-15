import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  anon,
  cleanupUsers,
  createUser,
  products,
  service,
  snapshotProducts,
  type TestUser,
} from "./helpers";

let customer: TestUser;
let admin: TestUser;
let restore: () => Promise<void>;

beforeAll(async () => {
  customer = await createUser("customer");
  admin = await createUser("admin");
});
afterAll(cleanupUsers);
beforeAll(async () => {
  restore = await snapshotProducts();
});
afterEach(async () => restore());

describe("sản phẩm — đúng 6 SKU", () => {
  it("database có đúng 6 sản phẩm với SKU duy nhất", async () => {
    const rows = await products();
    expect(rows).toHaveLength(6);
    expect(new Set(rows.map((r) => r.sku)).size).toBe(6);
    expect(rows.map((r) => r.sku)).toEqual([
      "TTXX-001",
      "TTXX-002",
      "TTXX-003",
      "TTXX-004",
      "TTXX-005",
      "TTXX-006",
    ]);
  });

  it("chặn tạo sản phẩm thứ 7 (kể cả với service role)", async () => {
    const { error } = await service.from("products").insert({
      sku: "TTXX-007",
      slug: "san-pham-thu-bay",
      name: "Sản phẩm thứ bảy",
      fabric: "satin",
      price: 100000,
    });
    expect(error?.message).toBe("PRODUCT_LIMIT_REACHED");
    expect(await products()).toHaveLength(6);
  });

  it("khách vãng lai xem được 6 sản phẩm đang hiển thị", async () => {
    const { data, error } = await anon().from("products").select("sku, price");
    expect(error).toBeNull();
    expect(data).toHaveLength(6);
  });

  it("sản phẩm bị ẩn: khách không thấy, admin vẫn thấy", async () => {
    const [first] = await products();
    await service.from("products").update({ is_visible: false }).eq("id", first!.id);
    const { data: guestRows } = await anon().from("products").select("id");
    expect(guestRows?.map((r) => r.id)).not.toContain(first!.id);
    const { data: customerRows } = await customer.client.from("products").select("id");
    expect(customerRows?.map((r) => r.id)).not.toContain(first!.id);
    const { data: adminRows } = await admin.client.from("products").select("id");
    expect(adminRows?.map((r) => r.id)).toContain(first!.id);
  });
});

describe("sản phẩm — quyền sửa", () => {
  it("khách vãng lai và khách hàng không sửa được giá", async () => {
    const [first] = await products();
    await anon().from("products").update({ price: 1000 }).eq("id", first!.id);
    await customer.client.from("products").update({ price: 1000 }).eq("id", first!.id);
    const [after] = await products();
    expect(after!.price).toBe(first!.price);
  });

  it("admin sửa được giá, giá gốc, tồn kho, tên", async () => {
    const [first] = await products();
    const { data, error } = await admin.client
      .from("products")
      .update({ price: 299000, compare_at_price: 399000, stock: 7, name: "Mây Hồng Test" })
      .eq("id", first!.id)
      .select("price, compare_at_price, stock, name")
      .single();
    expect(error).toBeNull();
    expect(data).toEqual({
      price: 299000,
      compare_at_price: 399000,
      stock: 7,
      name: "Mây Hồng Test",
    });
  });

  it("admin không đổi được SKU/slug (khóa theo cột)", async () => {
    const [first] = await products();
    const { error } = await admin.client
      .from("products")
      .update({ sku: "TTXX-999" })
      .eq("id", first!.id);
    expect(error).not.toBeNull();
    const [after] = await products();
    expect(after!.sku).toBe(first!.sku);
  });

  it("database từ chối giá gốc nhỏ hơn giá bán và tồn kho âm", async () => {
    const [first] = await products();
    const bad1 = await admin.client
      .from("products")
      .update({ price: 300000, compare_at_price: 200000 })
      .eq("id", first!.id);
    expect(bad1.error?.code).toBe("23514");
    const bad2 = await admin.client.from("products").update({ stock: -1 }).eq("id", first!.id);
    expect(bad2.error?.code).toBe("23514");
  });

  it("không ai xóa được sản phẩm qua API", async () => {
    const [first] = await products();
    await admin.client.from("products").delete().eq("id", first!.id);
    expect(await products()).toHaveLength(6);
  });
});

describe("hồ sơ người dùng", () => {
  it("khách hàng không tự nâng quyền admin", async () => {
    const { error } = await customer.client
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", customer.id);
    expect(error).not.toBeNull();
    const { data } = await service.from("profiles").select("role").eq("id", customer.id).single();
    expect(data?.role).toBe("customer");
  });

  it("khách hàng sửa được họ tên/SĐT của mình, không đọc được hồ sơ người khác", async () => {
    const { error } = await customer.client
      .from("profiles")
      .update({ full_name: "Tên Mới", phone: "0987654321" })
      .eq("id", customer.id);
    expect(error).toBeNull();
    const { data } = await customer.client.from("profiles").select("id");
    expect(data?.map((r) => r.id)).toEqual([customer.id]);
  });

  it("tài khoản mới tự có hồ sơ role customer", async () => {
    const { data } = await service
      .from("profiles")
      .select("role, full_name")
      .eq("id", customer.id)
      .single();
    expect(data?.role).toBe("customer");
  });
});

describe("storage ảnh sản phẩm", () => {
  const file = new Blob([new Uint8Array([0x52, 0x49, 0x46, 0x46])], { type: "image/webp" });

  it("khách hàng không tải ảnh lên được", async () => {
    const { error } = await customer.client.storage
      .from("product-images")
      .upload(`test/${Date.now()}.webp`, file);
    expect(error).not.toBeNull();
  });

  it("admin tải ảnh lên và xóa được", async () => {
    const path = `test/${Date.now()}.webp`;
    const { error } = await admin.client.storage
      .from("product-images")
      .upload(path, file, { contentType: "image/webp" });
    expect(error).toBeNull();
    const { error: removeError } = await admin.client.storage.from("product-images").remove([path]);
    expect(removeError).toBeNull();
  });

  it("bucket từ chối file không phải ảnh", async () => {
    const { error } = await admin.client.storage
      .from("product-images")
      .upload(`test/${Date.now()}.txt`, new Blob(["hello"], { type: "text/plain" }), {
        contentType: "text/plain",
      });
    expect(error).not.toBeNull();
  });
});
