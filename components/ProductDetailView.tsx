"use client";
import { useState } from "react";
import Link from "next/link";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import type { ProductDetail } from "@/lib/productLookup";

const HIGHLIGHTS = [
  { t: "Document-verified supplier", s: "Audited before listing on SANMISH" },
  { t: "Bulk & negotiated pricing", s: "Send an RFQ for volume orders" },
  { t: "PAN India delivery", s: "Tracked dispatch across 28+ states" },
  { t: "Installation support", s: "Certified engineers on request" },
];

const SPECS = [
  { k: "Category", v: "" },
  { k: "Brand", v: "" },
  { k: "Supplier Type", v: "" },
  { k: "Warranty", v: "1 Year Manufacturer Warranty" },
  { k: "Delivery", v: "7–14 business days, PAN India" },
  { k: "Certification", v: "ISO 9001, PESO Compliant" },
];

export default function ProductDetailView({ product }: { product: ProductDetail }) {
  useScrollAnimations();
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const wishlisted = isWishlisted(product.slug);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"description" | "specs">("description");
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const specs = SPECS.map((row) => {
    if (row.k === "Category") return { ...row, v: product.category };
    if (row.k === "Brand") return { ...row, v: product.brand || "—" };
    if (row.k === "Supplier Type") return { ...row, v: product.type || "Verified Manufacturer" };
    return row;
  });

  return (
    <>
      <section className="pg-banner" style={{ paddingBottom: 0 }}>
        <div className="hero-bg">
          <div className="blob g" />
          <div className="blob b" />
        </div>
        <div className="wrap">
          <div className="crumbs reveal">
            <Link href="/">Home</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <Link href="/products">Products</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="cur">{product.title}</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="pdp-grid">
            <div className="pdp-gallery reveal">
              <div className="pdp-gallery-main">
                <span dangerouslySetInnerHTML={{ __html: product.icon }} />
                <span className="prod-badge">{product.badge}</span>
                <span className="prod-verify">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5 9-9" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="pdp-info reveal d1">
              <div className="prod-cat">{product.category}</div>
              <h1>{product.title}</h1>
              <div className="pdp-meta">
                <span className="sd">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                </span>
                Sold by <b>{product.seller}</b>
              </div>

              <div className="pdp-price-box">
                <small>Price</small>
                <div className="price">{product.priceLabel}</div>
                <span className="pdp-instock">In stock &middot; Ships in 7–14 days</span>

                <div className="pdp-qty">
                  <span>Quantity</span>
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <b>{qty}</b>
                  <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
                </div>

                <div className="pdp-actions">
                  <button type="button" className="btn btn-ghost" onClick={handleAddToCart}>
                    {added ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 5 5 9-9" />
                        </svg>
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                  <Link href="/contact" className="btn btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 15l2 2 4-4" />
                    </svg>
                    Request Quote
                  </Link>
                  <button
                    type="button"
                    className={`pdp-wishlist-btn${wishlisted ? " active" : ""}`}
                    onClick={() => toggleItem(product)}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={wishlisted}
                  >
                    <svg viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="pdp-highlights">
                {HIGHLIGHTS.map((h) => (
                  <div key={h.t} className="pdp-highlight">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5 9-9" />
                    </svg>
                    <div><b>{h.t}</b><span>{h.s}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pdp-tabs reveal">
            <div className="pdp-tab-buttons">
              <button type="button" className={tab === "description" ? "active" : ""} onClick={() => setTab("description")}>Description</button>
              <button type="button" className={tab === "specs" ? "active" : ""} onClick={() => setTab("specs")}>Specifications</button>
            </div>

            {tab === "description" ? (
              <p style={{ color: "var(--ink-soft)", maxWidth: 760, lineHeight: 1.8 }}>
                {product.title} from {product.seller} is listed on SANMISH as part of our {product.category} equipment
                catalogue. This listing is a placeholder while our full product-detail data pipeline is connected —
                pricing, specs and lead times shown here will be replaced with live data from the seller&rsquo;s catalogue.
                Reach out for a formal quotation, technical datasheet or bulk-order pricing.
              </p>
            ) : (
              <div className="pdp-specs">
                {specs.map((row) => (
                  <div className="spec-row" key={row.k}>
                    <span>{row.k}</span>
                    <span>{row.v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="cta" id="cta">
        <div className="wrap">
          <div className="cta-box reveal">
            <div className="rings a" /><div className="rings b" />
            <h2>Need a formal quotation for this item?</h2>
            <p>Share your quantity and delivery location — our team will get back with pricing within hours.</p>
            <div className="cta-btns">
              <Link href="/contact" className="btn btn-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                </svg>
                Request a quote
              </Link>
              <Link href="/products" className="btn btn-light">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                Browse more equipment
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
