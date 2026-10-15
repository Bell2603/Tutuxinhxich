import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { LogoMark } from "@/components/brand/logo";

export function FinalCta() {
  return (
    <section className="container-page pt-8" aria-labelledby="cta-title">
      <Reveal className="relative isolate overflow-hidden rounded-[3rem] bg-aurora px-6 py-16 text-center shadow-pop sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgb(255_255_255/0.45),transparent_40%),radial-gradient(circle_at_80%_80%,rgb(255_207_63/0.45),transparent_45%)]"
        />
        <Sparkle className="absolute top-10 left-[10%] size-8 animate-twinkle text-white" />
        <Sparkle className="absolute right-[12%] bottom-12 size-10 animate-twinkle text-sun [animation-delay:1s]" />
        <LogoMark className="mx-auto size-20 animate-float" />
        <h2
          id="cta-title"
          className="mx-auto mt-6 max-w-3xl text-4xl leading-[1.05] font-extrabold text-ink sm:text-6xl"
        >
          Tu tu! Tàu sắp chạy rồi — <span className="font-serif italic">chọn khăn</span> của bạn
          thôi!
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg font-medium text-ink/80">
          Miễn phí giao hàng cho đơn từ 500.000₫ và gói quà xinh cho mọi đơn.
        </p>
        <ButtonLink href="/bo-suu-tap" size="lg" variant="primary" className="group mt-8">
          Mua ngay
          <ArrowRight
            className="size-5 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </ButtonLink>
      </Reveal>
    </section>
  );
}
