# Danh sách lỗi

Mức độ: **P0** chặn sử dụng/mất dữ liệu/bảo mật · **P1** chức năng chính sai · **P2** lỗi phụ/giao diện · **P3** cải thiện.

## Đang mở

_(chưa có)_

## Đã sửa

| ID    | Mức | Mô tả                                                                                    | Cách sửa                                         | Kiểm thử hồi quy                                        |
| ----- | --- | ---------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| B-001 | P1  | `place_order` dùng `FOR UPDATE` trên LEFT JOIN → Postgres báo lỗi khi khóa phía nullable | Khóa từng sản phẩm trong vòng lặp theo thứ tự id | `tests/integration/orders.test.ts` (đồng thời, tồn kho) |
