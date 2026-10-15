import { Suspense } from "react";
import { ContentEnter, PageTransition, SkeletonExit } from "@/components/motion/page-transition";
import { BrandStory } from "@/features/home/components/brand-story";
import {
  CollectionSection,
  CollectionSkeleton,
} from "@/features/home/components/collection-section";
import { FeaturedSection, FeaturedSkeleton } from "@/features/home/components/featured-section";
import { FinalCta } from "@/features/home/components/final-cta";
import { Hero } from "@/features/home/components/hero";
import { Lookbook } from "@/features/home/components/lookbook";
import { MarqueeBand } from "@/features/home/components/marquee-band";
import { Reviews, ReviewsSkeleton } from "@/features/home/components/reviews";
import { StylingGuide } from "@/features/home/components/styling-guide";
import { WhyUs } from "@/features/home/components/why-us";

export default function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <MarqueeBand />
      <Suspense
        fallback={
          <SkeletonExit>
            <CollectionSkeleton />
          </SkeletonExit>
        }
      >
        <ContentEnter>
          <CollectionSection />
        </ContentEnter>
      </Suspense>
      <Suspense
        fallback={
          <SkeletonExit>
            <FeaturedSkeleton />
          </SkeletonExit>
        }
      >
        <ContentEnter>
          <FeaturedSection />
        </ContentEnter>
      </Suspense>
      <Lookbook />
      <BrandStory />
      <WhyUs />
      <StylingGuide />
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews />
      </Suspense>
      <FinalCta />
    </PageTransition>
  );
}
