"use server";

import { z } from "zod";
import { ForbiddenError, requireAdmin } from "@/features/auth/session";
import { parseAppError } from "@/lib/errors";
import { fail, ok, type ActionResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import { orderStatusUpdateSchema, productUpdateSchema } from "./schemas";

async function guard(): Promise<ActionResult<null> | null> {
  try {
    await requireAdmin();
    return null;
  } catch (error) {
    if (error instanceof ForbiddenError)
      return fail("Bạn không có quyền quản trị.", { code: "FORBIDDEN" });
    throw error;
  }
}

export async function updateProductAction(
  productId: string,
  input: unknown,
): Promise<ActionResult<null>> {
  const denied = await guard();
  if (denied) return denied;
  if (!z.uuid().safeParse(productId).success) return fail("Sản phẩm không hợp lệ.");

  const parsed = productUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Dữ liệu chưa hợp lệ, vui lòng kiểm tra các ô báo đỏ.", {
      code: "VALIDATION",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    });
  }
  const v = parsed.data;
  const supabase = await createClient();

  // Chỉ một "toa đặc biệt" được nổi bật trên trang chủ.
  if (v.isFeatured) {
    const { error } = await supabase
      .from("products")
      .update({ is_featured: false })
      .neq("id", productId)
      .eq("is_featured", true);
    if (error) return fail("Không cập nhật được sản phẩm nổi bật.");
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      name: v.name,
      short_description: v.shortDescription,
      description: v.description,
      material: v.material,
      fabric: v.fabric,
      size: v.size,
      care_instructions: v.careInstructions,
      price: v.price,
      compare_at_price: v.compareAtPrice,
      stock: v.stock,
      badge: v.badge,
      is_visible: v.isVisible,
      is_featured: v.isFeatured,
      sort_order: v.sortOrder,
      colors: v.colors,
      image_url: v.imageUrl,
      gallery: v.gallery.filter((src) => src !== v.imageUrl),
    })
    .eq("id", productId)
    .select("id");
  if (error) {
    console.error("[updateProduct]", error);
    return fail(
      error.code === "23514"
        ? "Dữ liệu vi phạm ràng buộc (VD: giá gốc phải lớn hơn giá bán)."
        : "Không lưu được sản phẩm.",
    );
  }
  if (!data?.length) return fail("Không tìm thấy sản phẩm hoặc bạn không có quyền.");
  return ok(null, "Đã lưu sản phẩm.");
}

export async function setProductVisibilityAction(
  productId: string,
  visible: boolean,
): Promise<ActionResult<null>> {
  const denied = await guard();
  if (denied) return denied;
  if (!z.uuid().safeParse(productId).success) return fail("Sản phẩm không hợp lệ.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ is_visible: visible })
    .eq("id", productId)
    .select("id");
  if (error || !data?.length) return fail("Không cập nhật được trạng thái hiển thị.");
  return ok(null, visible ? "Sản phẩm đã hiển thị." : "Đã ẩn sản phẩm.");
}

export async function updateOrderStatusAction(input: unknown): Promise<ActionResult<null>> {
  const denied = await guard();
  if (denied) return denied;
  const parsed = orderStatusUpdateSchema.safeParse(input);
  if (!parsed.success) return fail("Dữ liệu không hợp lệ.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_order_status", {
    p_order_id: parsed.data.orderId,
    p_status: parsed.data.status,
    p_note: parsed.data.note,
  });
  if (error) return fail(parseAppError(error).message);
  return ok(null, "Đã cập nhật trạng thái đơn hàng.");
}
