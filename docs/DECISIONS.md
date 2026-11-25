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

### D-09 — Thương hiệu "chuyến tàu sắc màu"

Tên gợi âm thanh đoàn tàu → 6 sản phẩm = 6 toa, vé tàu/đường ray/đầu tàu quàng khăn là motif chung (logo, hero, timeline đơn hàng, thanh free ship). Tạo bản sắc riêng thay vì mẫu cửa hàng chung chung.

### D-10 — Giỏ hàng chỉ lưu `{productId, quantity}` trên trình duyệt

Giá/tên/ảnh luôn lấy mới từ `/api/catalog`; giỏ tự đối chiếu tồn kho. Không có bảng giỏ hàng trên server — đăng nhập không làm mất giỏ vì localStorage giữ nguyên.

### D-11 — Trang 404 của route stream trả mã 200 + `noindex`

Hành vi chuẩn của Next.js 16 với Partial Prerender (tài liệu `not-found.md`). Giữ streaming để trang hiển thị nhanh; công cụ tìm kiếm vẫn không index.

### D-12 — Tắt cache build Turbopack

`experimental.turbopackFileSystemCacheForBuild: false` vì cache trả CSS cũ (B-003). Build chỉ ~15 giây.

### D-13 — CSP không dùng nonce

Nonce theo request buộc toàn bộ trang render động. Chọn CSP chặn nguồn ngoài (`'self'` + Supabase) và `frame-ancestors 'none'`, chấp nhận `'unsafe-inline'` cho script (T-002).

### D-14 — Trang quản trị không tạo/xóa sản phẩm

Đúng yêu cầu "chính xác 6 SKU": admin chỉ sửa và ẩn/hiện; SKU/slug cố định để giữ URL và lịch sử đơn.

### D-15 — Chỉ dùng giao diện sáng

Bản sắc pastel rực rỡ được thiết kế cho nền kem; `color-scheme: light`. Có thể bổ sung chế độ tối sau.

### D-16 — Chuyển trang bằng React `<ViewTransition>` thay vì Motion/template

Next 16.4 + React 19.3 hỗ trợ sẵn View Transitions: chạy trên compositor của trình duyệt (nhẹ), tự kích hoạt khi điều hướng, không làm mất HTML SSR, trình duyệt cũ chỉ đổi trang bình thường. Không dùng hiệu ứng "morph" ảnh giữa trang danh sách và chi tiết vì dữ liệu sản phẩm cố ý đọc động (D-02) nên trang đích chưa có sẵn lúc bấm.

### D-17 — Yêu thích lưu trên trình duyệt

Giống giỏ hàng (D-10): không cần đăng nhập, không thêm bảng. Đổi sang lưu theo tài khoản nếu sau này cần đồng bộ nhiều thiết bị.

### D-18 — Email xác thực dùng link `token_hash`

Mẫu email tự viết (`supabase/templates/*.html`) trỏ thẳng về `/auth/confirm?token_hash=…` thay cho link PKCE mặc định: mở được trên điện thoại dù yêu cầu từ máy tính, nội dung tiếng Việt theo thương hiệu. `/auth/confirm` vẫn hỗ trợ `?code=` (B-011).

### D-19 — Đánh giá chỉ từ khách đã nhận hàng, bảo vệ riêng tư

Điều kiện "đơn đã giao" kiểm tra trong RPC `submit_review` (không tin client). Tên hiển thị rút gọn, cột `user_id` không cấp quyền đọc (grant theo cột) và hàm `has_delivered_product` không gọi trực tiếp được — tránh suy ra ai đã mua gì. Admin chỉ ẩn/hiện, không sửa nội dung của khách.

### D-20 — Mã giảm giá tính trong database, phí ship theo tạm tính trước giảm

`place_order` kiểm tra lại mã (khóa dòng `coupons` → không vượt tổng lượt khi đặt đồng thời) và tự tính tiền giảm; ô nhập ở checkout chỉ là xem trước. Phí ship dựa trên tạm tính trước giảm giá để quy tắc "free ship từ 500.000₫" dễ hiểu. Hủy đơn trả lượt dùng. Khách không đọc được bảng `coupons` (chỉ kiểm tra từng mã qua `preview_coupon`) để không lộ danh sách mã.

### D-21 — Nội dung chính sách một nguồn, dạng dữ liệu thuần

`src/features/policies/content.ts` là nơi duy nhất chứa chính sách & FAQ; `/chinh-sach`, `/hoi-dap`, trang sản phẩm (và chatbot ở M17) đều đọc từ đây. Không chứa JSX để server đọc thành văn bản. Số tiền ship lấy từ hằng số giỏ hàng (đã có test parity với SQL) → đổi phí ship ở một chỗ.

### D-22 — Google Maps nhúng bằng iframe, CSP chỉ mở `frame-src https://www.google.com`

Không dùng Maps JavaScript API (cần API key, mở script-src/connect-src). Link nhúng phải có dạng `https://www.google.com/maps…`; link `maps.google.com` hay rút gọn `maps.app.goo.gl` sẽ bị CSP chặn. E2E trả trang giả cho iframe (không phụ thuộc mạng, axe không quét nội dung của Google) nhưng vẫn đi qua CSP thật.

### D-23 — Đối tác cấu hình trong code, ẩn khi rỗng; parallax chỉ khi 3 cột cạnh nhau

Danh sách đối tác ít, hiếm đổi → `src/config/partners.ts` (có kiểu TS) thay vì bảng database + trang admin. Ảnh chỉ lấy từ `public/partners/` (không mở CSP `img-src`). Chưa có đối tác thì không hiện section/link rỗng. Parallax bật từ 1024px: dưới mức đó các cột xếp chồng và trượt ngược chiều sẽ đè lên nhau.

### D-24 — Chuyển khoản khách tự chuyển, VietQR tạo trên server, không đổi enum

Không tích hợp cổng thanh toán: trang đơn hiện tài khoản + nội dung + VietQR, shop đối soát sao kê thủ công rồi xác nhận đơn (không có trạng thái "đã thanh toán" tự động). QR là chuỗi EMVCo tự tạo + thư viện `qrcode` (SVG data URL) thay vì ảnh `img.vietqr.io`: không mở CSP `img-src`, không gửi tên/SĐT khách cho bên thứ ba. Enum `bank_transfer_mock` giữ nguyên (đổi enum cần migration và đụng RPC `place_order`), chỉ đổi nhãn hiển thị. Config còn giá trị mẫu → ẩn hẳn chuyển khoản (checkout, server action, chính sách) để không bao giờ hiện số tài khoản giả. Nội dung tối đa 50 ký tự (chưa tìm được giới hạn chính thức của NAPAS; 50 là mức an toàn), luôn giữ đủ mã đơn + SĐT.

### D-25 — Chatbot Gemini gọi từ server, giới hạn tần suất trong database

Gemini chỉ gọi trong route handler (`server-only`), khóa không bao giờ tới trình duyệt → CSP client không đổi. Gọi REST `generateContent` trực tiếp (không thêm SDK), không stream cho đơn giản. Giới hạn tần suất lưu ở Supabase (RPC `chat_rate_hit`) thay vì bộ nhớ: trên Vercel mỗi instance có bộ nhớ riêng nên đếm trong RAM dễ bị lách. IP băm kèm salt bí mật, không lưu IP thô. Prompt injection: chỉ dẫn hệ thống tách khỏi tin của khách (`systemInstruction`), dữ liệu cửa hàng đặt trong khối riêng, mã canary để phát hiện lộ chỉ dẫn, giao diện chỉ render văn bản thuần + link nội bộ. Lịch sử do client gửi lên (giới hạn 10 lượt) nên khách có thể sửa lượt "model" cũ — chấp nhận vì bot không có quyền thao tác dữ liệu.

### D-26 — Live chat bằng link Zalo/Messenger, không nhúng widget

So với Tawk.to/Zalo OA widget: không thêm script bên thứ ba, không mở CSP, không cookie theo dõi, nhân viên trả lời trên app quen dùng. Messenger Chat Plugin nhúng web đã bị Meta ngừng (2024) nên dùng `m.me`. Link chưa hợp lệ (mẫu) → nút tự ẩn.
