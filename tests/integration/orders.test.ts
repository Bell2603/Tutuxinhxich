import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  FREE_SHIPPING_THRESHOLD,
  MAX_QTY_PER_ITEM,
  SHIPPING_FEE,
  shippingFeeFor,
} from "@/features/cart/domain";
import { canTransition, ORDER_STATUSES } from "@/features/orders/domain";
import {
  anon,
  cleanupUsers,
  createUser,
  placeOrder,
  products,
  service,
  snapshotProducts,
  type TestUser,
} from "./helpers";

let alice: TestUser;
let bob: TestUser;
let admin: TestUser;
let restore: () => Promise<void>;

beforeAll(async () => {
  restore = await snapshotProducts();
  [alice, bob, admin] = await Promise.all([createUser(), createUser(), createUser("admin")]);
});
afterEach(async () => restore());
afterAll(cleanupUsers);

async function product(index: number) {
  const rows = await products();
  return rows[index]!;
}

describe("place_order — đặt hàng thử nghiệm", () => {
  it("khách vãng lai không đặt được (phải đăng nhập)", async () => {
    const p = await product(0);
    const { error } = await placeOrder(anon(), [{ product_id: p.id, quantity: 1 }]);
    expect(error).not.toBeNull();
  });

  it("tính tiền theo giá database, trừ tồn kho, tạo timeline", async () => {
    const p1 = await product(0);
    const p2 = await product(2);
    const { data, error } = await placeOrder(alice.client, [
      { product_id: p1.id, quantity: 1 },
      { product_id: p2.id, quantity: 1 },
      { product_id: p1.id, quantity: 1 }, // dòng trùng được gộp
    ]);
    expect(error).toBeNull();
    const orderId = data![0]!.order_id;
    expect(data![0]!.order_code).toMatch(/^TT\d{10}$/);

    const { data: order } = await alice.client
      .from("orders")
      .select(
        "subtotal, shipping_fee, total, item_count, status, order_items(sku, quantity, unit_price, line_total), order_events(status)",
      )
      .eq("id", orderId)
      .single();
    const subtotal = p1.price * 2 + p2.price;
    expect(order?.subtotal).toBe(subtotal);
    expect(order?.shipping_fee).toBe(shippingFeeFor(subtotal));
    expect(order?.total).toBe(subtotal + shippingFeeFor(subtotal));
    expect(order?.item_count).toBe(3);
    expect(order?.status).toBe("pending");
    expect(order?.order_items).toHaveLength(2);
    expect(order?.order_events.map((e) => e.status)).toEqual(["pending"]);

    const after1 = await product(0);
    expect(after1.stock).toBe(p1.stock - 2);
  });

  it("từ chối khi số lượng vượt tồn kho, không trừ kho", async () => {
    const p = await product(0);
    await service.from("products").update({ stock: 2 }).eq("id", p.id);
    const { error } = await placeOrder(alice.client, [{ product_id: p.id, quantity: 3 }]);
    expect(error?.message).toBe("INSUFFICIENT_STOCK");
    expect(JSON.parse(error!.details!)).toMatchObject({ sku: p.sku, available: 2 });
    expect((await product(0)).stock).toBe(2);
  });

  it(`từ chối số lượng > ${MAX_QTY_PER_ITEM} hoặc < 1`, async () => {
    const p = await product(2);
    const tooMany = await placeOrder(alice.client, [
      { product_id: p.id, quantity: MAX_QTY_PER_ITEM + 1 },
    ]);
    expect(tooMany.error?.message).toBe("INVALID_QUANTITY");
    const zero = await placeOrder(alice.client, [{ product_id: p.id, quantity: 0 }]);
    expect(zero.error?.message).toBe("INVALID_QUANTITY");
  });

  it("từ chối sản phẩm đang ẩn hoặc không tồn tại", async () => {
    const p = await product(1);
    await service.from("products").update({ is_visible: false }).eq("id", p.id);
    const hidden = await placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }]);
    expect(hidden.error?.message).toBe("PRODUCT_UNAVAILABLE");
    const missing = await placeOrder(alice.client, [{ product_id: randomUUID(), quantity: 1 }]);
    expect(missing.error?.message).toBe("PRODUCT_UNAVAILABLE");
  });

  it("từ chối giỏ trống và thông tin giao hàng sai", async () => {
    const empty = await placeOrder(alice.client, []);
    expect(empty.error?.message).toBe("EMPTY_CART");
    const p = await product(0);
    const badPhone = await placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }], {
      shipping: { phone: "12345" },
    });
    expect(badPhone.error?.message).toBe("INVALID_SHIPPING");
  });

  it("gửi lại cùng client_request_id không tạo đơn trùng", async () => {
    const p = await product(5);
    const requestId = randomUUID();
    const first = await placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }], {
      requestId,
    });
    const second = await placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }], {
      requestId,
    });
    expect(second.data![0]!.order_id).toBe(first.data![0]!.order_id);
    expect((await product(5)).stock).toBe(p.stock - 1);
  });

  it("hai khách tranh nhau chiếc cuối cùng: chỉ một đơn thành công", async () => {
    const p = await product(4);
    await service.from("products").update({ stock: 1 }).eq("id", p.id);
    const results = await Promise.all([
      placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }]),
      placeOrder(bob.client, [{ product_id: p.id, quantity: 1 }]),
    ]);
    const succeeded = results.filter((r) => !r.error);
    expect(succeeded).toHaveLength(1);
    expect(results.find((r) => r.error)?.error?.message).toBe("INSUFFICIENT_STOCK");
    expect((await product(4)).stock).toBe(0);
  });

  it("phí ship: miễn phí từ 500.000₫ (khớp TS ↔ SQL)", async () => {
    for (const subtotal of [
      0,
      1000,
      FREE_SHIPPING_THRESHOLD - 1,
      FREE_SHIPPING_THRESHOLD,
      2_000_000,
    ]) {
      const { data } = await service.rpc("shipping_fee_for", { p_subtotal: subtotal });
      expect(data).toBe(shippingFeeFor(subtotal));
    }
    expect(shippingFeeFor(FREE_SHIPPING_THRESHOLD - 1)).toBe(SHIPPING_FEE);
  });
});

describe("đơn hàng — quyền xem", () => {
  it("khách chỉ thấy đơn của mình; admin thấy tất cả; không ai sửa trực tiếp", async () => {
    const p = await product(2);
    const { data } = await placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }]);
    const orderId = data![0]!.order_id;

    const { data: bobView } = await bob.client.from("orders").select("id").eq("id", orderId);
    expect(bobView).toEqual([]);
    const { data: bobItems } = await bob.client
      .from("order_items")
      .select("id")
      .eq("order_id", orderId);
    expect(bobItems).toEqual([]);
    const { data: adminView } = await admin.client.from("orders").select("id").eq("id", orderId);
    expect(adminView).toHaveLength(1);

    await alice.client.from("orders").update({ status: "delivered", total: 1 }).eq("id", orderId);
    await admin.client.from("orders").update({ total: 1 }).eq("id", orderId);
    const { data: after } = await service
      .from("orders")
      .select("status, total")
      .eq("id", orderId)
      .single();
    expect(after?.status).toBe("pending");
    expect(after?.total).not.toBe(1);

    const insert = await alice.client.from("orders").insert({
      code: "FAKE",
      user_id: alice.id,
      client_request_id: randomUUID(),
      payment_method: "cod",
      recipient_name: "Fake",
      phone: "0912345678",
      address: "Fake address",
      ward: "Fake",
      province: "Fake",
      subtotal: 0,
      shipping_fee: 0,
      total: 0,
      item_count: 1,
    });
    expect(insert.error).not.toBeNull();
  });
});

describe("trạng thái đơn hàng", () => {
  it("luồng trạng thái khớp TS ↔ SQL", async () => {
    for (const from of ORDER_STATUSES) {
      for (const to of ORDER_STATUSES) {
        const { data } = await service.rpc("can_transition_order", { p_from: from, p_to: to });
        expect(data, `${from} → ${to}`).toBe(canTransition(from, to));
      }
    }
  });

  it("khách hàng không gọi được RPC admin", async () => {
    const p = await product(2);
    const { data } = await placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }]);
    const { error } = await alice.client.rpc("admin_update_order_status", {
      p_order_id: data![0]!.order_id,
      p_status: "confirmed",
    });
    expect(error?.message).toBe("FORBIDDEN");
  });

  it("admin chuyển trạng thái theo luồng, sai luồng bị chặn, hủy thì hoàn kho", async () => {
    const p = await product(3);
    const { data } = await placeOrder(alice.client, [{ product_id: p.id, quantity: 2 }]);
    const orderId = data![0]!.order_id;
    expect((await product(3)).stock).toBe(p.stock - 2);

    const skip = await admin.client.rpc("admin_update_order_status", {
      p_order_id: orderId,
      p_status: "delivered",
    });
    expect(skip.error?.message).toBe("INVALID_TRANSITION");

    const confirm = await admin.client.rpc("admin_update_order_status", {
      p_order_id: orderId,
      p_status: "confirmed",
      p_note: "Đã gọi xác nhận",
    });
    expect(confirm.data).toBe("confirmed");

    const cancel = await admin.client.rpc("admin_update_order_status", {
      p_order_id: orderId,
      p_status: "cancelled",
    });
    expect(cancel.data).toBe("cancelled");
    expect((await product(3)).stock).toBe(p.stock);

    const { data: events } = await alice.client
      .from("order_events")
      .select("status, note")
      .eq("order_id", orderId)
      .order("id");
    expect(events?.map((e) => e.status)).toEqual(["pending", "confirmed", "cancelled"]);
    expect(events?.[1]?.note).toBe("Đã gọi xác nhận");
  });

  it("khách tự hủy được đơn chờ xác nhận (hoàn kho), không hủy được đơn đã xác nhận hoặc của người khác", async () => {
    const p = await product(5);
    const first = await placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }]);
    const firstId = first.data![0]!.order_id;

    const bobCancel = await bob.client.rpc("cancel_my_order", { p_order_id: firstId });
    expect(bobCancel.error?.message).toBe("ORDER_NOT_FOUND");

    const ok = await alice.client.rpc("cancel_my_order", { p_order_id: firstId });
    expect(ok.data).toBe("cancelled");
    expect((await product(5)).stock).toBe(p.stock);

    const second = await placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }]);
    const secondId = second.data![0]!.order_id;
    await admin.client.rpc("admin_update_order_status", {
      p_order_id: secondId,
      p_status: "confirmed",
    });
    const late = await alice.client.rpc("cancel_my_order", { p_order_id: secondId });
    expect(late.error?.message).toBe("INVALID_TRANSITION");
  });

  it("dashboard chỉ dành cho admin", async () => {
    const denied = await alice.client.rpc("admin_dashboard_stats");
    expect(denied.error?.message).toBe("FORBIDDEN");
    const { data, error } = await admin.client.rpc("admin_dashboard_stats");
    expect(error).toBeNull();
    expect(data).toMatchObject({ orders_total: expect.any(Number), low_stock: expect.any(Number) });
  });
});
