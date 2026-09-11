"use client";
import { useEffect, type ReactNode } from "react";
import StatusTag from "@/components/admin/StatusTag";
import Icon from "@/components/admin/Icon";

type Props = {
  kicker: string;
  title: string;
  subtitle?: string;
  status?: string;
  tabs?: { key: string; label: string }[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
};

export default function Drawer({ kicker, title, subtitle, status, tabs, activeTab, onTabChange, onClose, children, actions }: Props) {
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
              {status && <StatusTag status={status} />}
              <button type="button" className="btn btn-icon btn-secondary" onClick={onClose} aria-label="Close">
                <Icon name="x" size={18} />
              </button>
            </div>
          </div>
          {tabs && tabs.length > 0 && (
            <div className="adm-drawer-tabs">
              {tabs.map((t) => (
                <button key={t.key} type="button" className={activeTab === t.key ? "active" : ""} onClick={() => onTabChange?.(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          )}
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

export function Field({ label, value, action, actionLabel, onAction, actionDisabled }: {
  label: string; value: ReactNode; action?: boolean; actionLabel?: string; onAction?: () => void; actionDisabled?: boolean;
}) {
  return (
    <div>
      <span className="adm-field-item-label">{label}</span>
      <span className="adm-field-item-value">
        {value}
        {action && (
          <button type="button" className="adm-micro-btn" onClick={onAction} disabled={actionDisabled}>{actionLabel}</button>
        )}
      </span>
    </div>
  );
}

export function NotesThread({ notes, draft, onDraftChange, onAdd }: {
  notes: { note?: string; text?: string; createdAt?: string; author?: string; adminName?: string; admin?: { name?: string } }[];
  draft: string; onDraftChange: (v: string) => void; onAdd: () => void;
}) {
  return (
    <div>
      <div className="adm-section-label">Internal notes</div>
      <div className="adm-notes-list" style={{ marginBottom: 12 }}>
        {notes.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>No notes yet.</p>
        ) : notes.map((n, i) => (
          <div key={i} className="adm-note-item">
            {n.note ?? n.text}
            <div className="adm-note-meta">{n.admin?.name ?? n.adminName ?? n.author ?? "Admin"} · {n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : ""}</div>
          </div>
        ))}
      </div>
      <div className="adm-note-input-row">
        <textarea className="input" rows={3} placeholder="Add a note…" value={draft} onChange={(e) => onDraftChange(e.target.value)} />
        <button type="button" className="btn btn-secondary btn-tinted" onClick={() => { if (draft.trim()) onAdd(); }}>Add note</button>
      </div>
    </div>
  );
}

export function Timeline({ events }: { events: { label?: string; status?: string; at?: string; by?: string; completed?: boolean }[] }) {
  return (
    <div>
      <div className="adm-section-label">Timeline</div>
      <div className="adm-timeline">
        {events.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>No timeline events yet.</p>
        ) : events.map((e, i) => (
          <div key={i} className="adm-timeline-item">
            <div className="adm-timeline-dot-wrap">
              <span className={`adm-timeline-dot${e.completed === false ? " pending" : ""}`} />
              <span className="adm-timeline-connector" />
            </div>
            <div>
              <div className="adm-timeline-label">{e.label ?? e.status ?? "Event"}</div>
              <div className="adm-timeline-meta">{e.at ? new Date(e.at).toLocaleString("en-IN") : ""}{e.by ? ` · ${e.by}` : ""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
