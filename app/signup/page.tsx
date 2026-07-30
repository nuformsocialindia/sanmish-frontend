"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth as authApi, ApiError } from "@/lib/api";
import AuthShell from "@/components/AuthShell";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<"details" | "otp" | "done">("details");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !name.trim()) {
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
    setError("");
    setLoading(true);
    try {
      await authApi.signupStart(name, email);
      setStep("otp");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("An account already exists for this email. Try logging in instead.");
      } else {
        setError(err instanceof Error ? err.message : "Could not send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { user } = await authApi.signupVerify(email, otp);
      login({ ...user, mobile });
      setStep("done");
      setTimeout(() => router.push("/"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Join SANMISH"
      heading={<>Sell or source with <span className="grad-text">verified partners</span></>}
      subtext="Create a free account to send RFQs, track quotations, or list your equipment to serious industrial buyers."
    >
      <div className="auth-card">
        {step === "details" && (
          <form onSubmit={handleContinue} noValidate>
            <h2 className="auth-step-title">Create your account</h2>
            <p className="auth-step-sub">Tell us a little about your business.</p>
            <div className="field">
              <label htmlFor="su-company">Business / Company Name <span className="req">*</span></label>
              <input id="su-company" type="text" placeholder="Your company name" value={company} onChange={(e) => setCompany(e.target.value)} autoFocus />
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="su-name">Contact Person <span className="req">*</span></label>
              <input id="su-name" type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="su-mobile">Mobile Number <span className="req">*</span></label>
              <input
                id="su-mobile"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
              />
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="su-email">Work Email <span className="req">*</span></label>
              <input id="su-email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <p className="auth-terms">
              By continuing, you agree to SANMISH&rsquo;s <Link href="#">Terms &amp; Conditions</Link> and <Link href="#">Privacy Policy</Link>.
            </p>
            <button type="submit" className="btn btn-primary form-submit" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Sending…" : "Get OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerify} noValidate>
            <h2 className="auth-step-title">Verify OTP</h2>
            <p className="auth-step-sub">We&rsquo;ve sent a code to {email}.</p>
            <div className="field">
              <label htmlFor="su-otp">Enter OTP <span className="req">*</span></label>
              <input
                id="su-otp"
                type="text"
                inputMode="numeric"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                autoFocus
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn btn-primary form-submit" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Verifying…" : "Verify & Create Account"}
            </button>
            <button
              type="button"
              className="auth-linkbtn"
              onClick={() => {
                setStep("details");
                setOtp("");
                setError("");
              }}
            >
              Edit details
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="auth-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <h2>Account created</h2>
            <p>Welcome to SANMISH, {name.split(" ")[0]}. Redirecting you home…</p>
          </div>
        )}

        {step !== "done" && (
          <>
            <div className="auth-divider"><span>Already have an account?</span></div>
            <Link href="/login" className="btn btn-ghost" style={{ width: "100%" }}>
              Login instead
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
