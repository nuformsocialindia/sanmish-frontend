import { fetchApiCategories, fetchApiProducts, fetchApiBrands, fetchApiServices } from "@/lib/publicApi";
import HomePageClient from "@/components/HomePageClient";

export default async function Page() {
  const [apiCategories, apiProducts, apiBrands, apiServices] = await Promise.all([
    fetchApiCategories({ flat: true, limit: 50 }),
    fetchApiProducts({ limit: 20 }),
    fetchApiBrands({ marquee: true }),
    fetchApiServices(),
  ]);

  return (
    <HomePageClient
      apiCategories={apiCategories}
      apiProducts={apiProducts}
      apiBrands={apiBrands}
      apiServices={apiServices}
    />
  );
}
