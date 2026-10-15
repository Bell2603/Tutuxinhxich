"use client";

import { LogoMark } from "@/components/brand/logo";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ShopError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="container-page grid min-h-[60dvh] place-items-center py-16 text-center">
      <div>
        <LogoMark className="mx-auto size-24" />
        <h1 className="mt-6 text-3xl font-extrabold">Tàu tạm dừng một chút…</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Có lỗi khi tải dữ liệu. Bạn thử lại sau vài giây nhé.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => retry()}>Thử lại</Button>
          <ButtonLink href="/" variant="light">
            Về trang chủ
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
