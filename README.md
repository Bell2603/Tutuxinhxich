# Tu Tu Xình Xịch 🚂🧣

> _Xinh từng nút thắt, chất từng chuyến đi._

Website thương mại điện tử của thương hiệu khăn quàng cổ **Tu Tu Xình Xịch** — đúng 6 mẫu khăn ("6 toa tàu sắc màu"), giao diện thời trang rực rỡ với animation mượt, giỏ hàng, đăng nhập, thanh toán thử nghiệm và trang quản trị.

> Sản phẩm, hình ảnh minh họa, đánh giá và thanh toán hiện là **dữ liệu demo**.

## Chạy nhanh

```bash
orb start                # bật Docker (OrbStack)
npm install
npm run db:start         # Supabase local (cổng 544xx)
npm run env:local        # tạo .env.local
npm run db:reset         # dữ liệu demo + tài khoản mẫu (XÓA dữ liệu local cũ)
npm run dev              # http://localhost:3000
```

Admin local: `admin@tutuxinhxich.local` / `TuTuAdmin@2026` → http://localhost:3000/admin

## Công nghệ

Next.js 16.4 (App Router, Cache Components) · React 19 · TypeScript strict · Tailwind CSS v4 · Motion for React · Supabase (Postgres, RLS, Auth, Storage) · zod · react-hook-form · zustand · Vitest · Playwright.

## Tài liệu

| Tài liệu                                                                  | Nội dung                                                |
| ------------------------------------------------------------------------- | ------------------------------------------------------- |
| [docs/RUN_GUIDE.md](docs/RUN_GUIDE.md)                                    | Cài đặt, chạy, tắt, xử lý lỗi thường gặp                |
| [docs/PRODUCT_MANAGEMENT.md](docs/PRODUCT_MANAGEMENT.md)                  | Sửa giá, giá gốc, tên, ảnh, tồn kho, ẩn/hiện 6 sản phẩm |
| [docs/DEPLOY_GUIDE.md](docs/DEPLOY_GUIDE.md)                              | Supabase Cloud + Vercel, tên miền, migration, rollback  |
| [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md)                              | Đặc tả thương hiệu & sản phẩm                           |
| [docs/PLAN.md](docs/PLAN.md) · [docs/PROGRESS.md](docs/PROGRESS.md)       | Kế hoạch milestone, tiến độ                             |
| [docs/TEST_REPORT.md](docs/TEST_REPORT.md) · [docs/BUGS.md](docs/BUGS.md) | Kiểm thử, danh sách lỗi                                 |
| [docs/DECISIONS.md](docs/DECISIONS.md)                                    | Quyết định kỹ thuật                                     |
| [docs/FINAL_REPORT.md](docs/FINAL_REPORT.md)                              | Báo cáo tổng kết                                        |
| [CLAUDE.md](CLAUDE.md)                                                    | Quy ước cho phiên làm việc với Claude Code              |

## Kiểm thử

```bash
npm run lint && npm run typecheck && npm run format:check && npm run test:unit
npm run test:integration   # cần Supabase local
npm run test:e2e           # build production + Playwright (reset DB local)
```
