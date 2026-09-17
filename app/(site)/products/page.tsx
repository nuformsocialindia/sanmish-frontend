import { Suspense } from "react";
import { fetchApiProducts, fetchApiCategories, fetchApiBrands } from "@/lib/publicApi";
import ProductsPageClient from "@/components/ProductsPageClient";

export default async function ProductsPage() {
  const [apiProducts, apiCategories, apiBrands] = await Promise.all([
    fetchApiProducts({ limit: 100 }),
    fetchApiCategories({ flat: true, limit: 100 }),
    fetchApiBrands({ limit: 100 }),
  ]);

  return (
    <Suspense>
      <ProductsPageClient apiProducts={apiProducts} apiCategories={apiCategories} apiBrands={apiBrands} />
    </Suspense>
  );
}
