"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { INQUIRY_TYPES } from "@/lib/data";
import { enquiries, ApiError, type EnquiryType } from "@/lib/api";

// Maps this form's friendly inquiry-type labels to the backend's EnquiryType
// enum (docs/public-api.md: POST /public/enquiries) — kept here rather than
// in lib/data.ts since it's only meaningful alongside this exact select.
const INQUIRY_TYPE_MAP: Record<string, EnquiryType> = {
  "Request a quotation (RFQ)": "QUOTE_REQUEST",
  "Become a seller / list products": "BECOME_SELLER",
  "Installation & commissioning": "SERVICE",
  "AMC & spare parts": "SUPPORT",
  "Turnkey project enquiry": "SERVICE",
  "General question": "GENERAL",
};

export default function ContactForm() {
  return (
    <Suspense fallback={null}>
      <ContactFormInner />
    </Suspense>
  );
}

function ContactFormInner() {
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Carries which product (if any) sent the visitor here — e.g. "Request
  // Quote for Bulk" on a product page — so the enquiry is attributed to
  // that product on the admin side.
  const productSlug = searchParams.get("productSlug");
  const productName = searchParams.get("productName");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setError("");
    setSubmitting(true);
    const data = new FormData(form);
    try {
      const result = await enquiries.create({
        type: INQUIRY_TYPE_MAP[String(data.get("type"))] ?? "GENERAL",
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        message: String(data.get("message") ?? ""),
        company: String(data.get("company") ?? "") || undefined,
        phone: String(data.get("phone") ?? "") || undefined,
        productSlug: productSlug ?? undefined,
      });
      setReference(result.reference);
      form.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card reveal">
      <h3>Send us a message</h3>
      <p className="sub">Tell us about your requirement and we&rsquo;ll route it to the right team.</p>
      {productName && (
        <p className="form-context-note">
          Regarding: <b>{productName}</b>
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="cf-name">Full name</label>
            <input id="cf-name" name="name" type="text" placeholder="Your name" required />
          </div>
          <div className="field">
            <label htmlFor="cf-company">Company</label>
            <input id="cf-company" name="company" type="text" placeholder="Company name" />
          </div>
          <div className="field">
            <label htmlFor="cf-email">Work email</label>
            <input id="cf-email" name="email" type="email" placeholder="you@company.com" required />
          </div>
          <div className="field">
            <label htmlFor="cf-phone">Phone</label>
            <input id="cf-phone" name="phone" type="tel" placeholder="+91 90000 00000" />
          </div>
          <div className="field full">
            <label htmlFor="cf-type">Inquiry type</label>
            <select id="cf-type" name="type" defaultValue={INQUIRY_TYPES[0]}>
              {INQUIRY_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field full">
            <label htmlFor="cf-msg">Message</label>
            <textarea id="cf-msg" name="message" placeholder="Share equipment, quantity, location or project details…" required />
          </div>
        </div>
        {error && <p className="auth-error">{error}</p>}
        {!reference && (
          <button type="submit" className="btn btn-primary form-submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send message"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
        <div className={`form-success${reference ? " show" : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Thanks — your message has been received{reference ? ` (reference ${reference})` : ""}. Our team will get back within one business day.
        </div>
      </form>
    </div>
  );
}
