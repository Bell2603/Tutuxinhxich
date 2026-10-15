import type { Metadata } from "next";
import { PageTransition } from "@/components/motion/page-transition";
import { Accent, Eyebrow } from "@/components/ui/section-heading";
import { WishlistView } from "@/features/wishlist/components/wishlist-view";

export const metadata: Metadata = { title: "Danh sách yêu thích", robots: { index: false } };

export default function WishlistPage() {
  return (
    <PageTransition>
      <div className="container-page py-10">
        <Eyebrow>Lưu trên trình duyệt này</Eyebrow>
        <h1 className="mt-5 mb-8 text-5xl leading-[1.02] font-extrabold sm:text-6xl">
          Những toa bạn <Accent>thả tim</Accent>
        </h1>
        <WishlistView />
      </div>
    </PageTransition>
  );
}
