import { fetchApiServices, fetchApiSection } from "@/lib/publicApi";
import { SERVICES, PROCESS_STEPS, INDUSTRIES, SERVICE_STATS, SERVICE_TESTIMONIALS, SERVICE_FAQ } from "@/lib/data";
import { DEFAULT_WHY_SERVICES_ITEMS } from "@/components/ServicesSections";
import ServicesPageClient from "@/components/ServicesPageClient";

type ServiceItem = { t: string; d: string; i: string };
type ProcessStep = { title: string; desc: string; icon: string };
type WhyItem = { t: string; s: string };
type Industry = { title: string; desc: string; icon: string };
type Stat = { count: number; suffix: string; label: string };
type Testimonial = { q: string; n: string; r: string; a: string };
type FaqItem = { q: string; a: string };

export default async function ServicesPage() {
  const [services, apiServices, processSteps, whyItems, industries, stats, testimonials, faq] = await Promise.all([
    fetchApiSection<ServiceItem[]>("/services/grid"),
    fetchApiServices(),
    fetchApiSection<ProcessStep[]>("/services/process-steps"),
    fetchApiSection<WhyItem[]>("/services/why-items"),
    fetchApiSection<Industry[]>("/services/industries"),
    fetchApiSection<Stat[]>("/services/stats"),
    fetchApiSection<Testimonial[]>("/services/testimonials"),
    fetchApiSection<FaqItem[]>("/services/faq"),
  ]);

  return (
    <ServicesPageClient
      services={services ?? SERVICES}
      apiServices={apiServices}
      processSteps={processSteps ?? PROCESS_STEPS}
      whyItems={whyItems ?? DEFAULT_WHY_SERVICES_ITEMS}
      industries={industries ?? INDUSTRIES}
      stats={stats ?? SERVICE_STATS}
      testimonials={testimonials ?? SERVICE_TESTIMONIALS}
      faq={faq ?? SERVICE_FAQ}
    />
  );
}
