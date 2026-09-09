"use client";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import HeroSection from "@/components/HeroSection";
import {
  SearchBand,
  FeatureHighlights,
  CategoryGrid,
  FeaturedProducts,
} from "@/components/ProductSections";
import ShowcaseSection from "@/components/ShowcaseSection";
import BestsellersSection from "@/components/BestsellersSection";
import CitiesSection from "@/components/CitiesSection";
import {
  WhySection,
  ServicesSection,
  StatsSection,
  BrandsSection,
  HowItWorks,
  BuyersLove,
} from "@/components/ContentSections";
import TestimonialsSection from "@/components/TestimonialsSection";
import { CTASection, AppDownloadSection, HelpBand } from "@/components/BottomSections";
import type { ApiCategory, ApiProductSummary, ApiBrand, ApiService } from "@/lib/publicApi";

type Stat = { count: number; suffix: string; label: string };
type WhyItem = { t: string; s: string };
type Step = { title: string; desc: string; icon: string };
type IconCard = { icon: string; title: string; desc: string };
type Testimonial = { q: string; n: string; r: string; a: string };

export default function HomePageClient({
  apiCategories,
  apiProducts,
  apiBrands,
  apiServices,
  stats,
  whyItems,
  brandNames,
  howItWorks,
  buyersLove,
  testimonials,
}: {
  apiCategories: ApiCategory[];
  apiProducts: ApiProductSummary[];
  apiBrands: ApiBrand[];
  apiServices: ApiService[];
  stats: Stat[];
  whyItems: WhyItem[];
  brandNames: string[];
  howItWorks: Step[];
  buyersLove: IconCard[];
  testimonials: Testimonial[];
}) {
  useScrollAnimations();

  return (
    <>
      <SearchBand />
      <HeroSection />
      <FeatureHighlights />
      <CategoryGrid apiCategories={apiCategories} />
      <FeaturedProducts apiProducts={apiProducts} />
      <ShowcaseSection />
      <BestsellersSection />
      <CitiesSection />
      <WhySection items={whyItems} />
      <ServicesSection apiServices={apiServices} />
      <StatsSection stats={stats} />
      <BrandsSection names={brandNames} apiBrands={apiBrands} />
      <HowItWorks steps={howItWorks} />
      <BuyersLove items={buyersLove} />
      <TestimonialsSection items={testimonials} />
      <CTASection />
      <AppDownloadSection />
      <HelpBand />
    </>
  );
}
