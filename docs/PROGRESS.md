# Tiến độ triển khai

> Cập nhật sau mỗi milestone. Phiên mới: đọc mục **Bước tiếp theo** trước.

## Trạng thái

| Milestone                                                      | Trạng thái |
| -------------------------------------------------------------- | ---------- |
| M0 — Môi trường & scaffold                                     | ✅         |
| M1 — Database (schema, RLS, RPC, seed, integration test)       | ✅         |
| M2 — Thương hiệu & design system                               | ✅         |
| M3 — Storefront                                                | ✅         |
| M4 — Giỏ hàng                                                  | ✅         |
| M5 — Tài khoản                                                 | ✅         |
| M6 — Checkout & đơn hàng                                       | ✅         |
| M7 — Quản trị                                                  | ✅         |
| M8 — Hardening                                                 | ✅         |
| M9 — Tài liệu & bàn giao                                       | ✅         |
| M10 — Motion & giao diện (chuyển trang, lightbox, yêu thích)   | ✅         |
| M11 — Tài khoản nâng cao (quên/đổi mật khẩu, điền sẵn địa chỉ) | ✅         |
| M12 — Đánh giá thật từ khách đã mua                            | ✅         |
| M13 — Mã giảm giá                                              | ✅         |

> Cách cập nhật bảng: sửa trực tiếp ô trạng thái (Prettier có thể căn lại cột — kiểm tra lại sau khi format).

## Nhật ký

### M0 — Môi trường (2026-10-15)

- Node 24.13, npm 11.6, Docker qua OrbStack (đã cài sẵn; được khởi động trong phiên này), Git 2.49.
- Thư mục home `/Users/nguyenduchung` là một git repo → tạo **git repo riêng** trong `Tutuxinhxich/` để không commit vào repo home.
- Scaffold `create-next-app@16.4.1` (Cache Components + Partial Prefetching bật sẵn).
- Supabase CLI là devDependency **ghim 2.120.0** để dùng lại Docker image đã có (ổ đĩa còn ~14 GB).
- Cổng Supabase 544xx (API 54421) để không xung đột với dự án `~/khan-store` (Supabase cổng 543xx).
- Tắt service không dùng: realtime, edge runtime, analytics, storage vector.

### M1 — Database

- Migrations `supabase/migrations/20261015000{100..400}_*.sql`: enum + bảng → RLS/grants → RPC đơn hàng → storage.
- Trigger `products_enforce_limit` chặn sản phẩm thứ 7. Admin chỉ `update` các cột nội dung (SKU/slug khóa).
- RPC: `place_order` (giá từ DB, khóa hàng theo thứ tự, idempotent theo `client_request_id`), `admin_update_order_status`, `cancel_my_order`, `admin_dashboard_stats`, `shipping_fee_for`, `can_transition_order`.
- Seed: `supabase/seed.sql` (6 sản phẩm DEMO), `scripts/seed-users.ts` (admin + khách mẫu, chỉ chạy với Supabase local).
- Ảnh demo: `npm run images:generate` → `public/products/ttxx-00N/{main,detail-1,detail-2,detail-3}.webp`.
- Integration test: 30 test (RLS sản phẩm/hồ sơ/đơn, storage, đặt hàng, tồn kho, đồng thời, idempotency, luồng trạng thái, parity TS ↔ SQL).

### M2 — Thương hiệu & design system

- Ý tưởng thương hiệu: "chuyến tàu sắc màu" — tên Tu Tu Xình Xịch (tiếng còi + nhịp bánh tàu); 6 sản phẩm = 6 "toa" (Toa 01…06).
- Slogan: **"Xinh từng nút thắt, chất từng chuyến đi"**. Logo: đầu tàu nhỏ quàng khăn, khăn bay như làn khói (`src/components/brand/logo.tsx`, `src/app/icon.svg`).
- Token màu/bóng/animation trong `src/app/globals.css` (`@theme`): mực tím than `ink`, nền kem `cream`, bubblegum, berry, lilac, sky, sun, mint, night, gold; gradient `bg-aurora`, `bg-sunset`, `text-gradient`.
- Font hỗ trợ tiếng Việt: Bricolage Grotesque (tiêu đề), Fraunces italic (nhấn), Be Vietnam Pro (nội dung).
- UI: Button/ButtonLink, Badge, Price, Field/Input/Select/Textarea, Skeleton, Sheet (ngăn kéo có focus trap), Accordion, SectionHeading/Accent.
- Motion (`motion/react`, LazyMotion + `MotionConfig reducedMotion="user"`): Reveal, Stagger, ImageReveal, SplitText, Parallax, TiltCard, Marquee (CSS).
- Ảnh demo vẽ bằng code: `npm run images:generate`; ảnh chia sẻ/icon: `npx tsx scripts/images/generate-brand.ts`.

### M3 — Storefront

- Layout cửa hàng: announcement bar (marquee), header ẩn khi cuộn xuống/hiện khi cuộn lên, menu desktop có viên nhấn trượt, menu mobile, tìm kiếm (Ctrl/⌘+K), footer.
- Trang chủ: hero (chữ xuất hiện từng từ, thẻ khăn nổi + parallax theo chuột/cuộn, vé tàu xoay, đoàn tàu 6 toa chạy), dải marquee, bộ sưu tập 6 sản phẩm, "toa đặc biệt" (featured, nền đêm), lookbook polaroid parallax, câu chuyện thương hiệu, lý do chọn, hướng dẫn 4 cách quàng (tab có minh họa), đánh giá **ghi rõ demo**, CTA.
- `/bo-suu-tap`: lọc màu/chất liệu/giá, tìm không dấu, sắp xếp, URL đồng bộ, grid có animation layout, ngăn kéo lọc trên mobile.
- `/san-pham/[slug]`: gallery (kính lúp desktop, vuốt mobile), giá/giá gốc/% giảm, tồn kho, màu, accordion mô tả/chất liệu/bảo quản/giao hàng, JSON-LD Product, thanh mua nhanh mobile, sản phẩm liên quan.
- `/chinh-sach` (chính sách mẫu), 404, error boundary, robots, sitemap, OG image.

### M4 — Giỏ hàng

- `src/features/cart/domain.ts` (logic thuần) + store zustand (localStorage, làm sạch dữ liệu hỏng, đồng bộ giữa tab).
- Drawer trượt, thanh "còn X₫ để free ship" có đầu tàu chạy, ảnh bay vào giỏ, badge nảy, giới hạn min(tồn kho, 10), tự đối chiếu giỏ với tồn kho mới.

### M5 — Tài khoản

- Đăng ký/đăng nhập/đăng xuất bằng Server Actions + `useActionState`; `?next=` an toàn (chống open redirect); proxy chặn `/tai-khoan`, `/thanh-toan`, `/admin` khi chưa đăng nhập; giỏ hàng giữ nguyên sau đăng nhập.
- `/tai-khoan`: sửa họ tên/SĐT, lịch sử mua hàng; `/auth/confirm` cho xác nhận email ở production.

### M6 — Checkout & đơn hàng

- `/thanh-toan`: react-hook-form + zod (dùng chung server), gợi ý 34 tỉnh/thành, COD hoặc chuyển khoản **giả lập**, tóm tắt đối chiếu server; `placeOrderAction` → RPC `place_order` (idempotent).
- `/tai-khoan/don-hang/[code]`: banner chúc mừng (pháo giấy), timeline đầu tàu chạy theo trạng thái, khách tự hủy đơn khi "Chờ xác nhận" (hoàn kho).

### M7 — Quản trị

- `/admin`: số liệu (RPC `admin_dashboard_stats`), tồn kho 6 toa, đơn gần đây.
- `/admin/san-pham`: 6 sản phẩm, công tắc ẩn/hiện; `/admin/san-pham/[id]`: sửa tên, mô tả, chất liệu, nhóm chất liệu, kích thước, bảo quản, giá bán, giá gốc, tồn kho, nhãn, nổi bật, số toa, màu (tên + mã màu + nhóm), ảnh (tải lên Storage, chọn ảnh chính, sắp xếp, gỡ) + xem trước thẻ sản phẩm.
- `/admin/don-hang` (lọc trạng thái, tìm mã/SĐT/tên) và chi tiết đơn (chuyển trạng thái theo luồng, hủy có xác nhận → hoàn kho).
- Phân quyền 3 lớp: proxy (đăng nhập) → `getAdminUser()`/`requireAdmin()` trong mọi page/query/action → RLS.

### Kiểm thử (sau M7)

- Unit 57 · Integration 30 · E2E 49 (desktop + Pixel 7) — tất cả xanh. Chi tiết: `docs/TEST_REPORT.md`.

### M8 — Hardening

- Rà soát giao diện đã đăng nhập (giỏ, checkout, tài khoản, admin) trên desktop và 390px.
- Sửa: mất màu khi admin lưu (B-009), admin bị cắt trên mobile (B-010), link xác nhận email PKCE (B-011).
- Thêm Content-Security-Policy, security headers, E2E kiểm tra tràn ngang cho trang cần đăng nhập, hồi quy lưu sản phẩm.
- `npm audit --omit=dev`: 0 lỗ hổng.

### M9 — Tài liệu & bàn giao

- `README.md`, `docs/RUN_GUIDE.md`, `docs/PRODUCT_MANAGEMENT.md`, `docs/DEPLOY_GUIDE.md`, `docs/PROJECT_SPEC.md`, `docs/FINAL_REPORT.md`.
- Kiểm thử cuối: lint ✅ · typecheck ✅ · format ✅ · unit 57 ✅ · integration 30 ✅ · E2E 51 ✅ · build ✅.

### M10 — Motion & giao diện (phiên 2)

- **Chuyển trang** (yêu cầu #14 còn thiếu ở phiên 1) bằng React `<ViewTransition>` + View Transitions API: `PageTransition` bọc từng trang cửa hàng; mặc định mờ chéo + trồi nhẹ, link sản phẩm trượt tới (`nav-forward`), breadcrumb/quay lại trượt lui (`nav-back`); skeleton → nội dung có hiệu ứng trao tay (`SkeletonExit`/`ContentEnter`); header + thanh thông báo đứng yên; tắt khi "giảm chuyển động"; chỉ chạy khi điều hướng phía client (không ẩn HTML SSR).
- **Lightbox ảnh** toàn màn hình: ảnh bay ra/vào từ gallery (Motion `layoutId`), vuốt/phím ←→, bấm phóng 2× tại điểm bấm + kéo xem, thumbnail, Esc; giữ ảnh đang xem khi đóng.
- **Yêu thích** (`/yeu-thich`): nút tim trên thẻ & trang sản phẩm (nảy + chùm tim bay), đếm trên header, lưu localStorage, "Thêm tất cả vào giỏ"; sản phẩm hết hàng vẫn thả tim được.
- **Gợi ý cách quàng theo từng khăn**: dữ liệu 4 cách quàng tách ra `src/features/home/styling-data.ts`; khăn vuông/dài đọc từ ô "Kích thước".
- Sửa giao diện: header 375px không xuống dòng, hàng mua hàng trên mobile (nút "Thêm vào giỏ" rộng hết hàng).
- Kiểm thử: unit 61 · E2E 58 (thêm `tests/e2e/experience.spec.ts`).

### M11 — Tài khoản nâng cao (phiên 2)

- `/quen-mat-khau` → email tiếng Việt có thương hiệu (`supabase/templates/recovery.html`, link `token_hash` mở được trên thiết bị khác) → `/dat-lai-mat-khau` → `/tai-khoan?mat-khau=moi`. Thông báo giống nhau dù email có/không tồn tại.
- Đổi mật khẩu trong `/tai-khoan` (xác minh mật khẩu hiện tại trước). Link "Quên mật khẩu?" ở trang đăng nhập.
- Mẫu email xác nhận đăng ký tiếng Việt (`supabase/templates/confirmation.html`) — dùng khi bật xác nhận email ở production.
- Checkout tự điền họ tên/SĐT/địa chỉ của đơn gần nhất (`getLastShipping`).
- Kiểm thử: unit 64 · E2E 63 (thêm `tests/e2e/account.spec.ts`, đọc email qua API Mailpit) · integration 30.

### M12 — Đánh giá thật (phiên 2)

- Migration `20261016000100_product_reviews.sql`: bảng `product_reviews` (1 đánh giá/khách/sản phẩm), RPC `submit_review` (chỉ khi có đơn **Đã giao** chứa sản phẩm), `review_status_for_me`, view `product_review_stats`; tên hiển thị rút gọn ("Nguyễn Thị Hoa" → "Hoa N."); không ai đọc được `user_id` của người đánh giá.
- Trang sản phẩm: điểm trung bình, phân bố sao, danh sách có huy hiệu "Đã mua hàng", form chọn sao có hiệu ứng (sửa/xóa đánh giá của mình); sao trên thẻ sản phẩm; JSON-LD `aggregateRating`.
- Đơn đã giao có link "Viết đánh giá" từng sản phẩm. Trang chủ tự chuyển sang đánh giá thật khi có ≥ 3 đánh giá 4–5 sao (nhãn xanh), nếu chưa thì giữ nội dung demo (nhãn vàng).
- Admin `/admin/danh-gia`: ẩn/hiện đánh giá.
- Kiểm thử: unit 69 · integration 38 · E2E 66.

### M13 — Mã giảm giá (phiên 2)

- Migration `20261016000200_coupons.sql`: bảng `coupons` (%/số tiền, giảm tối đa, đơn tối thiểu, thời gian, tổng lượt, lượt/khách, bật/tắt), `coupon_redemptions`, cột `orders.discount` + `orders.coupon_code`, `place_order(…, p_coupon_code)` khóa dòng mã khi đặt đồng thời, `preview_coupon`, hủy đơn → trả lượt (`release_coupon`).
- Checkout: ô "Mã giảm giá" (Enter/Áp dụng, báo lý do không dùng được), dòng "Giảm giá", tổng mới; phí ship tính theo tạm tính trước giảm giá. Đơn hàng (khách & admin) hiện giảm giá + mã.
- Admin `/admin/ma-giam-gia`: tạo, bật/tắt, xóa (chỉ mã chưa dùng). 2 mã DEMO trong seed: `LENTAU10`, `CHAOBAN30K`.
- Kiểm thử: unit 78 · integration 45 (gồm đặt đồng thời giành lượt cuối, parity TS ↔ SQL) · E2E 70.

### Tổng kết phiên 2

- 5 commit: sửa tài liệu tiến độ (B-012) → M10 → M11 → M12 → M13. Không push, không deploy.
- Môi trường: OrbStack bị dừng giữa phiên (không do Claude) → đã bật lại, dừng lại container của `~/khan-store` như phiên trước.

## Bước tiếp theo

Toàn bộ milestone M0–M13 đã xong. Việc còn lại **cần chủ cửa hàng quyết định/cung cấp** (không tự làm):

1. Dữ liệu thật: tên/giá/ảnh chụp/tồn kho 6 sản phẩm (`/admin/san-pham`), thông tin liên hệ & mạng xã hội (`src/config/site.ts`), chính sách (`/chinh-sach`), tắt/xóa 2 mã giảm giá demo và dòng thông báo "mã demo" (`/admin/ma-giam-gia`, `src/config/site.ts`).
2. Deploy theo `docs/DEPLOY_GUIDE.md` (cần tài khoản Supabase, Vercel, tên miền, SMTP).
3. Cổng thanh toán thật (VNPay/MoMo/PayOS) qua webhook có xác thực.

Ý tưởng an toàn có thể làm ở phiên sau nếu muốn: email xác nhận đơn hàng (cần SMTP), sổ địa chỉ nhiều địa chỉ, xuất đơn hàng CSV cho admin, lịch sử biến động tồn kho, chế độ tối, Lighthouse/hiệu năng trên thiết bị thật.
