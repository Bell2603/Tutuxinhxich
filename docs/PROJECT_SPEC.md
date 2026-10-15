# Đặc tả sản phẩm — Tu Tu Xình Xịch

## 1. Thương hiệu

- **Tên**: Tu Tu Xình Xịch — từ âm thanh đoàn tàu ("tu tu" còi tàu, "xình xịch" nhịp bánh xe).
- **Ngành hàng**: khăn quàng cổ thời trang · Thị trường Việt Nam · Tiếng Việt · VND.
- **Khách hàng mục tiêu**: người trẻ yêu thời trang, phụ kiện, phong cách cá nhân, quà tặng.
- **Ý tưởng**: "Chuyến tàu sắc màu" — 6 sản phẩm là 6 "toa" (Toa 01–06); vé tàu, đường ray, đầu tàu quàng khăn là motif xuyên suốt.
- **Slogan**: _Xinh từng nút thắt, chất từng chuyến đi._ Câu phụ: _Tu tu! Lên tàu thôi!_
- **Logo**: đầu tàu nhỏ (cabin tím than, nồi hơi hồng, bánh vàng) quàng khăn gradient hồng → tím → xanh bay như làn khói.
- **Bảng màu**: mực `#2B1145` (chữ), kem `#FFF8F1` (nền), bubblegum `#FF4F9A`, berry `#D4145A`, lilac `#A98BFF`, sky `#5CC8FF`, sun `#FFCF3F`, mint `#5FE0B7`, night `#1B1442`, gold `#F2C14E`. Gradient chủ đạo "aurora": hồng → lilac → xanh trời.
- **Typography**: Bricolage Grotesque (tiêu đề, cá tính), Fraunces italic (từ nhấn, editorial), Be Vietnam Pro (nội dung, dấu tiếng Việt chuẩn).
- **Giọng văn**: vui tươi, đáng yêu, gần gũi; dùng ẩn dụ chuyến tàu.

## 2. Danh mục — đúng 6 SKU (dữ liệu DEMO)

| SKU      | Tên               | Chất liệu              | Giá      | Giá gốc  | Tồn kho | Nhãn              |
| -------- | ----------------- | ---------------------- | -------- | -------- | ------- | ----------------- |
| TTXX-001 | Mây Hồng Kẹo Bông | Satin lụa, vuông 70×70 | 289.000₫ | 349.000₫ | 24      | Best Seller       |
| TTXX-002 | Sọc Kẹo Cầu Vồng  | Len dệt kim, 180×30    | 359.000₫ | —        | 18      | New               |
| TTXX-003 | Hoa Cúc Sân Ga    | Voan chiffon, 160×50   | 199.000₫ | 239.000₫ | 30      | —                 |
| TTXX-004 | Caro Dâu Tây      | Dạ mềm, 190×65         | 429.000₫ | 499.000₫ | 12      | Best Seller       |
| TTXX-005 | Ngân Hà Lấp Lánh  | Satin ánh nhũ, 90×90   | 459.000₫ | —        | 5       | Limited (nổi bật) |
| TTXX-006 | Bạc Hà Sương Sớm  | Cotton linen, 180×70   | 249.000₫ | —        | 20      | New               |

Mỗi sản phẩm có: SKU, tên, giá, giá gốc, mô tả ngắn/chi tiết, chất liệu, nhóm chất liệu, màu (tên + mã + nhóm), kích thước, bảo quản, tồn kho, ảnh chính + 3 ảnh chi tiết, trạng thái còn/hết hàng (tính từ tồn kho), nhãn, ẩn/hiện, thứ tự.

## 3. Chức năng

### Khách hàng

Trang chủ landing page · bộ sưu tập (lọc màu/chất liệu/giá, tìm không dấu, sắp xếp) · chi tiết sản phẩm · giỏ hàng (localStorage, khách chưa đăng nhập dùng được, giữ sau đăng nhập) · đăng ký/đăng nhập · checkout (bắt buộc đăng nhập, COD hoặc chuyển khoản **giả lập**) · trạng thái đơn (timeline) · lịch sử mua · tự hủy đơn khi chờ xác nhận.

### Bổ sung phiên 2

Hiệu ứng chuyển trang (View Transitions) · lightbox ảnh toàn màn hình · danh sách yêu thích `/yeu-thich` · gợi ý cách quàng theo dáng khăn · quên/đặt lại/đổi mật khẩu (email tiếng Việt) · checkout điền sẵn địa chỉ đơn gần nhất · đánh giá thật từ khách đã nhận hàng · mã giảm giá.

### Quản trị viên

Đăng nhập (quyền admin kiểm tra ở server + RLS) · dashboard · sửa 6 sản phẩm (giá, giá gốc, tên, mô tả, màu, ảnh upload, tồn kho, nhãn, ẩn/hiện, nổi bật, thứ tự) · quản lý đơn & cập nhật trạng thái (hủy → hoàn kho).

### Quy tắc nghiệp vụ

- Phí giao hàng 30.000₫; miễn phí khi tạm tính ≥ 500.000₫.
- Tối đa `min(tồn kho, 10)` chiếc mỗi sản phẩm trong một đơn.
- Giá, phí ship, tổng tiền luôn tính lại trong database khi đặt hàng.
- Luồng trạng thái: Chờ xác nhận → Đã xác nhận → Đang giao → Đã giao; hủy được trước khi giao xong.
- Mã đơn: `TT` + `YYMMDD` + số thứ tự 4 chữ số (giờ Việt Nam).

## 4. Trang & đường dẫn

| Đường dẫn                                                                                         | Mô tả                                                     |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `/`                                                                                               | Trang chủ                                                 |
| `/bo-suu-tap`                                                                                     | Bộ sưu tập + bộ lọc (`?q=&mau=&chat-lieu=&gia=&sap-xep=`) |
| `/san-pham/[slug]`                                                                                | Chi tiết sản phẩm                                         |
| `/thanh-toan`                                                                                     | Checkout (cần đăng nhập)                                  |
| `/tai-khoan`, `/tai-khoan/don-hang/[code]`                                                        | Tài khoản, đơn hàng                                       |
| `/dang-nhap`, `/dang-ky`                                                                          | Xác thực                                                  |
| `/chinh-sach`                                                                                     | Chính sách (mẫu)                                          |
| `/yeu-thich`                                                                                      | Danh sách yêu thích                                       |
| `/quen-mat-khau`, `/dat-lai-mat-khau`                                                             | Quên / đặt lại mật khẩu                                   |
| `/admin`, `/admin/san-pham[/id]`, `/admin/don-hang[/id]`, `/admin/danh-gia`, `/admin/ma-giam-gia` | Quản trị                                                  |
| `/api/catalog`                                                                                    | JSON danh sách sản phẩm công khai (giỏ hàng, tìm kiếm)    |

## 5. Dữ liệu

`products` (6 dòng) · `product_reviews` · `coupons` + `coupon_redemptions` · `profiles` (vai trò customer/admin) · `orders` · `order_items` (lưu ảnh chụp tên/giá lúc mua) · `order_events` (timeline) · Storage bucket `product-images`. Chi tiết: `supabase/migrations/`.

## 6. Yêu cầu phi chức năng

- Mobile-first, responsive 375px → desktop; không tràn ngang.
- Animation mượt, có mục đích, tôn trọng `prefers-reduced-motion`; Motion tải lười (LazyMotion).
- Accessibility WCAG 2.1 AA (axe: 0 lỗi serious/critical trên các trang chính).
- Bảo mật: RLS + column grants, RPC security definer, kiểm tra quyền ở server, chống open redirect, security headers + CSP, không dùng secret key trong app.
- SEO: metadata, Open Graph, JSON-LD Product, sitemap, robots.
- Nội dung demo luôn được ghi rõ (đánh giá, ảnh, sản phẩm, thanh toán).
