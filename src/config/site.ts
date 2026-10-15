/**
 * Nội dung thương hiệu dùng chung — sửa tại đây để đổi slogan, thông báo, liên hệ, chính sách.
 * Lưu ý: thông tin liên hệ & chính sách bên dưới là NỘI DUNG MẪU, cần thay bằng thông tin thật trước khi bán.
 */
export const site = {
  name: "Tu Tu Xình Xịch",
  shortName: "TTXX",
  slogan: "Xinh từng nút thắt, chất từng chuyến đi",
  tagline: "6 mẫu khăn quàng cổ — 6 toa tàu sắc màu",
  description:
    "Tu Tu Xình Xịch — thương hiệu khăn quàng cổ thời trang cho người trẻ: lụa satin, len, voan, cotton linen với họa tiết rực rỡ, đáng yêu và đầy cá tính.",
  collectionName: "Chuyến Tàu Sắc Màu",
  announcements: [
    "Tu tu! Miễn phí giao hàng cho đơn từ 500.000₫",
    "Gói quà xinh miễn phí cho mọi đơn hàng",
    "Phiên bản chạy thử — thanh toán chỉ là giả lập, không trừ tiền thật",
    "Đổi trả trong 7 ngày nếu khăn còn nguyên tem",
  ],
  contact: {
    email: "xinchao@tutuxinhxich.vn",
    phone: "0900 000 000",
    address: "Sân ga số 6, TP. Hồ Chí Minh",
    hours: "9:00 – 21:00 mỗi ngày",
  },
  social: {
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    facebook: "https://facebook.com/",
  },
  /** Nội dung minh họa — chưa phải dữ liệu thật. */
  demoNotice: "Sản phẩm, hình ảnh, đánh giá và thanh toán trên website hiện là dữ liệu demo.",
} as const;

export const nav = [
  { href: "/", label: "Trang chủ" },
  { href: "/bo-suu-tap", label: "Bộ sưu tập" },
  { href: "/#lookbook", label: "Lookbook" },
  { href: "/#phoi-do", label: "Phối khăn" },
  { href: "/#cau-chuyen", label: "Câu chuyện" },
] as const;
