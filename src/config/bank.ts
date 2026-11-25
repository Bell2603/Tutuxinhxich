/**
 * Tài khoản nhận CHUYỂN KHOẢN của cửa hàng — khách tự chuyển theo thông tin + mã VietQR trên trang đơn hàng.
 * Website không tích hợp cổng thanh toán và không tự xác nhận tiền về: chủ shop kiểm tra sao kê rồi xác nhận đơn.
 *
 * ⚠️ Đang là GIÁ TRỊ MẪU. Khi còn giá trị mẫu, lựa chọn "Chuyển khoản" bị ẩn ở checkout và trang đơn hàng.
 * Cách điền:
 * - bankName: tên ngân hàng hiển thị cho khách, VD "Vietcombank".
 * - bin: mã ngân hàng 6 số theo NAPAS (dùng để tạo mã QR), VD Vietcombank 970436, VietinBank 970415,
 *   BIDV 970418, Agribank 970405, MB 970422, Techcombank 970407, ACB 970416, VPBank 970432, TPBank 970423.
 *   Danh sách đầy đủ: https://api.vietqr.io/v2/banks (trường "bin").
 * - accountNumber: số tài khoản (chỉ chữ số).
 * - accountName: tên chủ tài khoản, IN HOA KHÔNG DẤU đúng như trên app ngân hàng.
 */
export const bank = {
  bankName: "ĐIỀN TÊN NGÂN HÀNG",
  bin: "ĐIỀN MÃ BIN 6 SỐ",
  accountNumber: "ĐIỀN SỐ TÀI KHOẢN",
  accountName: "ĐIỀN TÊN CHỦ TÀI KHOẢN",
};

export type BankAccount = typeof bank;
