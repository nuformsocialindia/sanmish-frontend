"use client";
import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { vendors, ApiError, type VendorBusinessType } from "@/lib/api";

const BUSINESS_TYPES: { value: VendorBusinessType; label: string }[] = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "distributor", label: "Distributor" },
  { value: "trader", label: "Trader" },
  { value: "service_provider", label: "Service Provider" },
];

export default function BecomeSellerPage() {
  const [businessName, setBusinessName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [businessType, setBusinessType] = useState<VendorBusinessType>("manufacturer");
  const [companyAddress, setCompanyAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [gstin, setGstin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !vendorName.trim()) {
      setError("Please fill in your business name and contact person.");
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!companyAddress.trim()) {
      setError("Please enter your company address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await vendors.apply({
        businessName: businessName.trim(),
        vendorName: vendorName.trim(),
        email: email.trim(),
        mobileNumber: mobile,
        businessType,
        companyAddress: companyAddress.trim(),
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        gstin: gstin.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("An application or account already exists for this email.");
      } else {
        setError(err instanceof Error ? err.message : "Could not submit your application. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Become a Seller"
      heading={<>List your equipment to <span className="grad-text">serious B2B buyers</span></>}
      subtext="Submit your business details for verification. Once our team approves your application, you'll get a confirmation email and vendor portal access."
    >
      <div className="auth-card auth-card--wide">
        {submitted ? (
          <div className="auth-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <h2>Application submitted</h2>
            <p>
              Thanks, {vendorName.split(" ")[0]} — our team will review {businessName}&rsquo;s application and email {email} once
              a decision is made.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h2 className="auth-step-title">Seller application</h2>
            <p className="auth-step-sub">Tell us about your business — we&rsquo;ll verify and get back to you.</p>

            <div className="form-grid-2">
              <div className="field">
                <label htmlFor="bs-business">Business / Company Name <span className="req">*</span></label>
                <input id="bs-business" type="text" placeholder="Your company name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} autoFocus />
              </div>
              <div className="field">
                <label htmlFor="bs-name">Contact Person <span className="req">*</span></label>
                <input id="bs-name" type="text" placeholder="Your full name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
              </div>
            </div>
            <div className="form-grid-2" style={{ marginTop: 16 }}>
              <div className="field">
                <label htmlFor="bs-email">Email <span className="req">*</span></label>
                <input id="bs-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="bs-mobile">Mobile Number <span className="req">*</span></label>
                <input
                  id="bs-mobile"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                />
              </div>
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="bs-type">Business Type <span className="req">*</span></label>
              <select id="bs-type" value={businessType} onChange={(e) => setBusinessType(e.target.value as VendorBusinessType)}>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="bs-address">Company Address <span className="req">*</span></label>
              <textarea id="bs-address" placeholder="Registered office / warehouse address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
            </div>
            <div className="form-grid-2" style={{ marginTop: 16 }}>
              <div className="field">
                <label htmlFor="bs-city">City</label>
                <input id="bs-city" type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="bs-state">State</label>
                <input id="bs-state" type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="bs-gstin">GSTIN</label>
              <input id="bs-gstin" type="text" placeholder="Optional" value={gstin} onChange={(e) => setGstin(e.target.value)} />
            </div>

            {error && <p className="auth-error">{error}</p>}
            <p className="auth-terms">
              By submitting, you agree to SANMISH&rsquo;s <Link href="#">Terms &amp; Conditions</Link> and <Link href="#">Privacy Policy</Link>.
            </p>
            <button type="submit" className="btn btn-primary form-submit" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Submitting…" : "Submit Application"}
            </button>

            <div className="auth-divider"><span>Already a buyer?</span></div>
            <Link href="/login" className="btn btn-ghost" style={{ width: "100%" }}>
              Login instead
            </Link>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
