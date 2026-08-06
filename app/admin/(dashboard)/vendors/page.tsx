"use client";
import { useCallback, useEffect, useState } from "react";
import { vendorsApi, brandsApi, downloadCsv, AdminApiError, type Paginated } from "@/lib/admin/api";
import { money, formatDate, displayStatus } from "@/lib/admin/format";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import StatusTag from "@/components/admin/StatusTag";
import Drawer, { FieldGrid, Field, NotesThread } from "@/components/admin/Drawer";
import Icon from "@/components/admin/Icon";

// Real Vendor fields (v2): businessName, vendorName, email, mobileNumber,
// gstin/gstVerified, pan/panVerified, cin, companyAddress, city, state,
// businessType, fuelTypes[], brandIds (write) / brands[] (read, join rows),
// bankAccount {accountName,accountNumber,ifsc}, commissionRateOverride,
// verificationStatus, ratingAverage/ratingCount (read-only, set by Reviews).
type Vendor = Record<string, unknown> & {
  id: string; businessName?: string; vendorName?: string; email?: string; mobileNumber?: string;
  gstin?: string; gstVerified?: boolean; pan?: string; panVerified?: boolean; cin?: string;
  companyAddress?: string; city?: string; state?: string; verificationStatus?: string; createdAt?: string;
  fuelTypes?: string[] | null; bankAccount?: { accountName?: string; accountNumber?: string; ifsc?: string } | null;
  commissionRateOverride?: number | null; ratingAverage?: string | number; ratingCount?: number;
  notes?: Record<string, unknown>[];
  brands?: { brandId: string; brand: { id: string; name: string } }[];
  productCount?: number;
  portalPermissions?: Record<string, boolean>;
};

const VENDOR_PERMISSIONS: { key: string; label: string; desc: string }[] = [
  { key: "products", label: "Products", desc: "View and manage their own product listings." },
  { key: "categories", label: "Categories", desc: "View and create marketplace categories." },
  { key: "orders", label: "Orders", desc: "View orders that include their products." },
  { key: "rfqs", label: "RFQs", desc: "View quote requests assigned to them." },
  { key: "settlements", label: "Settlements", desc: "View payout settlements and earnings." },
  { key: "payments", label: "Payments", desc: "View payments received on their orders." },
  { key: "taxGst", label: "Tax & GST", desc: "View a GST/tax summary of their sales." },
  { key: "reviews", label: "Reviews", desc: "View customer reviews on their products." },
  { key: "notifications", label: "Notifications", desc: "View notifications sent to them." },
];

const TABS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "on_hold", label: "On hold" },
  { key: "suspended", label: "Suspended" },
];
const STATUS_KEYS = ["pending", "approved", "on_hold", "rejected", "suspended"] as const;
const BUSINESS_TYPES = ["manufacturer", "wholesaler", "distributor", "trader", "service_provider"] as const;
const FUEL_TYPES = ["CNG", "CBG", "BIO_GAS", "HYDROGEN", "MULTI_FUEL"] as const;

export default function AdminVendorsPage() {
  const qs = useQueryState();
  const toast = useAdminToast();
  const [items, setItems] = useState<Vendor[]>([]);
  const [meta, setMeta] = useState<Paginated<Vendor>["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusCounts, setStatusCounts] = useState<Record<string, number> | null>(null);
  const [allBrands, setAllBrands] = useState<{ id: string; name: string }[]>([]);

  const [detail, setDetail] = useState<Vendor | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [earnings, setEarnings] = useState<{ totalGross: number; totalCommission: number; totalNet: number; settlementCount: number } | null>(null);
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [settlements, setSettlements] = useState<Record<string, unknown>[]>([]);
  const [rfqs, setRfqs] = useState<{ rfq: Record<string, unknown>; quotation: Record<string, unknown> | null }[]>([]);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [documents, setDocuments] = useState<Record<string, unknown>[]>([]);
  const [note, setNote] = useState("");
  const [docType, setDocType] = useState("");
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyChannel, setNotifyChannel] = useState<"email" | "in_app">("email");
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    businessName: "", vendorName: "", email: "", mobileNumber: "", companyAddress: "", city: "", state: "", cin: "",
    businessType: "manufacturer" as (typeof BUSINESS_TYPES)[number], gstin: "", pan: "",
    fuelTypes: [] as string[], brandIds: [] as string[],
    bankAccountName: "", bankAccountNumber: "", bankIfsc: "", commissionRateOverride: "",
  });
  const [saving, setSaving] = useState(false);

  const loadCounts = useCallback(() => {
    Promise.all(STATUS_KEYS.map((s) => vendorsApi.list({ limit: 1, verificationStatus: s }).then((r) => r.meta.total).catch(() => 0)))
      .then((counts) => setStatusCounts(Object.fromEntries(STATUS_KEYS.map((s, i) => [s, counts[i]]))));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    vendorsApi
      .list({ page: qs.page, limit: 20, search: qs.search || undefined, verificationStatus: qs.tab || undefined })
      .then((res) => { setItems((res.data as Vendor[]) || []); setMeta(res.meta); })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load vendors."))
      .finally(() => setLoading(false));
    loadCounts();
  }, [qs.page, qs.search, qs.tab, loadCounts]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { brandsApi.list({ limit: 100 }).then((r) => setAllBrands(r.data as { id: string; name: string }[])).catch(() => {}); }, []);

  const openDetail = (v: Vendor) => {
    setDetail(v);
    setDrawerTab("overview");
    vendorsApi.get(v.id).then((d) => setDetail(d as Vendor)).catch(() => {});
    vendorsApi.earnings(v.id).then(setEarnings).catch(() => setEarnings(null));
    vendorsApi.products(v.id).then(setProducts).catch(() => setProducts([]));
    vendorsApi.orders(v.id).then(setOrders).catch(() => setOrders([]));
    vendorsApi.settlements(v.id).then(setSettlements).catch(() => setSettlements([]));
    vendorsApi.rfqs(v.id).then(setRfqs).catch(() => setRfqs([]));
    vendorsApi.reviews(v.id).then(setReviews).catch(() => setReviews([]));
    vendorsApi.documents(v.id).then(setDocuments).catch(() => setDocuments([]));
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

  const handleNotify = async () => {
    if (!detail) return;
    await runAction(() => vendorsApi.notify(detail.id, { channel: notifyChannel, title: notifyTitle, body: notifyBody }), "Vendor notified.");
    setNotifyOpen(false);
    setNotifyTitle(""); setNotifyBody("");
  };

  const openCreate = () => {
    setForm({
      businessName: "", vendorName: "", email: "", mobileNumber: "", companyAddress: "", city: "", state: "", cin: "",
      businessType: "manufacturer", gstin: "", pan: "", fuelTypes: [], brandIds: [],
      bankAccountName: "", bankAccountNumber: "", bankIfsc: "", commissionRateOverride: "",
    });
    setFormOpen(true);
  };

  const toggleFuelType = (f: string) => setForm((s) => ({
    ...s, fuelTypes: s.fuelTypes.includes(f) ? s.fuelTypes.filter((x) => x !== f) : [...s.fuelTypes, f],
  }));
  const toggleBrand = (id: string) => setForm((s) => ({
    ...s, brandIds: s.brandIds.includes(id) ? s.brandIds.filter((x) => x !== id) : [...s.brandIds, id],
  }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await vendorsApi.create({
        businessName: form.businessName, vendorName: form.vendorName, email: form.email,
        mobileNumber: form.mobileNumber, companyAddress: form.companyAddress, city: form.city || undefined,
        state: form.state || undefined, cin: form.cin || undefined, businessType: form.businessType,
        gstin: form.gstin || undefined, pan: form.pan || undefined,
        fuelTypes: form.fuelTypes.length ? form.fuelTypes : undefined,
        brandIds: form.brandIds.length ? form.brandIds : undefined,
        bankAccount: (form.bankAccountName || form.bankAccountNumber || form.bankIfsc)
          ? { accountName: form.bankAccountName || undefined, accountNumber: form.bankAccountNumber || undefined, ifsc: form.bankIfsc || undefined }
          : undefined,
        commissionRateOverride: form.commissionRateOverride ? Number(form.commissionRateOverride) : undefined,
      });
      toast.success("Vendor created.");
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not create vendor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {statusCounts && (
        <div className="adm-analytics-strip">
          {STATUS_KEYS.map((s) => (
            <div key={s} className="card adm-analytics-card">
              <span className="adm-analytics-label">{displayStatus(s)}</span>
              <span className="adm-analytics-value">{statusCounts[s] ?? 0}</span>
            </div>
          ))}
        </div>
      )}

      <div className="adm-tab-bar">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={qs.tab === t.key ? "active" : ""} onClick={() => qs.setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <div className="adm-toolbar">
        <div className="adm-search-wrap">
          <Icon name="search" size={18} />
          <input className="input" placeholder="Search vendors…" value={qs.searchInput} onChange={(e) => qs.onSearchInput(e.target.value)} />
        </div>
        <div className="adm-toolbar-spacer" />
        <div className="adm-toolbar-actions">
          <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/vendors/export")}>Export CSV</button>
          <button type="button" className="btn btn-primary" onClick={openCreate}>New vendor</button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState onClear={qs.clearFilters} />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Business</th><th>GSTIN</th><th>Location</th><th className="num">Products</th><th>Rating</th><th>Status</th><th className="adm-open-col" /></tr></thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td>{v.businessName ?? "—"}<span className="sub-line">{v.email ?? "—"}</span></td>
                  <td>{v.gstin ?? "—"} {v.gstVerified ? <span className="tag tag-positive" style={{ marginLeft: 6 }}>verified</span> : null}</td>
                  <td>{[v.city, v.state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="num">{v.productCount ?? 0}</td>
                  <td>{v.ratingCount ? `★ ${Number(v.ratingAverage).toFixed(1)} (${v.ratingCount})` : "—"}</td>
                  <td><StatusTag status={displayStatus(v.verificationStatus)} /></td>
                  <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(v)}>Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="adm-pagination-row">
          <span>{meta.total} records · showing {meta.limit} per page</span>
          <span className="adm-toolbar-spacer" />
          <button type="button" className="btn btn-secondary btn-sm" disabled={qs.page <= 1} onClick={() => qs.setPage(qs.page - 1)}>Previous</button>
          <span>Page {meta.page} of {meta.totalPages}</span>
          <button type="button" className="btn btn-secondary btn-sm" disabled={qs.page >= meta.totalPages} onClick={() => qs.setPage(qs.page + 1)}>Next</button>
        </div>
      )}

      {formOpen && (
        <div className="dialog-backdrop" onClick={() => setFormOpen(false)}>
          <div className="dialog elev-lg" style={{ maxWidth: 640, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">New vendor</div>
            <form onSubmit={handleCreate}>
              <div className="adm-form-grid cols-2">
                <div className="field full"><label>Business name *</label><input className="input" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></div>
                <div className="field"><label>Contact person *</label><input className="input" required value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} /></div>
                <div className="field">
                  <label>Business type *</label>
                  <select className="input" value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value as (typeof BUSINESS_TYPES)[number] })}>
                    {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="field"><label>Email *</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="field"><label>Mobile number *</label><input className="input" required value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} /></div>
                <div className="field full"><label>Company address *</label><textarea className="input" required value={form.companyAddress} onChange={(e) => setForm({ ...form, companyAddress: e.target.value })} /></div>
                <div className="field"><label>City</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                <div className="field"><label>State</label><input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
                <div className="field"><label>GSTIN</label><input className="input" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} /></div>
                <div className="field"><label>PAN</label><input className="input" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} /></div>
                <div className="field"><label>CIN</label><input className="input" value={form.cin} onChange={(e) => setForm({ ...form, cin: e.target.value })} /></div>
                <div className="field"><label>Commission rate override (%)</label><input className="input" type="number" value={form.commissionRateOverride} onChange={(e) => setForm({ ...form, commissionRateOverride: e.target.value })} /></div>

                <div className="field full">
                  <label>Fuel types</label>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {FUEL_TYPES.map((f) => (
                      <label key={f} className="check"><input type="checkbox" checked={form.fuelTypes.includes(f)} onChange={() => toggleFuelType(f)} /> {f.replace(/_/g, " ")}</label>
                    ))}
                  </div>
                </div>
                <div className="field full">
                  <label>Brands</label>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {allBrands.length === 0 ? <span style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>No brands created yet.</span> :
                      allBrands.map((b) => (
                        <label key={b.id} className="check"><input type="checkbox" checked={form.brandIds.includes(b.id)} onChange={() => toggleBrand(b.id)} /> {b.name}</label>
                      ))}
                  </div>
                </div>

                <div className="field"><label>Bank account name</label><input className="input" value={form.bankAccountName} onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })} /></div>
                <div className="field"><label>Bank account number</label><input className="input" value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} /></div>
                <div className="field"><label>IFSC</label><input className="input" value={form.bankIfsc} onChange={(e) => setForm({ ...form, bankIfsc: e.target.value })} /></div>
              </div>
              <div className="dialog-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating…" : "Create vendor"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detail && (
        <Drawer
          kicker="Vendors"
          title={detail.businessName ?? "Vendor"}
          subtitle={`${detail.companyAddress ?? "—"} · ${products.length} SKUs live · onboarded ${formatDate(detail.createdAt)}`}
          status={displayStatus(detail.verificationStatus)}
          tabs={[
            { key: "overview", label: "Overview" }, { key: "products", label: "Products" }, { key: "orders", label: "Orders" },
            { key: "settlements", label: "Settlements" }, { key: "rfqs", label: "RFQs" }, { key: "reviews", label: "Reviews" }, { key: "documents", label: "Documents" },
            { key: "permissions", label: "Portal permissions" },
          ]}
          activeTab={drawerTab}
          onTabChange={setDrawerTab}
          onClose={() => setDetail(null)}
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={() => runAction(() => vendorsApi.approve(detail.id), "Vendor approved — notification queued.")}>Approve</button>
              <button type="button" className="btn btn-ghost" onClick={() => runAction(() => vendorsApi.reject(detail.id), "Vendor rejected.")}>Reject</button>
              <button type="button" className="btn btn-secondary" onClick={() => runAction(() => vendorsApi.hold(detail.id), "Vendor put on hold.")}>Put on hold</button>
              <button type="button" className="btn btn-ghost" onClick={() => runAction(() => vendorsApi.suspend(detail.id), "Vendor suspended.")}>Suspend</button>
              <button type="button" className="btn btn-secondary" onClick={() => runAction(() => vendorsApi.activate(detail.id), "Vendor reactivated.")}>Reactivate</button>
              <button type="button" className="btn btn-secondary" onClick={() => setNotifyOpen(true)}>Notify vendor</button>
            </>
          }
        >
          {drawerTab === "overview" && (
            <>
              <FieldGrid>
                <Field
                  label="GSTIN"
                  value={detail.gstin ?? "—"}
                  action
                  actionLabel={detail.gstVerified ? "Verified" : "Verify GST"}
                  actionDisabled={detail.gstVerified}
                  onAction={() => runAction(() => vendorsApi.verifyGst(detail.id), "GST checked — format/checksum only, not a live government lookup.")}
                />
                <Field
                  label="PAN"
                  value={detail.pan ?? "—"}
                  action
                  actionLabel={detail.panVerified ? "Verified" : "Verify PAN"}
                  actionDisabled={detail.panVerified}
                  onAction={() => runAction(() => vendorsApi.verifyPan(detail.id), "PAN checked — format/checksum only, not a live government lookup.")}
                />
                <Field label="CIN" value={detail.cin ?? "—"} />
                <Field label="Contact" value={`${detail.email ?? "—"} · ${detail.mobileNumber ?? "—"}`} />
                <Field label="Location" value={[detail.city, detail.state].filter(Boolean).join(", ") || "—"} />
                <Field label="Fuel types" value={Array.isArray(detail.fuelTypes) && detail.fuelTypes.length ? detail.fuelTypes.join(", ") : "—"} />
                <Field label="Brands" value={detail.brands?.length ? detail.brands.map((b) => b.brand.name).join(", ") : "—"} />
                <Field label="Rating" value={detail.ratingCount ? `★ ${Number(detail.ratingAverage).toFixed(1)} (${detail.ratingCount} reviews)` : "No reviews yet"} />
                <Field label="Commission override" value={detail.commissionRateOverride != null ? `${detail.commissionRateOverride}%` : "Default"} />
                <Field label="Products live" value={String(products.length)} />
                <Field label="Lifetime earnings" value={money(earnings?.totalGross ?? 0)} />
                <Field label="Pending settlement" value={money((earnings?.totalGross ?? 0) - (earnings?.totalCommission ?? 0))} />
              </FieldGrid>
              {earnings && (
                <div className="adm-analytics-strip">
                  <div className="card adm-analytics-card"><span className="adm-analytics-label">Gross</span><span className="adm-analytics-value">{money(earnings.totalGross)}</span></div>
                  <div className="card adm-analytics-card"><span className="adm-analytics-label">Commission</span><span className="adm-analytics-value">{money(earnings.totalCommission)}</span></div>
                  <div className="card adm-analytics-card"><span className="adm-analytics-label">Net</span><span className="adm-analytics-value">{money(earnings.totalNet)}</span></div>
                  <div className="card adm-analytics-card"><span className="adm-analytics-label">Settlements</span><span className="adm-analytics-value">{earnings.settlementCount}</span></div>
                </div>
              )}
              <NotesThread
                notes={detail.notes ?? []}
                draft={note}
                onDraftChange={setNote}
                onAdd={() => runAction(() => vendorsApi.addNote(detail.id, note), "Note added.").then(() => setNote(""))}
              />
            </>
          )}
          {drawerTab === "products" && (
            <table className="table"><thead><tr><th>Product</th><th className="num">Price</th><th>Status</th></tr></thead>
              <tbody>{products.length === 0 ? <tr><td colSpan={3} style={{ color: "var(--color-neutral-600)" }}>No products yet.</td></tr> :
                products.map((p, i) => <tr key={i}><td>{String(p.title ?? p.name)}</td><td className="num">{money(Number(p.sellingPrice ?? p.price ?? 0))}</td><td><StatusTag status={displayStatus(String(p.status ?? ""))} /></td></tr>)}</tbody>
            </table>
          )}
          {drawerTab === "orders" && (
            <table className="table"><thead><tr><th>Order</th><th className="num">Value</th><th>Status</th></tr></thead>
              <tbody>{orders.length === 0 ? <tr><td colSpan={3} style={{ color: "var(--color-neutral-600)" }}>No orders yet.</td></tr> :
                orders.map((o, i) => <tr key={i}><td>{String(o.orderNumber ?? o.id)}</td><td className="num">{money(Number(o.totalAmount ?? 0))}</td><td><StatusTag status={displayStatus(String(o.status ?? ""))} /></td></tr>)}</tbody>
            </table>
          )}
          {drawerTab === "settlements" && (
            <table className="table"><thead><tr><th>Period</th><th className="num">Net amount</th><th>Status</th></tr></thead>
              <tbody>{settlements.length === 0 ? <tr><td colSpan={3} style={{ color: "var(--color-neutral-600)" }}>No settlements yet.</td></tr> :
                settlements.map((s, i) => <tr key={i}><td>{formatDate(String(s.periodStart ?? ""))} – {formatDate(String(s.periodEnd ?? ""))}</td><td className="num">{money(Number(s.netAmount ?? 0))}</td><td><StatusTag status={displayStatus(String(s.status ?? ""))} /></td></tr>)}</tbody>
            </table>
          )}
          {drawerTab === "rfqs" && (
            <table className="table"><thead><tr><th>Requirement</th><th>Quoted price</th><th>Status</th></tr></thead>
              <tbody>{rfqs.length === 0 ? <tr><td colSpan={3} style={{ color: "var(--color-neutral-600)" }}>No RFQs yet.</td></tr> :
                rfqs.map((a, i) => (
                  <tr key={i}>
                    <td>{String(a.rfq?.productName ?? "—")}</td>
                    <td className="num">{a.quotation ? money(Number(a.quotation.price ?? 0)) : "—"}</td>
                    <td><StatusTag status={displayStatus(String(a.rfq?.status ?? ""))} /></td>
                  </tr>
                ))}</tbody>
            </table>
          )}
          {drawerTab === "reviews" && (
            <table className="table"><thead><tr><th>Rating</th><th>Reviewer</th><th>Review</th><th>Status</th></tr></thead>
              <tbody>{reviews.length === 0 ? <tr><td colSpan={4} style={{ color: "var(--color-neutral-600)" }}>No reviews yet.</td></tr> :
                reviews.map((r, i) => (
                  <tr key={i}>
                    <td>{"★".repeat(Number(r.rating ?? 0))}</td>
                    <td>{String((r.user as Record<string, unknown> | undefined)?.name ?? "—")}</td>
                    <td>{String(r.title ?? r.body ?? "—")}</td>
                    <td><StatusTag status={displayStatus(String(r.status ?? ""))} /></td>
                  </tr>
                ))}</tbody>
            </table>
          )}
          {drawerTab === "permissions" && (
            <div>
              <p style={{ fontSize: 13.5, color: "var(--color-neutral-600)", marginBottom: 14 }}>
                Turn off any module this vendor shouldn't see or use in their portal. Changes apply immediately on their next request.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {VENDOR_PERMISSIONS.map((p) => {
                  const enabled = detail.portalPermissions?.[p.key] !== false;
                  return (
                    <label
                      key={p.key}
                      className="check"
                      style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 4px", borderBottom: "1px solid var(--color-divider)" }}
                    >
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) =>
                          runAction(
                            () => vendorsApi.updatePermissions(detail.id, { [p.key]: e.target.checked }),
                            `${p.label} ${e.target.checked ? "enabled" : "disabled"} for this vendor.`
                          )
                        }
                      />
                      <span>
                        <strong>{p.label}</strong>
                        <div className="sub-line">{p.desc}</div>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          {drawerTab === "documents" && (
            <div>
              {documents.length === 0 ? <p style={{ color: "var(--color-neutral-600)", fontSize: 13.5, marginBottom: 14 }}>No documents uploaded yet.</p> :
                documents.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}>
                    <span>{String(d.docType ?? d.name ?? "Document")}</span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => vendorsApi.removeDocument(detail.id, String(d.id)), "Document removed.")}>Remove</button>
                  </div>
                ))}
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
                <input className="input" placeholder="Document type (e.g. gst_certificate)" value={docType} onChange={(e) => setDocType(e.target.value)} style={{ maxWidth: 260 }} />
                <label className="btn btn-secondary btn-sm" style={{ cursor: docType ? "pointer" : "not-allowed", opacity: docType ? 1 : 0.5 }}>
                  Upload document
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    style={{ display: "none" }}
                    disabled={!docType}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && docType) {
                        runAction(() => vendorsApi.uploadDocument(detail.id, file, docType), "Document uploaded.");
                        setDocType("");
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </Drawer>
      )}

      {notifyOpen && (
        <div className="dialog-backdrop" onClick={() => setNotifyOpen(false)}>
          <div className="dialog elev-lg" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">Notify vendor</div>
            <div className="dialog-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="field">
                <label>Channel</label>
                <select className="input" value={notifyChannel} onChange={(e) => setNotifyChannel(e.target.value as "email" | "in_app")}>
                  <option value="email">Email</option>
                  <option value="in_app">In-app</option>
                </select>
              </div>
              <div className="field"><label>Title</label><input className="input" value={notifyTitle} onChange={(e) => setNotifyTitle(e.target.value)} /></div>
              <div className="field"><label>Message</label><textarea className="input" value={notifyBody} onChange={(e) => setNotifyBody(e.target.value)} /></div>
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setNotifyOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleNotify}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
