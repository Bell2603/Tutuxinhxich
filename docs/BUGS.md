# Danh sách lỗi

Mức độ: **P0** chặn sử dụng/mất dữ liệu/bảo mật · **P1** chức năng chính sai · **P2** lỗi phụ/giao diện · **P3** cải thiện.

## Đang mở

| ID    | Mức | Mô tả                                                                                                    | Ghi chú / hướng xử lý                                                                                                                                                              |
| ----- | --- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-001 | P3  | `npm audit`: 5 lỗ hổng mức high trong chuỗi `braces` ← `micromatch` ← `fast-glob` ← `eslint-config-next` | Chỉ có trong devDependencies (công cụ lint), không vào bản build. `npm audit --omit=dev` = 0. Chờ bản vá upstream; không dùng `npm audit fix --force` (hạ cấp eslint-config-next). |
| T-002 | P3  | CSP còn cho phép `'unsafe-inline'` cho script                                                            | Dùng nonce sẽ buộc mọi trang render động (mất static shell của Partial Prerender). Vẫn chặn script ngoài, iframe nhúng, plugin.                                                    |

## Đã sửa

| ID    | Mức | Mô tả                                                                                    | Cách sửa                                         | Kiểm thử hồi quy                                        |
| ----- | --- | ---------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| B-001 | P1  | `place_order` dùng `FOR UPDATE` trên LEFT JOIN → Postgres báo lỗi khi khóa phía nullable | Khóa từng sản phẩm trong vòng lặp theo thứ tự id | `tests/integration/orders.test.ts` (đồng thời, tồn kho) |
