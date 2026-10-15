import { afterAll, beforeAll, describe, expect, it } from "vitest";
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

let buyer: TestUser;
let stranger: TestUser;
let admin: TestUser;
let productId: string;
let otherProductId: string;
let restore: () => Promise<void>;

async function deliver(orderId: string) {
  for (const status of ["confirmed", "shipping", "delivered"] as const) {
    const { error } = await admin.client.rpc("admin_update_order_status", {
      p_order_id: orderId,
      p_status: status,
    });
    if (error) throw error;
  }
}

beforeAll(async () => {
  restore = await snapshotProducts();
  [buyer, stranger, admin] = await Promise.all([createUser(), createUser(), createUser("admin")]);
  await service.from("profiles").update({ full_name: "Nguyễn Thị Xinh" }).eq("id", buyer.id);
  const rows = await products();
  productId = rows[2]!.id;
  otherProductId = rows[3]!.id;
});

afterAll(async () => {
  await service.from("product_reviews").delete().in("product_id", [productId, otherProductId]);
  await restore();
  await cleanupUsers();
});

describe("đánh giá — điều kiện viết", () => {
  it("chưa nhận hàng thì không viết được", async () => {
    const { data } = await placeOrder(buyer.client, [{ product_id: productId, quantity: 1 }]);
    const pending = await buyer.client.rpc("submit_review", {
      p_product_id: productId,
      p_rating: 5,
      p_content: "Khăn đẹp lắm luôn!",
    });
    expect(pending.error?.message).toBe("REVIEW_NOT_ALLOWED");
    const status = await buyer.client.rpc("review_status_for_me", { p_product_id: productId });
    expect(status.data).toMatchObject({ eligible: false, review: null });

    await deliver(data![0]!.order_id);
    const ok = await buyer.client.rpc("submit_review", {
      p_product_id: productId,
      p_rating: 5,
      p_content: "Khăn voan nhẹ, màu xinh y hình.",
    });
    expect(ok.error).toBeNull();
    const after = await buyer.client.rpc("review_status_for_me", { p_product_id: productId });
    expect(after.data).toMatchObject({ eligible: true, review: { rating: 5, is_visible: true } });
  });

  it("chỉ đánh giá được đúng sản phẩm đã mua, khách vãng lai không gọi được", async () => {
    const other = await buyer.client.rpc("submit_review", {
      p_product_id: otherProductId,
      p_rating: 4,
      p_content: "Chưa mua nhưng muốn đánh giá",
    });
    expect(other.error?.message).toBe("REVIEW_NOT_ALLOWED");
    const stranger1 = await stranger.client.rpc("submit_review", {
      p_product_id: productId,
      p_rating: 1,
      p_content: "Đánh giá giả mạo nè",
    });
    expect(stranger1.error?.message).toBe("REVIEW_NOT_ALLOWED");
    const guest = await anon().rpc("submit_review", {
      p_product_id: productId,
      p_rating: 5,
      p_content: "Khách vãng lai viết",
    });
    expect(guest.error).not.toBeNull();
  });

  it("kiểm tra điểm sao và độ dài nội dung", async () => {
    const tooHigh = await buyer.client.rpc("submit_review", {
      p_product_id: productId,
      p_rating: 6,
      p_content: "Điểm sao không hợp lệ",
    });
    expect(tooHigh.error?.message).toBe("INVALID_REVIEW");
    const short = await buyer.client.rpc("submit_review", {
      p_product_id: productId,
      p_rating: 4,
      p_content: "ngắn",
    });
    expect(short.error?.message).toBe("INVALID_REVIEW");
  });

  it("viết lại thì cập nhật, không tạo đánh giá thứ hai; tên hiển thị được rút gọn", async () => {
    await buyer.client.rpc("submit_review", {
      p_product_id: productId,
      p_rating: 4,
      p_content: "Sửa lại: rất ổn, giao nhanh.",
    });
    const { data } = await anon()
      .from("product_reviews")
      .select("rating, content, author_name")
      .eq("product_id", productId);
    expect(data).toEqual([
      { rating: 4, content: "Sửa lại: rất ổn, giao nhanh.", author_name: "Xinh N." },
    ]);
  });
});

describe("đánh giá — quyền & riêng tư", () => {
  it("không ai đọc được user_id của người đánh giá", async () => {
    const { error } = await anon()
      .from("product_reviews")
      .select("user_id")
      .eq("product_id", productId);
    expect(error).not.toBeNull();
    const { error: authError } = await stranger.client.from("product_reviews").select("user_id");
    expect(authError).not.toBeNull();
    const { error: fnError } = await stranger.client.rpc(
      "has_delivered_product" as never,
      { p_user: buyer.id, p_product_id: productId } as never,
    );
    expect(fnError).not.toBeNull();
  });

  it("khách không tự ẩn/sửa điểm trực tiếp; admin ẩn được; đánh giá ẩn không hiện với người khác", async () => {
    const { data: review } = await service
      .from("product_reviews")
      .select("id")
      .eq("product_id", productId)
      .single();
    await buyer.client.from("product_reviews").update({ is_visible: false }).eq("id", review!.id);
    const { data: still } = await service
      .from("product_reviews")
      .select("is_visible")
      .eq("id", review!.id)
      .single();
    expect(still?.is_visible).toBe(true);

    const { error } = await admin.client
      .from("product_reviews")
      .update({ is_visible: false })
      .eq("id", review!.id);
    expect(error).toBeNull();
    const { data: publicRows } = await anon()
      .from("product_reviews")
      .select("id")
      .eq("product_id", productId);
    expect(publicRows).toEqual([]);
    const own = await buyer.client.rpc("review_status_for_me", { p_product_id: productId });
    expect(own.data).toMatchObject({ review: { is_visible: false } });
    const { data: adminRows } = await admin.client
      .from("product_reviews")
      .select("id")
      .eq("product_id", productId);
    expect(adminRows).toHaveLength(1);
    await admin.client.from("product_reviews").update({ is_visible: true }).eq("id", review!.id);
  });

  it("thống kê điểm trung bình chỉ tính đánh giá đang hiển thị", async () => {
    const { data } = await anon()
      .from("product_review_stats")
      .select("review_count, average_rating")
      .eq("product_id", productId)
      .single();
    expect(data).toEqual({ review_count: 1, average_rating: 4 });
  });

  it("khách xóa được đánh giá của mình, không xóa được của người khác", async () => {
    const { data: review } = await service
      .from("product_reviews")
      .select("id")
      .eq("product_id", productId)
      .single();
    await stranger.client.from("product_reviews").delete().eq("id", review!.id);
    expect(
      (await service.from("product_reviews").select("id").eq("id", review!.id)).data,
    ).toHaveLength(1);
    await buyer.client.from("product_reviews").delete().eq("id", review!.id);
    expect(
      (await service.from("product_reviews").select("id").eq("id", review!.id)).data,
    ).toHaveLength(0);
  });
});
