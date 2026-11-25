import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { PageTransition } from "@/components/motion/page-transition";
import { AccordionItem } from "@/components/ui/accordion";
import { Accent } from "@/components/ui/section-heading";
import { site } from "@/config/site";
import { FAQS } from "@/features/policies/content";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp",
  description: `Giải đáp nhanh về giao hàng, đổi trả, thanh toán và bảo quản khăn tại ${site.name}.`,
};

export default function FaqPage() {
  return (
    <PageTransition>
      <>
        <PageHero
          eyebrow="Hỏi đáp"
          title={
            <>
              Hỏi gì <Accent>Tu Tu</Accent> cũng đáp
            </>
          }
          description="Những thắc mắc hay gặp nhất trước khi lên tàu. Nội dung khớp với trang Chính sách của cửa hàng."
        />
        <div className="container-page max-w-4xl py-10">
          <div
            className="rounded-[2rem] bg-white px-7 py-3 shadow-card ring-1 ring-line"
            data-testid="faq-list"
          >
            {FAQS.map((faq, i) => (
              <AccordionItem key={faq.question} title={faq.question} defaultOpen={i === 0}>
                <p>{faq.answer}</p>
              </AccordionItem>
            ))}
          </div>
          <p className="mt-8 text-center text-ink-soft">
            Chưa thấy câu trả lời? Xem{" "}
            <Link href="/chinh-sach" className="font-semibold text-berry hover:underline">
              chính sách đầy đủ
            </Link>{" "}
            hoặc{" "}
            <Link href="/ve-chung-toi#lien-he" className="font-semibold text-berry hover:underline">
              liên hệ Tu Tu
            </Link>
            .
          </p>
        </div>
      </>
    </PageTransition>
  );
}
