"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { type ProductDetail } from "@/lib/productLookup";
import { BULK_TIERS, MIN_ORDER_QTY, mockRating, tierForQty, unitPriceForQty, computeUnitPricing } from "@/lib/pricingTiers";
import SimilarProductCard from "@/components/SimilarProductCard";

const inr = (n: number) => "₹ " + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

// Whitelisted icon set for trust badges — admins pick a key (never raw
// markup) so a badge's `icon` field can never inject arbitrary HTML. Keys
// match the admin's ICON_OPTIONS (app/admin/(dashboard)/products).
const TRUST_ICON_LIBRARY: Record<string, string> = {
  RETURN: `<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/>`,
  ORIGINAL: `<circle cx="12" cy="8" r="6"/><path d="M9 12 6 21l6-3 6 3-3-9"/>`,
  PAYMENT: `<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
  PROTECTION: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>`,
  BRAND: `<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 21l-5-3-5 3 1.5-7.5"/>`,
  SHIPPING: `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>`,
  STAR: `<path d="m12 2 2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.3l7.1-.7z"/>`,
  CHECK: `<circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/>`,
};
const DEFAULT_TRUST_ICON = TRUST_ICON_LIBRARY.CHECK;

// Shown for any product whose `trustBadges` is null (i.e. not customized).
const DEFAULT_TRUST_BADGES = [
  { label: "7 Days Return Policy", icon: "RETURN" },
  { label: "100% Original Products", icon: "ORIGINAL" },
  { label: "Secure Payments", icon: "PAYMENT" },
  { label: "100% Buyer Protection", icon: "PROTECTION" },
  { label: "Top Brands", icon: "BRAND" },
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

export default function ProductDetailView({
  product,
  similarProducts,
}: {
  product: ProductDetail;
  similarProducts: ProductDetail[];
}) {
  useScrollAnimations();
  const router = useRouter();
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const wishlisted = isWishlisted(product.slug);

  // API-sourced products carry the same server-computed GST pricing the admin
  // panel shows; hardcoded demo products don't, so they keep the old synthetic
  // "buy more save more" bulk-tier simulation unchanged.
  const isApiPriced = product.basePrice !== undefined;
  const minOrderQty = product.minOrderQty ?? MIN_ORDER_QTY;
  const [qty, setQty] = useState(minOrderQty);
  const [tab, setTab] = useState<"description" | "specs">("description");
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const gallery = product.images && product.images.length > 0 ? product.images : null;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  // Real volume-pricing slabs from the admin (only present on API products
  // with a configured ladder). When absent, price is flat at any quantity.
  const realTiers = isApiPriced && product.priceSlabs && product.priceSlabs.length > 0
    ? product.priceSlabs.map((s) => ({
        label: s.maxQty ? `${s.minQty} - ${s.maxQty}` : `${s.minQty}+`,
        min: s.minQty,
        max: s.maxQty,
        sellingPrice: s.requiresQuote ? null : s.pricePerUnit,
      }))
    : null;

  const activeRealTier = realTiers
    ? realTiers.find((t) => qty >= t.min && (t.max === null || qty <= t.max)) ?? realTiers[0]
    : null;

  // Per-tier display price + "save X%" vs. the first (lowest-quantity) tier.
  const realTierRows = realTiers?.map((tier) => {
    const gstRate = product.gstRate ?? 18;
    const priceIncludesGst = product.priceIncludesGst ?? true;
    const gstApplicable = product.gstApplicable ?? true;
    const tierPrice = tier.sellingPrice == null
      ? null
      : round2(computeUnitPricing(tier.sellingPrice, gstRate, priceIncludesGst, gstApplicable).grandTotal);
    return { ...tier, tierPrice };
  });
  const firstTierPrice = realTierRows?.[0]?.tierPrice ?? null;

  const basePrice = product.priceValue;
  let unitPrice: number | null;
  let gstBase: number | null;
  let gstAmount: number | null;
  let discountPct = 0;
  const activeTier = tierForQty(qty); // used for the hardcoded-product fallback UI only

  if (isApiPriced) {
    const gstRate = product.gstRate ?? 18;
    const priceIncludesGst = product.priceIncludesGst ?? true;
    const gstApplicable = product.gstApplicable ?? true;
    const sellingAtQty = realTiers ? activeRealTier?.sellingPrice ?? null : product.priceValue;

    if (sellingAtQty == null) {
      unitPrice = null;
      gstBase = null;
      gstAmount = null;
    } else {
      const computed = computeUnitPricing(sellingAtQty, gstRate, priceIncludesGst, gstApplicable);
      unitPrice = round2(computed.grandTotal);
      gstBase = round2(computed.basePrice);
      gstAmount = round2(computed.gstAmount);
    }
    if (product.mrp && unitPrice != null && product.mrp > unitPrice) {
      discountPct = round2(((product.mrp - unitPrice) / product.mrp) * 100);
    }
  } else {
    unitPrice = basePrice != null ? unitPriceForQty(basePrice, qty) : null;
    gstBase = unitPrice != null ? unitPrice / 1.05 : null;
    gstAmount = unitPrice != null && gstBase != null ? unitPrice - gstBase : null;
    discountPct = basePrice != null && unitPrice != null && basePrice > 0
      ? Math.round((1 - unitPrice / basePrice) * 1000) / 10
      : 0;
  }

  const total = unitPrice != null ? unitPrice * qty : null;
  const mrpForStrike = isApiPriced ? (discountPct > 0 ? product.mrp : null) : (discountPct > 0 ? basePrice : null);
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

  // Real per-product specifications from the admin take over the generic
  // demo rows (Warranty/Delivery/Certification/…) once they're configured.
  const specs = product.specifications && product.specifications.length > 0
    ? [
        { k: "Category", v: product.category },
        { k: "Brand", v: product.brand || "—" },
        { k: "Supplier Type", v: product.type || "Verified Manufacturer" },
        ...product.specifications.map((s) => ({ k: s.key.trim(), v: s.value })),
      ]
    : SPECS.map((row) => {
        if (row.k === "Category") return { ...row, v: product.category };
        if (row.k === "Brand") return { ...row, v: product.brand || "—" };
        if (row.k === "Supplier Type") return { ...row, v: product.type || "Verified Manufacturer" };
        return row;
      });

  // product.trustBadges is null for hardcoded/unconfigured products (show
  // the default strip); a fully custom, admin-authored list (any label,
  // any count, possibly empty) wins once configured on that product.
  const trustStrip = (product.trustBadges != null ? product.trustBadges : DEFAULT_TRUST_BADGES).map((b) => ({
    label: b.label,
    icon: TRUST_ICON_LIBRARY[b.icon] ?? DEFAULT_TRUST_ICON,
  }));

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
            {product.categorySlug ? (
              <Link href={`/categories/${product.categorySlug}`}>{product.category}</Link>
            ) : (
              <Link href="/products">{product.category || "Products"}</Link>
            )}
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
                {gallery ? (
                  <img src={gallery[activeImage] ?? gallery[0]} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: product.icon }} />
                )}
                <span className="prod-badge">{product.badge}</span>
                <button
                  type="button"
                  className={`prod-wishlist${wishlisted ? " active" : ""}`}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={wishlisted}
                  onClick={() => toggleItem(product)}
                >
                  <svg viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
              <div className="pdp-thumbs">
                {gallery ? (
                  gallery.map((src, i) => (
                    <button
                      type="button"
                      key={src}
                      className={`pdp-thumb${i === activeImage ? " active" : ""}`}
                      onClick={() => setActiveImage(i)}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
                    </button>
                  ))
                ) : (
                  <>
                    <div className="pdp-thumb active"><span dangerouslySetInnerHTML={{ __html: product.icon }} /></div>
                    <div className="pdp-thumb"><span dangerouslySetInnerHTML={{ __html: product.icon }} /></div>
                  </>
                )}
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

              {(basePrice != null || isApiPriced) && (
                <div className="pdp-price-inline">
                  {mrpForStrike != null && <span className="off">-{discountPct}%</span>}
                  <b>{unitPrice != null ? inr(unitPrice) : product.priceLabel}</b>
                  <span className="unit">/Piece</span>
                  {mrpForStrike != null && <s>{inr(mrpForStrike)}</s>}
                  <span className="tax-note">Inclusive of all taxes</span>
                  {unitPrice != null && gstBase != null && gstAmount != null && (
                    <div className="gst-split">{inr(gstBase)} + {inr(gstAmount)} GST</div>
                  )}
                </div>
              )}

              <div className="pdp-offers">
                <div><span className="tick">✓</span>Eligible for <b>FREE SHIPPING</b>. *T&amp;C Apply</div>
                <div><span className="tick">✓</span>Get GST invoice and <b>save up to 18%</b> on business purchases.</div>
              </div>
            </div>
          </div>

            {trustStrip.length > 0 && (
              <div className="pdp-trust-strip">
                {trustStrip.map((t, i) => (
                  <div key={`${t.label}-${i}`} className="pdp-trust-item">
                    <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg>` }} />
                    <small>{t.label}</small>
                  </div>
                ))}
              </div>
            )}

            <div className="pdp-tabs reveal">
              <div className="pdp-tab-buttons">
                <button type="button" className={tab === "description" ? "active" : ""} onClick={() => setTab("description")}>Description</button>
                <button type="button" className={tab === "specs" ? "active" : ""} onClick={() => setTab("specs")}>Specifications</button>
              </div>

              <div className="pdp-tab-content">
                {tab === "description" ? (
                  <p style={{ color: "var(--ink-soft)", maxWidth: 760, lineHeight: 1.8 }}>
                    {product.description ?? (
                      <>
                        {product.title} from {product.seller} is listed on SANMISH as part of our {product.category} equipment
                        catalogue. This listing is a placeholder while our full product-detail data pipeline is connected —
                        pricing, specs and lead times shown here will be replaced with live data from the seller&rsquo;s catalogue.
                        Reach out for a formal quotation, technical datasheet or bulk-order pricing.
                      </>
                    )}
                  </p>
                ) : (
                  <div className="pdp-specs">
                    {specs.map((row, i) => (
                      <div className="spec-row" key={`${row.k}-${i}`}>
                        <span>{row.k}</span>
                        <span>{row.v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

              {!isApiPriced && basePrice != null && (
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

              {isApiPriced && realTierRows && (
                <>
                  <div className="pdp-bmsm-head">Buy more save more</div>
                  <div className="pdp-bmsm-table">
                    <div className="pdp-bmsm-row pdp-bmsm-header">
                      <span>Quantity</span>
                      <span>Price/Piece (incl. of all taxes)</span>
                    </div>
                    {realTierRows.map((tier) => {
                      const isActive = activeRealTier?.label === tier.label;
                      const savePct = tier.tierPrice != null && firstTierPrice && firstTierPrice > tier.tierPrice
                        ? round2(((firstTierPrice - tier.tierPrice) / firstTierPrice) * 100)
                        : 0;
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
                            {tier.tierPrice != null ? (
                              <>
                                {inr(tier.tierPrice)}
                                {savePct > 0 ? <em> Save {savePct}%</em> : null}
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
                <button type="button" onClick={() => setQty((q) => Math.max(minOrderQty, q - 1))} aria-label="Decrease quantity">−</button>
                <b>{qty}</b>
                <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
                <span className="unit-lbl">Piece(s)</span>
              </div>
              <div className="pdp-min-order">Min. Order Quantity: {minOrderQty} Pieces</div>

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
                className={`btn pdp-quote-bulk-btn${unitPrice == null ? " active" : ""}`}
              >
                Request Quote for Bulk
              </Link>
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
