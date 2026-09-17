"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DEALS } from "@/lib/data";
import { normalizeApiProducts } from "@/components/ProductSections";
import type { ApiProductSummary } from "@/lib/publicApi";

export default function ShowcaseSection({
  apiNewArrivals,
  apiTrendingProducts,
}: {
  apiNewArrivals: ApiProductSummary[];
  apiTrendingProducts: ApiProductSummary[];
}) {
  const [dealIdx, setDealIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setDealIdx((i) => (i + 1) % DEALS.length);
    }, 4200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Both strictly admin-flag-driven (Product.isNewArrival / isTrending,
  // "Homepage rail placement" in the admin form) — no fallback, so
  // unchecking a product actually removes it instead of a stand-in list
  // quietly taking its place.
  const newArrivals = normalizeApiProducts(apiNewArrivals).slice(0, 4);
  const bestSelling = normalizeApiProducts(apiTrendingProducts).slice(0, 4);

  if (newArrivals.length === 0 && bestSelling.length === 0) return null;

  return (
    <section className="section" style={{ paddingTop: 20 }}>
      <div className="wrap">
        <div className="showcase-grid">

          {newArrivals.length > 0 && (
            <div className="showcase-col reveal">
              <div className="col-head">
                <h3>New Arrivals</h3>
                <Link href="/products">View all <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
              </div>
              <div className="mini-grid">
                {newArrivals.map((item) => (
                  <Link href={`/products/${item.slug}`} className="mini-prod" key={item.key}>
                    <div className="mini-thumb" dangerouslySetInnerHTML={{ __html: item.icon }} />
                    <h4>{item.title}</h4>
                    <div className="from">Starting from <b>{item.priceLabel}</b></div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {bestSelling.length > 0 && (
            <div className="showcase-col reveal d1">
              <div className="col-head">
                <h3>Best Selling</h3>
                <Link href="/products">View all <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
              </div>
              <div className="mini-grid">
                {bestSelling.map((item) => (
                  <Link href={`/products/${item.slug}`} className="mini-prod" key={item.key}>
                    <div className="mini-thumb" dangerouslySetInnerHTML={{ __html: item.icon }} />
                    <h4>{item.title}</h4>
                    <div className="from">Starting from <b>{item.priceLabel}</b></div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Popular Deals banner */}
          <div className="showcase-col deals reveal d2">
            <div className="col-head">
              <h3>Popular Deals</h3>
              <a href="#cta">Offers <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
            </div>
            <div className="deal-banner">
              {DEALS.map((deal, i) => (
                <div
                  key={i}
                  className={`deal-slide${i === dealIdx ? " active" : ""}`}
                  style={{ background: deal.dg } as React.CSSProperties}
                >
                  <small>{deal.tag}</small>
                  <h3>{deal.h}</h3>
                  <div className="off">{deal.off}<span>{deal.offSub}</span></div>
                  <a href="#cta" className="btn btn-white">
                    {deal.cta}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                </div>
              ))}
              <div className="deal-dots">
                {DEALS.map((_, i) => (
                  <button
                    key={i}
                    className={i === dealIdx ? "on" : ""}
                    onClick={() => setDealIdx(i)}
                    aria-label={`Deal ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
