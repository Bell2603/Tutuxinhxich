/**
 * Chuyển lỗi từ Supabase (RPC/Postgres/Auth) thành thông báo tiếng Việt thân thiện,
 * không lộ chi tiết nội bộ. RPC dùng SQLSTATE P0001 với message là mã máy.
 */
export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "EMPTY_CART"
  | "INVALID_SHIPPING"
  | "INVALID_QUANTITY"
  | "INVALID_REQUEST"
  | "INSUFFICIENT_STOCK"
  | "PRODUCT_UNAVAILABLE"
  | "PRODUCT_LIMIT_REACHED"
  | "ORDER_NOT_FOUND"
  | "INVALID_TRANSITION"
  | "UNKNOWN";

type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string | null;
  detail?: string;
};

export type ParsedAppError = {
  code: AppErrorCode;
  message: string;
  context: Record<string, unknown>;
};

const KNOWN_CODES = new Set<AppErrorCode>([
  "AUTH_REQUIRED",
  "FORBIDDEN",
  "EMPTY_CART",
  "INVALID_SHIPPING",
  "INVALID_QUANTITY",
  "INVALID_REQUEST",
  "INSUFFICIENT_STOCK",
  "PRODUCT_UNAVAILABLE",
  "PRODUCT_LIMIT_REACHED",
  "ORDER_NOT_FOUND",
  "INVALID_TRANSITION",
]);

function parseContext(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function parseAppError(error: SupabaseLikeError | null | undefined): ParsedAppError {
  const rawCode = error?.message?.trim() ?? "";
  const code: AppErrorCode = KNOWN_CODES.has(rawCode as AppErrorCode)
    ? (rawCode as AppErrorCode)
    : "UNKNOWN";
  const context = parseContext(error?.details ?? error?.detail);
  return { code, context, message: messageFor(code, context) };
}

function messageFor(code: AppErrorCode, context: Record<string, unknown>): string {
  const name = typeof context.name === "string" ? `“${context.name}”` : "Sản phẩm";
  switch (code) {
    case "AUTH_REQUIRED":
      return "Bạn cần đăng nhập để tiếp tục.";
    case "FORBIDDEN":
      return "Bạn không có quyền thực hiện thao tác này.";
    case "EMPTY_CART":
      return "Giỏ hàng đang trống.";
    case "INVALID_SHIPPING":
      return "Thông tin nhận hàng chưa hợp lệ, vui lòng kiểm tra lại.";
    case "INVALID_QUANTITY":
      return `Số lượng của ${name} không hợp lệ (tối đa 10 mỗi sản phẩm).`;
    case "INVALID_REQUEST":
      return "Yêu cầu không hợp lệ, vui lòng tải lại trang.";
    case "INSUFFICIENT_STOCK": {
      const available = typeof context.available === "number" ? context.available : 0;
      return available > 0
        ? `${name} chỉ còn ${available} sản phẩm. Vui lòng giảm số lượng.`
        : `${name} vừa hết hàng. Vui lòng xóa khỏi giỏ hàng.`;
    }
    case "PRODUCT_UNAVAILABLE":
      return `${name} hiện không còn bán. Vui lòng xóa khỏi giỏ hàng.`;
    case "PRODUCT_LIMIT_REACHED":
      return "Cửa hàng chỉ bán đúng 6 mã sản phẩm.";
    case "ORDER_NOT_FOUND":
      return "Không tìm thấy đơn hàng.";
    case "INVALID_TRANSITION":
      return "Không thể chuyển đơn hàng sang trạng thái này.";
    default:
      return "Đã có lỗi xảy ra, vui lòng thử lại sau.";
  }
}

/** Lỗi đăng nhập/đăng ký từ Supabase Auth. */
export function authErrorMessage(
  error: { code?: string; message?: string; status?: number } | null,
): string {
  switch (error?.code) {
    case "invalid_credentials":
      return "Email hoặc mật khẩu không đúng.";
    case "email_not_confirmed":
      return "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.";
    case "user_already_exists":
    case "email_exists":
      return "Email này đã được đăng ký. Hãy đăng nhập nhé!";
    case "weak_password":
      return "Mật khẩu quá yếu, hãy dùng ít nhất 8 ký tự gồm chữ và số.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.";
    case "signup_disabled":
      return "Đăng ký tài khoản đang tạm đóng.";
    default:
      return "Không thể xử lý yêu cầu lúc này, vui lòng thử lại.";
  }
}
