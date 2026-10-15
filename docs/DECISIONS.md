# Quyết định kỹ thuật (ADR rút gọn)

### D-01 — Git repo riêng trong thư mục dự án

Thư mục home là một git repo; commit ở đó sẽ trộn dự án với file cá nhân. → `git init` trong `Tutuxinhxich/`, nhánh `main`.

### D-02 — Next.js 16.4 với Cache Components (mặc định của template)

Dữ liệu sản phẩm đọc **động** trong `<Suspense>` (không `use cache`) để admin sửa giá là thấy ngay và `next build` không cần database. Chỉ có 6 sản phẩm nên truy vấn rất nhẹ.

### D-03 — Supabase local, CLI ghim 2.120.0, cổng 544xx

Dùng lại Docker image sẵn có (ổ đĩa hạn chế), tránh xung đột cổng với dự án khác trên máy.

### D-04 — Nghiệp vụ đơn hàng trong Postgres (RPC security definer)

Giá, phí ship, tồn kho, trạng thái được tính/khóa trong một transaction → không thể đặt vượt tồn kho kể cả khi đặt đồng thời, client không sửa được giá. Lỗi nghiệp vụ: `P0001` + mã máy + `detail` JSON.

### D-05 — Đúng 6 SKU được đảm bảo ở database

Trigger chặn insert sản phẩm thứ 7; không có policy insert/delete; admin chỉ sửa và ẩn/hiện.

### D-06 — Publishable key + RLS, không dùng secret key trong app

Website chỉ dùng `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; quyền do RLS + column grants. `SUPABASE_SECRET_KEY` chỉ cho scripts/tests.

### D-07 — Ảnh sản phẩm demo là minh họa vẽ bằng code

Không có ảnh thật → sinh ảnh minh họa có thương hiệu (`scripts/images/generate.ts`, SVG → WebP bằng sharp). Ảnh thật tải lên qua admin vào Supabase Storage (bucket `product-images`, chỉ admin ghi, tối đa 5 MB, jpeg/png/webp/avif).

### D-08 — Địa chỉ 2 cấp (Tỉnh/Thành phố → Phường/Xã)

Theo mô hình chính quyền địa phương 2 cấp áp dụng từ 01/07/2025, checkout không hỏi Quận/Huyện.
