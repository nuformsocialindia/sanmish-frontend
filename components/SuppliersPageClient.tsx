"use client";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import { TopSearchBand } from "@/components/ContactSections";
import {
  SuppliersHero,
  SupplierStatsSection,
  WhySourceSection,
  JoinStepsSection,
  BenefitsSection,
  SuppliersCTASection,
} from "@/components/SuppliersSections";
import SupplierDirectory from "@/components/SupplierDirectory";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQAccordion from "@/components/FAQAccordion";

type SupplierFilter = { value: string; label: string };
type Supplier = { n: string; a: string; t: string; loc: string; r: string; rv: number; p: number; tags: string[]; cats: string[] };
type Stat = { count: number; suffix: string; label: string };
type WhyItem = { t: string; s: string };
type JoinStep = { title: string; desc: string; icon: string };
type Benefit = { icon: string; title: string; desc: string };
type Testimonial = { q: string; n: string; r: string; a: string };
type FaqItem = { q: string; a: string };

export default function SuppliersPageClient({
  filters,
  suppliers,
  stats,
  whyItems,
  joinSteps,
  benefits,
  testimonials,
  faq,
}: {
  filters: SupplierFilter[];
  suppliers: Supplier[];
  stats: Stat[];
  whyItems: WhyItem[];
  joinSteps: JoinStep[];
  benefits: Benefit[];
  testimonials: Testimonial[];
  faq: FaqItem[];
}) {
  useScrollAnimations();

  return (
    <>
      <TopSearchBand />
      <SuppliersHero />
      <SupplierDirectory suppliers={suppliers} filters={filters} />
      <SupplierStatsSection stats={stats} />
      <WhySourceSection items={whyItems} />
      <JoinStepsSection steps={joinSteps} />
      <BenefitsSection benefits={benefits} />
      <TestimonialsSection
        items={testimonials}
        eyebrow="Supplier stories"
        heading={
          <>
            Trusted by <span className="grad-text">verified suppliers</span>
          </>
        }
      />
      <section className="section" id="faq" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow reveal"><span className="dot" />Good to know</span>
            <h2 className="reveal d1">Supplier <span className="grad-text">FAQs</span></h2>
          </div>
          <FAQAccordion items={faq} />
        </div>
      </section>
      <SuppliersCTASection />
    </>
  );
}
