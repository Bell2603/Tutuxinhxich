import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Các khu vực bắt buộc đăng nhập. Quyền admin được kiểm tra lại ở server (layout, action) và RLS.
const PROTECTED_PREFIXES = ["/tai-khoan", "/thanh-toan", "/admin"];

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isProtected && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/dang-nhap";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(url);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    // Bỏ qua file tĩnh, ảnh sản phẩm và ảnh tối ưu.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|products/|brand/|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
