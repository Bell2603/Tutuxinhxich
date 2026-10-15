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

## Bước tiếp theo

- M2: design system (globals.css tokens, fonts, Logo, Button, Badge…), rồi M3 storefront.
