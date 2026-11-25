import { Suspense } from "react";
import { ContentEnter, PageTransition, SkeletonExit } from "@/components/motion/page-transition";
import {
  CollectionSection,
  CollectionSkeleton,
} from "@/features/home/components/collection-section";
import { FeaturedSection, FeaturedSkeleton } from "@/features/home/components/featured-section";
import { FinalCta } from "@/features/home/components/final-cta";
import { Hero } from "@/features/home/components/hero";
import { PartnersSection } from "@/features/home/components/partners-section";
import { MarqueeBand } from "@/features/home/components/marquee-band";
import { Reviews, ReviewsSkeleton } from "@/features/home/components/reviews";
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
      <PartnersSection />
      <WhyUs />
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews />
      </Suspense>
      <FinalCta />
    </PageTransition>
  );
}
