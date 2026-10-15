import { describe, expect, it } from "vitest";
import { sanitizeWishlist, toggleWishlist, WISHLIST_LIMIT } from "./domain";

const id = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;

describe("danh sách yêu thích", () => {
  it("thêm lên đầu, bấm lần nữa thì bỏ", () => {
    const first = toggleWishlist([], id(1));
    expect(first).toEqual({ ids: [id(1)], added: true });
    const second = toggleWishlist(first.ids, id(2));
    expect(second.ids).toEqual([id(2), id(1)]);
    expect(toggleWishlist(second.ids, id(1))).toEqual({ ids: [id(2)], added: false });
  });
  it("làm sạch dữ liệu localStorage hỏng, bỏ trùng, giới hạn 6", () => {
    expect(sanitizeWishlist("x")).toEqual([]);
    expect(sanitizeWishlist([id(1), id(1), "khong-phai-uuid", 42, null])).toEqual([id(1)]);
    const many = Array.from({ length: 9 }, (_, i) => id(i));
    expect(sanitizeWishlist(many)).toHaveLength(WISHLIST_LIMIT);
  });
});
