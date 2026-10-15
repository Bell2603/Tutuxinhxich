-- =============================================================================
-- DỮ LIỆU DEMO — 6 mã khăn quàng cổ của Tu Tu Xình Xịch.
-- Tên, mô tả, giá, tồn kho và hình ảnh minh họa đều là dữ liệu mẫu để phát triển/kiểm thử.
-- Thay bằng dữ liệu thật qua trang quản trị /admin/san-pham (không cần sửa file này).
-- File này chỉ chạy khi `npm run db:reset` (xóa sạch database local rồi tạo lại).
-- =============================================================================

insert into public.products (
  sku, slug, name, short_description, description, material, fabric, colors, size, care_instructions,
  price, compare_at_price, stock, image_url, gallery, badge, is_visible, is_featured, sort_order
) values
(
  'TTXX-001', 'may-hong-keo-bong', 'Mây Hồng Kẹo Bông',
  'Khăn lụa satin vuông in mây hồng bồng bềnh — thắt nơ cổ là xinh tức thì.',
  E'Toa số 01 của chuyến tàu Tu Tu Xình Xịch chở theo cả một bầu trời kẹo bông. Mặt satin mềm rủ, bóng nhẹ, in họa tiết mây hồng và tím lilac loang mềm như màu trời lúc năm giờ chiều.\n\nThắt nơ ở cổ áo sơ mi, buộc quai túi, quấn tóc đuôi ngựa hay làm băng đô — một chiếc khăn, bốn kiểu xinh.',
  'Satin lụa (100% polyester cao cấp), in kỹ thuật số', 'satin',
  '[{"name":"Hồng phấn","hex":"#FFB3D1","family":"hong"},{"name":"Tím lilac","hex":"#C9B6FF","family":"tim"},{"name":"Trắng kem","hex":"#FFF6EC","family":"trang"}]',
  '70 × 70 cm',
  E'Giặt tay nhẹ nhàng với nước mát.\nKhông dùng chất tẩy, không vắt mạnh.\nPhơi nơi thoáng mát, tránh nắng gắt.\nỦi mặt trái ở nhiệt độ thấp.',
  289000, 349000, 24,
  '/products/ttxx-001/main.webp',
  array['/products/ttxx-001/detail-1.webp', '/products/ttxx-001/detail-2.webp', '/products/ttxx-001/detail-3.webp'],
  'best_seller', true, false, 1
),
(
  'TTXX-002', 'soc-keo-cau-vong', 'Sọc Kẹo Cầu Vồng',
  'Khăn len dệt kim sọc năm màu kẹo ngọt, dài 180 cm — ấm áp mà vẫn rực rỡ.',
  E'Toa số 02 là toa ấm áp nhất đoàn tàu: sợi len dệt kim mềm mịn, dệt sọc hồng, vàng, mint, xanh trời và lilac như một thanh kẹo cầu vồng. Hai đầu khăn có tua rua nhỏ đung đưa theo từng bước chân.\n\nQuấn hai vòng với áo khoác denim hay áo len trơn để chiếc khăn trở thành nhân vật chính của outfit.',
  'Len acrylic pha cotton (70% acrylic, 30% cotton), dệt kim', 'len',
  '[{"name":"Hồng kẹo","hex":"#FF8DC1","family":"hong"},{"name":"Vàng chanh","hex":"#FFE066","family":"vang"},{"name":"Xanh mint","hex":"#8BE9C9","family":"xanh"},{"name":"Xanh trời","hex":"#8FD3FF","family":"xanh"},{"name":"Tím lilac","hex":"#C9B6FF","family":"tim"}]',
  '180 × 30 cm (chưa gồm tua rua)',
  E'Giặt tay hoặc giặt máy chế độ len, cho vào túi giặt riêng.\nKhông ngâm lâu, không sấy nóng.\nPhơi nằm ngang để khăn giữ form.\nKhông ủi trực tiếp lên sợi len.',
  359000, null, 18,
  '/products/ttxx-002/main.webp',
  array['/products/ttxx-002/detail-1.webp', '/products/ttxx-002/detail-2.webp', '/products/ttxx-002/detail-3.webp'],
  'new', true, false, 2
),
(
  'TTXX-003', 'hoa-cuc-san-ga', 'Hoa Cúc Sân Ga',
  'Khăn voan mỏng nhẹ in hoa cúc vàng nắng — bay bay theo gió sân ga.',
  E'Toa số 03 dừng ở một sân ga đầy nắng: nền voan trắng sữa trong nhẹ, rải hoa cúc vàng và lá xanh non. Khăn mỏng, thoáng, rất hợp những ngày đầu thu hay phòng máy lạnh.\n\nThả hờ trên vai với váy hoa, hoặc quấn lỏng một vòng với áo thun trắng cho vẻ ngoài thơ mộng mà không cầu kỳ.',
  'Voan chiffon (100% polyester), mỏng nhẹ', 'voan',
  '[{"name":"Vàng nắng","hex":"#FFD447","family":"vang"},{"name":"Trắng sữa","hex":"#FFFBF2","family":"trang"},{"name":"Xanh lá non","hex":"#A8E07A","family":"xanh"}]',
  '160 × 50 cm',
  E'Giặt tay với nước mát, không vò mạnh.\nKhông dùng chất tẩy.\nPhơi trong bóng râm.\nỦi hơi nước ở nhiệt độ thấp.',
  199000, 239000, 30,
  '/products/ttxx-003/main.webp',
  array['/products/ttxx-003/detail-1.webp', '/products/ttxx-003/detail-2.webp', '/products/ttxx-003/detail-3.webp'],
  null, true, false, 3
),
(
  'TTXX-004', 'caro-dau-tay', 'Caro Dâu Tây',
  'Khăn dạ caro đỏ dâu, hồng sữa và kem, dày dặn, có tua rua — mùa lạnh cứ để Toa 04 lo.',
  E'Toa số 04 chở theo mùa đông ngọt ngào: kẻ caro đỏ dâu đan hồng sữa và kem, chất dạ dày dặn nhưng mềm, giữ ấm tốt mà không gây ngứa.\n\nKhổ lớn nên có thể quàng như khăn choàng phủ vai, thắt kiểu Paris hoặc quấn làm "chăn mini" khi ngồi phòng máy lạnh.',
  'Dạ mềm cashmere-feel (100% acrylic cao cấp), tua rua hai đầu', 'len',
  '[{"name":"Đỏ dâu","hex":"#E8344E","family":"do"},{"name":"Hồng sữa","hex":"#FFC2D4","family":"hong"},{"name":"Kem","hex":"#FFF1DC","family":"trang"}]',
  '190 × 65 cm',
  E'Giặt khô hoặc giặt tay nhẹ với nước lạnh.\nKhông vắt xoắn, không sấy.\nPhơi nằm ngang nơi thoáng mát.\nChải nhẹ tua rua sau khi khô.',
  429000, 499000, 12,
  '/products/ttxx-004/main.webp',
  array['/products/ttxx-004/detail-1.webp', '/products/ttxx-004/detail-2.webp', '/products/ttxx-004/detail-3.webp'],
  'best_seller', true, false, 4
),
(
  'TTXX-005', 'ngan-ha-lap-lanh', 'Ngân Hà Lấp Lánh',
  'Khăn satin vuông lớn xanh đêm điểm sao nhũ ánh kim — phiên bản giới hạn.',
  E'Toa số 05 là chuyến tàu đêm xuyên dải ngân hà: nền satin xanh đêm sâu thẳm, điểm những ngôi sao nhũ vàng lấp lánh dưới ánh đèn. Mỗi đợt chỉ sản xuất số lượng nhỏ.\n\nGấp tam giác quàng cổ với blazer cho buổi hẹn tối, hoặc buộc quanh túi xách để cả set đồ cùng "phát sáng".',
  'Satin ánh nhũ (95% polyester, 5% sợi kim tuyến)', 'satin',
  '[{"name":"Xanh đêm","hex":"#1E2A6E","family":"xanh"},{"name":"Tím than","hex":"#3B2A6B","family":"tim"},{"name":"Vàng ánh kim","hex":"#F2C14E","family":"vang"}]',
  '90 × 90 cm',
  E'Chỉ giặt tay nhẹ nhàng hoặc giặt khô.\nKhông chà mạnh lên phần nhũ.\nPhơi trong bóng râm.\nỦi mặt trái ở nhiệt độ thấp, có lót vải.',
  459000, null, 5,
  '/products/ttxx-005/main.webp',
  array['/products/ttxx-005/detail-1.webp', '/products/ttxx-005/detail-2.webp', '/products/ttxx-005/detail-3.webp'],
  'limited', true, true, 5
),
(
  'TTXX-006', 'bac-ha-suong-som', 'Bạc Hà Sương Sớm',
  'Khăn cotton linen loang màu bạc hà và xanh trời, mát như sương sớm.',
  E'Toa số 06 khởi hành lúc bình minh: vải cotton pha linen nhuộm loang từ xanh bạc hà sang xanh trời và trắng sữa, mỗi chiếc mang một đường loang riêng.\n\nThoáng mát cho ngày nắng, đủ ấm cho tối se lạnh. Quàng hờ với áo sơ mi linen hoặc dùng làm khăn choàng đi biển đều đẹp.',
  'Cotton pha linen (60% cotton, 40% linen), nhuộm loang', 'cotton',
  '[{"name":"Xanh bạc hà","hex":"#9EEBD0","family":"xanh"},{"name":"Xanh trời","hex":"#9AD7FF","family":"xanh"},{"name":"Trắng sữa","hex":"#FFFBF2","family":"trang"}]',
  '180 × 70 cm',
  E'Giặt riêng ở lần đầu vì có thể ra màu nhẹ.\nGiặt tay hoặc giặt máy chế độ nhẹ, nước lạnh.\nKhông dùng chất tẩy.\nỦi nhiệt độ trung bình khi khăn còn hơi ẩm.',
  249000, null, 20,
  '/products/ttxx-006/main.webp',
  array['/products/ttxx-006/detail-1.webp', '/products/ttxx-006/detail-2.webp', '/products/ttxx-006/detail-3.webp'],
  'new', true, false, 6
);
