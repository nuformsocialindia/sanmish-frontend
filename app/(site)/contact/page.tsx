"use client";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import {
  TopSearchBand,
  ContactHero,
  ContactMethodsSection,
  ContactInfoPanel,
  OfficesSection,
  ContactCTASection,
} from "@/components/ContactSections";
import ContactForm from "@/components/ContactForm";
import FAQAccordion from "@/components/FAQAccordion";

export default function ContactPage() {
  useScrollAnimations();

  return (
    <>
      <TopSearchBand />
      <ContactHero />
      <ContactMethodsSection />
      <section className="section" id="contact-form" style={{ paddingTop: 20 }}>
        <div className="wrap contact-grid">
          <ContactForm />
          <ContactInfoPanel />
        </div>
      </section>
      <OfficesSection />
      <section className="section" id="faq" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow reveal"><span className="dot" />Before you write</span>
            <h2 className="reveal d1">Common <span className="grad-text">questions</span></h2>
          </div>
          <FAQAccordion />
        </div>
      </section>
      <ContactCTASection />
    </>
  );
}
