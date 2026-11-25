# Báo cáo kiểm thử

Cập nhật: 2026-10-15 (phiên 2) · Môi trường: macOS (arm64), Node 24.13, Supabase local (CLI 2.120.0), Chromium (Playwright 1.64.1).

## Tổng hợp

| Loại                                                  | Lệnh                       | Kết quả                               |
| ----------------------------------------------------- | -------------------------- | ------------------------------------- |
| Lint                                                  | `npm run lint`             | ✅ 0 lỗi, 0 cảnh báo                  |
| Typecheck                                             | `npm run typecheck`        | ✅                                    |
| Định dạng                                             | `npm run format:check`     | ✅                                    |
| Unit (Vitest, jsdom)                                  | `npm run test:unit`        | ✅ 78/78                              |
| Integration (Vitest + Supabase local)                 | `npm run test:integration` | ✅ 45/45                              |
| E2E (Playwright, build production, desktop + Pixel 7) | `npm run test:e2e`         | ✅ 70/70                              |
| Production build                                      | `npm run build`            | ✅ mọi trang là Partial Prerender (◐) |

## Phạm vi theo yêu cầu bắt buộc

| Yêu cầu                           | Kiểm thử                                                                                                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trang chủ hoạt động               | E2E `storefront.spec.ts` › Trang chủ (desktop + mobile)                                                                                                                 |
| Chính xác 6 SKU hiển thị          | E2E (6 thẻ, đúng SKU TTXX-001…006) + Integration (DB đúng 6, chặn SKU thứ 7)                                                                                            |
| Trang chi tiết hoạt động          | E2E chi tiết sản phẩm (giá, giá gốc, SKU, tồn kho, JSON-LD), 404 khi không tồn tại/ẩn                                                                                   |
| Giá sản phẩm chính xác            | E2E so giá trên trang với database; Unit `formatVND`, `discountPercent`                                                                                                 |
| Giỏ hàng tính tiền đúng           | Unit `summarizeCart`/phí ship; E2E tạm tính, free ship ≥ 500.000₫, phí 30.000₫                                                                                          |
| Không mua vượt tồn kho            | Unit `addLine`/`clampQuantity`; E2E giới hạn 5 chiếc, nút khóa; E2E server chặn khi kho đổi lúc thanh toán; Integration `INSUFFICIENT_STOCK` + 2 khách tranh chiếc cuối |
| Đăng nhập/đăng ký                 | E2E đăng ký → đăng xuất → đăng nhập, lỗi validation, sai mật khẩu, email trùng, chống open redirect                                                                     |
| Checkout thử nghiệm               | E2E khách vãng lai → đăng nhập giữ giỏ → đặt hàng → trừ kho → lịch sử → hủy → hoàn kho                                                                                  |
| User thường không vào admin       | E2E (trang `/admin*` hiển thị "Không có quyền", form không render); Integration RLS + RPC `FORBIDDEN`                                                                   |
| API có validation & authorization | Unit zod schema; Integration RLS/RPC; E2E `/api/catalog` chỉ trả dữ liệu công khai                                                                                      |
| Giao diện mobile                  | E2E project `mobile` (Pixel 7); không tràn ngang ở 375px cho trang công khai, tài khoản, checkout và admin                                                              |
| Animation không gây lỗi           | E2E bật `prefers-reduced-motion`; duyệt nhiều trang không lỗi JS                                                                                                        |
| Không lỗi JS nghiêm trọng         | E2E `trackErrors` trên các trang chính                                                                                                                                  |
| Production build                  | `npm run build` + E2E chạy trên bản build                                                                                                                               |
| Accessibility                     | axe (WCAG 2.1 AA) trên 5 trang: 0 lỗi serious/critical                                                                                                                  |
| Bảo mật header                    | E2E: CSP, X-Frame-Options, nosniff, Referrer-Policy, không lộ X-Powered-By                                                                                              |
| Hồi quy lưu sản phẩm (B-009)      | E2E admin: lưu không làm đổi màu/ảnh/mô tả                                                                                                                              |

## Bổ sung phiên 2

| Hạng mục         | Kiểm thử                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| Lightbox         | E2E: mở, phím ←→, nút tiếp, Esc, gallery giữ ảnh đang xem; chạm mở trên mobile                                      |
| Yêu thích        | Unit `toggleWishlist`/`sanitizeWishlist`; E2E thả tim → đếm → tải lại → `/yeu-thich` → thêm tất cả vào giỏ → bỏ tim |
| Chuyển trang     | E2E: `startViewTransition` nhận type `nav-forward`/`nav-back`, không lỗi JS                                         |
| Gợi ý cách quàng | Unit `scarfShape`; E2E khăn vuông ↔ khăn dài                                                                        |

| Quên/đặt lại mật khẩu | E2E: yêu cầu link → đọc email trong Mailpit → đặt mật khẩu mới → đăng nhập; email lạ nhận cùng thông báo; link hết hạn |
| Đổi mật khẩu | Unit schema; E2E sai mật khẩu hiện tại bị từ chối, đổi thành công đăng nhập được |
| Checkout điền sẵn | E2E đơn thứ hai tự điền địa chỉ đơn trước |

| Đánh giá thật | Integration: chưa giao không viết được, chỉ sản phẩm đã mua, giới hạn sao/độ dài, viết lại = cập nhật, không lộ `user_id`, admin ẩn, thống kê chỉ tính đánh giá hiển thị, xóa của mình; E2E viết từ đơn đã giao → hiện trên trang/thẻ/JSON-LD, khách chưa mua không có form, admin ẩn |

| Mã giảm giá | Unit công thức/nhãn/trạng thái/schema; Integration xem trước (hợp lệ, chưa đủ tối thiểu, sai mã, tắt, hết hạn, chưa bắt đầu), đặt hàng trừ đúng, 1 lần/khách, hủy trả lượt, 2 khách giành lượt cuối, quyền admin, parity TS ↔ SQL; E2E áp mã ở checkout → đơn lưu giảm giá, dùng lại bị từ chối, chưa đủ tối thiểu, admin tạo/tắt/xóa |

## Bổ sung phiên 3 (2026-11-25, Playwright 1.64.1)

| Hạng mục         | Kiểm thử                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trang mới        | E2E: menu/footer dẫn tới `/phoi-khan`, `/ve-chung-toi`, `/hoi-dap`; trang chủ không còn `#cau-chuyen`/`#phoi-do`, chỉ 1 `h1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Về chúng tôi     | E2E: liên hệ khớp `site.contact`, iframe Maps đúng `src`, tải được qua CSP, không lỗi console (desktop + mobile)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| FAQ ↔ chính sách | Unit `policies/content.test.ts` (phí ship & số ngày đổi trả dùng hằng số); E2E accordion mở/đóng, nội dung khớp `/chinh-sach`                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| A11y             | axe trên 8 trang (thêm 3 trang mới): 0 lỗi serious/critical                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Chuyển khoản     | Unit `bank-transfer.test.ts` (placeholder → ẩn, bỏ dấu/in hoa, ≤ 50 ký tự giữ mã đơn + SĐT, CRC16 chuẩn `29B1`, cấu trúc VietQR), `copy-button.test.tsx`; E2E: chưa cấu hình → checkout không có chuyển khoản; có cấu hình → trang đơn đúng STK/số tiền/nội dung, QR, sao chép vào clipboard, hủy đơn thì ẩn; đơn COD không có khối chuyển khoản. Đối chiếu thủ công: chuỗi QR trùng img.vietqr.io, QR trên trang giải mã đúng                                                                                                                                                                              |
| Chatbot          | Unit: schema (độ dài, số lượt, tin cuối của khách, vai lạ), `trimHistory`, `splitReply` (chỉ link nội bộ), `liveChannels` (bỏ link mẫu/lạ), system prompt chứa dữ liệu thật + quy tắc, client Gemini (header khóa, body, thinkingLevel, bị chặn, lộ canary, 429/500, timeout, MAX_TOKENS). Integration: giới hạn phút/ngày, tách IP, từ chối đầu vào lạ, anon không đọc/ghi bảng. E2E (server Gemini giả lập cổng 3199): hỏi đáp + request chứa đủ 6 sản phẩm/giá/chính sách, lịch sử, lỗi 500, chặn lộ chỉ dẫn, giới hạn 500 ký tự, nút Chat với nhân viên, 403/400/413, 429 + Retry-After, axe khung chat |

| Đối tác | Unit `partners-section.test.tsx` (rỗng → không render; link tab mới + `rel`; chia cột không sót); E2E section/menu ẩn khi rỗng, có đối tác thì link khớp config (đã chạy thêm với 4 đối tác tạm); hero → `/phoi-khan` |

Kết quả M14: lint/typecheck/format ✅ · unit 81/81 · integration 45/45 · build ✅ · E2E 77 pass, 4 fail có từ trước (B-017, B-018), 3 skip.
Kết quả M15: unit 85/85 · integration 45/45 · build ✅ · E2E 80 pass, 4 fail có từ trước (B-017, B-018), 3 skip.
Kết quả M16: unit 94/94 · integration 45/45 · build ✅ · E2E 81 pass, 4 fail có từ trước (B-017, B-018), 5 skip (2 test chuyển khoản tự bỏ qua khi `src/config/bank.ts` còn giá trị mẫu — đã chạy xanh với tài khoản thử). Một lần chạy trước đó chậm bất thường (27 phút) làm 3 test mobile (giỏ hàng, checkout, yêu thích) quá thời gian; chạy lại riêng và chạy lại cả bộ đều xanh.
Kết quả M17: unit 116/116 · integration 50/50 (thêm 5 test RPC `chat_rate_hit`) · build ✅ · E2E 89 pass, 5 fail (4 có từ trước B-017/B-018 + 1 chập chờn B-019, chạy riêng 3/3 xanh), 5 skip.

## Ghi chú

- E2E reset database local về dữ liệu demo trước mỗi lần chạy (`tests/e2e/global-setup.ts`).
- Trang 404 của route được stream trả mã 200 kèm `noindex` (hành vi chuẩn của Next.js 16 với Partial Prerender) — test kiểm tra `noindex`.
- Kiểm tra axe chạy sau khi animation có hạn kết thúc (`settleAnimations`), vì hiệu ứng mờ dần làm phép đo tương phản sai.
- React có thể tạm giữ bản sao ẩn của nội dung đang stream → test luôn chọn phần tử đang hiển thị (`visible()` trong `tests/e2e/support.ts`).
