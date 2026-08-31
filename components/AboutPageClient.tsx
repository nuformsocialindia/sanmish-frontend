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

type Stat = { count: number; suffix: string; label: string };
type StoryPoint = { t: string; s: string };
type IconCard = { icon: string; title: string; desc: string };
type JourneyStep = { year: string; title: string; desc: string; icon: string };
type TeamMember = { a: string; n: string; r: string; b: string };
type Testimonial = { q: string; n: string; r: string; a: string };

export default function AboutPageClient({
  stats,
  storyPoints,
  missionVision,
  values,
  journey,
  team,
  certifications,
  brands,
  testimonials,
}: {
  stats: Stat[];
  storyPoints: StoryPoint[];
  missionVision: IconCard[];
  values: IconCard[];
  journey: JourneyStep[];
  team: TeamMember[];
  certifications: IconCard[];
  brands: string[];
  testimonials: Testimonial[];
}) {
  useScrollAnimations();

  return (
    <>
      <AboutHero />
      <AboutStatsSection stats={stats} />
      <StorySection points={storyPoints} />
      <MissionVisionSection items={missionVision} />
      <CoreValuesSection values={values} />
      <JourneySection journey={journey} />
      <TeamSection team={team} />
      <CertificationsSection certifications={certifications} />
      <BrandsSection names={brands} />
      <TestimonialsSection items={testimonials} />
      <AboutCTASection />
    </>
  );
}
