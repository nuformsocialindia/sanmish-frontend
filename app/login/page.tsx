"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<"phone" | "otp" | "done">("phone");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleGetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setStep("otp");
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setError("");
    login({ mobile });
    setStep("done");
    setTimeout(() => router.push("/"), 900);
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      heading={<>Login to source <span className="grad-text">clean energy equipment</span></>}
      subtext="Access RFQs, orders, wishlists and verified supplier quotations — all in one place."
    >
      <div className="auth-card">
        {step === "phone" && (
          <form onSubmit={handleGetOtp} noValidate>
            <h2 className="auth-step-title">Login to your account</h2>
            <p className="auth-step-sub">Enter your registered mobile number to continue.</p>
            <div className="field">
              <label htmlFor="login-mobile">Mobile Number <span className="req">*</span></label>
              <input
                id="login-mobile"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                autoFocus
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <p className="auth-terms">
              By continuing, you agree to SANMISH&rsquo;s <Link href="#">Terms &amp; Conditions</Link>.
            </p>
            <button type="submit" className="btn btn-primary form-submit" style={{ width: "100%" }}>
              Get OTP
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerify} noValidate>
            <h2 className="auth-step-title">Verify OTP</h2>
            <p className="auth-step-sub">We&rsquo;ve sent a code to +91 {mobile}.</p>
            <div className="field">
              <label htmlFor="login-otp">Enter OTP <span className="req">*</span></label>
              <input
                id="login-otp"
                type="text"
                inputMode="numeric"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                autoFocus
              />
              <span className="field-hint">Demo mode — enter any 6 digits.</span>
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn btn-primary form-submit" style={{ width: "100%" }}>
              Verify &amp; Continue
            </button>
            <button
              type="button"
              className="auth-linkbtn"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
            >
              Change mobile number
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="auth-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <h2>You&rsquo;re logged in</h2>
            <p>Redirecting you back…</p>
          </div>
        )}

        {step !== "done" && (
          <>
            <div className="auth-divider"><span>New to SANMISH?</span></div>
            <Link href="/signup" className="btn btn-ghost" style={{ width: "100%" }}>
              Create a free account
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
