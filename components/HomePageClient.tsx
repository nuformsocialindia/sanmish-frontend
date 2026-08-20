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

export default function HomePageClient({
  apiCategories,
  apiProducts,
  apiBrands,
  apiServices,
}: {
  apiCategories: ApiCategory[];
  apiProducts: ApiProductSummary[];
  apiBrands: ApiBrand[];
  apiServices: ApiService[];
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
      <WhySection />
      <ServicesSection apiServices={apiServices} />
      <StatsSection />
      <BrandsSection apiBrands={apiBrands} />
      <HowItWorks />
      <BuyersLove />
      <TestimonialsSection />
      <CTASection />
      <AppDownloadSection />
      <HelpBand />
    </>
  );
}
