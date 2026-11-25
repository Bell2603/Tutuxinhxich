/**
 * Nguồn nội dung chính sách DUY NHẤT — dùng cho /chinh-sach, /hoi-dap, trang sản phẩm (và chatbot).
 * Chỉ là dữ liệu thuần (không JSX) để server có thể đọc thành văn bản.
 * Số tiền lấy từ hằng số giỏ hàng (đã khớp với SQL) — không viết cứng.
 */
import { site } from "@/config/site";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/features/cart/domain";
import { bank } from "@/config/bank";
import { isBankConfigured, transferContent } from "@/features/payments/bank-transfer";
import { formatVND } from "@/lib/format";

/** Số ngày được đổi mẫu kể từ khi nhận hàng. */
export const RETURN_DAYS = 7;

const freeShip = formatVND(FREE_SHIPPING_THRESHOLD);
const bankReady = isBankConfigured();
const TRANSFER_EXAMPLE = transferContent("TT2611250001", "Nguyễn Văn A", "0912345678");
const shipFee = formatVND(SHIPPING_FEE);

export type PolicySection = { id: string; title: string; items: readonly string[] };

export const POLICY_SECTIONS: readonly PolicySection[] = [
  {
    id: "giao-hang",
    title: "Giao hàng",
    items: [
      `Miễn phí giao hàng cho đơn từ ${freeShip}; đơn dưới mức này phí ${shipFee} trên toàn quốc.`,
      "Thời gian dự kiến: 1–3 ngày nội thành, 3–5 ngày tỉnh thành khác.",
      "Mỗi đơn được gói trong hộp quà kèm vé tàu Tu Tu Xình Xịch.",
    ],
  },
  {
    id: "doi-tra",
    title: "Đổi trả",
    items: [
      `Đổi mẫu khác trong ${RETURN_DAYS} ngày kể từ khi nhận hàng nếu khăn còn nguyên tem, chưa giặt.`,
      "Lỗi từ nhà sản xuất: đổi mới miễn phí, Tu Tu chịu phí vận chuyển hai chiều.",
      `Liên hệ ${site.contact.email} để được hỗ trợ.`,
    ],
  },
  {
    id: "bao-quan",
    title: "Bảo quản khăn",
    items: [
      "Satin & voan: giặt tay nước mát, phơi trong bóng râm, ủi mặt trái ở nhiệt độ thấp.",
      "Len & dạ: giặt tay hoặc chế độ len, phơi nằm ngang để giữ form, không sấy nóng.",
      "Cotton linen: giặt riêng lần đầu, không dùng chất tẩy.",
    ],
  },
  {
    id: "thanh-toan",
    title: "Thanh toán",
    items: [
      "Thanh toán khi nhận hàng (COD): trả tiền mặt cho shipper khi nhận khăn.",
      ...(bankReady
        ? [
            `Chuyển khoản ngân hàng: sau khi đặt hàng, trang chi tiết đơn hiện số tài khoản ${bank.bankName}, số tiền, nội dung chuyển khoản và mã QR. Nội dung theo cú pháp “Mã đơn - Họ tên - SĐT” (VD ${TRANSFER_EXAMPLE}). Tu Tu xác nhận đơn sau khi nhận được tiền.`,
          ]
        : []),
      "Website không thu tiền online và không lưu thông tin thẻ/tài khoản của khách.",
      "Khách hàng có thể tự hủy đơn khi đơn còn ở trạng thái “Chờ xác nhận”.",
    ],
  },
];

/** Tóm tắt một dòng cho accordion "Giao hàng & đổi trả" trên trang sản phẩm. */
export const SHIPPING_RETURN_SUMMARY = `Miễn phí giao hàng cho đơn từ ${freeShip} (dưới mức này phí ${shipFee}). Đổi mẫu trong ${RETURN_DAYS} ngày nếu khăn còn nguyên tem.`;

export type Faq = { question: string; answer: string };

export const FAQS: readonly Faq[] = [
  {
    question: "Phí giao hàng là bao nhiêu?",
    answer: `Miễn phí giao hàng cho đơn từ ${freeShip}. Đơn dưới mức này phí ${shipFee} trên toàn quốc.`,
  },
  {
    question: "Bao lâu thì mình nhận được khăn?",
    answer:
      "Dự kiến 1–3 ngày với nội thành và 3–5 ngày với các tỉnh thành khác. Mỗi đơn đều được gói trong hộp quà kèm vé tàu Tu Tu Xình Xịch.",
  },
  {
    question: "Mình có được đổi mẫu khác không?",
    answer: `Có. Bạn được đổi mẫu khác trong ${RETURN_DAYS} ngày kể từ khi nhận hàng, miễn là khăn còn nguyên tem và chưa giặt.`,
  },
  {
    question: "Khăn bị lỗi thì sao?",
    answer:
      "Nếu khăn lỗi từ nhà sản xuất, Tu Tu đổi mới miễn phí và chịu phí vận chuyển hai chiều.",
  },
  {
    question: "Có những hình thức thanh toán nào?",
    answer: bankReady
      ? `Bạn chọn thanh toán khi nhận hàng (COD) hoặc chuyển khoản ngân hàng. Với chuyển khoản, sau khi đặt hàng bạn sẽ thấy số tài khoản, nội dung chuyển khoản (VD ${TRANSFER_EXAMPLE}) và mã QR trên trang chi tiết đơn; Tu Tu xác nhận đơn khi nhận được tiền.`
      : "Hiện Tu Tu nhận thanh toán khi nhận hàng (COD): bạn trả tiền mặt cho shipper khi nhận khăn.",
  },
  {
    question: "Mình có hủy đơn được không?",
    answer: "Được, bạn tự hủy đơn trong mục Tài khoản khi đơn còn ở trạng thái “Chờ xác nhận”.",
  },
  {
    question: "Giặt và bảo quản khăn thế nào?",
    answer:
      "Satin & voan: giặt tay nước mát, phơi trong bóng râm. Len & dạ: giặt tay hoặc chế độ len, phơi nằm ngang, không sấy nóng. Cotton linen: giặt riêng lần đầu, không dùng chất tẩy.",
  },
  {
    question: "Liên hệ Tu Tu bằng cách nào?",
    answer: `Gọi ${site.contact.phone} hoặc email ${site.contact.email} (${site.contact.hours}). Bạn cũng có thể ghé cửa hàng tại ${site.contact.address}.`,
  },
];
