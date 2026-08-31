"use client";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import { TopSearchBand } from "@/components/ContactSections";
import {
  ServicesHero,
  ServicesGridSection,
  ProcessSection,
  WhyServicesSection,
  IndustriesSection,
  ServiceStatsSection,
  ServicesCTASection,
} from "@/components/ServicesSections";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQAccordion from "@/components/FAQAccordion";
import type { ApiService } from "@/lib/publicApi";

type ServiceItem = { t: string; d: string; i: string };
type ProcessStep = { title: string; desc: string; icon: string };
type WhyItem = { t: string; s: string };
type Industry = { title: string; desc: string; icon: string };
type Stat = { count: number; suffix: string; label: string };
type Testimonial = { q: string; n: string; r: string; a: string };
type FaqItem = { q: string; a: string };

export default function ServicesPageClient({
  services,
  apiServices,
  processSteps,
  whyItems,
  industries,
  stats,
  testimonials,
  faq,
}: {
  services: ServiceItem[];
  apiServices: ApiService[];
  processSteps: ProcessStep[];
  whyItems: WhyItem[];
  industries: Industry[];
  stats: Stat[];
  testimonials: Testimonial[];
  faq: FaqItem[];
}) {
  useScrollAnimations();

  return (
    <>
      <TopSearchBand />
      <ServicesHero />
      <ServicesGridSection services={services} apiServices={apiServices} />
      <ProcessSection steps={processSteps} />
      <WhyServicesSection items={whyItems} />
      <IndustriesSection industries={industries} />
      <ServiceStatsSection stats={stats} />
      <TestimonialsSection
        items={testimonials}
        eyebrow="Client stories"
        heading={
          <>
            Trusted on the <span className="grad-text">ground</span>
          </>
        }
      />
      <section className="section" id="faq" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow reveal"><span className="dot" />Good to know</span>
            <h2 className="reveal d1">Service <span className="grad-text">FAQs</span></h2>
          </div>
          <FAQAccordion items={faq} />
        </div>
      </section>
      <ServicesCTASection />
    </>
  );
}
