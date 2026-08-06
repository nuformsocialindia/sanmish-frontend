"use client";
import { useEffect, type ReactNode } from "react";

type Props = {
  kicker: string;
  title: string;
  subtitle?: string;
  status?: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
};

export default function Drawer({ kicker, title, subtitle, status, onClose, children, actions }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="adm-drawer-backdrop" onClick={onClose}>
      <div className="adm-drawer-panel elev-lg" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="adm-drawer-head">
          <div className="adm-drawer-head-top">
            <div>
              <div className="adm-drawer-kicker">{kicker}</div>
              <div className="adm-drawer-title">{title}</div>
              {subtitle && <div className="adm-drawer-sub">{subtitle}</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {status && <span className="tag tag-attention">{status}</span>}
              <button type="button" className="btn btn-icon btn-secondary" onClick={onClose} aria-label="Close">×</button>
            </div>
          </div>
        </div>
        <div className="adm-drawer-body">{children}</div>
        {actions && <div className="adm-action-row">{actions}</div>}
      </div>
    </div>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="adm-field-grid">{children}</div>;
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <span className="adm-field-item-label">{label}</span>
      <span className="adm-field-item-value">{value}</span>
    </div>
  );
}
