# Hướng dẫn quản lý 6 sản phẩm

Cửa hàng bán **đúng 6 mã sản phẩm** (TTXX-001 … TTXX-006). Database chặn tạo sản phẩm thứ 7; quản trị viên chỉ **sửa** và **ẩn/hiện** sản phẩm.

> Dữ liệu hiện tại là **DEMO** (tên, giá, mô tả, tồn kho, ảnh minh họa vẽ bằng code). Hãy thay bằng dữ liệu thật theo hướng dẫn dưới đây.

---

## Cách 1 (khuyên dùng): Trang quản trị

1. Đăng nhập bằng tài khoản admin tại `/dang-nhap` (local: `admin@tutuxinhxich.local` / `TuTuAdmin@2026`).
2. Vào **http://localhost:3000/admin/san-pham** (production: `https://<tên-miền>/admin/san-pham`).
3. Bấm **Sửa** ở sản phẩm cần chỉnh → sửa các ô → bấm **Lưu sản phẩm**.
4. Bấm **Xem trên cửa hàng** để kiểm tra. Thay đổi hiển thị **ngay lập tức** (không cần build lại).

### Bảng đối chiếu: ô trên trang admin ↔ cột trong database

Tất cả nằm ở bảng `public.products`.

| Muốn sửa         | Ô trên trang `/admin/san-pham/[id]`                         | Cột database                                      | Ghi chú                                                                                                                                                           |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Giá bán**      | "Giá bán (₫)" (mục _Giá & tồn kho_)                         | `price`                                           | Số nguyên VND, gõ `289000` hoặc `289.000`. Tối thiểu 1.000₫.                                                                                                      |
| **Giá gốc**      | "Giá gốc (₫)"                                               | `compare_at_price`                                | Để **trống** nếu không giảm giá. Phải **lớn hơn** giá bán; web tự hiện giá gạch + % giảm.                                                                         |
| **Tồn kho**      | "Tồn kho"                                                   | `stock`                                           | `0` = hết hàng (khách không mua được). ≤ 5 hiện "Chỉ còn N chiếc".                                                                                                |
| **Tên sản phẩm** | "Tên sản phẩm"                                              | `name`                                            | 2–80 ký tự. Đường dẫn (URL) **không đổi** theo tên.                                                                                                               |
| Mô tả ngắn       | "Mô tả ngắn"                                                | `short_description`                               | Hiện trên thẻ sản phẩm (≤ 200 ký tự).                                                                                                                             |
| Mô tả chi tiết   | "Mô tả chi tiết"                                            | `description`                                     | Xuống dòng 2 lần để tách đoạn.                                                                                                                                    |
| Chất liệu        | "Chất liệu"                                                 | `material`                                        | Chữ tự do.                                                                                                                                                        |
| Nhóm chất liệu   | "Nhóm chất liệu (dùng cho bộ lọc)"                          | `fabric`                                          | Lụa satin / Len & dạ / Voan / Cotton linen.                                                                                                                       |
| Kích thước       | "Kích thước"                                                | `size`                                            | VD `70 × 70 cm`. Hai số gần bằng nhau → web hiểu là **khăn vuông** và gợi ý cách quàng nơ cổ/buộc túi/băng đô; còn lại là **khăn dài** (thắt kiểu Paris/băng đô). |
| Bảo quản         | "Hướng dẫn bảo quản"                                        | `care_instructions`                               | Mỗi dòng một ý.                                                                                                                                                   |
| **Màu sắc**      | Mục _Màu sắc_ (Mã màu, Tên màu, Nhóm màu; nút **Thêm màu**) | `colors` (JSON)                                   | Tối đa 8 màu. "Nhóm màu" quyết định sản phẩm xuất hiện khi khách lọc màu.                                                                                         |
| Nhãn             | "Nhãn"                                                      | `badge`                                           | Không có / New / Best Seller / Limited.                                                                                                                           |
| **Ẩn/hiện**      | Công tắc "Hiện trên cửa hàng" (hoặc công tắc ở danh sách)   | `is_visible`                                      | Ẩn = khách không thấy, không mua được, link sản phẩm báo không tìm thấy.                                                                                          |
| Sản phẩm nổi bật | Công tắc "Toa đặc biệt"                                     | `is_featured`                                     | Hiện ở mục nổi bật trang chủ. Chỉ một sản phẩm được bật cùng lúc (tự tắt sản phẩm khác).                                                                          |
| Thứ tự hiển thị  | "Số toa"                                                    | `sort_order`                                      | 1 → "Toa 01". Sắp xếp "Nổi bật" theo số này.                                                                                                                      |
| **Ảnh**          | Mục _Hình ảnh_                                              | `image_url` (ảnh chính), `gallery` (ảnh chi tiết) | Xem hướng dẫn bên dưới.                                                                                                                                           |

**Không sửa được qua admin (cố ý):** `sku` (mã sản phẩm) và `slug` (đường dẫn `/san-pham/...`). Nếu thật sự cần đổi, nhờ lập trình viên tạo migration mới.

### Thay ảnh / thêm ảnh mới

1. Ở mục **Hình ảnh**, bấm ô **Tải ảnh mới** → chọn một hoặc nhiều ảnh trong máy.
   - Định dạng JPG, PNG, WEBP hoặc AVIF, **tối đa 5 MB/ảnh**.
   - Nên dùng ảnh dọc tỉ lệ **4:5** (VD 1200 × 1500 px), nền sáng, sản phẩm ở giữa.
2. Ảnh mới xuất hiện cuối danh sách. Dùng các nút dưới mỗi ảnh:
   - ⭐ **Đặt làm ảnh chính** (ảnh đầu tiên có viền hồng là ảnh chính, hiện trên thẻ sản phẩm).
   - ← → đổi thứ tự; 🗑 gỡ ảnh khỏi sản phẩm.
3. Bấm **Lưu sản phẩm** — ảnh chỉ được áp dụng sau khi lưu.

Ảnh tải lên được lưu ở Supabase Storage, bucket **`product-images`**, thư mục theo SKU (VD `ttxx-001/…webp`). Chỉ tài khoản admin được tải lên/xóa (kiểm tra ở database). Gỡ ảnh khỏi sản phẩm **không xóa file** trong Storage (để có thể dùng lại); muốn dọn file thừa, vào Supabase Studio → Storage → `product-images`.

Ảnh demo ban đầu nằm trong mã nguồn tại `public/products/ttxx-00N/{main,detail-1,detail-2,detail-3}.webp` (vẽ lại bằng `npm run images:generate`).

### Kiểm tra sau khi chỉnh sửa

- Bấm **Xem trên cửa hàng** trên trang sửa, hoặc mở `/san-pham/<slug>` và `/bo-suu-tap`.
- Thẻ "Xem trước thẻ sản phẩm" bên phải trang sửa cho thấy kết quả ngay khi gõ (trước khi lưu).
- Dashboard `/admin` hiển thị tồn kho 6 toa và cảnh báo sắp hết/hết hàng.

---

## Cách 2 (nâng cao): Supabase Studio

Local: http://127.0.0.1:54423 → **Table Editor** → bảng **products** → bấm vào ô để sửa → **Save**.
Production: https://supabase.com/dashboard → project → Table Editor.

Database có ràng buộc bảo vệ dữ liệu (VD giá gốc phải lớn hơn giá bán, tồn kho không âm, tối đa 6 sản phẩm); nếu lưu bị từ chối, đọc thông báo lỗi và sửa lại giá trị. Cột `colors` là JSON dạng:

```json
[{ "name": "Hồng phấn", "hex": "#FFB3D1", "family": "hong" }]
```

`family` nhận một trong: `hong`, `tim`, `xanh`, `vang`, `do`, `trang`.

---

## Quản lý đơn hàng

- `/admin/don-hang`: lọc theo trạng thái, tìm theo mã đơn / SĐT / tên người nhận.
- Mở một đơn → **Cập nhật trạng thái** theo luồng: Chờ xác nhận → Đã xác nhận → Đang giao → Đã giao. Có thể **Hủy đơn** trước khi giao xong — tồn kho tự được hoàn lại.
- Khách tự hủy được đơn khi đơn còn "Chờ xác nhận".
- Thanh toán hiện là **giả lập** (COD / chuyển khoản mô phỏng), không phát sinh tiền thật.

## Quản lý đánh giá

- Khách chỉ viết được đánh giá khi đơn chứa chiếc khăn đó ở trạng thái **Đã giao** (database kiểm tra). Mỗi khách 1 đánh giá/sản phẩm, có thể sửa/xóa.
- `/admin/danh-gia`: tắt công tắc để **ẩn** đánh giá vi phạm (spam, ngôn từ không phù hợp). Đánh giá ẩn không tính vào điểm trung bình; người viết vẫn thấy kèm ghi chú "đang được ẩn".
- Trang chủ tự hiển thị 3 đánh giá thật mới nhất (4–5 sao) khi có đủ; trước đó là nội dung demo được ghi rõ.
- Dữ liệu: bảng `public.product_reviews` (cột `rating`, `content`, `author_name`, `is_visible`).

## Thêm quản trị viên

Người cần quyền admin tự đăng ký tài khoản trên website, sau đó chạy trong **Supabase Studio → SQL Editor**:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'email-cua-ban@example.com');
```

Bỏ quyền: đổi `'admin'` thành `'customer'`.

---

## Nội dung khác của website (cần lập trình viên hoặc sửa file)

| Nội dung                                                                                | File                                                                                                                                             |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slogan, thông báo chạy trên đầu trang, thông tin liên hệ, mạng xã hội, câu ghi chú demo | `src/config/site.ts`                                                                                                                             |
| Ảnh ở hero trang chủ                                                                    | `src/features/home/components/hero.tsx` (mảng `CARDS`)                                                                                           |
| Ảnh lookbook                                                                            | `src/features/home/components/lookbook.tsx` (mảng `COLUMNS`)                                                                                     |
| Nội dung 4 cách quàng khăn (trang chủ + gợi ý trên trang sản phẩm)                      | `src/features/home/styling-data.ts`                                                                                                              |
| Đánh giá khách hàng (hiện là **demo**)                                                  | `src/features/home/components/reviews.tsx` (mảng `DEMO_REVIEWS`)                                                                                 |
| Chính sách giao hàng/đổi trả (mẫu)                                                      | `src/app/(shop)/chinh-sach/page.tsx`                                                                                                             |
| Phí ship (30.000₫) & mức miễn phí (500.000₫), giới hạn 10 chiếc/sản phẩm                | `src/features/cart/domain.ts` **và** hàm SQL `shipping_fee_for` / `place_order` (tạo migration mới; integration test kiểm tra hai bên khớp nhau) |
| Màu sắc, font chữ thương hiệu                                                           | `src/app/globals.css` (khối `@theme`), `src/app/layout.tsx`                                                                                      |
