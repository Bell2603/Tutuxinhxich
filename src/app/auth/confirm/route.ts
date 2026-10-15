import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

/** Link xác nhận email (khi bật "Confirm email" trên Supabase production). */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirectPath(searchParams.get("next"), "/tai-khoan");

  const code = searchParams.get("code");
  const supabase = await createClient();
  if (tokenHash && type) {
    // Mẫu email khuyên dùng: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  } else if (code) {
    // Mẫu email mặc định (PKCE): Supabase chuyển về đây kèm ?code=… (cùng trình duyệt đã đăng ký).
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }
  return NextResponse.redirect(new URL("/dang-nhap?loi=xac-nhan", request.url));
}
