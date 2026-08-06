"use client";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import { PageBanner, ListingSearchBand, ListingCTASection } from "@/components/ProductsPageSections";
import ProductListing from "@/components/ProductListing";

export default function ProductsPage() {
  useScrollAnimations();

  return (
    <>
      <PageBanner />
      <ListingSearchBand />
      <section className="listing-section">
        <div className="wrap">
          <ProductListing />
        </div>
      </section>
      <ListingCTASection />
    </>
  );
}
