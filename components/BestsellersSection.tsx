"use client";
import { useRef } from "react";
import Link from "next/link";
import { normalizeApiProducts } from "@/components/ProductSections";
import type { ApiProductSummary } from "@/lib/publicApi";

export default function BestsellersSection({
  apiBestsellerProducts,
}: {
  apiBestsellerProducts: ApiProductSummary[];
}) {
  const railRef = useRef<HTMLDivElement>(null);
  // Strictly Product.isBestseller ("Show in Bestseller rail") — no fallback.
  const items = normalizeApiProducts(apiBestsellerProducts).slice(0, 8);

  if (items.length === 0) return null;

  function scroll(dir: "prev" | "next") {
    railRef.current?.scrollBy({ left: dir === "next" ? 504 : -504, behavior: "smooth" });
  }

  return (
    <section className="section" style={{ paddingTop: 20, background: "linear-gradient(180deg,#fff,var(--bg))" }}>
      <div className="wrap">

        {/* Section header — uses col-head style like original */}
        <div className="col-head reveal">
          <h3 style={{ fontSize: "1.4rem" }}>Bestsellers</h3>
          <a href="#products">Browse all equipment <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        </div>

        {/* Rail */}
        <div className="rail-wrap reveal d1">
          <button className="rail-btn prev" onClick={() => scroll("prev")} aria-label="Scroll left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="rail" ref={railRef}>
            {items.map((item) => (
              <Link href={`/products/${item.slug}`} className="bs-card" key={item.key}>
                <div className="bs-thumb">
                  <span dangerouslySetInnerHTML={{ __html: item.icon }} />
                </div>
                <h4>{item.title}</h4>
                <div className="bs-price">
                  <b>{item.priceLabel}</b>
                  {item.mrp != null && item.priceValue != null && item.mrp > item.priceValue && (
                    <s>{"₹ " + item.mrp.toLocaleString("en-IN")}</s>
                  )}
                  {item.discountPercent != null && item.discountPercent > 0 && (
                    <span className="save">{Math.round(item.discountPercent)}% off</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <button className="rail-btn next" onClick={() => scroll("next")} aria-label="Scroll right">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        {/* Promo row — exact content and SVGs from original */}
        <div className="promo-row">
          <div className="promo p1 reveal">
            <div>
              <h4>Supply Chain Financing</h4>
              <p>Working capital on up to 90% of your invoice value for verified buyers.</p>
            </div>
            <a href="#cta" className="pill">Get Started</a>
            <div className="pico">
              <svg viewBox="0 0 24 24" fill="none" stroke="#7BB145" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
          <div className="promo p2 reveal d1">
            <div>
              <h4>SANMISH Brand Store</h4>
              <p>One-stop shop for OEM-verified compressors, dispensers and valves.</p>
            </div>
            <a href="#categories" className="pill">Explore Store</a>
            <div className="pico">
              <svg viewBox="0 0 24 24" fill="none" stroke="#3E79BD" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l1-5h16l1 5M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M3 9h18M9 21v-6h6v6"/>
              </svg>
            </div>
          </div>
          <div className="promo p3 reveal d2">
            <div>
              <h4>Track Your Order</h4>
              <p>Real-time dispatch tracking for heavy industrial equipment, PAN India.</p>
            </div>
            <a href="#" className="pill">Track Now</a>
            <div className="pico">
              <svg viewBox="0 0 24 24" fill="none" stroke="#e0855a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                <circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
              </svg>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
