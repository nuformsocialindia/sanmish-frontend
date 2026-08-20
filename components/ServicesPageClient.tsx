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
import { SERVICE_TESTIMONIALS, SERVICE_FAQ } from "@/lib/data";
import type { ApiService } from "@/lib/publicApi";

export default function ServicesPageClient({ apiServices }: { apiServices: ApiService[] }) {
  useScrollAnimations();

  return (
    <>
      <TopSearchBand />
      <ServicesHero />
      <ServicesGridSection apiServices={apiServices} />
      <ProcessSection />
      <WhyServicesSection />
      <IndustriesSection />
      <ServiceStatsSection />
      <TestimonialsSection
        items={SERVICE_TESTIMONIALS}
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
          <FAQAccordion items={SERVICE_FAQ} />
        </div>
      </section>
      <ServicesCTASection />
    </>
  );
}
