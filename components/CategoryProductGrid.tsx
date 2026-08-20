"use client";
import { useState } from "react";
import SimilarProductCard from "@/components/SimilarProductCard";
import type { ProductDetail } from "@/lib/productLookup";

const PER_PAGE = 9;

// Paginates so a category with many products doesn't turn this page into
// one very long unbroken grid — matches the /products listing's own PER_PAGE.
export default function CategoryProductGrid({ products }: { products: ProductDetail[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = products.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const goToPage = (i: number) => {
    setPage(i);
    document.querySelector(".listing-grid-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="listing-grid-products">
        {pageItems.map((p) => (
          <SimilarProductCard key={p.slug} product={p} compact={false} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={safePage === 1} onClick={() => goToPage(safePage - 1)} aria-label="Previous page">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((i) => (
            <button key={i} className={`page-btn${i === safePage ? " active" : ""}`} onClick={() => goToPage(i)}>
              {i}
            </button>
          ))}
          <button className="page-btn" disabled={safePage === totalPages} onClick={() => goToPage(safePage + 1)} aria-label="Next page">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
