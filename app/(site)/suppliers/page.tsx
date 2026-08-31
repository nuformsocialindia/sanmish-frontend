import { fetchApiSection } from "@/lib/publicApi";
import {
  SUPPLIER_FILTERS, SUPPLIERS, SUPPLIER_STATS, SUPPLIER_WHY_ITEMS, SUPPLIER_JOIN_STEPS,
  SUPPLIER_BENEFITS, SUPPLIER_TESTIMONIALS, SUPPLIER_FAQ,
} from "@/lib/data";
import SuppliersPageClient from "@/components/SuppliersPageClient";

type SupplierFilter = { value: string; label: string };
type Supplier = { n: string; a: string; t: string; loc: string; r: string; rv: number; p: number; tags: string[]; cats: string[] };
type Stat = { count: number; suffix: string; label: string };
type WhyItem = { t: string; s: string };
type JoinStep = { title: string; desc: string; icon: string };
type Benefit = { icon: string; title: string; desc: string };
type Testimonial = { q: string; n: string; r: string; a: string };
type FaqItem = { q: string; a: string };

export default async function SuppliersPage() {
  const [filters, suppliers, stats, whyItems, joinSteps, benefits, testimonials, faq] = await Promise.all([
    fetchApiSection<SupplierFilter[]>("/suppliers/filters"),
    fetchApiSection<Supplier[]>("/suppliers/directory"),
    fetchApiSection<Stat[]>("/suppliers/stats"),
    fetchApiSection<WhyItem[]>("/suppliers/why-items"),
    fetchApiSection<JoinStep[]>("/suppliers/join-steps"),
    fetchApiSection<Benefit[]>("/suppliers/benefits"),
    fetchApiSection<Testimonial[]>("/suppliers/testimonials"),
    fetchApiSection<FaqItem[]>("/suppliers/faq"),
  ]);

  return (
    <SuppliersPageClient
      filters={filters ?? SUPPLIER_FILTERS}
      suppliers={suppliers ?? SUPPLIERS}
      stats={stats ?? SUPPLIER_STATS}
      whyItems={whyItems ?? SUPPLIER_WHY_ITEMS}
      joinSteps={joinSteps ?? SUPPLIER_JOIN_STEPS}
      benefits={benefits ?? SUPPLIER_BENEFITS}
      testimonials={testimonials ?? SUPPLIER_TESTIMONIALS}
      faq={faq ?? SUPPLIER_FAQ}
    />
  );
}
