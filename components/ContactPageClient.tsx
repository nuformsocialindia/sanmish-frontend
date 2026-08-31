"use client";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import {
  TopSearchBand,
  ContactHero,
  ContactMethodsSection,
  ContactInfoPanel,
  OfficesSection,
  ContactCTASection,
  type ContactMethod,
  type ContactDetails,
} from "@/components/ContactSections";
import ContactForm from "@/components/ContactForm";
import FAQAccordion from "@/components/FAQAccordion";

type Office = { city: string; addr: string; phone: string };
type FaqItem = { q: string; a: string };

export default function ContactPageClient({
  methods,
  details,
  offices,
  faq,
}: {
  methods: ContactMethod[];
  details: ContactDetails;
  offices: Office[];
  faq: FaqItem[];
}) {
  useScrollAnimations();

  return (
    <>
      <TopSearchBand />
      <ContactHero />
      <ContactMethodsSection methods={methods} />
      <section className="section" id="contact-form" style={{ paddingTop: 20 }}>
        <div className="wrap contact-grid">
          <ContactForm />
          <ContactInfoPanel details={details} />
        </div>
      </section>
      <OfficesSection offices={offices} />
      <section className="section" id="faq" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow reveal"><span className="dot" />Before you write</span>
            <h2 className="reveal d1">Common <span className="grad-text">questions</span></h2>
          </div>
          <FAQAccordion items={faq} />
        </div>
      </section>
      <ContactCTASection />
    </>
  );
}
