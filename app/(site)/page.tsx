import { fetchApiCategories, fetchApiProducts, fetchApiBrands, fetchApiServices, fetchApiSection } from "@/lib/publicApi";
import { STATS, HOW_IT_WORKS, BUYERS_LOVE, BRANDS, TESTIMONIALS } from "@/lib/data";
import { DEFAULT_HOME_WHY_ITEMS } from "@/components/ContentSections";
import HomePageClient from "@/components/HomePageClient";

type Stat = { count: number; suffix: string; label: string };
type WhyItem = { t: string; s: string };
type Step = { title: string; desc: string; icon: string };
type IconCard = { icon: string; title: string; desc: string };
type BrandItem = { name: string };
type Testimonial = { q: string; n: string; r: string; a: string };

export default async function Page() {
  const [
    apiCategories, apiFeaturedProducts, apiTrendingProducts, apiNewArrivals, apiBestsellerProducts, apiBrands, apiServices,
    stats, whyItems, brands, howItWorks, buyersLove, testimonials,
  ] = await Promise.all([
    fetchApiCategories({ flat: true, limit: 50 }),
    // Featured Equipment / Hot Selling / New Arrivals / Bestsellers rails
    // reflect the admin's own isFeatured/isTrending/isNewArrival/isBestseller
    // flags — not just whatever happened to load first — so an admin
    // flipping a flag actually changes what shows up here.
    fetchApiProducts({ isFeatured: true, limit: 8 }),
    fetchApiProducts({ isTrending: true, limit: 8 }),
    fetchApiProducts({ isNewArrival: true, limit: 8 }),
    fetchApiProducts({ isBestseller: true, limit: 8 }),
    fetchApiBrands({ marquee: true }),
    fetchApiServices(),
    fetchApiSection<Stat[]>("/home/stats"),
    fetchApiSection<WhyItem[]>("/home/why-items"),
    fetchApiSection<BrandItem[]>("/about/brands"),
    fetchApiSection<Step[]>("/home/how-it-works"),
    fetchApiSection<IconCard[]>("/home/buyers-love"),
    fetchApiSection<Testimonial[]>("/about/testimonials"),
  ]);

  return (
    <HomePageClient
      apiCategories={apiCategories}
      apiFeaturedProducts={apiFeaturedProducts}
      apiTrendingProducts={apiTrendingProducts}
      apiNewArrivals={apiNewArrivals}
      apiBestsellerProducts={apiBestsellerProducts}
      apiBrands={apiBrands}
      apiServices={apiServices}
      stats={stats ?? STATS}
      whyItems={whyItems ?? DEFAULT_HOME_WHY_ITEMS}
      brandNames={brands ? brands.map((b) => b.name) : BRANDS}
      howItWorks={howItWorks ?? HOW_IT_WORKS}
      buyersLove={buyersLove ?? BUYERS_LOVE}
      testimonials={testimonials ?? TESTIMONIALS}
    />
  );
}
