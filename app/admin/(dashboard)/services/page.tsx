"use client";
import { useCallback, useEffect, useState } from "react";
import { servicesApi, AdminApiError, type Paginated } from "@/lib/admin/api";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import Drawer, { FieldGrid, Field } from "@/components/admin/Drawer";

type Service = Record<string, unknown> & {
  id: string; name?: string; group?: string; summary?: string; body?: string; iconName?: string | null;
  position?: number; enquiryFormEnabled?: boolean; status?: string;
};

const GROUPS = ["SUPPLY", "ENGINEERING", "LIFECYCLE", "ADVISORY", "COMMERCIAL"] as const;
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

const emptyForm = () => ({ name: "", group: "SUPPLY" as (typeof GROUPS)[number], summary: "", body: "", iconName: "", position: "0", enquiryFormEnabled: true, status: "DRAFT" as (typeof STATUSES)[number] });

export default function AdminServicesPage() {
  const toast = useAdminToast();
  const [items, setItems] = useState<Service[]>([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<Service | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    servicesApi.list({ limit: 100, group: showDeleted ? undefined : groupFilter || undefined, deletedOnly: showDeleted || undefined })
      .then((r) => setItems((r.data as Service[]).sort((a, b) => (a.position ?? 0) - (b.position ?? 0))))
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load services."))
      .finally(() => setLoading(false));
  }, [groupFilter, showDeleted]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setFormOpen(true); };
  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: String(s.name ?? ""), group: (s.group as (typeof GROUPS)[number]) ?? "SUPPLY", summary: String(s.summary ?? ""),
      body: String(s.body ?? ""), iconName: String(s.iconName ?? ""), position: String(s.position ?? 0),
      enquiryFormEnabled: s.enquiryFormEnabled !== false, status: (s.status as (typeof STATUSES)[number]) ?? "DRAFT",
    });
    setDetail(null);
    setFormOpen(true);
  };

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      toast.success(successMsg);
      load();
      setDetail(null);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name, group: form.group, summary: form.summary, body: form.body, iconName: form.iconName || undefined,
        position: Number(form.position) || 0, enquiryFormEnabled: form.enquiryFormEnabled, status: form.status,
      };
      if (editing) await servicesApi.update(editing.id, body);
      else await servicesApi.create(body);
      toast.success(editing ? "Service updated." : "Service created.");
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save service.");
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = (id: string, direction: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const a = items[idx], b = items[swapIdx];
    runAction(() => servicesApi.reorder([{ id: a.id, position: swapIdx }, { id: b.id, position: idx }]), "Order updated.");
  };

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="adm-toolbar">
        <select className="input" style={{ maxWidth: 220 }} disabled={showDeleted} value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
          <option value="">All groups</option>
          {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <label className="check" style={{ fontSize: 13, color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>
          <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
          Show deleted
        </label>
        <div className="adm-toolbar-spacer" />
        <button type="button" className="btn btn-primary" onClick={openCreate}>New service</button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState onClear={() => setGroupFilter("")} />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Order</th><th>Name</th><th>Group</th><th>Summary</th><th>Enquiry form</th><th>Status</th><th className="adm-open-col" /></tr></thead>
            <tbody>
              {items.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ display: "flex", gap: 4 }}>
                    <button type="button" className="btn btn-ghost btn-sm" disabled={showDeleted || i === 0} onClick={() => handleReorder(s.id, -1)}>↑</button>
                    <button type="button" className="btn btn-ghost btn-sm" disabled={showDeleted || i === items.length - 1} onClick={() => handleReorder(s.id, 1)}>↓</button>
                  </td>
                  <td>{s.name}</td>
                  <td>{s.group}</td>
                  <td style={{ maxWidth: 280 }}>{s.summary}</td>
                  <td>{s.enquiryFormEnabled ? "On" : "Off"}</td>
                  <td><span className={`tag ${s.status === "PUBLISHED" ? "tag-positive" : s.status === "ARCHIVED" ? "tag-muted" : "tag-attention"}`}>{s.status}</span></td>
                  <td>
                    {showDeleted ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => servicesApi.restore(s.id), "Service restored.")}>Restore</button>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDetail(s)}>Open</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="dialog-backdrop" onClick={() => setFormOpen(false)}>
          <div className="dialog elev-lg" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">{editing ? "Edit service" : "New service"}</div>
            <form onSubmit={handleSave}>
              <div className="adm-form-grid cols-2">
                <div className="field full"><label>Name *</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="field">
                  <label>Group *</label>
                  <select className="input" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value as (typeof GROUPS)[number] })}>
                    {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="field"><label>Icon name</label><input className="input" value={form.iconName} onChange={(e) => setForm({ ...form, iconName: e.target.value })} /></div>
                <div className="field full"><label>Summary *</label><input className="input" required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
                <div className="field full"><label>Body *</label><textarea className="input" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
                <div className="field"><label>Position</label><input className="input" type="number" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
                <div className="field">
                  <label>Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as (typeof STATUSES)[number] })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="field full"><label className="check"><input type="checkbox" checked={form.enquiryFormEnabled} onChange={(e) => setForm({ ...form, enquiryFormEnabled: e.target.checked })} /> Show enquiry form on this service page</label></div>
              </div>
              <div className="dialog-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detail && (
        <Drawer
          kicker="Services"
          title={String(detail.name ?? "Service")}
          status={detail.status}
          onClose={() => setDetail(null)}
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={() => openEdit(detail)}>Edit</button>
              {detail.status !== "PUBLISHED" && <button type="button" className="btn btn-secondary" onClick={() => runAction(() => servicesApi.setStatus(detail.id, "PUBLISHED"), "Published.")}>Publish</button>}
              {detail.status !== "ARCHIVED" && <button type="button" className="btn btn-secondary" onClick={() => runAction(() => servicesApi.setStatus(detail.id, "ARCHIVED"), "Archived.")}>Archive</button>}
              <button type="button" className="btn btn-ghost" onClick={() => { if (confirm(`Soft delete "${detail.name}"?`)) runAction(() => servicesApi.remove(detail.id), "Service soft deleted."); }}>Soft delete</button>
            </>
          }
        >
          <FieldGrid>
            <Field label="Group" value={String(detail.group ?? "—")} />
            <Field label="Enquiry form" value={detail.enquiryFormEnabled ? "On" : "Off"} />
            <Field label="Position" value={String(detail.position ?? 0)} />
          </FieldGrid>
          <div className="adm-section-label">Summary</div>
          <p style={{ fontSize: 13.5, marginBottom: 16 }}>{String(detail.summary ?? "—")}</p>
          <div className="adm-section-label">Body</div>
          <p style={{ fontSize: 13.5, whiteSpace: "pre-wrap" }}>{String(detail.body ?? "—")}</p>
        </Drawer>
      )}
    </div>
  );
}
