import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { PageTransition } from "@/components/motion/page-transition";
import { Accent } from "@/components/ui/section-heading";
import { site } from "@/config/site";
import { StylingGuide } from "@/features/styling/components/styling-guide";
import { STYLES } from "@/features/styling/styling-data";

export const metadata: Metadata = {
  title: "Hướng dẫn phối khăn",
  description: `${STYLES.length} cách quàng khăn của ${site.name}: ${STYLES.map((s) => s.label.toLowerCase()).join(", ")}.`,
};

export default function StylingPage() {
  return (
    <PageTransition>
      <>
        <PageHero
          eyebrow="Phối khăn"
          title={
            <>
              Một chiếc khăn, <Accent>muôn kiểu</Accent> xinh
            </>
          }
          description="Chọn cách quàng hợp outfit hôm nay — mỗi kiểu kèm các bước làm và mẫu khăn gợi ý."
        />
        <StylingGuide />
      </>
    </PageTransition>
  );
}
