import { PageTransition } from "@/components/motion/page-transition";
import type { Metadata } from "next";
import { Accent, Eyebrow } from "@/components/ui/section-heading";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Giao hàng, đổi trả & bảo quản" };

const SECTIONS = [
  {
    id: "giao-hang",
    title: "Giao hàng",
    items: [
      "Miễn phí giao hàng cho đơn từ 500.000₫; đơn dưới mức này phí 30.000₫ trên toàn quốc.",
      "Thời gian dự kiến: 1–3 ngày nội thành, 3–5 ngày tỉnh thành khác.",
      "Mỗi đơn được gói trong hộp quà kèm vé tàu Tu Tu Xình Xịch.",
    ],
  },
  {
    id: "doi-tra",
    title: "Đổi trả",
    items: [
      "Đổi mẫu khác trong 7 ngày kể từ khi nhận hàng nếu khăn còn nguyên tem, chưa giặt.",
      "Lỗi từ nhà sản xuất: đổi mới miễn phí, Tu Tu chịu phí vận chuyển hai chiều.",
      "Liên hệ " + site.contact.email + " để được hỗ trợ.",
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
      "Website đang ở giai đoạn thử nghiệm: COD và chuyển khoản đều là quy trình giả lập, không trừ tiền thật.",
      "Khách hàng có thể tự hủy đơn khi đơn còn ở trạng thái “Chờ xác nhận”.",
    ],
  },
];

export default function PolicyPage() {
  return (
    <PageTransition>
      <div className="container-page max-w-4xl py-12">
        <Eyebrow>Chính sách</Eyebrow>
        <h1 className="mt-5 text-5xl leading-[1.02] font-extrabold sm:text-6xl">
          Đi tàu <Accent>an tâm</Accent>
        </h1>
        <p className="mt-4 rounded-2xl bg-sun-100 px-4 py-3 text-sm font-semibold text-warning">
          Nội dung chính sách mẫu — cửa hàng cần cập nhật theo chính sách thực tế trước khi bán
          hàng.
        </p>
        <div className="mt-10 space-y-6">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 rounded-[2rem] bg-white p-7 shadow-card ring-1 ring-line"
            >
              <h2 className="text-2xl font-extrabold">{section.title}</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
