import { fetchApiSection } from "@/lib/publicApi";
import {
  ABOUT_STATS, STORY_POINTS, CORE_VALUES, JOURNEY, TEAM, CERTIFICATIONS, BRANDS, TESTIMONIALS,
} from "@/lib/data";
import AboutPageClient from "@/components/AboutPageClient";
import { DEFAULT_MISSION_VISION } from "@/components/AboutSections";

type Stat = { count: number; suffix: string; label: string };
type StoryPoint = { t: string; s: string };
type IconCard = { icon: string; title: string; desc: string };
type JourneyStep = { year: string; title: string; desc: string; icon: string };
type TeamMember = { a: string; n: string; r: string; b: string };
type BrandItem = { name: string };
type Testimonial = { q: string; n: string; r: string; a: string };

export default async function AboutPage() {
  const [stats, storyPoints, missionVision, values, journey, team, certifications, brands, testimonials] = await Promise.all([
    fetchApiSection<Stat[]>("/about/stats"),
    fetchApiSection<StoryPoint[]>("/about/story-points"),
    fetchApiSection<IconCard[]>("/about/mission-vision"),
    fetchApiSection<IconCard[]>("/about/values"),
    fetchApiSection<JourneyStep[]>("/about/journey"),
    fetchApiSection<TeamMember[]>("/about/team"),
    fetchApiSection<IconCard[]>("/about/certifications"),
    fetchApiSection<BrandItem[]>("/about/brands"),
    fetchApiSection<Testimonial[]>("/about/testimonials"),
  ]);

  return (
    <AboutPageClient
      stats={stats ?? ABOUT_STATS}
      storyPoints={storyPoints ?? STORY_POINTS}
      missionVision={missionVision ?? DEFAULT_MISSION_VISION}
      values={values ?? CORE_VALUES}
      journey={journey ?? JOURNEY}
      team={team ?? TEAM}
      certifications={certifications ?? CERTIFICATIONS}
      brands={brands ? brands.map((b) => b.name) : BRANDS}
      testimonials={testimonials ?? TESTIMONIALS}
    />
  );
}
