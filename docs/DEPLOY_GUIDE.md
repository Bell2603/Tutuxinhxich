# Hướng dẫn đưa website lên Internet (Supabase Cloud + Vercel)

> ⚠️ Việc deploy, tạo tài khoản dịch vụ, tên miền và thanh toán thật là quyết định của chủ cửa hàng. Tài liệu này mô tả các bước; **chưa có bước nào được thực hiện tự động**.

Kiến trúc production:

```
Khách hàng ──► Vercel (Next.js 16) ──► Supabase Cloud (Postgres + Auth + Storage)
```

Chi phí khởi đầu có thể là 0₫ (Vercel Hobby + Supabase Free). Khi bán thật nên cân nhắc Supabase Pro (sao lưu hằng ngày, không tự tạm dừng project).

---

## 0. Chuẩn bị

- Tài khoản GitHub (để Vercel lấy mã nguồn), Supabase (https://supabase.com), Vercel (https://vercel.com).
- Đưa mã nguồn lên một repository **riêng tư** trên GitHub (dự án hiện chỉ có git local, chưa push):
  ```bash
  cd ~/Tutuxinhxich
  git remote add origin git@github.com:<tai-khoan>/tutuxinhxich.git
  git push -u origin main
  ```
- Chạy đủ kiểm thử trên máy trước (xem `docs/RUN_GUIDE.md` mục 7).

## 1. Tạo database production trên Supabase Cloud

1. Supabase Dashboard → **New project** → đặt tên `tutuxinhxich`, region **Southeast Asia (Singapore)**, đặt **Database password** mạnh và lưu vào trình quản lý mật khẩu.
2. Ghi lại **Project ref** (chuỗi trong URL `https://supabase.com/dashboard/project/<ref>`).
3. Vào **Project Settings → API Keys**: lấy **Project URL** và **Publishable key**. (Secret key **không** cần cho website.)

## 2. Chạy migration an toàn (tạo bảng, phân quyền, hàm, storage)

```bash
cd ~/Tutuxinhxich
npx supabase login                        # mở trình duyệt để đăng nhập
npx supabase link --project-ref <ref>      # nhập Database password khi được hỏi
npx supabase db push --dry-run             # XEM TRƯỚC: liệt kê migration sẽ chạy, chưa thay đổi gì
npx supabase db push                       # áp dụng migration
```

- `db push` chỉ chạy các file trong `supabase/migrations/` **chưa từng chạy**, không xóa dữ liệu.
- **Tuyệt đối không** chạy `supabase db reset --linked` trên production (xóa sạch dữ liệu).

### Nạp 6 sản phẩm ban đầu (một lần duy nhất)

Chọn **một** trong hai cách:

- `npx supabase db push --include-seed` ngay lần push đầu tiên, **hoặc**
- Dashboard → **SQL Editor** → dán nội dung `supabase/seed.sql` → **Run**.

Sau đó thay dữ liệu demo bằng dữ liệu thật qua trang `/admin/san-pham` (xem `docs/PRODUCT_MANAGEMENT.md`).

## 3. Cấu hình đăng nhập (Supabase → Authentication)

1. **URL Configuration**
   - Site URL: `https://<tên-miền-của-bạn>` (tạm thời có thể là `https://<project>.vercel.app`).
   - Redirect URLs: thêm `https://<tên-miền>/auth/confirm` và `https://<project>.vercel.app/auth/confirm`.
2. **Providers → Email**: bật **Confirm email** (khách phải xác nhận email trước khi đăng nhập). Website đã có trang xử lý link xác nhận `/auth/confirm`.
3. **Password**: độ dài tối thiểu **8** (khớp với kiểm tra trên website).
4. **SMTP**: dịch vụ email mặc định của Supabase giới hạn rất ít email/giờ — cấu hình SMTP riêng (VD Resend, Brevo, Amazon SES) ở **Project Settings → Authentication → SMTP**.
5. (Tùy chọn) Sửa mẫu email xác nhận sang tiếng Việt: **Authentication → Email Templates**. Link trong mẫu "Confirm signup" nên là:
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/tai-khoan`

## 4. Tạo tài khoản quản trị đầu tiên

1. Sau khi website chạy (bước 5), tự đăng ký một tài khoản bằng email của bạn và xác nhận email.
2. Supabase → **SQL Editor**:
   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'email-cua-ban@example.com');
   ```
3. Đăng xuất rồi đăng nhập lại → vào `/admin`.

> Không dùng `npm run db:seed-users` cho production (script này chỉ chạy với Supabase local).

## 5. Deploy lên Vercel

1. Vercel → **Add New → Project** → chọn repository GitHub `tutuxinhxich`. Framework tự nhận **Next.js**.
2. **Environment Variables** (áp dụng cho Production và Preview):

   | Tên                                    | Giá trị                                                |
   | -------------------------------------- | ------------------------------------------------------ |
   | `NEXT_PUBLIC_SUPABASE_URL`             | Project URL của Supabase (`https://<ref>.supabase.co`) |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_…`)                   |
   | `NEXT_PUBLIC_SITE_URL`                 | `https://<tên-miền>` (hoặc URL `.vercel.app` lúc đầu)  |

   **Không** thêm `SUPABASE_SECRET_KEY` lên Vercel — website không cần, càng ít nơi giữ khóa bí mật càng an toàn.

3. **Settings → General → Node.js Version**: chọn 22.x hoặc 24.x.
4. Bấm **Deploy**. Ảnh tải lên từ Supabase Storage được cho phép tự động dựa trên `NEXT_PUBLIC_SUPABASE_URL` (xem `next.config.ts`).

## 6. Tên miền

1. Vercel → Project → **Settings → Domains** → thêm `tutuxinhxich.vn` (ví dụ) và `www.tutuxinhxich.vn`.
2. Tại nhà cung cấp tên miền, tạo bản ghi DNS theo hướng dẫn Vercel hiển thị (thường là `A 76.76.21.21` cho tên miền gốc và `CNAME cname.vercel-dns.com` cho `www`).
3. Đợi DNS cập nhật (vài phút đến vài giờ), Vercel tự cấp HTTPS.
4. Cập nhật lại `NEXT_PUBLIC_SITE_URL` trên Vercel và **Site URL / Redirect URLs** trên Supabase theo tên miền mới → **Redeploy**.

## 7. Kiểm thử sau deploy (checklist)

- [ ] Trang chủ hiển thị đúng 6 sản phẩm, giá đúng.
- [ ] `/bo-suu-tap`: lọc màu/chất liệu/giá, tìm kiếm hoạt động.
- [ ] Trang chi tiết sản phẩm, thêm vào giỏ, đổi số lượng, giỏ giữ sau khi tải lại.
- [ ] Đăng ký → nhận email xác nhận → đăng nhập.
- [ ] Đặt một đơn thử nghiệm → đơn xuất hiện ở `/tai-khoan` và `/admin/don-hang`; tồn kho giảm.
- [ ] Hủy đơn thử → tồn kho hoàn lại.
- [ ] Tài khoản thường mở `/admin` → thấy "Không có quyền truy cập".
- [ ] Admin sửa giá/ảnh một sản phẩm → cửa hàng cập nhật.
- [ ] `https://<tên-miền>/robots.txt` và `/sitemap.xml` có đúng tên miền.
- [ ] Kiểm tra trên điện thoại thật (iOS Safari, Android Chrome).

## 8. Cập nhật phiên bản mới

1. Phát triển và kiểm thử trên máy (`npm run lint && npm run typecheck && npm run test:unit && npm run test:integration && npm run test:e2e`).
2. Nếu có migration mới: chạy `npx supabase db push --dry-run` rồi `npx supabase db push` **trước** khi đưa code dùng migration đó lên production. Viết migration theo hướng tương thích ngược (thêm cột mới có giá trị mặc định thay vì đổi tên/xóa ngay).
3. `git push` lên nhánh khác `main` → Vercel tạo bản **Preview** để kiểm tra → merge vào `main` → Vercel tự deploy Production.

## 9. Rollback (quay lại bản trước)

- **Code**: Vercel → Project → **Deployments** → chọn bản ổn định trước đó → **⋯ → Promote to Production** (Instant Rollback, gần như tức thì).
- **Database**: migration chỉ chạy một chiều. Trước mỗi migration có rủi ro, sao lưu:
  ```bash
  npx supabase db dump --linked -f backup-schema-$(date +%F).sql
  npx supabase db dump --linked --data-only -f backup-data-$(date +%F).sql
  ```
  Nếu cần hoàn tác, viết **migration mới** đảo ngược thay đổi (không sửa migration cũ). Gói Supabase Pro có sao lưu hằng ngày/Point-in-Time Recovery.

## 10. Những điều cần tránh khi lên production

- ❌ Chạy `npm run db:reset` hoặc `supabase db reset --linked` vào database thật.
- ❌ Commit file `.env*` (chỉ `.env.example` được commit) hoặc đặt khóa bí mật vào biến bắt đầu bằng `NEXT_PUBLIC_`.
- ❌ Sửa file migration đã chạy — luôn tạo migration mới.
- ❌ Bật thu tiền thật khi chưa tích hợp cổng thanh toán (VNPay/MoMo/PayOS…) có xác thực webhook phía server. Phương thức hiện tại là **giả lập**; khi tích hợp thật, trạng thái "đã thanh toán" phải do webhook đã xác minh chữ ký cập nhật, không do trình duyệt.
- ❌ Để nguyên nội dung mẫu: thông tin liên hệ, chính sách, **đánh giá demo**, ảnh minh họa — thay bằng nội dung thật (`docs/PRODUCT_MANAGEMENT.md`).
- ❌ Tắt Row Level Security hoặc sửa policy Storage khi chưa hiểu rõ — đây là lớp bảo vệ chính của dữ liệu.
- ✅ Bật xác thực 2 lớp cho tài khoản Supabase, Vercel, GitHub; giới hạn số người có quyền admin.
