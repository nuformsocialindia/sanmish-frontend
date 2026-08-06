"use client";
import { useCallback, useEffect, useState } from "react";
import { merchandisingApi, categoriesApi, productsApi, brandsApi, fileUrl, AdminApiError, type Paginated } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/format";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import Drawer, { FieldGrid, Field } from "@/components/admin/Drawer";

type Block = Record<string, unknown> & {
  id: string; title?: string; type?: string; placement?: string; position?: number; status?: string;
  publishFrom?: string | null; publishTo?: string | null; config?: Record<string, unknown>; categoryId?: string | null;
  imageUrl?: string | null;
};

const TYPES = ["HERO_SLIDE", "CATEGORY_RAIL", "PRODUCT_RAIL", "DEAL_BANNER", "CITY_RAIL", "PROMO_BLOCK", "BRAND_MARQUEE", "STAT_COUNTER", "TESTIMONIAL_RAIL"] as const;
const PLACEMENTS = ["HOME", "PRODUCTS", "CATEGORY", "CHECKOUT"] as const;
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

function emptyForm() {
  return {
    title: "", type: "HERO_SLIDE" as (typeof TYPES)[number], placement: "HOME" as (typeof PLACEMENTS)[number],
    position: "0", status: "DRAFT" as (typeof STATUSES)[number], publishFrom: "", publishTo: "", categoryId: "",
    headline: "", subhead: "", ctaText: "", ctaUrl: "", body: "",
    idList: "", stats: [{ label: "", value: "" }], testimonials: [{ name: "", quote: "", company: "" }],
  };
}

function buildConfig(f: ReturnType<typeof emptyForm>): Record<string, unknown> {
  switch (f.type) {
    case "HERO_SLIDE":
    case "DEAL_BANNER":
    case "PROMO_BLOCK":
      return { headline: f.headline, subhead: f.subhead || undefined, ctaText: f.ctaText || undefined, ctaUrl: f.ctaUrl || undefined, body: f.body || undefined };
    case "CATEGORY_RAIL":
      return { categoryIds: f.idList.split(",").map((s) => s.trim()).filter(Boolean) };
    case "PRODUCT_RAIL":
      return { productIds: f.idList.split(",").map((s) => s.trim()).filter(Boolean) };
    case "CITY_RAIL":
      return { cityNames: f.idList.split(",").map((s) => s.trim()).filter(Boolean) };
    case "BRAND_MARQUEE":
      return { brandIds: f.idList.split(",").map((s) => s.trim()).filter(Boolean) };
    case "STAT_COUNTER":
      return { stats: f.stats.filter((s) => s.label) };
    case "TESTIMONIAL_RAIL":
      return { testimonials: f.testimonials.filter((t) => t.name) };
    default:
      return {};
  }
}

function loadConfigIntoForm(f: ReturnType<typeof emptyForm>, config: Record<string, unknown> | undefined | null): ReturnType<typeof emptyForm> {
  if (!config) return f;
  const idListKey: Record<string, string> = { CATEGORY_RAIL: "categoryIds", PRODUCT_RAIL: "productIds", CITY_RAIL: "cityNames", BRAND_MARQUEE: "brandIds" };
  const key = idListKey[f.type];
  return {
    ...f,
    headline: String(config.headline ?? ""), subhead: String(config.subhead ?? ""), ctaText: String(config.ctaText ?? ""),
    ctaUrl: String(config.ctaUrl ?? ""), body: String(config.body ?? ""),
    idList: key && Array.isArray(config[key]) ? (config[key] as string[]).join(", ") : "",
    stats: Array.isArray(config.stats) && config.stats.length ? config.stats as { label: string; value: string }[] : f.stats,
    testimonials: Array.isArray(config.testimonials) && config.testimonials.length ? config.testimonials as { name: string; quote: string; company: string }[] : f.testimonials,
  };
}

export default function AdminMerchandisingPage() {
  const toast = useAdminToast();
  const [items, setItems] = useState<Block[]>([]);
  const [meta, setMeta] = useState<Paginated<Block>["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [placementFilter, setPlacementFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Block | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<Block | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    merchandisingApi.list({ limit: 100, placement: placementFilter || undefined, deletedOnly: showDeleted || undefined })
      .then((r) => { setItems((r.data as Block[]).sort((a, b) => (a.position ?? 0) - (b.position ?? 0))); setMeta(r.meta); })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load merchandising blocks."))
      .finally(() => setLoading(false));
  }, [placementFilter, showDeleted]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { categoriesApi.flat({ limit: 100 }).then((r) => setCategories(r.data)).catch(() => {}); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setImageFile(null); setFormOpen(true); };
  const openEdit = (b: Block) => {
    setEditing(b);
    setForm(loadConfigIntoForm({
      ...emptyForm(), title: String(b.title ?? ""), type: (b.type as (typeof TYPES)[number]) ?? "HERO_SLIDE",
      placement: (b.placement as (typeof PLACEMENTS)[number]) ?? "HOME", position: String(b.position ?? 0),
      status: (b.status as (typeof STATUSES)[number]) ?? "DRAFT", publishFrom: b.publishFrom ? String(b.publishFrom).slice(0, 10) : "",
      publishTo: b.publishTo ? String(b.publishTo).slice(0, 10) : "", categoryId: String(b.categoryId ?? ""),
    }, b.config));
    setImageFile(null);
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
        title: form.title, type: form.type, placement: form.placement, position: Number(form.position) || 0,
        status: form.status, publishFrom: form.publishFrom || undefined, publishTo: form.publishTo || undefined,
        categoryId: form.categoryId || undefined, config: buildConfig(form),
      };
      const saved = editing ? await merchandisingApi.update(editing.id, body) : await merchandisingApi.create(body);
      const id = String((saved as Block).id ?? editing?.id);
      if (imageFile) await merchandisingApi.uploadImage(id, imageFile);
      toast.success(editing ? "Block updated." : "Block created.");
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save block.");
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = (id: string, direction: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const a = items[idx], b = items[swapIdx];
    runAction(() => merchandisingApi.reorder([{ id: a.id, position: swapIdx }, { id: b.id, position: idx }]), "Order updated.");
  };

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="adm-toolbar">
        <select className="input" style={{ maxWidth: 220 }} value={placementFilter} onChange={(e) => setPlacementFilter(e.target.value)}>
          <option value="">All placements</option>
          {PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <label className="check" style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
          <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
          Show deleted
        </label>
        <div className="adm-toolbar-spacer" />
        <button type="button" className="btn btn-primary" onClick={openCreate}>New block</button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState onClear={() => setPlacementFilter("")} />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Order</th><th>Title</th><th>Type</th><th>Placement</th><th>Window</th><th>Status</th><th className="adm-open-col" /></tr></thead>
            <tbody>
              {items.map((b, i) => (
                <tr key={b.id}>
                  <td style={{ display: "flex", gap: 4 }}>
                    <button type="button" className="btn btn-ghost btn-sm" disabled={i === 0} onClick={() => handleReorder(b.id, -1)}>↑</button>
                    <button type="button" className="btn btn-ghost btn-sm" disabled={i === items.length - 1} onClick={() => handleReorder(b.id, 1)}>↓</button>
                  </td>
                  <td>{b.imageUrl && <img src={fileUrl(String(b.imageUrl))} alt="" style={{ height: 20, marginRight: 8, verticalAlign: "middle" }} />}{b.title}</td>
                  <td>{String(b.type ?? "—").replace(/_/g, " ")}</td>
                  <td>{b.placement}</td>
                  <td>{b.publishFrom ? formatDate(b.publishFrom) : "—"} – {b.publishTo ? formatDate(b.publishTo) : "—"}</td>
                  <td><span className={`tag ${b.status === "PUBLISHED" ? "tag-positive" : b.status === "ARCHIVED" ? "tag-muted" : "tag-attention"}`}>{b.status}</span></td>
                  <td>
                    {showDeleted ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => merchandisingApi.restore(b.id), "Block restored.")}>Restore</button>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDetail(b)}>Open</button>
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
          <div className="dialog elev-lg" style={{ maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">{editing ? "Edit block" : "New block"}</div>
            <form onSubmit={handleSave}>
              <div className="adm-form-grid cols-2">
                <div className="field full"><label>Title *</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="field">
                  <label>Type *</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as (typeof TYPES)[number] })}>
                    {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Placement *</label>
                  <select className="input" value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value as (typeof PLACEMENTS)[number] })}>
                    {PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {form.placement === "CATEGORY" && (
                  <div className="field">
                    <label>Category</label>
                    <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                      <option value="">— select —</option>
                      {categories.map((c) => <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}
                    </select>
                  </div>
                )}
                <div className="field"><label>Position</label><input className="input" type="number" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
                <div className="field">
                  <label>Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as (typeof STATUSES)[number] })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field"><label>Publish from</label><input className="input" type="date" value={form.publishFrom} onChange={(e) => setForm({ ...form, publishFrom: e.target.value })} /></div>
                <div className="field"><label>Publish to</label><input className="input" type="date" value={form.publishTo} onChange={(e) => setForm({ ...form, publishTo: e.target.value })} /></div>
                <div className="field"><label>Image</label><input className="input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} /></div>
              </div>

              <div className="adm-section-label" style={{ marginTop: 16 }}>Block content ({form.type.replace(/_/g, " ")})</div>
              {(form.type === "HERO_SLIDE" || form.type === "DEAL_BANNER" || form.type === "PROMO_BLOCK") && (
                <div className="adm-form-grid cols-2">
                  <div className="field full"><label>Headline</label><input className="input" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></div>
                  <div className="field full"><label>Subhead</label><input className="input" value={form.subhead} onChange={(e) => setForm({ ...form, subhead: e.target.value })} /></div>
                  <div className="field"><label>CTA text</label><input className="input" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} /></div>
                  <div className="field"><label>CTA URL</label><input className="input" value={form.ctaUrl} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} /></div>
                  {form.type === "PROMO_BLOCK" && <div className="field full"><label>Body</label><textarea className="input" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>}
                </div>
              )}
              {(form.type === "CATEGORY_RAIL" || form.type === "PRODUCT_RAIL" || form.type === "CITY_RAIL" || form.type === "BRAND_MARQUEE") && (
                <div className="field full">
                  <label>{form.type === "CATEGORY_RAIL" ? "Category IDs" : form.type === "PRODUCT_RAIL" ? "Product IDs" : form.type === "CITY_RAIL" ? "City names" : "Brand IDs"} (comma-separated)</label>
                  <input className="input" value={form.idList} onChange={(e) => setForm({ ...form, idList: e.target.value })} />
                </div>
              )}
              {form.type === "STAT_COUNTER" && (
                <div>
                  {form.stats.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <input className="input" placeholder="Label" value={s.label} onChange={(e) => setForm({ ...form, stats: form.stats.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x) })} />
                      <input className="input" placeholder="Value" value={s.value} onChange={(e) => setForm({ ...form, stats: form.stats.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x) })} />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, stats: form.stats.filter((_, idx) => idx !== i) })}>Remove</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setForm({ ...form, stats: [...form.stats, { label: "", value: "" }] })}>Add stat</button>
                </div>
              )}
              {form.type === "TESTIMONIAL_RAIL" && (
                <div>
                  {form.testimonials.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <input className="input" placeholder="Name" value={t.name} onChange={(e) => setForm({ ...form, testimonials: form.testimonials.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x) })} />
                      <input className="input" placeholder="Company" value={t.company} onChange={(e) => setForm({ ...form, testimonials: form.testimonials.map((x, idx) => idx === i ? { ...x, company: e.target.value } : x) })} />
                      <input className="input" placeholder="Quote" value={t.quote} onChange={(e) => setForm({ ...form, testimonials: form.testimonials.map((x, idx) => idx === i ? { ...x, quote: e.target.value } : x) })} />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, testimonials: form.testimonials.filter((_, idx) => idx !== i) })}>Remove</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setForm({ ...form, testimonials: [...form.testimonials, { name: "", quote: "", company: "" }] })}>Add testimonial</button>
                </div>
              )}

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
          kicker="Merchandising"
          title={String(detail.title ?? "Block")}
          status={detail.status}
          onClose={() => setDetail(null)}
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={() => openEdit(detail)}>Edit</button>
              {detail.status !== "PUBLISHED" && <button type="button" className="btn btn-secondary" onClick={() => runAction(() => merchandisingApi.setStatus(detail.id, "PUBLISHED"), "Published.")}>Publish</button>}
              {detail.status !== "ARCHIVED" && <button type="button" className="btn btn-secondary" onClick={() => runAction(() => merchandisingApi.setStatus(detail.id, "ARCHIVED"), "Archived.")}>Archive</button>}
              <button type="button" className="btn btn-ghost" onClick={() => { if (confirm(`Soft delete "${detail.title}"?`)) runAction(() => merchandisingApi.remove(detail.id), "Block soft deleted."); }}>Soft delete</button>
            </>
          }
        >
          <FieldGrid>
            <Field label="Type" value={String(detail.type ?? "—").replace(/_/g, " ")} />
            <Field label="Placement" value={String(detail.placement ?? "—")} />
            <Field label="Position" value={String(detail.position ?? 0)} />
            <Field label="Window" value={`${detail.publishFrom ? formatDate(detail.publishFrom) : "—"} – ${detail.publishTo ? formatDate(detail.publishTo) : "—"}`} />
          </FieldGrid>
          <div className="adm-section-label">Config (raw)</div>
          <pre style={{ background: "var(--color-neutral-100)", padding: 12, borderRadius: "var(--radius-md)", fontSize: 12.5, overflowX: "auto" }}>{JSON.stringify(detail.config ?? {}, null, 2)}</pre>
        </Drawer>
      )}
    </div>
  );
}
