import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Không tìm thấy trang" };

export default function NotFound() {
  return (
    <div className="grid min-h-[70dvh] place-items-center bg-candy px-4 py-16 text-center">
      <div>
        <LogoMark className="mx-auto size-28 animate-float" />
        <p className="mt-6 text-gradient font-display text-8xl font-extrabold">404</p>
        <h1 className="mt-2 text-3xl font-extrabold">Ối! Tàu đi lạc sân ga rồi</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Trang bạn tìm không tồn tại hoặc đã được dời đi. Cùng quay về ga chính nhé.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="primary">
            Về trang chủ
          </ButtonLink>
          <ButtonLink href="/bo-suu-tap" variant="light">
            Xem bộ sưu tập
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
