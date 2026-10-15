/** Danh sách yêu thích: chỉ lưu id sản phẩm (tối đa 6 vì cửa hàng có đúng 6 mã). */
export const WISHLIST_LIMIT = 6;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function sanitizeWishlist(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids = value.filter((v): v is string => typeof v === "string" && UUID.test(v));
  return [...new Set(ids)].slice(0, WISHLIST_LIMIT);
}

/** Thêm nếu chưa có (mới nhất lên đầu), bỏ nếu đã có. */
export function toggleWishlist(ids: string[], id: string): { ids: string[]; added: boolean } {
  if (ids.includes(id)) return { ids: ids.filter((v) => v !== id), added: false };
  return { ids: sanitizeWishlist([id, ...ids]), added: true };
}
