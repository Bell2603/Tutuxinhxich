import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { PageTransition } from "@/components/motion/page-transition";
import { Accent } from "@/components/ui/section-heading";
import { site } from "@/config/site";
import { BrandStory } from "@/features/about/components/brand-story";
import { ContactSection } from "@/features/about/components/contact-section";

export const metadata: Metadata = {
  title: "Về chúng tôi & liên hệ",
  description: `Vì sao lại là ${site.name}? Câu chuyện đằng sau cái tên, thông tin liên hệ và địa chỉ cửa hàng.`,
};

export default function AboutPage() {
  return (
    <PageTransition>
      <>
        <PageHero
          eyebrow="Về chúng tôi"
          title={
            <>
              Chuyến tàu <Accent>sắc màu</Accent> của Tu Tu
            </>
          }
          description={`${site.tagline}. Đây là câu chuyện của chúng mình — và cách để bạn ghé thăm.`}
        />
        <BrandStory />
        <ContactSection />
      </>
    </PageTransition>
  );
}
