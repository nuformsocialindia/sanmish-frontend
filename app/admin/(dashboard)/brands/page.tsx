"use client";
import { useCallback, useEffect, useState } from "react";
import { brandsApi, downloadCsv, fileUrl, AdminApiError, type Paginated } from "@/lib/admin/api";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import { ListToolbar, PaginationRow } from "@/components/admin/ListChrome";
import Drawer, { FieldGrid, Field } from "@/components/admin/Drawer";
import { useQueryState } from "@/lib/admin/useQueryState";

type Brand = Record<string, unknown> & {
  id: string; name?: string; relationship?: string; description?: string; ranges?: string[] | null;
  logoUrl?: string | null; showInMarquee?: boolean; marqueePosition?: number | null; isActive?: boolean;
  listingCount?: number;
};

export default function AdminBrandsPage() {
  const qs = useQueryState();
  const toast = useAdminToast();
  const [items, setItems] = useState<Brand[]>([]);
  const [meta, setMeta] = useState<Paginated<Brand>["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("OEM_PARTNER");
  const [description, setDescription] = useState("");
  const [ranges, setRanges] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [showInMarquee, setShowInMarquee] = useState(false);
  const [marqueePosition, setMarqueePosition] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<Brand | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    brandsApi
      .list({ page: qs.page, limit: 20, search: qs.search || undefined, deletedOnly: showDeleted || undefined })
      .then((r) => { setItems(r.data as Brand[]); setMeta(r.meta); })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load brands."))
      .finally(() => setLoading(false));
  }, [qs.page, qs.search, showDeleted]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setEditing(null);
    setName(""); setRelationship("OEM_PARTNER"); setDescription(""); setRanges(""); setVendorId("");
    setShowInMarquee(false); setMarqueePosition(""); setLogoFile(null);
  };

  const openEdit = (b: Brand) => {
    setDetail(null);
    setEditing(b);
    setName(String(b.name ?? "")); setRelationship(String(b.relationship ?? "OEM_PARTNER"));
    setDescription(String(b.description ?? "")); setRanges((b.ranges ?? []).join(", "));
    setVendorId(String(b.vendorId ?? "")); setShowInMarquee(Boolean(b.showInMarquee));
    setMarqueePosition(b.marqueePosition != null ? String(b.marqueePosition) : ""); setLogoFile(null);
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
    const body: Record<string, unknown> = {
      name, relationship, description: description || undefined,
      ranges: ranges.trim() ? ranges.split(",").map((r) => r.trim()).filter(Boolean) : undefined,
      vendorId: vendorId || undefined, showInMarquee,
      marqueePosition: showInMarquee && marqueePosition ? Number(marqueePosition) : undefined,
    };
    try {
      const saved = editing ? await brandsApi.update(editing.id, body) : await brandsApi.create(body);
      if (logoFile) await brandsApi.uploadLogo(String((saved as Brand).id ?? editing?.id), logoFile);
      toast.success(editing ? "Brand updated." : "Brand created.");
      resetForm();
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save brand.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="card elev-sm adm-form-card">
        <div className="card-kicker">Catalogue</div>
        <h3 className="card-title" style={{ fontSize: 21 }}>{editing ? "Edit brand" : "New brand"}</h3>
        <form onSubmit={handleSave} className="adm-form-grid cols-3">
          <div className="field full"><label>Name *</label><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field">
            <label>Relationship</label>
            <select className="input" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
              <option value="OEM_PARTNER">OEM partner</option>
              <option value="COMPATIBILITY_ONLY">Compatibility only</option>
            </select>
          </div>
          <div className="field"><label>Linked vendor ID (optional)</label><input className="input" value={vendorId} onChange={(e) => setVendorId(e.target.value)} /></div>
          <div className="field"><label>Logo</label><input className="input" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} /></div>
          <div className="field full"><label>Ranges (comma-separated product lines)</label><input className="input" value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="Compressors, Dispensers" /></div>
          <div className="field full"><label>Description</label><textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="field">
            <label className="check" style={{ marginTop: 22 }}>
              <input type="checkbox" checked={showInMarquee} onChange={(e) => setShowInMarquee(e.target.checked)} />
              Show in homepage marquee
            </label>
          </div>
          {showInMarquee && (
            <div className="field"><label>Marquee position</label><input className="input" type="number" value={marqueePosition} onChange={(e) => setMarqueePosition(e.target.value)} /></div>
          )}
          <div className="field full">
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: "flex-start" }}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create brand"}
            </button>
            {editing && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel edit</button>}
          </div>
        </form>
      </div>

      <ListToolbar
        search={qs.searchInput}
        onSearch={qs.onSearchInput}
        placeholder="Search brands…"
        showDeleted={showDeleted}
        onShowDeletedChange={setShowDeleted}
      >
        <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/brands/export")}>Export CSV</button>
      </ListToolbar>

      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState onClear={qs.clearFilters} />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Brand</th><th>Relationship</th><th>Ranges</th><th className="num">Listings</th><th>Marquee</th><th>Status</th><th className="adm-open-col" /></tr></thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id}>
                  <td>
                    {b.logoUrl && <img src={fileUrl(String(b.logoUrl))} alt="" style={{ height: 20, marginRight: 8, verticalAlign: "middle" }} />}
                    {b.name}
                  </td>
                  <td>{String(b.relationship ?? "—").replace(/_/g, " ")}</td>
                  <td>{Array.isArray(b.ranges) ? b.ranges.join(", ") : "—"}</td>
                  <td className="num">{b.listingCount ?? 0}</td>
                  <td>{b.showInMarquee ? <span className="tag tag-positive">position {b.marqueePosition ?? "—"}</span> : "—"}</td>
                  <td><span className={`tag ${b.isActive ? "tag-positive" : "tag-muted"}`}>{b.isActive ? "active" : "inactive"}</span></td>
                  <td>
                    {showDeleted ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => brandsApi.restore(b.id), "Brand restored.")}>Restore</button>
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

      <PaginationRow meta={meta} page={qs.page} onPrev={() => qs.setPage(qs.page - 1)} onNext={() => qs.setPage(qs.page + 1)} />

      {detail && (
        <Drawer
          kicker="Brands & OEMs"
          title={String(detail.name ?? "Brand")}
          status={detail.isActive ? "Active" : "Inactive"}
          onClose={() => setDetail(null)}
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={() => openEdit(detail)}>Edit</button>
              <button type="button" className="btn btn-ghost" onClick={() => { if (confirm(`Soft delete "${detail.name}"?`)) runAction(() => brandsApi.remove(detail.id), "Brand soft deleted."); }}>Soft delete</button>
            </>
          }
        >
          <FieldGrid>
            <Field label="Relationship" value={String(detail.relationship ?? "—").replace(/_/g, " ")} />
            <Field label="Listings" value={String(detail.listingCount ?? 0)} />
            <Field label="Ranges" value={Array.isArray(detail.ranges) ? detail.ranges.join(", ") : "—"} />
            <Field label="Marquee" value={detail.showInMarquee ? `On · position ${detail.marqueePosition ?? "—"}` : "Off"} />
            <Field label="Description" value={String(detail.description ?? "—")} />
          </FieldGrid>
        </Drawer>
      )}
    </div>
  );
}
