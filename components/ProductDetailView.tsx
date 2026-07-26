"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { getAllProducts, type ProductDetail } from "@/lib/productLookup";
import { BULK_TIERS, MIN_ORDER_QTY, mockRating, tierForQty, unitPriceForQty } from "@/lib/pricingTiers";
import SimilarProductCard from "@/components/SimilarProductCard";

const inr = (n: number) => "₹ " + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

const TRUST_STRIP = [
  { t: "Assured Delivery", icon: `<path d="M14 3h-4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M9 8H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h5"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>` },
  { t: "Easy Cancellation", icon: `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m14 15-4 4M10 15l4 4"/>` },
  { t: "7 Days Return", icon: `<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1zM10 12h4"/>` },
];

const SPECS = [
  { k: "Category", v: "" },
  { k: "Brand", v: "" },
  { k: "Supplier Type", v: "" },
  { k: "Warranty", v: "1 Year Manufacturer Warranty" },
  { k: "Delivery", v: "7–14 business days, PAN India" },
  { k: "Certification", v: "ISO 9001, PESO Compliant" },
  { k: "Key Features", v: "Weatherproof housing, plug-and-play installation" },
  { k: "Country of Origin", v: "India" },
];

export default function ProductDetailView({ product }: { product: ProductDetail }) {
  useScrollAnimations();
  const router = useRouter();
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const wishlisted = isWishlisted(product.slug);
  const [qty, setQty] = useState(MIN_ORDER_QTY);
  const [tab, setTab] = useState<"description" | "specs">("description");
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState<string | null>(null);

  const basePrice = product.priceValue;
  const activeTier = tierForQty(qty);
  const unitPrice = basePrice != null ? unitPriceForQty(basePrice, qty) : null;
  const total = unitPrice != null ? unitPrice * qty : null;
  const gstBase = unitPrice != null ? unitPrice / 1.05 : null;
  const gstAmount = unitPrice != null && gstBase != null ? unitPrice - gstBase : null;
  const discountPct = basePrice != null && unitPrice != null && basePrice > 0
    ? Math.round((1 - unitPrice / basePrice) * 1000) / 10
    : 0;
  const rating = mockRating(product.slug);

  const handleAddToCart = () => {
    if (unitPrice == null) return;
    addItem({ ...product, priceValue: unitPrice, priceLabel: inr(unitPrice) }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  const specs = SPECS.map((row) => {
    if (row.k === "Category") return { ...row, v: product.category };
    if (row.k === "Brand") return { ...row, v: product.brand || "—" };
    if (row.k === "Supplier Type") return { ...row, v: product.type || "Verified Manufacturer" };
    return row;
  });

  const similarProducts = useMemo(() => {
    return getAllProducts()
      .filter((p) => p.slug !== product.slug && p.category === product.category)
      .slice(0, 8);
  }, [product.slug, product.category]);

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
          <div className="pdp-outer">
          <div className="pdp-main">
          <div className="pdp-top-grid">
            <div className="pdp-gallery reveal">
              <div className="pdp-gallery-main">
                <span dangerouslySetInnerHTML={{ __html: product.icon }} />
                <span className="prod-badge">{product.badge}</span>
              </div>
              <div className="pdp-thumbs">
                <div className="pdp-thumb active"><span dangerouslySetInnerHTML={{ __html: product.icon }} /></div>
                <div className="pdp-thumb"><span dangerouslySetInnerHTML={{ __html: product.icon }} /></div>
              </div>
              <div className="pdp-help-box">
                <b>Need help?</b>
                <p>Share your requirement &amp; we&rsquo;ll call you back shortly.</p>
                <Link href="/contact" className="btn btn-ghost" style={{ width: "100%" }}>Submit Enquiry</Link>
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
                <span className="pdp-rating">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.3l7.1-.7z" /></svg>
                  {rating}
                </span>
              </div>

              {basePrice != null && (
                <div className="pdp-price-inline">
                  {discountPct > 0 && <span className="off">-{discountPct}%</span>}
                  <b>{unitPrice != null ? inr(unitPrice) : product.priceLabel}</b>
                  <span className="unit">/Piece</span>
                  {discountPct > 0 && <s>{inr(basePrice)}</s>}
                  <span className="tax-note">Inclusive of all taxes</span>
                  {unitPrice != null && (
                    <div className="gst-split">{inr(Math.round(gstBase! * 100) / 100)} + {inr(Math.round(gstAmount! * 100) / 100)} GST</div>
                  )}
                </div>
              )}

              <div className="pdp-offers">
                <div><span className="tick">✓</span>Eligible for <b>FREE SHIPPING</b>. *T&amp;C Apply</div>
                <div><span className="tick">✓</span>Get GST invoice and <b>save up to 18%</b> on business purchases.</div>
              </div>

              <div className="pdp-trust-strip">
                {TRUST_STRIP.map((t) => (
                  <div key={t.t} className="pdp-trust-item">
                    <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg>` }} />
                    <small>{t.t}</small>
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

            <aside className="pdp-buybox reveal d2">
              <div className="pdp-buybox-head">
                <div>
                  <small>Shipped by</small>
                  <b>SANMISH Fulfilment</b>
                </div>
                <button type="button" className="pdp-copylink" onClick={handleCopyLink}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>

              <div className="pdp-delivery-row">
                Estimated delivery in <b>7–14 business days</b>
              </div>
              <div className="pdp-pincode">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ""))}
                />
                <button
                  type="button"
                  disabled={pincode.length !== 6}
                  onClick={() => setPincodeChecked(pincode)}
                >
                  Check
                </button>
              </div>
              {pincodeChecked && (
                <div className="pdp-pincode-result">Delivery available to {pincodeChecked}</div>
              )}

              <div className="pdp-sold-row">
                Sold by <Link href="/suppliers">{product.seller}</Link>
                <span className="pdp-trusted-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-9" /></svg>
                  Trusted
                </span>
                <span className="pdp-rating-chip">{rating} ★</span>
              </div>

              {basePrice != null && (
                <>
                  <div className="pdp-bmsm-head">Buy more save more</div>
                  <div className="pdp-bmsm-table">
                    <div className="pdp-bmsm-row pdp-bmsm-header">
                      <span>Quantity</span>
                      <span>Price/Piece (incl. of all taxes)</span>
                    </div>
                    {BULK_TIERS.map((tier) => {
                      const isActive = activeTier.label === tier.label;
                      const tierPrice = tier.discountPct === null ? null : unitPriceForQty(basePrice, tier.min);
                      return (
                        <label key={tier.label} className={`pdp-bmsm-row${isActive ? " active" : ""}`}>
                          <span className="pdp-bmsm-radio">
                            <input
                              type="radio"
                              name="bulk-tier"
                              checked={isActive}
                              onChange={() => setQty(tier.min)}
                            />
                            {tier.label}
                          </span>
                          <span>
                            {tierPrice != null ? (
                              <>
                                {inr(tierPrice)}
                                {tier.discountPct ? <em> Save {tier.discountPct}%</em> : null}
                              </>
                            ) : (
                              "Request Quote for Bulk"
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="pdp-qty">
                <span>Quantity</span>
                <button type="button" onClick={() => setQty((q) => Math.max(MIN_ORDER_QTY, q - 1))} aria-label="Decrease quantity">−</button>
                <b>{qty}</b>
                <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
                <span className="unit-lbl">Piece(s)</span>
              </div>
              <div className="pdp-min-order">Min. Order Quantity: {MIN_ORDER_QTY} Pieces</div>

              {total != null ? (
                <div className="pdp-total">Total: <b>{inr(Math.round(total * 100) / 100)}</b></div>
              ) : (
                <div className="pdp-total">This quantity needs a custom quote.</div>
              )}
              <div className="pdp-final-note">Final price and shipping charges will be displayed in checkout</div>

              <div className="pdp-buybox-actions">
                <button type="button" className="btn btn-ghost" disabled={unitPrice == null} onClick={handleAddToCart}>
                  {added ? "Added to Cart" : "Add To Cart"}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={unitPrice == null}
                  onClick={() => {
                    if (unitPrice == null) return;
                    addItem({ ...product, priceValue: unitPrice, priceLabel: inr(unitPrice) }, qty);
                    router.push("/checkout");
                  }}
                >
                  Buy Now
                </button>
              </div>
              <Link
                href="/contact"
                className={`btn pdp-quote-bulk-btn${activeTier.discountPct === null ? " active" : ""}`}
              >
                Request Quote for Bulk
              </Link>

              <button
                type="button"
                className={`pdp-wishlist-btn pdp-wishlist-btn-full${wishlisted ? " active" : ""}`}
                onClick={() => toggleItem(product)}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wishlisted}
              >
                <svg viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
              </button>
            </aside>
          </div>

          {similarProducts.length > 0 && (
            <div className="pdp-similar reveal">
              <div className="pdp-similar-head">
                <h2>Similar Products</h2>
                <p>More {product.category.toLowerCase()} equipment you might also need.</p>
              </div>
              <div className="pdp-similar-scroll">
                {similarProducts.map((p) => (
                  <SimilarProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          )}
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
