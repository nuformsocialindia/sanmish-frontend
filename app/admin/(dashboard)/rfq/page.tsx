"use client";
import { useCallback, useEffect, useState } from "react";
import { rfqApi, vendorsApi, usersApi, categoriesApi, downloadCsv, AdminApiError, type Paginated } from "@/lib/admin/api";
import { money, formatDate, displayStatus } from "@/lib/admin/format";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import StatusTag from "@/components/admin/StatusTag";
import Drawer, { FieldGrid, Field, NotesThread, Timeline } from "@/components/admin/Drawer";
import Icon from "@/components/admin/Icon";

// RfqStatus enum on the backend: open, vendor_assigned, quoted, approved,
// rejected, converted, closed — no "new"/"assigned"/"escalated" values.
// "escalated" is a separate boolean column, so that tab filters client-side
// rather than sending an invalid `status`.
type Rfq = Record<string, unknown> & {
  id: string; rfqNumber?: string; productName?: string; status?: string; quantity?: number; unit?: string;
  priority?: string; dueDate?: string; escalated?: boolean;
  user?: { id: string; name: string; email: string };
  vendorAssignments?: { vendor: { id: string; businessName: string }; quotation: Record<string, unknown> | null }[];
  notes?: Record<string, unknown>[];
};
const TABS = [
  { key: "", label: "All" }, { key: "open", label: "Open" }, { key: "vendor_assigned", label: "Vendor assigned" },
  { key: "quoted", label: "Quoted" }, { key: "approved", label: "Approved" }, { key: "escalated", label: "Escalated" }, { key: "converted", label: "Converted" },
];

function quoteStatus(q: Record<string, unknown> | null | undefined): string {
  if (!q) return "pending";
  if (q.isApproved) return "approved";
  if (q.isRejected) return "rejected";
  return "pending";
}

function quoteVendorName(q: Record<string, unknown>): string {
  const assignment = q.assignment as { vendor?: { businessName?: string } } | undefined;
  return assignment?.vendor?.businessName ?? "—";
}

export default function AdminRfqPage() {
  const qs = useQueryState();
  const toast = useAdminToast();
  const [items, setItems] = useState<Rfq[]>([]);
  const [meta, setMeta] = useState<Paginated<Rfq>["meta"] | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, number> | null>(null);
  const [vendors, setVendors] = useState<Record<string, unknown>[]>([]);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ userId: "", productName: "", categoryId: "", quantity: "1", unit: "unit", description: "", priority: "medium", dueDate: "" });
  const [creating, setCreating] = useState(false);

  const [detail, setDetail] = useState<Rfq | null>(null);
  const [drawerTab, setDrawerTab] = useState("requirement");
  const [quotations, setQuotations] = useState<Record<string, unknown>[]>([]);
  const [timeline, setTimeline] = useState<{ type?: string; at?: string; detail?: string }[]>([]);
  const [note, setNote] = useState("");
  const [assignIds, setAssignIds] = useState<string[]>([]);
  const [quoteVendorId, setQuoteVendorId] = useState("");
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteLeadTime, setQuoteLeadTime] = useState("");

  const isEscalatedTab = qs.tab === "escalated";
  const serverStatus = isEscalatedTab ? undefined : qs.tab || undefined;

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      rfqApi.list({ page: qs.page, limit: 20, search: qs.search || undefined, status: serverStatus }).catch(() => ({ data: [], meta: null })),
      rfqApi.analytics().catch(() => null),
    ])
      .then(([r, a]) => {
        const rows = isEscalatedTab ? (r.data as Rfq[]).filter((x) => x.escalated) : (r.data as Rfq[]);
        setItems(rows); setMeta(r.meta as Paginated<Rfq>["meta"]); setAnalytics(a);
      })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load RFQs."))
      .finally(() => setLoading(false));
  }, [qs.page, qs.search, serverStatus, isEscalatedTab]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { vendorsApi.list({ limit: 100, verificationStatus: "approved" }).then((r) => setVendors(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    usersApi.list({ limit: 100 }).then((r) => setUsers(r.data as Record<string, unknown>[])).catch(() => {});
    categoriesApi.flat({ limit: 100 }).then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await rfqApi.create({
        userId: createForm.userId, productName: createForm.productName, categoryId: createForm.categoryId || undefined,
        quantity: Number(createForm.quantity), unit: createForm.unit, description: createForm.description || undefined,
        priority: createForm.priority, dueDate: createForm.dueDate || undefined,
      });
      toast.success("RFQ created.");
      setCreateOpen(false);
      setCreateForm({ userId: "", productName: "", categoryId: "", quantity: "1", unit: "unit", description: "", priority: "medium", dueDate: "" });
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not create RFQ.");
    } finally {
      setCreating(false);
    }
  };

  const openDetail = (r: Rfq) => {
    setDetail(r);
    setDrawerTab("requirement");
    rfqApi.get(r.id).then((d) => setDetail(d as Rfq)).catch(() => {});
    rfqApi.quotations(r.id).then(setQuotations).catch(() => setQuotations([]));
    rfqApi.timeline(r.id).then((t) => setTimeline(t as { type?: string; at?: string; detail?: string }[])).catch(() => setTimeline([]));
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

  const hasApprovedQuote = quotations.some((q) => Boolean(q.isApproved));

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {analytics && (
        <div className="adm-analytics-strip">
          {Object.entries(analytics).map(([k, v]) => (
            <div key={k} className="card adm-analytics-card"><span className="adm-analytics-label">{k.replace(/([A-Z])/g, " $1")}</span><span className="adm-analytics-value">{v}</span></div>
          ))}
        </div>
      )}

      <div className="adm-tab-bar">
        {TABS.map((t) => <button key={t.key} type="button" className={qs.tab === t.key ? "active" : ""} onClick={() => qs.setTab(t.key)}>{t.label}</button>)}
      </div>

      <div className="adm-toolbar">
        <div className="adm-search-wrap">
          <Icon name="search" size={18} />
          <input className="input" placeholder="Search RFQs…" value={qs.searchInput} onChange={(e) => qs.onSearchInput(e.target.value)} />
        </div>
        <div className="adm-toolbar-spacer" />
        <div className="adm-toolbar-actions">
          <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/rfq/export")}>Export CSV</button>
          <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>New RFQ</button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState onClear={qs.clearFilters} />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Enquiry</th><th>Buyer</th><th>Requirement</th><th>Priority</th><th>Status</th><th className="adm-open-col" /></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.rfqNumber ?? r.id}<span className="sub-line">due {formatDate(r.dueDate)}</span></td>
                  <td>{r.user?.name ?? "—"}</td>
                  <td>{r.productName ?? "—"} · {r.quantity ?? "—"} {r.unit ?? ""}</td>
                  <td>{r.priority ?? "—"}</td>
                  <td>
                    <StatusTag status={displayStatus(r.status)} />
                    {r.escalated ? <span className="tag tag-adverse" style={{ marginLeft: 6 }}>escalated</span> : null}
                  </td>
                  <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(r)}>Open</button></td>
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

      {createOpen && (
        <div className="dialog-backdrop" onClick={() => setCreateOpen(false)}>
          <div className="dialog elev-lg" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">New RFQ</div>
            <form onSubmit={handleCreate}>
              <div className="adm-form-grid cols-2">
                <div className="field">
                  <label>Buyer *</label>
                  <select className="input" required value={createForm.userId} onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}>
                    <option value="">— select —</option>
                    {users.map((u) => <option key={String(u.id)} value={String(u.id)}>{String(u.name ?? u.email)}</option>)}
                  </select>
                </div>
                <div className="field"><label>Requirement / product *</label><input className="input" required value={createForm.productName} onChange={(e) => setCreateForm({ ...createForm, productName: e.target.value })} /></div>
                <div className="field">
                  <label>Category</label>
                  <select className="input" value={createForm.categoryId} onChange={(e) => setCreateForm({ ...createForm, categoryId: e.target.value })}>
                    <option value="">— select —</option>
                    {categories.map((c) => <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}
                  </select>
                </div>
                <div className="field"><label>Quantity *</label><input className="input" type="number" required value={createForm.quantity} onChange={(e) => setCreateForm({ ...createForm, quantity: e.target.value })} /></div>
                <div className="field"><label>Unit *</label><input className="input" required value={createForm.unit} onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })} /></div>
                <div className="field">
                  <label>Priority</label>
                  <select className="input" value={createForm.priority} onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
                <div className="field"><label>Due date</label><input className="input" type="date" value={createForm.dueDate} onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })} /></div>
                <div className="field full"><label>Description</label><textarea className="input" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} /></div>
              </div>
              <div className="dialog-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? "Creating…" : "Create RFQ"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detail && (
        <Drawer
          kicker="RFQ"
          title={detail.productName ?? "RFQ"}
          subtitle={`${detail.user?.name ?? "—"} · due ${formatDate(detail.dueDate)} · priority ${detail.priority ?? "—"}`}
          status={displayStatus(detail.status)}
          tabs={[{ key: "requirement", label: "Requirement" }, { key: "vendors", label: "Vendors" }, { key: "quotations", label: "Quotations" }, { key: "timeline", label: "Timeline" }]}
          activeTab={drawerTab}
          onTabChange={setDrawerTab}
          onClose={() => setDetail(null)}
          actions={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setDrawerTab("vendors")}>Assign vendors</button>
              <button type="button" className="btn btn-secondary" onClick={() => setDrawerTab("quotations")}>Record quotation</button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!hasApprovedQuote}
                onClick={() => runAction(() => rfqApi.convertToOrder(detail.id), "RFQ converted to order.")}
              >
                Convert to order
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => runAction(() => rfqApi.escalate(detail.id), "RFQ escalated.")}>Escalate</button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => runAction(() => rfqApi.notify(detail.id, { recipientType: "user", recipientId: detail.user?.id ?? "", title: "Update on your enquiry", body: "Your RFQ has an update." }), "Buyer notified.")}
              >
                Notify buyer
              </button>
            </>
          }
        >
          {drawerTab === "requirement" && (
            <>
              <FieldGrid>
                <Field label="Requirement" value={detail.productName ?? "—"} />
                <Field label="Quantity" value={`${detail.quantity ?? "—"} ${detail.unit ?? ""}`} />
                <Field label="Priority" value={detail.priority ?? "—"} />
                <Field label="Due date" value={formatDate(detail.dueDate)} />
              </FieldGrid>
              <NotesThread
                notes={detail.notes ?? []}
                draft={note}
                onDraftChange={setNote}
                onAdd={() => runAction(() => rfqApi.addNote(detail.id, note), "Note added.").then(() => setNote(""))}
              />
            </>
          )}
          {drawerTab === "vendors" && (
            <div>
              <div className="adm-section-label">Assign vendors</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {vendors.map((v) => (
                  <label key={String(v.id)} className="check">
                    <input
                      type="checkbox"
                      checked={assignIds.includes(String(v.id))}
                      onChange={() => setAssignIds((prev) => prev.includes(String(v.id)) ? prev.filter((x) => x !== String(v.id)) : [...prev, String(v.id)])}
                    />
                    {String(v.businessName ?? v.id)}
                  </label>
                ))}
              </div>
              <button type="button" className="btn btn-primary btn-sm" disabled={assignIds.length === 0} onClick={() => runAction(() => rfqApi.assignVendors(detail.id, assignIds), "Vendors assigned.")}>
                Assign selected
              </button>
            </div>
          )}
          {drawerTab === "quotations" && (
            <div>
              <div className="adm-section-label">Record a quotation</div>
              <div className="adm-form-grid cols-3" style={{ marginBottom: 16 }}>
                <div className="field">
                  <label>Vendor</label>
                  <select className="input" value={quoteVendorId} onChange={(e) => setQuoteVendorId(e.target.value)}>
                    <option value="">— select —</option>
                    {(detail.vendorAssignments ?? []).map((a) => <option key={a.vendor.id} value={a.vendor.id}>{a.vendor.businessName}</option>)}
                  </select>
                </div>
                <div className="field"><label>Price (₹)</label><input className="input" type="number" value={quotePrice} onChange={(e) => setQuotePrice(e.target.value)} /></div>
                <div className="field"><label>Lead time (days)</label><input className="input" type="number" value={quoteLeadTime} onChange={(e) => setQuoteLeadTime(e.target.value)} /></div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={!quoteVendorId || !quotePrice}
                onClick={() =>
                  runAction(() => rfqApi.addQuotation(detail.id, { vendorId: quoteVendorId, price: Number(quotePrice), leadTimeDays: Number(quoteLeadTime) || 0 }), "Quotation recorded.")
                    .then(() => { setQuoteVendorId(""); setQuotePrice(""); setQuoteLeadTime(""); })
                }
              >
                Save quotation
              </button>

              <div className="adm-section-label" style={{ marginTop: 20 }}>Compare quotations</div>
              <table className="table">
                <thead><tr><th>Vendor</th><th className="num">Price</th><th>Lead time</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {quotations.length === 0 ? <tr><td colSpan={5} style={{ color: "var(--color-neutral-600)" }}>No quotations yet.</td></tr> :
                    quotations.map((q, i) => (
                      <tr key={i}>
                        <td>{quoteVendorName(q)}</td>
                        <td className="num">{q.price != null ? money(Number(q.price)) : "—"}</td>
                        <td>{String(q.leadTimeDays ?? "—")} days</td>
                        <td><StatusTag status={displayStatus(quoteStatus(q))} /></td>
                        <td>
                          <button type="button" className="btn btn-ghost btn-sm" disabled={Boolean(q.isApproved)} onClick={() => runAction(() => rfqApi.approveQuotation(detail.id, String(q.id)), "Quotation approved.")}>Approve</button>{" "}
                          <button type="button" className="btn btn-ghost btn-sm" disabled={Boolean(q.isRejected)} onClick={() => runAction(() => rfqApi.rejectQuotation(detail.id, String(q.id)), "Quotation rejected.")}>Reject</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          {drawerTab === "timeline" && (
            <Timeline events={timeline.map((t) => ({ label: t.detail ?? t.type ?? "Event", at: t.at }))} />
          )}
        </Drawer>
      )}
    </div>
  );
}
