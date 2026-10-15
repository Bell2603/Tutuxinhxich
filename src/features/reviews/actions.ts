"use server";

import { z } from "zod";
import { ForbiddenError, getSessionUser, requireAdmin } from "@/features/auth/session";
import { parseAppError } from "@/lib/errors";
import { fail, ok, type ActionResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema } from "./schemas";

export async function submitReviewAction(input: unknown): Promise<ActionResult<null>> {
  const user = await getSessionUser();
  if (!user) return fail("Bạn cần đăng nhập để viết đánh giá.", { code: "AUTH_REQUIRED" });
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Đánh giá chưa hợp lệ.", {
      code: "VALIDATION",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_review", {
    p_product_id: parsed.data.productId,
    p_rating: parsed.data.rating,
    p_content: parsed.data.content,
  });
  if (error) {
    const appError = parseAppError(error);
    return fail(appError.message, { code: appError.code });
  }
  return ok(null, "Cảm ơn bạn đã đánh giá! 🧣");
}

export async function deleteMyReviewAction(reviewId: string): Promise<ActionResult<null>> {
  if (!z.uuid().safeParse(reviewId).success) return fail("Đánh giá không hợp lệ.");
  if (!(await getSessionUser())) return fail("Bạn cần đăng nhập.");
  const supabase = await createClient();
  // RLS chỉ cho xóa đánh giá của chính mình.
  const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId);
  if (error) return fail("Không xóa được đánh giá.");
  return ok(null, "Đã xóa đánh giá.");
}

export async function setReviewVisibilityAction(
  reviewId: string,
  visible: boolean,
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof ForbiddenError)
      return fail("Bạn không có quyền quản trị.", { code: "FORBIDDEN" });
    throw error;
  }
  if (!z.uuid().safeParse(reviewId).success) return fail("Đánh giá không hợp lệ.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .update({ is_visible: visible })
    .eq("id", reviewId)
    .select("id");
  if (error || !data?.length) return fail("Không cập nhật được đánh giá.");
  return ok(null, visible ? "Đánh giá đã hiển thị." : "Đã ẩn đánh giá.");
}
