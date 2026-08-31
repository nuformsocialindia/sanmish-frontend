import { fetchApiSection } from "@/lib/publicApi";
import { OFFICES, CONTACT_FAQ } from "@/lib/data";
import { DEFAULT_CONTACT_METHODS, DEFAULT_CONTACT_DETAILS, type ContactMethod, type ContactDetails } from "@/components/ContactSections";
import ContactPageClient from "@/components/ContactPageClient";

type Office = { city: string; addr: string; phone: string };
type FaqItem = { q: string; a: string };

export default async function ContactPage() {
  const [methods, detailsRecord, offices, faq] = await Promise.all([
    fetchApiSection<ContactMethod[]>("/contact/methods"),
    fetchApiSection<ContactDetails[]>("/contact/details"),
    fetchApiSection<Office[]>("/contact/offices"),
    fetchApiSection<FaqItem[]>("/contact/faq"),
  ]);

  return (
    <ContactPageClient
      methods={methods ?? DEFAULT_CONTACT_METHODS}
      details={detailsRecord?.[0] ?? DEFAULT_CONTACT_DETAILS}
      offices={offices ?? OFFICES}
      faq={faq ?? CONTACT_FAQ}
    />
  );
}
