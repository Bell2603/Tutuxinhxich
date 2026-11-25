/**
 * Chuyển khoản ngân hàng (khách tự chuyển) — logic thuần: kiểm tra config, nội dung chuyển khoản, chuỗi VietQR.
 * Không gọi dịch vụ ngoài: mã QR được tạo ngay trên server từ chuỗi này.
 */
import { bank as defaultBank, type BankAccount } from "@/config/bank";
import type { OrderStatus } from "@/features/orders/domain";

/** Độ dài tối đa nội dung chuyển khoản — mức an toàn cho đa số app ngân hàng (cắt bớt phần tên nếu dài). */
export const TRANSFER_CONTENT_MAX = 50;

const SEPARATOR = " - ";

/** Config đã điền thật (không còn giá trị mẫu) thì mới cho khách chọn/hiện chuyển khoản. */
export function isBankConfigured(account: BankAccount = defaultBank): boolean {
  return (
    /^\d{6}$/.test(account.bin) &&
    /^\d{4,19}$/.test(account.accountNumber) &&
    account.bankName.trim().length > 0 &&
    !/ĐIỀN/i.test(account.bankName) &&
    account.accountName.trim().length >= 2 &&
    !/ĐIỀN/i.test(account.accountName)
  );
}

/** Bỏ dấu tiếng Việt, IN HOA, chỉ giữ chữ, số và dấu cách (ký tự ngân hàng chấp nhận). */
export function toBankText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Nội dung chuyển khoản: "<Mã đơn> - <TÊN> - <SĐT>", VD "TT2611250001 - NGUYEN VAN A - 0912345678".
 * Tối đa TRANSFER_CONTENT_MAX ký tự: mã đơn và SĐT luôn giữ đủ (để đối soát), chỉ cắt bớt tên.
 */
export function transferContent(code: string, name: string, phone: string): string {
  const head = toBankText(code).replace(/ /g, "");
  const tail = phone.replace(/\D/g, "");
  const room = TRANSFER_CONTENT_MAX - head.length - tail.length - SEPARATOR.length * 2;
  const fullName = toBankText(name);
  const shortName = fullName.length <= room ? fullName : fullName.slice(0, room).trimEnd();
  if (room <= 0 || !shortName) return [head, tail].filter(Boolean).join(SEPARATOR);
  return [head, shortName, tail].join(SEPARATOR);
}

/** Đơn chuyển khoản còn cần thanh toán (chưa hủy, chưa giao) thì mới hiện hướng dẫn chuyển khoản. */
export function shouldShowTransfer(status: OrderStatus): boolean {
  return status !== "cancelled" && status !== "delivered";
}

// ——— VietQR (chuẩn EMVCo Merchant-Presented QR, NAPAS 247 chuyển nhanh tới tài khoản) ———

function tlv(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) — trường 63 của mã EMVCo. */
export function crc16(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Chuỗi VietQR: quét bằng app ngân hàng sẽ điền sẵn tài khoản nhận, số tiền và nội dung. */
export function vietQrPayload({
  bin,
  accountNumber,
  amount,
  content,
}: {
  bin: string;
  accountNumber: string;
  amount: number;
  content: string;
}): string {
  const beneficiary = tlv("00", bin) + tlv("01", accountNumber);
  const merchant = tlv("00", "A000000727") + tlv("01", beneficiary) + tlv("02", "QRIBFTTA");
  const body =
    tlv("00", "01") +
    tlv("01", "12") + // QR động (có số tiền)
    tlv("38", merchant) +
    tlv("53", "704") + // VND
    tlv("54", String(Math.round(amount))) +
    tlv("58", "VN") +
    tlv("62", tlv("08", content)) +
    "6304";
  return body + crc16(body);
}
