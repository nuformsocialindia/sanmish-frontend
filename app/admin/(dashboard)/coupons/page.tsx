"use client";
import { useCallback, useEffect, useState } from "react";
import { couponsApi, categoriesApi, vendorsApi, downloadCsv, AdminApiError, type Paginated } from "@/lib/admin/api";
import { money, formatDate } from "@/lib/admin/format";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import { ListToolbar, PaginationRow } from "@/components/admin/ListChrome";
import Drawer, { FieldGrid, Field } from "@/components/admin/Drawer";

type Coupon = Record<string, unknown> & {
  id: string; code?: string; type?: string; value?: number; maxDiscountAmount?: number | null; minOrderValue?: number | null;
  minQty?: number | null; description?: string; appliesTo?: string; targetIds?: string[] | null;
  validFrom?: string; validTo?: string; usageLimitTotal?: number | null; usageLimitPerBuyer?: number | null;
  stackable?: boolean; disabled?: boolean; status?: string;
};

const TABS = [
  { key: "", label: "All" }, { key: "ACTIVE", label: "Active" }, { key: "SCHEDULED", label: "Scheduled" },
  { key: "EXPIRED", label: "Expired" }, { key: "DISABLED", label: "Disabled" },
];
const APPLIES_TO = ["ALL", "CATEGORY", "PRODUCT", "VENDOR"] as const;

const emptyForm = () => ({
  code: "", type: "PERCENT" as "PERCENT" | "FLAT", value: "", maxDiscountAmount: "", minOrderValue: "", minQty: "",
  description: "", appliesTo: "ALL" as (typeof APPLIES_TO)[number], targetIds: [] as string[], productIdList: "",
  validFrom: "", validTo: "", usageLimitTotal: "", usageLimitPerBuyer: "", stackable: false, disabled: false,
});

export default function AdminCouponsPage() {
  const qs = useQueryState();
  const toast = useAdminToast();
  const [items, setItems] = useState<Coupon[]>([]);
  const [meta, setMeta] = useState<Paginated<Coupon>["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [vendors, setVendors] = useState<Record<string, unknown>[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<Coupon | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [usage, setUsage] = useState<Record<string, unknown>[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    couponsApi.list({ page: qs.page, limit: 20, search: qs.search || undefined, status: showDeleted ? undefined : qs.tab || undefined, deletedOnly: showDeleted || undefined })
      .then((r) => { setItems(r.data as Coupon[]); setMeta(r.meta); })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load coupons."))
      .finally(() => setLoading(false));
  }, [qs.page, qs.search, qs.tab, showDeleted]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    categoriesApi.flat({ limit: 100 }).then((r) => setCategories(r.data)).catch(() => {});
    vendorsApi.list({ limit: 100 }).then((r) => setVendors(r.data as Record<string, unknown>[])).catch(() => {});
  }, []);

  const openDetail = (c: Coupon) => {
    setDetail(c);
    setDrawerTab("overview");
    couponsApi.get(c.id).then((d) => setDetail(d as Coupon)).catch(() => {});
    couponsApi.usage(c.id).then(setUsage).catch(() => setUsage([]));
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setFormOpen(true); };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      ...emptyForm(), code: String(c.code ?? ""), type: (c.type as "PERCENT" | "FLAT") ?? "PERCENT", value: String(c.value ?? ""),
      maxDiscountAmount: c.maxDiscountAmount != null ? String(c.maxDiscountAmount) : "", minOrderValue: c.minOrderValue != null ? String(c.minOrderValue) : "",
      minQty: c.minQty != null ? String(c.minQty) : "", description: String(c.description ?? ""),
      appliesTo: (c.appliesTo as (typeof APPLIES_TO)[number]) ?? "ALL",
      targetIds: c.appliesTo === "CATEGORY" || c.appliesTo === "VENDOR" ? (c.targetIds ?? []) : [],
      productIdList: c.appliesTo === "PRODUCT" ? (c.targetIds ?? []).join(", ") : "",
      validFrom: c.validFrom ? String(c.validFrom).slice(0, 10) : "", validTo: c.validTo ? String(c.validTo).slice(0, 10) : "",
      usageLimitTotal: c.usageLimitTotal != null ? String(c.usageLimitTotal) : "", usageLimitPerBuyer: c.usageLimitPerBuyer != null ? String(c.usageLimitPerBuyer) : "",
      stackable: Boolean(c.stackable), disabled: Boolean(c.disabled),
    });
    setDetail(null);
    setFormOpen(true);
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

  const toggleTarget = (id: string) => setForm((f) => ({ ...f, targetIds: f.targetIds.includes(id) ? f.targetIds.filter((x) => x !== id) : [...f.targetIds, id] }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const targetIds = form.appliesTo === "ALL" ? undefined
        : form.appliesTo === "PRODUCT" ? form.productIdList.split(",").map((s) => s.trim()).filter(Boolean)
        : form.targetIds;
      const body = {
        code: form.code.toUpperCase(), type: form.type, value: Number(form.value),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : undefined,
        minQty: form.minQty ? Number(form.minQty) : undefined,
        description: form.description, appliesTo: form.appliesTo, targetIds,
        validFrom: new Date(`${form.validFrom}T00:00:00.000Z`).toISOString(),
        validTo: new Date(`${form.validTo}T23:59:59.999Z`).toISOString(),
        usageLimitTotal: form.usageLimitTotal ? Number(form.usageLimitTotal) : undefined,
        usageLimitPerBuyer: form.usageLimitPerBuyer ? Number(form.usageLimitPerBuyer) : undefined,
        stackable: form.stackable, disabled: form.disabled,
      };
      if (editing) await couponsApi.update(editing.id, body);
      else await couponsApi.create(body);
      toast.success(editing ? "Coupon updated." : "Coupon created.");
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const statusTagClass = (s?: string) => s === "ACTIVE" ? "tag-positive" : s === "EXPIRED" || s === "DISABLED" ? "tag-muted" : "tag-attention";

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="adm-tab-bar">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={qs.tab === t.key ? "active" : ""} onClick={() => qs.setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <ListToolbar
        search={qs.searchInput}
        onSearch={qs.onSearchInput}
        placeholder="Search coupons…"
        showDeleted={showDeleted}
        onShowDeletedChange={setShowDeleted}
      >
        <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/coupons/export")}>Export CSV</button>
        <button type="button" className="btn btn-primary" onClick={openCreate}>New coupon</button>
      </ListToolbar>

      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState onClear={qs.clearFilters} />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Code</th><th>Type</th><th>Applies to</th><th>Window</th><th>Status</th><th className="adm-open-col" /></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.code}<span className="sub-line">{c.description}</span></td>
                  <td>{c.type === "PERCENT" ? `${c.value}%` : money(Number(c.value ?? 0))}</td>
                  <td>{c.appliesTo}</td>
                  <td>{formatDate(c.validFrom)} – {formatDate(c.validTo)}</td>
                  <td><span className={`tag ${statusTagClass(c.status)}`}>{c.status}</span></td>
                  <td>
                    {showDeleted ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => couponsApi.restore(c.id), "Coupon restored.")}>Restore</button>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(c)}>Open</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationRow meta={meta} page={qs.page} onPrev={() => qs.setPage(qs.page - 1)} onNext={() => qs.setPage(qs.page + 1)} />

      {formOpen && (
        <div className="dialog-backdrop" onClick={() => setFormOpen(false)}>
          <div className="dialog elev-lg" style={{ maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">{editing ? "Edit coupon" : "New coupon"}</div>
            <form onSubmit={handleSave}>
              <div className="adm-form-grid cols-2">
                <div className="field"><label>Code *</label><input className="input" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} style={{ textTransform: "uppercase" }} /></div>
                <div className="field">
                  <label>Type *</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENT" | "FLAT" })}>
                    <option value="PERCENT">Percentage</option>
                    <option value="FLAT">Flat amount</option>
                  </select>
                </div>
                <div className="field"><label>Value * {form.type === "PERCENT" ? "(%)" : "(₹)"}</label><input className="input" type="number" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
                {form.type === "PERCENT" && <div className="field"><label>Max discount amount (₹)</label><input className="input" type="number" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} /></div>}
                <div className="field"><label>Min order value (₹)</label><input className="input" type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} /></div>
                <div className="field"><label>Min quantity</label><input className="input" type="number" value={form.minQty} onChange={(e) => setForm({ ...form, minQty: e.target.value })} /></div>
                <div className="field full"><label>Description *</label><input className="input" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="field">
                  <label>Applies to *</label>
                  <select className="input" value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value as (typeof APPLIES_TO)[number] })}>
                    {APPLIES_TO.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="field"><label>Valid from *</label><input className="input" type="date" required value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} /></div>
                <div className="field"><label>Valid to *</label><input className="input" type="date" required value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} /></div>
                <div className="field"><label>Usage limit (total)</label><input className="input" type="number" value={form.usageLimitTotal} onChange={(e) => setForm({ ...form, usageLimitTotal: e.target.value })} /></div>
                <div className="field"><label>Usage limit (per buyer)</label><input className="input" type="number" value={form.usageLimitPerBuyer} onChange={(e) => setForm({ ...form, usageLimitPerBuyer: e.target.value })} /></div>
                <div className="field"><label className="check" style={{ marginTop: 22 }}><input type="checkbox" checked={form.stackable} onChange={(e) => setForm({ ...form, stackable: e.target.checked })} /> Stackable with other coupons</label></div>
                <div className="field"><label className="check" style={{ marginTop: 22 }}><input type="checkbox" checked={form.disabled} onChange={(e) => setForm({ ...form, disabled: e.target.checked })} /> Manually disabled</label></div>
              </div>

              {form.appliesTo === "CATEGORY" && (
                <div className="field full">
                  <label>Categories</label>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {categories.map((c) => <label key={String(c.id)} className="check"><input type="checkbox" checked={form.targetIds.includes(String(c.id))} onChange={() => toggleTarget(String(c.id))} /> {String(c.name)}</label>)}
                  </div>
                </div>
              )}
              {form.appliesTo === "VENDOR" && (
                <div className="field full">
                  <label>Vendors</label>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {vendors.map((v) => <label key={String(v.id)} className="check"><input type="checkbox" checked={form.targetIds.includes(String(v.id))} onChange={() => toggleTarget(String(v.id))} /> {String(v.businessName)}</label>)}
                  </div>
                </div>
              )}
              {form.appliesTo === "PRODUCT" && (
                <div className="field full"><label>Product IDs (comma-separated)</label><input className="input" value={form.productIdList} onChange={(e) => setForm({ ...form, productIdList: e.target.value })} /></div>
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
          kicker="Coupons"
          title={String(detail.code ?? "Coupon")}
          subtitle={String(detail.description ?? "")}
          status={detail.status}
          tabs={[{ key: "overview", label: "Overview" }, { key: "usage", label: "Usage log" }]}
          activeTab={drawerTab}
          onTabChange={setDrawerTab}
          onClose={() => setDetail(null)}
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={() => openEdit(detail)}>Edit</button>
              <button type="button" className="btn btn-secondary" onClick={() => runAction(() => couponsApi.setDisabled(detail.id, !detail.disabled), detail.disabled ? "Coupon re-enabled." : "Coupon disabled.")}>{detail.disabled ? "Enable" : "Disable"}</button>
              <button type="button" className="btn btn-ghost" onClick={() => runAction(() => couponsApi.remove(detail.id), "Coupon soft deleted.")}>Soft delete</button>
            </>
          }
        >
          {drawerTab === "overview" && (
            <FieldGrid>
              <Field label="Type / value" value={detail.type === "PERCENT" ? `${detail.value}%` : money(Number(detail.value ?? 0))} />
              <Field label="Max discount" value={detail.maxDiscountAmount != null ? money(Number(detail.maxDiscountAmount)) : "—"} />
              <Field label="Min order value" value={detail.minOrderValue != null ? money(Number(detail.minOrderValue)) : "—"} />
              <Field label="Min quantity" value={String(detail.minQty ?? "—")} />
              <Field label="Applies to" value={`${detail.appliesTo}${detail.targetIds?.length ? ` (${detail.targetIds.length} targets)` : ""}`} />
              <Field label="Window" value={`${formatDate(detail.validFrom)} – ${formatDate(detail.validTo)}`} />
              <Field label="Usage limits" value={`Total ${detail.usageLimitTotal ?? "∞"} · per buyer ${detail.usageLimitPerBuyer ?? "∞"}`} />
              <Field label="Stackable" value={detail.stackable ? "Yes" : "No"} />
            </FieldGrid>
          )}
          {drawerTab === "usage" && (
            <table className="table">
              <thead><tr><th>Order</th><th>Buyer</th><th className="num">Discount applied</th><th>Date</th></tr></thead>
              <tbody>
                {usage.length === 0 ? <tr><td colSpan={4} style={{ color: "var(--color-neutral-600)" }}>Not redeemed yet.</td></tr> :
                  usage.map((u, i) => <tr key={i}><td>{String(u.orderId ?? "—")}</td><td>{String(u.buyerId ?? "—")}</td><td className="num">{money(Number(u.discountApplied ?? 0))}</td><td>{formatDate(String(u.createdAt ?? ""))}</td></tr>)}
              </tbody>
            </table>
          )}
        </Drawer>
      )}
    </div>
  );
}
