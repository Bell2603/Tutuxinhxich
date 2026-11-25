/**
 * Đối tác (các nhóm thương mại điện tử khác) — hiển thị ở section #doi-tac trên trang chủ.
 * Danh sách rỗng → section và link "Đối tác" trong menu/footer tự ẩn.
 *
 * Thêm đối tác:
 * 1. Đặt ảnh/logo vào public/partners/ (VD: public/partners/ten-doi-tac.webp, tỉ lệ 4:5, ≥ 800px chiều cao).
 *    Không dùng ảnh từ domain ngoài (CSP img-src chỉ cho phép ảnh của website).
 * 2. Thêm một mục vào PARTNERS bên dưới.
 */
export type Partner = {
  /** Tên hiển thị dưới ảnh. */
  name: string;
  /** Website đối tác — mở ở tab mới. */
  url: `https://${string}`;
  /** Đường dẫn ảnh trong public/, VD "/partners/ten-doi-tac.webp". */
  logo: `/partners/${string}`;
};

export const PARTNERS: readonly Partner[] = [
  // { name: "Tên đối tác", url: "https://example.com", logo: "/partners/ten-doi-tac.webp" },
];
