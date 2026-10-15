import { LayoutDashboard, UserRound } from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "../session";

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? `${parts[0]![0]}${parts[parts.length - 1]![0]}` : source.slice(0, 2);
  return letters.toUpperCase();
}

/** Nút tài khoản trên header (đọc phiên đăng nhập → đặt trong <Suspense>). */
export async function AccountMenu() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <Link
        href="/dang-nhap"
        className="inline-flex h-11 items-center gap-2 rounded-full bg-white/70 px-4 text-sm font-semibold text-ink shadow-sm focus-ring transition-transform hover:scale-[1.03]"
        data-testid="login-link"
      >
        <UserRound className="size-4" aria-hidden />
        Đăng nhập
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {user.role === "admin" ? (
        <Link
          href="/admin"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-sun px-4 text-sm font-bold text-ink shadow-sm focus-ring transition-transform hover:scale-[1.03]"
        >
          <LayoutDashboard className="size-4" aria-hidden />
          Quản trị
        </Link>
      ) : null}
      <Link
        href="/tai-khoan"
        className="grid size-11 place-items-center rounded-full bg-aurora text-sm font-extrabold text-ink shadow-sm ring-2 ring-white focus-ring transition-transform hover:scale-105"
        aria-label={`Tài khoản của ${user.fullName || user.email}`}
        data-testid="account-link"
      >
        {initials(user.fullName, user.email)}
      </Link>
    </div>
  );
}

export function AccountMenuSkeleton() {
  return <span className="block h-11 w-28 skeleton rounded-full" aria-hidden />;
}
