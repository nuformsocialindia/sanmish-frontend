"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DEALS } from "@/lib/data";
import { normalizeApiProducts } from "@/components/ProductSections";
import { useWishlist } from "@/lib/wishlist-context";
import type { ApiProductSummary } from "@/lib/publicApi";
import type { DisplayProduct } from "@/components/ProductSections";

function MiniProductGrid({ items }: { items: DisplayProduct[] }) {
  const { isWishlisted, toggleItem } = useWishlist();
  return (
    <div className="mini-grid">
      {items.map((item) => {
        const wishlisted = isWishlisted(item.slug);
        return (
          <div className="mini-prod" key={item.key}>
            <Link href={`/products/${item.slug}`} className="prod-card-link" aria-hidden="true" tabIndex={-1} />
            <div className="mini-thumb">
              <span dangerouslySetInnerHTML={{ __html: item.icon }} />
              <button
                type="button"
                className={`prod-wishlist${wishlisted ? " active" : ""}`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                data-tooltip={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wishlisted}
                onClick={() =>
                  toggleItem({
                    slug: item.slug,
                    title: item.title,
                    category: item.category,
                    seller: item.seller,
                    priceLabel: item.priceLabel,
                    priceValue: item.priceValue,
                    badge: item.badge,
                    icon: item.icon,
                  })
                }
              >
                <svg viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "#fff"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
            <h4>{item.title}</h4>
            <div className="from">Starting from <b>{item.priceLabel}</b></div>
          </div>
        );
      })}
    </div>
  );
}

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
  const hotSelling = normalizeApiProducts(apiTrendingProducts).slice(0, 4);

  if (newArrivals.length === 0 && hotSelling.length === 0) return null;

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
              <MiniProductGrid items={newArrivals} />
            </div>
          )}

          {hotSelling.length > 0 && (
            <div className="showcase-col reveal d1">
              <div className="col-head">
                <h3>Hot Selling</h3>
                <Link href="/products">View all <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
              </div>
              <MiniProductGrid items={hotSelling} />
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
