# Báo cáo kiểm thử

Cập nhật: 2026-10-15 · Môi trường: macOS (arm64), Node 24.13, Supabase local (CLI 2.120.0), Chromium (Playwright 1.64.1).

## Tổng hợp

| Loại                                                  | Lệnh                       | Kết quả                               |
| ----------------------------------------------------- | -------------------------- | ------------------------------------- |
| Lint                                                  | `npm run lint`             | ✅ 0 lỗi, 0 cảnh báo                  |
| Typecheck                                             | `npm run typecheck`        | ✅                                    |
| Định dạng                                             | `npm run format:check`     | ✅                                    |
| Unit (Vitest, jsdom)                                  | `npm run test:unit`        | ✅ 61/61                              |
| Integration (Vitest + Supabase local)                 | `npm run test:integration` | ✅ 30/30                              |
| E2E (Playwright, build production, desktop + Pixel 7) | `npm run test:e2e`         | ✅ 58/58                              |
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

## Ghi chú

- E2E reset database local về dữ liệu demo trước mỗi lần chạy (`tests/e2e/global-setup.ts`).
- Trang 404 của route được stream trả mã 200 kèm `noindex` (hành vi chuẩn của Next.js 16 với Partial Prerender) — test kiểm tra `noindex`.
- Kiểm tra axe chạy sau khi animation có hạn kết thúc (`settleAnimations`), vì hiệu ứng mờ dần làm phép đo tương phản sai.
- React có thể tạm giữ bản sao ẩn của nội dung đang stream → test luôn chọn phần tử đang hiển thị (`visible()` trong `tests/e2e/support.ts`).
