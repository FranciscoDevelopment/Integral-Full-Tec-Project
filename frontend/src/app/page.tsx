import { CommunityCounters } from "@/features/home/components/community-counters";
import { HomeHero } from "@/features/home/components/home-hero";
import { LatestNewsSection } from "@/features/home/components/latest-news-section";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <CommunityCounters />
      <LatestNewsSection />
    </>
  );
}
