"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth as authApi, ApiError } from "@/lib/api";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [step, setStep] = useState<"email" | "otp" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authApi.loginStart(email);
      setStep("otp");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("No account found for this email. Try signing up instead.");
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
      const { user } = await authApi.loginVerify(email, otp);
      login(user);
      setStep("done");
      const next = searchParams.get("next") || "/";
      setTimeout(() => router.push(next), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      heading={<>Login to source <span className="grad-text">clean energy equipment</span></>}
      subtext="Access RFQs, orders, wishlists and verified supplier quotations — all in one place."
    >
      <div className="auth-card">
        {step === "email" && (
          <form onSubmit={handleGetOtp} noValidate>
            <h2 className="auth-step-title">Login to your account</h2>
            <p className="auth-step-sub">Enter your registered email address to continue.</p>
            <div className="field">
              <label htmlFor="login-email">Email Address <span className="req">*</span></label>
              <input
                id="login-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <p className="auth-terms">
              By continuing, you agree to SANMISH&rsquo;s <Link href="#">Terms &amp; Conditions</Link>.
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
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn btn-primary form-submit" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Verifying…" : "Verify & Continue"}
            </button>
            <button
              type="button"
              className="auth-linkbtn"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError("");
              }}
            >
              Change email address
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
