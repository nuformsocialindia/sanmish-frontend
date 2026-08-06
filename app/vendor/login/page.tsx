"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { vendorAuthApi, VendorApiError } from "@/lib/vendor/api";
import { useVendorAuth } from "@/lib/vendor/auth-context";

export default function VendorLoginPage() {
  return (
    <Suspense fallback={null}>
      <VendorLoginInner />
    </Suspense>
  );
}

function VendorLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useVendorAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await vendorAuthApi.login(email, password);
      await refresh();
      router.push(searchParams.get("next") || "/vendor/dashboard");
    } catch (err) {
      setError(err instanceof VendorApiError ? err.message : "Login failed. Please try again.");
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
            <h1 className="adm-login-hero">The vendor portal for SANMISH partners.</h1>
            <p className="adm-login-hero-copy">
              View your products and categories, track orders and RFQs, and stay on top of settlements — all in one place.
            </p>
          </div>
          <div className="adm-login-tags">
            <span>Products</span><span>Orders</span><span>RFQs</span><span>Settlements</span>
          </div>
        </div>

        <div className="adm-login-right">
          <form onSubmit={handleSubmit} className="card elev-md adm-login-card">
            <div>
              <div className="card-kicker">Vendor access</div>
              <h2 style={{ fontSize: 28, margin: 0 }}>Sign in</h2>
            </div>
            {error && <div className="adm-error-box">{error}</div>}
            <div className="field">
              <label htmlFor="vnd-email">Email</label>
              <input id="vnd-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
            </div>
            <div className="field">
              <label htmlFor="vnd-password">Password</label>
              <input id="vnd-password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <p style={{ fontSize: 13, color: "var(--color-neutral-600)", margin: 0 }}>
              Only vendors approved by SANMISH can sign in here. Not onboarded yet? <a href="/contact">Contact us</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
