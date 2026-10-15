# Tu Tu Xình Xịch — website bán khăn quàng cổ (đúng 6 SKU)

@AGENTS.md

## Bắt đầu mỗi phiên

1. Đọc file này → `docs/PLAN.md` → `docs/PROGRESS.md` (mục "Bước tiếp theo") → `docs/BUGS.md` (lỗi đang mở).
2. `git status` + `git log --oneline -10` để biết checkpoint gần nhất.
3. Bật môi trường: OrbStack/Docker → `npm run db:start` → `npm run env:local` (nếu thiếu `.env.local`).
4. Tiếp tục milestone đầu tiên chưa ✅ trong `docs/PLAN.md`. Không làm lại phần đã xong.

## Kết thúc mỗi phiên / milestone

Chạy kiểm tra → cập nhật `docs/PROGRESS.md` (đã làm, bước tiếp theo), `docs/BUGS.md`, `docs/TEST_REPORT.md`,
`docs/DECISIONS.md` (nếu có quyết định mới) → commit trên nhánh hiện tại. **Không push.**

## Stack

- Next.js 16.4 (App Router, Turbopack, `cacheComponents` + `partialPrefetching`, `typedRoutes`, `src/proxy.ts` thay middleware), React 19.3, TypeScript strict (+`noUncheckedIndexedAccess`)
- Tailwind CSS v4 (token trong `src/app/globals.css`), Motion for React (`motion/react`), lucide-react, sonner
- Supabase (Postgres + RLS + RPC, Auth email/mật khẩu, Storage) — local qua Docker (OrbStack), CLI là devDependency **ghim 2.120.0** (`npx supabase`)
- zod v4, react-hook-form, zustand (giỏ hàng localStorage)
- Vitest 5 (`unit` + `integration`), Playwright (E2E desktop + mobile), ESLint 9, Prettier

## Cổng local (khác mặc định để không đụng dự án khác)

API 54421 · DB 54422 · Studio 54423 · Mailpit 54424 · Next.js 3000

## Cấu trúc

```
src/app/(shop)/…          Cửa hàng: trang chủ, /bo-suu-tap, /san-pham/[slug], /thanh-toan, /tai-khoan, /dang-nhap, /dang-ky
src/app/admin/…           Quản trị: /admin, /admin/san-pham, /admin/don-hang
src/features/<tên>/       catalog · cart · checkout · orders · auth · admin
  domain.ts               Logic thuần → unit test (*.test.ts cạnh file)
  schemas.ts              zod dùng chung client + server
  queries.ts              Đọc dữ liệu (server-only)
  actions.ts              Server Actions: validate → kiểm quyền → Supabase → ActionResult
  components/
src/components/           UI dùng chung (ui/, brand/, motion/, layout/)
src/lib/                  supabase clients, env, format, text, errors, safe-redirect
supabase/migrations/      Schema, RLS, RPC, storage — KHÔNG sửa file đã commit, thêm migration mới
supabase/seed.sql         6 sản phẩm DEMO
scripts/                  env:local, seed-users, images/generate (ảnh demo)
tests/integration/        Vitest + Supabase local thật (RLS, RPC)
tests/e2e/                Playwright
```

## Lệnh kiểm tra (Definition of Done)

```bash
npm run lint && npm run typecheck && npm run format:check && npm run test:unit
npm run test:integration        # cần Supabase local
npm run build                   # production build
npm run test:e2e                # tự build + start, cần Supabase local; reset dữ liệu trước khi chạy
```

## Quy tắc

- Đúng **6 sản phẩm**: database chặn sản phẩm thứ 7 (trigger). Admin chỉ sửa/ẩn, không tạo/xóa.
- Giá luôn tính lại ở database (`place_order`), không tin giá từ client. Hằng số phí ship/giới hạn số lượng phải khớp TS ↔ SQL.
- Quyền admin kiểm tra ở server: `requireAdmin()` trong mọi query/action admin + RLS. Không dùng `SUPABASE_SECRET_KEY` trong `src/`.
- Mọi đọc cookie/dữ liệu động phải nằm trong `<Suspense>` (Cache Components). `createClient()` server đã gọi `connection()`.
- Không commit `.env*` (trừ `.env.example`). Không push, không deploy, không bật thanh toán thật.
- `npm run db:reset` xóa sạch DB local (chỉ local, có kiểm tra host).
- Animation: dùng `motion/react`, tôn trọng `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` + CSS).
- UI tiếng Việt, tiền tệ `formatVND()`.
