"use client";
import { useCallback, useEffect, useState } from "react";
import { pagesApi, AdminApiError, type Paginated } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/format";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import Drawer, { FieldGrid, Field } from "@/components/admin/Drawer";

type CmsPage = Record<string, unknown> & {
  id: string; title?: string; path?: string; group?: string; bodyHtml?: string; metaTitle?: string | null;
  metaDescription?: string | null; status?: string; version?: number; updatedAt?: string;
};
type PageVersion = Record<string, unknown> & { version: number; bodyHtml?: string; createdAt?: string; admin?: { name?: string } };

const GROUPS = ["SUPPORT", "LEGAL", "MARKETING"] as const;
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

const emptyForm = () => ({ title: "", path: "", group: "LEGAL" as (typeof GROUPS)[number], bodyHtml: "", metaTitle: "", metaDescription: "", status: "DRAFT" as (typeof STATUSES)[number] });

export default function AdminPagesPage() {
  const toast = useAdminToast();
  const [items, setItems] = useState<CmsPage[]>([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<CmsPage | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [versions, setVersions] = useState<PageVersion[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    pagesApi.list({ limit: 100, group: groupFilter || undefined })
      .then((r) => setItems(r.data as CmsPage[]))
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load pages."))
      .finally(() => setLoading(false));
  }, [groupFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setFormOpen(true); };
  const openEdit = (p: CmsPage) => {
    setEditing(p);
    setForm({
      title: String(p.title ?? ""), path: String(p.path ?? ""), group: (p.group as (typeof GROUPS)[number]) ?? "LEGAL",
      bodyHtml: String(p.bodyHtml ?? ""), metaTitle: String(p.metaTitle ?? ""), metaDescription: String(p.metaDescription ?? ""),
      status: (p.status as (typeof STATUSES)[number]) ?? "DRAFT",
    });
    setDetail(null);
    setFormOpen(true);
  };

  const openDetail = (p: CmsPage) => {
    setDetail(p);
    setDrawerTab("overview");
    pagesApi.get(p.id).then((d) => setDetail(d as CmsPage)).catch(() => {});
    pagesApi.versions(p.id).then((v) => setVersions(v as PageVersion[])).catch(() => setVersions([]));
  };

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      toast.success(successMsg);
      load();
      if (detail) openDetail(detail);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        title: form.title, path: form.path, group: form.group, bodyHtml: form.bodyHtml,
        metaTitle: form.metaTitle || undefined, metaDescription: form.metaDescription || undefined, status: form.status,
      };
      if (editing) await pagesApi.update(editing.id, body);
      else await pagesApi.create(body);
      toast.success(editing ? "Page updated." : "Page created.");
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save page.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="adm-toolbar">
        <select className="input" style={{ maxWidth: 220 }} value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
          <option value="">All groups</option>
          {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <div className="adm-toolbar-spacer" />
        <button type="button" className="btn btn-primary" onClick={openCreate}>New page</button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState onClear={() => setGroupFilter("")} />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Title</th><th>Path</th><th>Group</th><th className="num">Version</th><th>Updated</th><th>Status</th><th className="adm-open-col" /></tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td><code>{p.path}</code></td>
                  <td>{p.group}</td>
                  <td className="num">v{p.version ?? 1}</td>
                  <td>{formatDate(p.updatedAt)}</td>
                  <td><span className={`tag ${p.status === "PUBLISHED" ? "tag-positive" : p.status === "ARCHIVED" ? "tag-muted" : "tag-attention"}`}>{p.status}</span></td>
                  <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(p)}>Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="dialog-backdrop" onClick={() => setFormOpen(false)}>
          <div className="dialog elev-lg" style={{ maxWidth: 980, width: "94vw", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">{editing ? "Edit page" : "New page"}</div>
            <form onSubmit={handleSave}>
              <div className="adm-form-grid cols-2">
                <div className="field"><label>Title *</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="field"><label>Path * (e.g. /refund-policy)</label><input className="input" required value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} disabled={Boolean(editing)} /></div>
                <div className="field">
                  <label>Group *</label>
                  <select className="input" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value as (typeof GROUPS)[number] })}>
                    {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as (typeof STATUSES)[number] })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="field full">
                  <label>Body HTML *</label>
                  <textarea
                    className="input"
                    required
                    rows={24}
                    value={form.bodyHtml}
                    onChange={(e) => setForm({ ...form, bodyHtml: e.target.value })}
                    style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 13, lineHeight: 1.6, minHeight: 420, resize: "vertical" }}
                  />
                </div>
                <div className="field"><label>Meta title</label><input className="input" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} /></div>
                <div className="field"><label>Meta description</label><input className="input" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} /></div>
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
          kicker="Pages & policies"
          title={String(detail.title ?? "Page")}
          subtitle={String(detail.path ?? "")}
          status={detail.status}
          tabs={[{ key: "overview", label: "Overview" }, { key: "versions", label: "Version history" }]}
          activeTab={drawerTab}
          onTabChange={setDrawerTab}
          onClose={() => setDetail(null)}
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={() => openEdit(detail)}>Edit</button>
              {detail.status !== "PUBLISHED" && <button type="button" className="btn btn-secondary" onClick={() => runAction(() => pagesApi.setStatus(detail.id, "PUBLISHED"), "Published.")}>Publish</button>}
              {detail.status !== "ARCHIVED" && <button type="button" className="btn btn-secondary" onClick={() => runAction(() => pagesApi.setStatus(detail.id, "ARCHIVED"), "Archived.")}>Archive</button>}
            </>
          }
        >
          {drawerTab === "overview" && (
            <>
              <FieldGrid>
                <Field label="Group" value={String(detail.group ?? "—")} />
                <Field label="Current version" value={`v${detail.version ?? 1}`} />
                <Field label="Meta title" value={String(detail.metaTitle ?? "—")} />
                <Field label="Meta description" value={String(detail.metaDescription ?? "—")} />
              </FieldGrid>
              <div className="adm-section-label">Body HTML (current)</div>
              <pre style={{ background: "var(--color-neutral-100)", padding: 12, borderRadius: "var(--radius-md)", fontSize: 12.5, overflowX: "auto", whiteSpace: "pre-wrap" }}>{String(detail.bodyHtml ?? "—")}</pre>
            </>
          )}
          {drawerTab === "versions" && (
            <table className="table">
              <thead><tr><th>Version</th><th>Edited by</th><th>Date</th><th /></tr></thead>
              <tbody>
                {versions.length === 0 ? <tr><td colSpan={4} style={{ color: "var(--color-neutral-600)" }}>No prior versions.</td></tr> :
                  versions.map((v) => (
                    <tr key={v.version}>
                      <td>v{v.version}{v.version === detail.version ? " (current)" : ""}</td>
                      <td>{v.admin?.name ?? "—"}</td>
                      <td>{formatDate(v.createdAt)}</td>
                      <td>{v.version !== detail.version && <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => pagesApi.revert(detail.id, v.version), `Reverted to v${v.version}'s content (created as a new version).`)}>Revert to this</button>}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </Drawer>
      )}
    </div>
  );
}
