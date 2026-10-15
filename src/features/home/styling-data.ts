import type { ComponentType } from "react";
import {
  BagIllustration,
  BowIllustration,
  HeadbandIllustration,
  ParisIllustration,
} from "./components/styling-illustrations";

export type ScarfShape = "square" | "long";

export type TyingStyle = {
  key: string;
  fits: readonly ScarfShape[];
  label: string;
  Illustration: ComponentType;
  lead: string;
  steps: readonly string[];
  suggest: { name: string; slug: string };
};

/** 4 cách quàng khăn — dùng ở trang chủ (#phoi-do) và gợi ý trên trang sản phẩm. */
export const STYLES: readonly TyingStyle[] = [
  {
    key: "no-co",
    fits: ["square"],
    label: "Nơ cổ áo",
    Illustration: BowIllustration,
    lead: "Kiểu kinh điển cho áo sơ mi và blouse — thanh lịch nhưng vẫn rất đáng yêu.",
    steps: [
      "Gấp khăn vuông thành dải dài khoảng 5 cm.",
      "Vòng quanh cổ dưới cổ áo, bắt chéo hai đầu.",
      "Thắt nơ, kéo hai cánh nơ cân đối và tỉa đuôi.",
    ],
    suggest: { name: "Mây Hồng Kẹo Bông", slug: "may-hong-keo-bong" },
  },
  {
    key: "paris",
    fits: ["long"],
    label: "Thắt kiểu Paris",
    Illustration: ParisIllustration,
    lead: "Gọn gàng, giữ ấm tốt và hợp mọi áo khoác — kiểu thắt nhanh nhất cho khăn dài.",
    steps: [
      "Gấp đôi khăn theo chiều dài.",
      "Vòng qua gáy, để phần vòng gấp ở một bên.",
      "Luồn hai đầu khăn qua vòng gấp rồi chỉnh độ lỏng.",
    ],
    suggest: { name: "Sọc Kẹo Cầu Vồng", slug: "soc-keo-cau-vong" },
  },
  {
    key: "tui",
    fits: ["square"],
    label: "Buộc quai túi",
    Illustration: BagIllustration,
    lead: "Biến chiếc túi quen thuộc thành món phụ kiện mới chỉ trong 30 giây.",
    steps: [
      "Gấp khăn thành dải nhỏ khoảng 3 cm.",
      "Thắt nút đơn quanh chân quai túi.",
      "Quấn hoặc thắt nơ, để hai đuôi khăn bay nhẹ.",
    ],
    suggest: { name: "Ngân Hà Lấp Lánh", slug: "ngan-ha-lap-lanh" },
  },
  {
    key: "bang-do",
    fits: ["square", "long"],
    label: "Băng đô tóc",
    Illustration: HeadbandIllustration,
    lead: "Giữ tóc gọn gàng ngày nắng, thêm điểm nhấn màu sắc cho khuôn mặt.",
    steps: [
      "Gấp chéo khăn vuông thành hình tam giác rồi cuộn thành dải.",
      "Đặt dải khăn qua đỉnh đầu, đưa hai đầu ra sau gáy.",
      "Thắt nút hoặc nơ nhỏ lệch một bên cho tinh nghịch.",
    ],
    suggest: { name: "Hoa Cúc Sân Ga", slug: "hoa-cuc-san-ga" },
  },
];

/** Khăn vuông (VD "70 × 70 cm") hay khăn dài ("180 × 30 cm") — đọc từ ô kích thước. */
export function scarfShape(size: string): ScarfShape {
  const [a, b] = (size.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => Number(n.replace(",", ".")));
  if (!a || !b) return "long";
  return Math.max(a, b) / Math.min(a, b) < 1.3 ? "square" : "long";
}

export function stylesForShape(shape: ScarfShape): TyingStyle[] {
  return STYLES.filter((style) => style.fits.includes(shape));
}
