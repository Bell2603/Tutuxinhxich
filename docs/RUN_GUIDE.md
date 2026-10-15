# Hướng dẫn chạy website Tu Tu Xình Xịch trên máy của bạn

Tài liệu này dành cho người chưa nhiều kinh nghiệm. Làm lần lượt từng bước, gõ lệnh trong ứng dụng **Terminal** (macOS).

---

## 1. Phần mềm cần có

| Phần mềm | Phiên bản                                      | Kiểm tra bằng lệnh | Ghi chú                              |
| -------- | ---------------------------------------------- | ------------------ | ------------------------------------ |
| Node.js  | ≥ 22 (máy hiện dùng 24.13)                     | `node -v`          | Tải tại https://nodejs.org (bản LTS) |
| npm      | đi kèm Node.js                                 | `npm -v`           |                                      |
| Docker   | OrbStack (đã cài trên máy) hoặc Docker Desktop | `docker info`      | Supabase local chạy trong Docker     |
| Git      | bất kỳ                                         | `git --version`    |                                      |

**Không cần** cài Supabase CLI riêng — dự án đã kèm sẵn (gọi bằng `npx supabase`, phiên bản ghim 2.120.0).

> Supabase local cần khoảng 4–5 GB dung lượng ổ đĩa cho Docker image (đã có sẵn trên máy này).

---

## 2. Chạy lần đầu

```bash
# 1) Bật Docker (OrbStack)
orb start                 # hoặc mở ứng dụng OrbStack / Docker Desktop

# 2) Vào thư mục dự án
cd ~/Tutuxinhxich

# 3) Cài thư viện (chỉ cần khi mới tải dự án hoặc khi package.json thay đổi)
npm install

# 4) Khởi động database Supabase local (lần đầu có thể mất vài phút)
npm run db:start

# 5) Tạo file cấu hình .env.local từ Supabase local
npm run env:local

# 6) Nạp dữ liệu demo (6 sản phẩm) + tài khoản mẫu
npm run db:reset

# 7) Chạy website
npm run dev
```

Mở trình duyệt tại **http://localhost:3000** 🎉

> ⚠️ `npm run db:reset` **xóa sạch** database local rồi tạo lại dữ liệu demo. Chỉ chạy lần đầu hoặc khi muốn làm lại từ đầu. Lệnh này tự từ chối chạy nếu không phải Supabase local.

---

## 3. Địa chỉ truy cập

| Trang                                           | URL                         |
| ----------------------------------------------- | --------------------------- |
| Website (cửa hàng)                              | http://localhost:3000       |
| Trang quản trị                                  | http://localhost:3000/admin |
| Supabase Studio (xem/sửa bảng dữ liệu)          | http://127.0.0.1:54423      |
| Mailpit (hộp thư thử nghiệm của Supabase local) | http://127.0.0.1:54424      |
| API Supabase local                              | http://127.0.0.1:54421      |

Cổng Supabase của dự án là **544xx** (khác mặc định 543xx) để không đụng dự án `~/khan-store` trên cùng máy.

### Tài khoản mẫu (chỉ có ở môi trường local)

| Vai trò       | Email                      | Mật khẩu         |
| ------------- | -------------------------- | ---------------- |
| Quản trị viên | `admin@tutuxinhxich.local` | `TuTuAdmin@2026` |
| Khách hàng    | `khach@tutuxinhxich.local` | `KhachXinh@2026` |

Có thể đổi trong `.env.local` (biến `SEED_*`) rồi chạy `npm run db:seed-users`.

---

## 4. Tắt website

1. Ở cửa sổ Terminal đang chạy `npm run dev`: nhấn **Ctrl + C**.
2. Tắt database (dữ liệu vẫn được giữ lại): `npm run db:stop`
3. (Tùy chọn) Tắt Docker để tiết kiệm pin/RAM: `orb stop`

## 5. Chạy lại những lần sau

```bash
orb start
cd ~/Tutuxinhxich
npm run db:start
npm run dev
```

## 6. Chạy bản production trên máy (giống khi deploy)

```bash
npm run build
npm run start      # http://localhost:3000
```

## 7. Kiểm thử

```bash
npm run lint              # kiểm tra code
npm run typecheck         # kiểm tra kiểu TypeScript
npm run test:unit         # unit test (không cần database)
npm run test:integration  # cần Supabase local đang chạy
npm run test:e2e          # Playwright: tự build + chạy ở cổng 3100, RESET database local về dữ liệu demo
```

> `npm run test:e2e` reset database local trước khi chạy. Muốn giữ dữ liệu đang có: `E2E_SKIP_RESET=1 npm run test:e2e`.

---

## 8. Lỗi thường gặp

| Hiện tượng                                                                    | Cách xử lý                                                                                                        |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `Cấu hình môi trường không hợp lệ` khi chạy web                               | Chạy `npm run db:start` rồi `npm run env:local`.                                                                  |
| `Cannot connect to the Docker daemon` / `failed to connect to the docker API` | Docker chưa bật: `orb start` (hoặc mở Docker Desktop), đợi 10 giây rồi thử lại.                                   |
| `port 54421 already in use` khi `db:start`                                    | Một Supabase khác đang chạy cổng này. Xem `docker ps`, dừng dự án kia (`cd ~/khan-store && npx supabase stop`).   |
| `Port 3000 is in use`                                                         | Có web khác đang chạy. Tắt nó, hoặc chạy cổng khác: `npx next dev -p 3001`.                                       |
| Web báo lỗi tải dữ liệu / trang trắng phần sản phẩm                           | Database chưa chạy: `npm run db:status`; nếu dừng thì `npm run db:start`.                                         |
| Đăng nhập báo lỗi sau khi `db:reset`                                          | Phiên đăng nhập cũ không còn hợp lệ: đăng xuất hoặc xóa cookie `localhost`, rồi đăng nhập lại.                    |
| Giỏ hàng hiển thị lạ                                                          | Xóa dữ liệu trình duyệt của `localhost` (key `ttxx-cart` trong Local Storage).                                    |
| Đổi màu trong `globals.css` mà bản build không đổi                            | Xóa thư mục build: `rm -rf .next` rồi build lại.                                                                  |
| Ảnh tải lên không hiện                                                        | Kiểm tra `NEXT_PUBLIC_SUPABASE_URL` trong `.env.local` đúng với `npm run db:status`; khởi động lại `npm run dev`. |
| Ổ đĩa đầy                                                                     | Xóa ảnh Docker không dùng: `docker image prune` (cẩn thận, không xóa volume dữ liệu).                             |
