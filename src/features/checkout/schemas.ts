import { z } from "zod";
import { MAX_QTY_PER_ITEM } from "@/features/cart/domain";
import { normalizePhone, VN_PHONE_REGEX } from "@/lib/text";

export const shippingSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên người nhận")
    .max(100, "Họ tên tối đa 100 ký tự"),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .pipe(z.string().regex(VN_PHONE_REGEX, "Số điện thoại chưa đúng (VD: 0912345678)")),
  address: z
    .string()
    .trim()
    .min(5, "Vui lòng nhập số nhà, tên đường")
    .max(255, "Địa chỉ tối đa 255 ký tự"),
  ward: z.string().trim().min(2, "Vui lòng nhập phường/xã").max(100, "Tối đa 100 ký tự"),
  province: z.string().trim().min(2, "Vui lòng nhập tỉnh/thành phố").max(100, "Tối đa 100 ký tự"),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
});

export type ShippingInput = z.input<typeof shippingSchema>;
export type ShippingValues = z.output<typeof shippingSchema>;

export const PAYMENT_METHODS = ["cod", "bank_transfer_mock"] as const;

export const checkoutSchema = z.object({
  shipping: shippingSchema,
  paymentMethod: z.enum(PAYMENT_METHODS, { message: "Vui lòng chọn phương thức thanh toán" }),
  items: z
    .array(
      z.object({ productId: z.uuid(), quantity: z.number().int().min(1).max(MAX_QTY_PER_ITEM) }),
    )
    .min(1, "Giỏ hàng đang trống")
    .max(6),
  clientRequestId: z.uuid(),
  couponCode: z
    .string()
    .trim()
    .max(20)
    .regex(/^[A-Za-z0-9]*$/, "Mã giảm giá chỉ gồm chữ và số")
    .optional(),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

/** 34 tỉnh/thành sau sắp xếp đơn vị hành chính 2025 — gợi ý nhập liệu (vẫn cho nhập tự do). */
export const PROVINCES = [
  "TP. Hà Nội",
  "TP. Hồ Chí Minh",
  "TP. Hải Phòng",
  "TP. Đà Nẵng",
  "TP. Cần Thơ",
  "TP. Huế",
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Tĩnh",
  "Hưng Yên",
  "Khánh Hòa",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "Tuyên Quang",
  "Vĩnh Long",
] as const;
