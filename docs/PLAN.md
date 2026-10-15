# Kế hoạch triển khai — Tu Tu Xình Xịch

Quy trình mỗi milestone: ANALYZE → PLAN → IMPLEMENT → TEST → REVIEW → FIX → RETEST → COMMIT → DOCUMENT.
Trạng thái chi tiết nằm ở `docs/PROGRESS.md`.

| #   | Milestone                   | Nội dung chính                                                                                                                                                                                                   | Kiểm thử                                                |
| --- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| M0  | Môi trường & scaffold       | Next.js 16.4, TS strict, Tailwind v4, Supabase CLI local (cổng 544xx), tooling (ESLint, Prettier, Vitest, Playwright), git repo riêng                                                                            | `lint`, `typecheck`                                     |
| M1  | Database                    | Schema 6 SKU (trigger chặn SKU thứ 7), profiles, orders, RLS + column grants, RPC `place_order`/`admin_update_order_status`/`cancel_my_order`, storage, seed demo, user mẫu                                      | Integration: RLS, RPC, tồn kho, đồng thời, idempotency  |
| M2  | Thương hiệu & design system | Logo, bảng màu, typography, token Tailwind, component UI cơ bản, ảnh minh họa 6 sản phẩm, motion primitives                                                                                                      | Unit cho tiện ích                                       |
| M3  | Storefront                  | Announcement bar, header (menu động, tìm kiếm), footer, trang chủ (hero, bộ sưu tập, featured, lookbook, câu chuyện, lý do chọn, phối đồ, review demo, CTA), `/bo-suu-tap` (lọc/tìm/sắp xếp), `/san-pham/[slug]` | Unit domain catalog; E2E trang chủ 6 SKU, chi tiết, lọc |
| M4  | Giỏ hàng                    | Store localStorage, drawer trượt, add-to-cart animation, giới hạn tồn kho, đối chiếu server                                                                                                                      | Unit cart domain; E2E giỏ hàng, tồn kho                 |
| M5  | Tài khoản                   | Đăng ký/đăng nhập/đăng xuất, proxy bảo vệ route, giữ giỏ sau đăng nhập, trang tài khoản                                                                                                                          | E2E auth                                                |
| M6  | Checkout & đơn hàng         | Checkout thử nghiệm (COD / chuyển khoản giả lập), trạng thái đơn + timeline, lịch sử mua, khách hủy đơn chờ xác nhận                                                                                             | Unit schema; E2E checkout                               |
| M7  | Quản trị                    | Dashboard, sửa 6 sản phẩm (giá, giá gốc, tên, mô tả, màu, ảnh upload, tồn kho, ẩn/hiện, nhãn), quản lý đơn & trạng thái                                                                                          | Integration quyền; E2E admin, chặn user thường          |
| M8  | Hardening                   | SEO (metadata, sitemap, robots, OG), a11y (axe), responsive 375px, reduced motion, security headers, lỗi/404, hiệu năng                                                                                          | E2E chất lượng, build                                   |
| M9  | Tài liệu & bàn giao         | RUN_GUIDE, PRODUCT_MANAGEMENT, DEPLOY_GUIDE, TEST_REPORT, FINAL_REPORT                                                                                                                                           | Chạy lại toàn bộ test                                   |

## Definition of Done (mỗi milestone)

- `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run test:unit` xanh
- Integration/E2E liên quan xanh (khi milestone có phần đó)
- Không có lỗi P0/P1 mở trong `docs/BUGS.md`
- `docs/PROGRESS.md` cập nhật, commit theo milestone (không push)
