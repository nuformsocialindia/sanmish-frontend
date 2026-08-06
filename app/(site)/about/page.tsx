"use client";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import {
  AboutHero,
  AboutStatsSection,
  StorySection,
  MissionVisionSection,
  CoreValuesSection,
  JourneySection,
  TeamSection,
  CertificationsSection,
  AboutCTASection,
} from "@/components/AboutSections";
import { BrandsSection } from "@/components/ContentSections";
import TestimonialsSection from "@/components/TestimonialsSection";

export default function AboutPage() {
  useScrollAnimations();

  return (
    <>
      <AboutHero />
      <AboutStatsSection />
      <StorySection />
      <MissionVisionSection />
      <CoreValuesSection />
      <JourneySection />
      <TeamSection />
      <CertificationsSection />
      <BrandsSection />
      <TestimonialsSection />
      <AboutCTASection />
    </>
  );
}
