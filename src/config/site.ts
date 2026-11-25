import { PARTNERS } from "./partners";

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
    // "Nhập mã LENTAU10 giảm 10% cho đơn từ 300.000₫ (mã demo)",
    "Đổi trả trong 7 ngày nếu khăn còn nguyên tem",
  ],
  contact: {
    email: "xinchao@tutuxinhxich.vn",
    phone: "0357423261",
    address: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    hours: "9:00 – 21:00 mỗi ngày",
    /**
     * Link nhúng Google Maps cho trang /ve-chung-toi (Google Maps → Chia sẻ → Nhúng bản đồ → lấy giá trị src).
     * Phải bắt đầu bằng https://www.google.com/maps — CSP (frame-src) chỉ cho phép domain này.
     */
    mapEmbedUrl:
      "https://www.google.com/maps?q=S%E1%BB%91+1+%C4%90%E1%BA%A1i+C%E1%BB%93+Vi%E1%BB%87t%2C+Hai+B%C3%A0+Tr%C6%B0ng%2C+H%C3%A0+N%E1%BB%99i&output=embed",
  },
  social: {
    // instagram: "https://instagram.com/",
    /** Link Zalo thật (VD https://zalo.me/0357423261 hoặc link Zalo OA). Còn link mẫu → nút Zalo của chatbot tự ẩn. */
    zalo: "https://zalo.me/số-điện-thoại-hoặc-link-nhóm",
    tiktok: "https://tiktok.com/",
    facebook:
      "https://web.facebook.com/people/Tu-Tu-X%C3%ACnh-X%E1%BB%8Bch/61595232284438/?locale=vi_VN",
    /** Nút "Chat với nhân viên" của chatbot (m.me/<ID trang Facebook>). */
    messenger: "https://m.me/61595232284438",
  },
  /** Nội dung minh họa — chưa phải dữ liệu thật. */
  demoNotice: "", // Sản phẩm, hình ảnh, đánh giá và thanh toán trên website hiện là dữ liệu demo.
} as const;

/** Có đối tác thì mới hiện link "Đối tác" (section #doi-tac trên trang chủ ẩn khi danh sách rỗng). */
export const hasPartners = PARTNERS.length > 0;

export const nav = [
  { href: "/", label: "Trang chủ" },
  { href: "/bo-suu-tap", label: "Bộ sưu tập" },
  ...(hasPartners ? [{ href: "/#doi-tac", label: "Đối tác" } as const] : []),
  { href: "/phoi-khan", label: "Phối khăn" },
  { href: "/ve-chung-toi", label: "Về chúng tôi" },
] as const;
