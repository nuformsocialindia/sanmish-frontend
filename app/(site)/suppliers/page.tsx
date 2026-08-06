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
import { SUPPLIER_TESTIMONIALS, SUPPLIER_FAQ } from "@/lib/data";

export default function SuppliersPage() {
  useScrollAnimations();

  return (
    <>
      <TopSearchBand />
      <SuppliersHero />
      <SupplierDirectory />
      <SupplierStatsSection />
      <WhySourceSection />
      <JoinStepsSection />
      <BenefitsSection />
      <TestimonialsSection
        items={SUPPLIER_TESTIMONIALS}
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
          <FAQAccordion items={SUPPLIER_FAQ} />
        </div>
      </section>
      <SuppliersCTASection />
    </>
  );
}
