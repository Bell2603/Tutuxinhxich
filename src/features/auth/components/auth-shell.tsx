import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Sparkle } from "@/components/ui/sparkle";
import { site } from "@/config/site";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-float ring-1 ring-line md:grid-cols-[1fr_1.1fr]">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-aurora p-10 text-ink md:flex">
          <Sparkle className="absolute top-10 right-10 size-8 animate-twinkle text-white" />
          <Sparkle className="absolute bottom-24 left-8 size-5 animate-twinkle text-sun [animation-delay:1s]" />
          <LogoMark className="size-24 animate-float" />
          <div>
            <p className="font-serif text-3xl leading-tight italic">“{site.slogan}”</p>
            <p className="mt-4 font-medium text-ink/80">
              Đăng nhập để thanh toán, theo dõi đơn hàng và lưu thông tin nhận hàng cho lần sau.
            </p>
          </div>
        </div>
        <div className="p-6 sm:p-10">
          <h1 className="text-4xl font-extrabold">{title}</h1>
          <p className="mt-2 mb-8 text-ink-soft">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
