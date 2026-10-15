import { NextResponse } from "next/server";
import { getVisibleProducts } from "@/features/catalog/queries";

/** Danh sách sản phẩm công khai cho giỏ hàng & ô tìm kiếm phía trình duyệt (luôn mới nhất). */
export async function GET() {
  try {
    const products = await getVisibleProducts();
    return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Không tải được sản phẩm" }, { status: 503 });
  }
}
