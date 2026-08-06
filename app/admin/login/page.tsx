"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, AdminApiError } from "@/lib/admin/api";
import { useAdminAuth } from "@/lib/admin/auth-context";
import Icon from "@/components/admin/Icon";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginInner />
    </Suspense>
  );
}

function AdminLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAdminAuth();

  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const goToNext = async () => {
    await refresh();
    router.push(searchParams.get("next") || "/admin");
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.requires2fa && res.tempToken) {
        setTempToken(res.tempToken);
        setStep("2fa");
      } else {
        await goToNext();
      }
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handle2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      setError("Enter all six digits.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authApi.verify2fa(tempToken, code);
      await goToNext();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-root">
      <div className="adm-login-grid">
        <div className="adm-login-left">
          <div className="adm-brand">
            <span className="adm-brand-dot">S</span>
            <span className="adm-brand-name" style={{ fontSize: 22 }}>SANMISH</span>
          </div>
          <div>
            <h1 className="adm-login-hero">The admin panel for a marketplace that runs on trust.</h1>
            <p className="adm-login-hero-copy">
              Vendor approvals, RFQ quotations, settlements and shipments — all in one console.
            </p>
          </div>
          <div className="adm-login-tags">
            <span>Operations</span><span>Finance</span><span>Logistics</span><span>Vendors</span>
          </div>
        </div>

        <div className="adm-login-right">
          {step === "credentials" ? (
            <form onSubmit={handleCredentials} className="card elev-md adm-login-card">
              <div>
                <div className="card-kicker">Admin access</div>
                <h2 style={{ fontSize: 28, margin: 0 }}>Sign in</h2>
              </div>
              {error && <div className="adm-error-box">{error}</div>}
              <div className="field">
                <label htmlFor="adm-email">Email</label>
                <input id="adm-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
              </div>
              <div className="field">
                <label htmlFor="adm-password">Password</label>
                <input id="adm-password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
              <p style={{ fontSize: 13, color: "var(--color-neutral-600)", margin: 0 }}>
                Forgot access? Ask a super admin.
              </p>
            </form>
          ) : (
            <form onSubmit={handle2fa} className="card elev-md adm-login-card">
              <div className="adm-2fa-icon"><Icon name="lock" size={26} /></div>
              <div>
                <h2 style={{ fontSize: 26, margin: 0 }}>Two-factor code</h2>
                <p style={{ fontSize: 14, margin: "6px 0 0" }}>Enter the 6-digit code from your authenticator app.</p>
              </div>
              {error && <div className="adm-error-box">{error}</div>}
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="input"
                placeholder="000000"
                style={{ fontSize: 22, textAlign: "center", letterSpacing: "0.5em" }}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? "Verifying…" : "Verify and continue"}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-block"
                onClick={() => { setStep("credentials"); setCode(""); setError(""); }}
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
