# Tiến độ triển khai

> Cập nhật sau mỗi milestone. Phiên mới: đọc mục **Bước tiếp theo** trước.

## Trạng thái

| Milestone                                                | Trạng thái |
| -------------------------------------------------------- | ---------- |
| M0 — Môi trường & scaffold                               | ✅         |
| M1 — Database (schema, RLS, RPC, seed, integration test) | ✅         |
| M2 — Thương hiệu & design system                         | ⏳         |
| M3 — Storefront                                          | ⏳         |
| M4 — Giỏ hàng                                            | ⏳         |
| M5 — Tài khoản                                           | ⏳         |
| M6 — Checkout & đơn hàng                                 | ⏳         |
| M7 — Quản trị                                            | ⏳         |
| M8 — Hardening                                           | ⏳         |
| M9 — Tài liệu & bàn giao                                 | ⏳         |

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

## Bước tiếp theo

- M8: rà soát giao diện các trang còn lại (checkout, tài khoản, admin) trên desktop/mobile, hiệu năng, CSP.
- M9: viết `docs/RUN_GUIDE.md`, `docs/PRODUCT_MANAGEMENT.md`, `docs/DEPLOY_GUIDE.md`, `docs/PROJECT_SPEC.md`, `docs/FINAL_REPORT.md`, README.
