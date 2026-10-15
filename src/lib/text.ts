/** Bỏ dấu tiếng Việt + chữ thường để tìm kiếm không phân biệt dấu ("Khăn Đỏ" → "khan do"). */
export function normalizeVietnamese(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Chuẩn hóa số điện thoại VN: "+84 912 345 678" → "0912345678". */
export function normalizePhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+84")) return `0${digits.slice(3)}`;
  if (digits.startsWith("84") && digits.length === 11) return `0${digits.slice(2)}`;
  return digits.replace(/\+/g, "");
}

export const VN_PHONE_REGEX = /^0[35789]\d{8}$/;
