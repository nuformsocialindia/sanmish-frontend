"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { slugify } from "@/lib/slug";
import { getAllProducts } from "@/lib/productLookup";
import SimilarProductCard from "@/components/SimilarProductCard";

const inr = (n: number) => "₹ " + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const GST_RATE = 0.05;

export default function CartPage() {
  useScrollAnimations();
  const { items, removeItem, setQty } = useCart();
  const { user } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const isSelected = (slug: string) => selected.size === 0 || selected.has(slug);

  const toggleSelected = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev.size === 0 ? items.map((i) => i.slug) : prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectedItems = items.filter((i) => isSelected(i.slug));
  const selectedCount = selectedItems.reduce((sum, i) => sum + i.qty, 0);
  const selectedSubtotal = selectedItems.reduce((sum, i) => sum + (i.priceValue ?? 0) * i.qty, 0);
  const quoteOnlyCount = selectedItems.filter((i) => i.priceValue == null).length;
  const baseAmount = selectedSubtotal / (1 + GST_RATE);
  const gstAmount = selectedSubtotal - baseAmount;

  const recommended = useMemo(() => {
    const inCart = new Set(items.map((i) => i.slug));
    const cartCategories = new Set(items.map((i) => i.category));
    const all = getAllProducts().filter((p) => !inCart.has(p.slug));
    const sameCategory = all.filter((p) => cartCategories.has(p.category));
    const rest = all.filter((p) => !cartCategories.has(p.category));
    return [...sameCategory, ...rest].slice(0, 8);
  }, [items]);

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="crumbs reveal">
          <Link href="/">Home</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="cur">Cart</span>
        </div>

        {items.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h3>Your cart is empty</h3>
            <p>Browse the marketplace and add equipment to request a bulk quotation.</p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: 20 }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-list">
              <div className="cart-list-head">
                <h1>Shopping Cart</h1>
                <button
                  type="button"
                  className="cart-deselect"
                  onClick={() => setSelected(selected.size === 0 ? new Set() : new Set())}
                >
                  {selected.size === 0 ? "Deselect all items" : "Select all items"}
                </button>
              </div>

              {items.map((item) => (
                <div key={item.slug} className="cart-row">
                  <label className="cart-check">
                    <input
                      type="checkbox"
                      checked={isSelected(item.slug)}
                      onChange={() => toggleSelected(item.slug)}
                    />
                  </label>
                  <div className="cart-thumb">
                    <span dangerouslySetInnerHTML={{ __html: item.icon }} />
                  </div>
                  <div className="cart-details">
                    <Link href={`/products/${item.slug}`} className="cart-title">{item.title}</Link>
                    <div className="prod-cat">{item.category}</div>
                    <div className="prod-seller">
                      <span className="sd">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                      </span>
                      {item.seller}
                    </div>
                    <div className="cart-row-actions">
                      <div className="pdp-qty" style={{ marginTop: 0 }}>
                        <button type="button" onClick={() => setQty(item.slug, item.qty - 1)} aria-label="Decrease quantity">−</button>
                        <b>{item.qty}</b>
                        <button type="button" onClick={() => setQty(item.slug, item.qty + 1)} aria-label="Increase quantity">+</button>
                      </div>
                      <span className="cart-sep">|</span>
                      <button type="button" className="cart-remove" onClick={() => removeItem(item.slug)}>Remove</button>
                      <span className="cart-sep">|</span>
                      <Link href={`/products/${slugify(item.title)}`}>See product</Link>
                    </div>
                  </div>
                  <div className="cart-price-col">
                    <div className="cart-price">
                      {item.priceValue != null ? inr(item.priceValue * item.qty) : "On Request"}
                    </div>
                    {item.priceValue != null && item.qty > 1 && (
                      <div className="cart-price-unit">{inr(item.priceValue)} × {item.qty}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-summary-card">
                <p className="cart-summary-line">
                  {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
                </p>

                <div className="checkout-breakdown">
                  <div className="checkout-breakdown-row">
                    <span>Base Amount</span>
                    <span>{inr(Math.round(baseAmount * 100) / 100)}</span>
                  </div>
                  <div className="checkout-breakdown-row">
                    <span>GST (5%)</span>
                    <span>{inr(Math.round(gstAmount * 100) / 100)}</span>
                  </div>
                  <div className="checkout-breakdown-row">
                    <span>Estimated Shipping</span>
                    <span className="free">FREE</span>
                  </div>
                  <div className="checkout-breakdown-row total">
                    <span>Total</span>
                    <span>{inr(Math.round(selectedSubtotal * 100) / 100)}</span>
                  </div>
                </div>

                {quoteOnlyCount > 0 && (
                  <p className="checkout-quote-note">
                    {`${quoteOnlyCount} item${quoteOnlyCount > 1 ? "s are" : " is"} priced “On Request” — pricing for ${quoteOnlyCount > 1 ? "these" : "it"} isn’t included in the total above and will be shared separately.`}
                  </p>
                )}

                <Link href={user ? "/checkout" : "/checkout/auth"} className="btn btn-primary" style={{ width: "100%", marginTop: 14 }}>
                  Proceed to Checkout
                </Link>
                <p className="cart-summary-note">
                  SANMISH works on an RFQ model — submit your details at checkout and our team will follow up with
                  formal pricing, lead times and bulk discounts.
                </p>

                <div className="cart-help-points">
                  <div className="cart-help-point">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5 9-9" />
                    </svg>
                    <span>All sellers are document-verified before listing on SANMISH.</span>
                  </div>
                  <div className="cart-help-point">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5 9-9" />
                    </svg>
                    <span>Bulk quantities are eligible for negotiated pricing on request.</span>
                  </div>
                  <div className="cart-help-point">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5 9-9" />
                    </svg>
                    <span>Tracked dispatch and installation support across 28+ states.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {recommended.length > 0 && (
          <div className="pdp-similar reveal">
            <div className="pdp-similar-head">
              <h2>You Might Also Like</h2>
              <p>Add more equipment to your quotation request before checking out.</p>
            </div>
            <div className="pdp-similar-scroll">
              {recommended.map((p) => (
                <SimilarProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
