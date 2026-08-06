"use client";
import { useEffect, useState } from "react";
import { authApi, AdminApiError } from "@/lib/admin/api";
import { useAdminAuth } from "@/lib/admin/auth-context";
import { useAdminToast } from "@/components/admin/Toast";
import { ErrorBanner } from "@/components/admin/ListStates";

export default function AdminSettingsPage() {
  const toast = useAdminToast();
  const { admin } = useAdminAuth();
  const [setup, setSetup] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setEnabled(Boolean(admin?.twoFactorEnabled)); }, [admin?.twoFactorEnabled]);

  const apiBase = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const beginSetup = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await authApi.setup2fa();
      setSetup(res);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not start 2FA setup.");
    } finally {
      setBusy(false);
    }
  };

  const confirmEnable = async () => {
    if (code.length < 6) { setError("Enter all six digits."); return; }
    setBusy(true);
    setError("");
    try {
      await authApi.enable2fa(code);
      setEnabled(true);
      toast.success("Two-factor authentication enabled.");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not enable 2FA.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-settings-grid">
      <div className="card elev-sm adm-form-card">
        <div>
          <div className="card-kicker">Security</div>
          <h3 style={{ fontSize: 22, margin: 0 }}>Two-factor authentication</h3>
          <p style={{ fontSize: 13.5, margin: "6px 0 0" }}>
            Add an authenticator-app code as a second step at sign-in.
          </p>
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

        {enabled ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 13.5, color: "var(--color-accent-2-800)" }}>2FA is enabled on this account.</p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                className="input"
                style={{ maxWidth: 160 }}
                maxLength={6}
                placeholder="Current code"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy || disableCode.length < 6}
                onClick={async () => {
                  setBusy(true); setError("");
                  try {
                    await authApi.disable2fa(disableCode);
                    setEnabled(false); setSetup(null); setCode(""); setDisableCode("");
                    toast.success("Two-factor authentication disabled.");
                  } catch (err) {
                    setError(err instanceof AdminApiError ? err.message : "Could not disable 2FA — check the code.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Disabling…" : "Disable 2FA"}
              </button>
            </div>
          </div>
        ) : !setup ? (
          <button type="button" className="btn btn-primary" style={{ alignSelf: "flex-start" }} disabled={busy} onClick={beginSetup}>
            {busy ? "Starting…" : "Set up 2FA"}
          </button>
        ) : (
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div className="adm-qr-panel">
              {setup.qrCodeDataUrl && <img src={setup.qrCodeDataUrl} alt="2FA QR code" />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 12.5, margin: 0 }}>Manual entry key:</p>
              <code style={{ fontSize: 12.5, wordBreak: "break-all" }}>{setup.secret}</code>
              <input
                className="input"
                maxLength={6}
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              />
              <button type="button" className="btn btn-primary" disabled={busy} onClick={confirmEnable}>
                {busy ? "Enabling…" : "Enable 2FA"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card elev-sm adm-form-card">
        <div>
          <div className="card-kicker">Environment</div>
          <h3 style={{ fontSize: 22, margin: 0 }}>API connection</h3>
        </div>
        <div className="field">
          <label>Base URL</label>
          <input className="input" value={apiBase} readOnly />
        </div>
        <p style={{ fontSize: 13, color: "var(--color-neutral-600)", margin: 0 }}>
          If your dev server isn&apos;t on localhost:3001, set <code>ADMIN_FRONTEND_ORIGIN</code> in the backend
          .env to match, or CORS will reject the cookie. The base URL comes from <code>NEXT_PUBLIC_ADMIN_API_URL</code>.
        </p>
      </div>
    </div>
  );
}
