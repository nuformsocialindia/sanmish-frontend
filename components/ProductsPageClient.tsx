"use client";
import { useState } from "react";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import { PageBanner, ListingSearchBand, ListingCTASection } from "@/components/ProductsPageSections";
import ProductListing from "@/components/ProductListing";
import type { ApiProductSummary, ApiCategory, ApiBrand } from "@/lib/publicApi";

export default function ProductsPageClient({
  apiProducts,
  apiCategories,
  apiBrands,
}: {
  apiProducts: ApiProductSummary[];
  apiCategories: ApiCategory[];
  apiBrands: ApiBrand[];
}) {
  useScrollAnimations();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState<string | null>(null);

  const scrollToResults = () => {
    document.querySelector(".listing-toolbar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <PageBanner />
      <ListingSearchBand
        categories={apiCategories}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        selectedCategory={searchCategory}
        onCategoryChange={setSearchCategory}
        onSubmit={scrollToResults}
      />
      <section className="listing-section">
        <div className="wrap">
          <ProductListing
            apiProducts={apiProducts}
            apiCategories={apiCategories}
            apiBrands={apiBrands}
            searchTerm={searchTerm}
            searchCategory={searchCategory}
            onSearchTermChange={setSearchTerm}
            onSearchCategoryChange={setSearchCategory}
          />
        </div>
      </section>
      <ListingCTASection />
    </>
  );
}
