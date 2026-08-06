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

export default function HomePage() {
  useScrollAnimations();

  return (
    <>
      <SearchBand />
      <HeroSection />
      <FeatureHighlights />
      <CategoryGrid />
      <FeaturedProducts />
      <ShowcaseSection />
      <BestsellersSection />
      <CitiesSection />
      <WhySection />
      <ServicesSection />
      <StatsSection />
      <BrandsSection />
      <HowItWorks />
      <BuyersLove />
      <TestimonialsSection />
      <CTASection />
      <AppDownloadSection />
      <HelpBand />
    </>
  );
}
