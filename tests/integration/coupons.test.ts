import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { couponDiscount } from "@/features/coupons/domain";
import { shippingFeeFor } from "@/features/cart/domain";
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
const codes: string[] = [];

async function coupon(overrides: Record<string, unknown> = {}) {
  const code = `T${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
  codes.push(code);
  const { error } = await service.from("coupons").insert({
    code,
    description: "Mã test",
    discount_type: "percent",
    discount_value: 10,
    max_discount: 50000,
    min_subtotal: 0,
    per_customer_limit: 1,
    ...overrides,
  });
  if (error) throw error;
  return code;
}

async function product(index: number) {
  return (await products())[index]!;
}

beforeAll(async () => {
  restore = await snapshotProducts();
  [alice, bob, admin] = await Promise.all([createUser(), createUser(), createUser("admin")]);
});
afterEach(async () => restore());
afterAll(async () => {
  await service.from("coupons").delete().in("code", codes);
  await cleanupUsers();
});

describe("xem trước mã", () => {
  it("mã hợp lệ trả về số tiền giảm; khách vãng lai không gọi được", async () => {
    const code = await coupon();
    const { data, error } = await alice.client.rpc("preview_coupon", {
      p_code: ` ${code.toLowerCase()} `,
      p_subtotal: 359000,
    });
    expect(error).toBeNull();
    expect(data).toMatchObject({ code, discount: 35000, discount_type: "percent" });
    const guest = await anon().rpc("preview_coupon", { p_code: code, p_subtotal: 359000 });
    expect(guest.error).not.toBeNull();
  });

  it("báo đúng lý do khi không dùng được", async () => {
    const minCode = await coupon({ min_subtotal: 500000 });
    const min = await alice.client.rpc("preview_coupon", { p_code: minCode, p_subtotal: 300000 });
    expect(min.error?.message).toBe("COUPON_MIN_SUBTOTAL");
    expect(JSON.parse(min.error!.details!)).toEqual({ min_subtotal: 500000 });

    expect(
      (await alice.client.rpc("preview_coupon", { p_code: "KHONGCO123", p_subtotal: 1 })).error
        ?.message,
    ).toBe("COUPON_NOT_FOUND");
    const off = await coupon({ is_active: false });
    expect(
      (await alice.client.rpc("preview_coupon", { p_code: off, p_subtotal: 1 })).error?.message,
    ).toBe("COUPON_NOT_FOUND");
    const expired = await coupon({
      starts_at: "2020-01-01T00:00:00Z",
      ends_at: "2021-01-01T00:00:00Z",
    });
    expect(
      (await alice.client.rpc("preview_coupon", { p_code: expired, p_subtotal: 1 })).error?.message,
    ).toBe("COUPON_EXPIRED");
    const future = await coupon({ starts_at: "2099-01-01T00:00:00Z" });
    expect(
      (await alice.client.rpc("preview_coupon", { p_code: future, p_subtotal: 1 })).error?.message,
    ).toBe("COUPON_NOT_STARTED");
  });

  it("công thức giảm giá khớp TS ↔ SQL", async () => {
    const cases = [
      ["percent", 10, 50000],
      ["percent", 15, null],
      ["percent", 90, 1000000],
      ["fixed", 30000, null],
      ["fixed", 500000, null],
    ] as const;
    for (const [type, value, max] of cases) {
      for (const subtotal of [0, 999, 199000, 289999, 359000, 918000, 2500000]) {
        const { data } = await service.rpc("coupon_discount_amount", {
          p_type: type,
          p_value: value,
          p_max: max as number,
          p_subtotal: subtotal,
        });
        expect(data, `${type} ${value} ${max} ${subtotal}`).toBe(
          couponDiscount({ discountType: type, discountValue: value, maxDiscount: max }, subtotal),
        );
      }
    }
  });
});

describe("đặt hàng với mã giảm giá", () => {
  it("trừ tiền trong DB, ghi nhận lượt dùng, mỗi khách 1 lần; hủy đơn trả lại lượt", async () => {
    const code = await coupon({
      discount_type: "fixed",
      discount_value: 30000,
      min_subtotal: 199000,
    });
    const p = await product(2);
    const { data, error } = await placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }], {
      coupon: code,
    });
    expect(error).toBeNull();
    const orderId = data![0]!.order_id;
    const { data: order } = await alice.client
      .from("orders")
      .select("subtotal, shipping_fee, discount, total, coupon_code")
      .eq("id", orderId)
      .single();
    expect(order).toEqual({
      subtotal: p.price,
      shipping_fee: shippingFeeFor(p.price),
      discount: 30000,
      total: p.price + shippingFeeFor(p.price) - 30000,
      coupon_code: code,
    });
    expect(
      (await service.from("coupons").select("used_count").eq("code", code).single()).data
        ?.used_count,
    ).toBe(1);

    const again = await placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }], {
      coupon: code,
    });
    expect(again.error?.message).toBe("COUPON_ALREADY_USED");

    const cancel = await alice.client.rpc("cancel_my_order", { p_order_id: orderId });
    expect(cancel.error).toBeNull();
    expect(
      (await service.from("coupons").select("used_count").eq("code", code).single()).data
        ?.used_count,
    ).toBe(0);
    const reuse = await placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }], {
      coupon: code,
    });
    expect(reuse.error).toBeNull();
  });

  it("không đủ giá trị tối thiểu thì không tạo đơn, không trừ kho", async () => {
    const code = await coupon({ min_subtotal: 5000000 });
    const p = await product(0);
    const { error } = await placeOrder(bob.client, [{ product_id: p.id, quantity: 1 }], {
      coupon: code,
    });
    expect(error?.message).toBe("COUPON_MIN_SUBTOTAL");
    expect((await product(0)).stock).toBe(p.stock);
  });

  it("mã còn 1 lượt, hai khách đặt cùng lúc: chỉ một người dùng được", async () => {
    const code = await coupon({ usage_limit: 1 });
    const p = await product(5);
    const results = await Promise.all([
      placeOrder(alice.client, [{ product_id: p.id, quantity: 1 }], { coupon: code }),
      placeOrder(bob.client, [{ product_id: p.id, quantity: 1 }], { coupon: code }),
    ]);
    expect(results.filter((r) => !r.error)).toHaveLength(1);
    expect(results.find((r) => r.error)?.error?.message).toBe("COUPON_USED_UP");
    expect(
      (await service.from("coupons").select("used_count").eq("code", code).single()).data
        ?.used_count,
    ).toBe(1);
  });
});

describe("quyền với mã giảm giá", () => {
  it("khách không xem/tạo được mã; admin quản lý được; mã đã dùng không xóa được", async () => {
    const code = await coupon();
    const { data: seen } = await alice.client.from("coupons").select("code");
    expect(seen).toEqual([]);
    const insert = await alice.client
      .from("coupons")
      .insert({ code: "HACK99", discount_type: "fixed", discount_value: 999999 });
    expect(insert.error).not.toBeNull();

    const { data: adminSeen } = await admin.client.from("coupons").select("code").eq("code", code);
    expect(adminSeen).toHaveLength(1);
    const created = `A${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    codes.push(created);
    expect(
      (
        await admin.client
          .from("coupons")
          .insert({ code: created, discount_type: "fixed", discount_value: 20000 })
      ).error,
    ).toBeNull();
    expect(
      (await admin.client.from("coupons").update({ is_active: false }).eq("code", created)).error,
    ).toBeNull();

    await service.from("coupons").update({ used_count: 3 }).eq("code", code);
    await admin.client.from("coupons").delete().eq("code", code);
    expect((await service.from("coupons").select("code").eq("code", code)).data).toHaveLength(1);
    await admin.client.from("coupons").delete().eq("code", created);
    expect((await service.from("coupons").select("code").eq("code", created)).data).toHaveLength(0);
  });
});
