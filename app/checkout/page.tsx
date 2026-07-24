"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

const inr = (n: number) => "₹ " + n.toLocaleString("en-IN");

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setRefId(`SM-${Math.floor(100000 + Math.random() * 900000)}`);
    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <section className="section" style={{ paddingTop: 60 }}>
        <div className="wrap" style={{ maxWidth: 560 }}>
          <div className="auth-card" style={{ textAlign: "center" }}>
            <div className="auth-success" style={{ padding: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <h2>Request submitted</h2>
              <p>
                Your reference number is <b>{refId}</b>. Our team will review your requirement and follow up
                with formal pricing and lead times within one business day.
              </p>
            </div>
            <div className="cta-btns" style={{ marginTop: 28, justifyContent: "center" }}>
              <Link href="/products" className="btn btn-primary">Continue Browsing</Link>
              <Link href="/" className="btn btn-ghost">Back to Home</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h3>Your cart is empty</h3>
            <p>Add equipment to your cart before checking out.</p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Products</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">Home</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <Link href="/cart">Cart</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="cur">Checkout</span>
        </div>

        <div className="checkout-grid">
          <form className="form-card" onSubmit={handleSubmit} noValidate>
            <h3>Delivery &amp; Business Details</h3>
            <p className="sub">Tell us where and who to deliver this equipment to — pricing is confirmed after review.</p>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="co-company">Company Name</label>
                <input id="co-company" name="company" type="text" placeholder="Your company name" required />
              </div>
              <div className="field">
                <label htmlFor="co-gst">GSTIN (optional)</label>
                <input id="co-gst" name="gst" type="text" placeholder="22AAAAA0000A1Z5" />
              </div>
              <div className="field">
                <label htmlFor="co-contact">Contact Person</label>
                <input id="co-contact" name="contact" type="text" placeholder="Full name" required />
              </div>
              <div className="field">
                <label htmlFor="co-phone">Phone</label>
                <input id="co-phone" name="phone" type="tel" placeholder="+91 90000 00000" defaultValue={user?.mobile ? `+91 ${user.mobile}` : ""} required />
              </div>
              <div className="field full">
                <label htmlFor="co-email">Email</label>
                <input id="co-email" name="email" type="email" placeholder="you@company.com" required />
              </div>
              <div className="field full">
                <label htmlFor="co-address">Delivery Address</label>
                <textarea id="co-address" name="address" placeholder="Plot / street / area" required />
              </div>
              <div className="field">
                <label htmlFor="co-city">City</label>
                <input id="co-city" name="city" type="text" placeholder="City" required />
              </div>
              <div className="field">
                <label htmlFor="co-state">State</label>
                <input id="co-state" name="state" type="text" placeholder="State" required />
              </div>
              <div className="field">
                <label htmlFor="co-pin">PIN Code</label>
                <input id="co-pin" name="pin" type="text" inputMode="numeric" placeholder="6-digit PIN" pattern="[0-9]{6}" required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary form-submit" style={{ width: "100%" }}>
              Submit Quotation Request
            </button>
          </form>

          <div className="cart-summary">
            <div className="cart-summary-card">
              <h4 style={{ fontFamily: "Poppins", fontWeight: 700, marginBottom: 16 }}>Order Summary</h4>
              <div className="checkout-items">
                {items.map((item) => (
                  <div key={item.slug} className="checkout-item-row">
                    <div className="checkout-item-thumb" dangerouslySetInnerHTML={{ __html: item.icon }} />
                    <div className="checkout-item-info">
                      <b>{item.title}</b>
                      <span>Qty {item.qty}</span>
                    </div>
                    <span className="checkout-item-price">{item.priceLabel}</span>
                  </div>
                ))}
              </div>
              <p className="cart-summary-line" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                Subtotal: <b>{inr(subtotal)}</b>
              </p>
              <p className="cart-summary-note">
                Final pricing, taxes and delivery charges will be confirmed by our team after reviewing your request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
