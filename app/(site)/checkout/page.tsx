"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useAddresses } from "@/lib/address-context";
import { checkout as checkoutApi, enquiries, ApiError } from "@/lib/api";

const inr = (n: number) => "₹ " + n.toLocaleString("en-IN");

const GST_RATE = 0.05;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, hydrated } = useAuth();
  const { addresses } = useAddresses();

  const quoteOnlyCount = items.filter((i) => i.priceValue == null).length;
  const baseAmount = subtotal / (1 + GST_RATE);
  const gstAmount = subtotal - baseAmount;

  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");
  const [rfqNumbers, setRfqNumbers] = useState<string[]>([]);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");

  // `user` isn't known synchronously — auth-context resolves it via an async
  // /auth/me call, so at first render it's still null even for a logged-in
  // buyer. Prefilling from a useState initializer would miss that; this
  // fills in once the real session data arrives (and only prefills empty
  // fields, so it doesn't clobber anything the buyer already typed while
  // waiting).
  useEffect(() => {
    if (!user) return;
    setContact((c) => c || user.name);
    setPhone((p) => p || (user.mobile ? `+91 ${user.mobile}` : ""));
    setEmail((e) => e || user.email);
  }, [user]);

  const useAddress = (id: string) => {
    const a = addresses.find((addr) => addr.id === id);
    if (!a) return;
    setContact(a.name);
    setPhone(a.phone);
    setAddress(a.line1);
    setCity(a.city);
    setState(a.state);
    setPin(a.pin);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!hydrated) {
      // Session check hasn't resolved yet — submitting now risks treating a
      // logged-in buyer as a guest (enquiry instead of a real order), since
      // `user` is only known once this flips true. The button is disabled
      // until then, but guard here too in case of a fast double-submit.
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      if (user) {
        const result = await checkoutApi.submit({
          items: items.map((i) => ({ productSlug: i.slug, quantity: i.qty })),
          company,
          contact,
          phone,
          address,
          city,
          state,
          pincode: pin,
        });
        const refs = [
          ...(result.order ? [result.order.orderNumber] : []),
          ...result.rfqs.map((r) => r.rfqNumber),
        ];
        setRfqNumbers(refs);
        setRefId(refs[0] ?? "");
        setOrderNumber(result.order?.orderNumber ?? null);
      } else {
        const itemLines = items
          .map((i) => `${i.title} — Qty ${i.qty}${i.priceValue != null ? ` @ ₹${i.priceValue}/piece` : " (price on request)"}`)
          .join("\n");
        const result = await enquiries.create({
          type: "QUOTE_REQUEST",
          name: contact,
          email,
          company,
          phone,
          city,
          message: `Quotation request for:\n${itemLines}\n\nDeliver to: ${address}, ${city}, ${state} ${pin}`,
          deliveryPincode: pin,
        });
        setRfqNumbers([result.reference]);
        setRefId(result.reference);
      }
      setSubmitted(true);
      clearCart();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Something went wrong submitting your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
                {rfqNumbers.length > 1 ? (
                  <>Your reference numbers are <b>{rfqNumbers.join(", ")}</b>.</>
                ) : (
                  <>Your reference number is <b>{rfqNumbers[0] ?? refId}</b>.</>
                )}{" "}
                {rfqNumbers[0]?.startsWith("ORD-")
                  ? "We've confirmed your order — our team will follow up on delivery and payment shortly."
                  : "Our team will review your requirement and follow up with formal pricing and lead times within one business day."}
              </p>
            </div>
            <div className="cta-btns" style={{ marginTop: 28, justifyContent: "center" }}>
              {orderNumber ? (
                <Link href={`/account/orders/${orderNumber}`} className="btn btn-primary">View Order</Link>
              ) : user ? (
                <Link href="/account/orders" className="btn btn-primary">View My Orders</Link>
              ) : null}
              <Link href="/products" className="btn btn-ghost">Continue Browsing</Link>
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

            {addresses.length > 0 && (
              <div className="checkout-saved-addresses">
                <span>Use a saved address:</span>
                <div className="checkout-saved-chips">
                  {addresses.map((a) => (
                    <button type="button" key={a.id} className="tag" onClick={() => useAddress(a.id)}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-grid">
              <div className="field">
                <label htmlFor="co-company">Company Name</label>
                <input id="co-company" name="company" type="text" placeholder="Your company name" value={company} onChange={(e) => setCompany(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="co-gst">GSTIN (optional)</label>
                <input id="co-gst" name="gst" type="text" placeholder="22AAAAA0000A1Z5" />
              </div>
              <div className="field">
                <label htmlFor="co-contact">Contact Person</label>
                <input id="co-contact" name="contact" type="text" placeholder="Full name" value={contact} onChange={(e) => setContact(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="co-phone">Phone</label>
                <input id="co-phone" name="phone" type="tel" placeholder="+91 90000 00000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="field full">
                <label htmlFor="co-email">Email</label>
                <input id="co-email" name="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="field full">
                <label htmlFor="co-address">Delivery Address</label>
                <textarea id="co-address" name="address" placeholder="Plot / street / area" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="co-city">City</label>
                <input id="co-city" name="city" type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="co-state">State</label>
                <input id="co-state" name="state" type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="co-pin">PIN Code</label>
                <input id="co-pin" name="pin" type="text" inputMode="numeric" placeholder="6-digit PIN" pattern="[0-9]{6}" value={pin} onChange={(e) => setPin(e.target.value)} required />
              </div>
            </div>
            {submitError && (
              <p style={{ color: "var(--color-danger-600, #dc2626)", fontSize: 14 }}>{submitError}</p>
            )}
            <button type="submit" className="btn btn-primary form-submit" style={{ width: "100%" }} disabled={submitting || !hydrated}>
              {submitting ? "Submitting…" : !hydrated ? "Loading…" : "Submit Quotation Request"}
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
                      <span>Qty {item.qty} {item.priceValue != null && <>&middot; {inr(item.priceValue)}/piece</>}</span>
                    </div>
                    <span className="checkout-item-price">
                      {item.priceValue != null ? inr(item.priceValue * item.qty) : "On Request"}
                    </span>
                  </div>
                ))}
              </div>

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
                  <span>Total Payable</span>
                  <span>{inr(Math.round(subtotal * 100) / 100)}</span>
                </div>
              </div>

              {quoteOnlyCount > 0 && (
                <p className="checkout-quote-note">
                  {`${quoteOnlyCount} item${quoteOnlyCount > 1 ? "s are" : " is"} priced “On Request” — pricing for ${quoteOnlyCount > 1 ? "these" : "it"} isn’t included in the total above and will be shared separately.`}
                </p>
              )}

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
