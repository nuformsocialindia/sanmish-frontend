"use client";
import { useCallback, useEffect, useState } from "react";
import { ordersApi, downloadGenerated, downloadCsv, AdminApiError, type Paginated } from "@/lib/admin/api";
import { money, formatDate, displayStatus } from "@/lib/admin/format";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import StatusTag from "@/components/admin/StatusTag";
import Drawer, { FieldGrid, Field, NotesThread, Timeline } from "@/components/admin/Drawer";
import Icon from "@/components/admin/Icon";

type Address = { line1?: string; line2?: string; city?: string; state?: string; pincode?: string };
type OrderItem = {
  id: string; quantity: number; unitPrice: number; lineTotal: number; product: { id: string; name?: string; title?: string };
  mrpAtPurchase?: number; basePrice?: number; gstAmount?: number;
};
type Order = Record<string, unknown> & {
  id: string; orderNumber?: string; status?: string; totalAmount?: number; createdAt?: string;
  shippingAddress?: Address | string | null; billingAddress?: Address | string | null;
  couponCode?: string | null; couponDiscount?: number | null; placeOfSupply?: string | null;
  gstBreakup?: { cgst?: number; sgst?: number; igst?: number } | null;
  user?: { id: string; name: string; email: string; mobileNumber?: string };
  vendorAssignments?: { vendor: { id: string; businessName: string } }[];
  items?: OrderItem[];
  notes?: Record<string, unknown>[];
};

function formatAddress(a: Address | string | null | undefined): string {
  if (!a) return "—";
  if (typeof a === "string") return a;
  return [a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(", ") || "—";
}

// OrderStatus enum on the backend: pending, approved, processing, shipped,
// delivered, completed, cancelled, rejected, returned. Orders has no
// deletedAt column, so there's no soft-delete/"show deleted" affordance here.
const TABS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];
const STATUS_OPTIONS = ["pending", "approved", "processing", "shipped", "delivered", "completed", "cancelled", "rejected", "returned"];

function vendorName(o: Order): string {
  return o.vendorAssignments?.[0]?.vendor?.businessName ?? "—";
}

export default function AdminOrdersPage() {
  const qs = useQueryState();
  const toast = useAdminToast();
  const [items, setItems] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Paginated<Order>["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const [detail, setDetail] = useState<Order | null>(null);
  const [drawerTab, setDrawerTab] = useState("line-items");
  const [timeline, setTimeline] = useState<Record<string, unknown>[]>([]);
  const [note, setNote] = useState("");
  const [nextStatus, setNextStatus] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    ordersApi
      .list({ page: qs.page, limit: 20, search: qs.search || undefined, status: qs.tab || undefined })
      .then((res) => { setItems((res.data as Order[]) || []); setMeta(res.meta); })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load orders."))
      .finally(() => setLoading(false));
  }, [qs.page, qs.search, qs.tab]);

  useEffect(() => { load(); }, [load]);

  const openDetail = (o: Order) => {
    setDetail(o);
    setDrawerTab("line-items");
    ordersApi.get(o.id).then((d) => { setDetail(d as Order); setNextStatus(String(d.status ?? "")); }).catch(() => {});
    ordersApi.timeline(o.id).then(setTimeline).catch(() => setTimeline([]));
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

  const generateFile = async (fn: () => Promise<{ path: string }>, name: string) => {
    try {
      const { path } = await fn();
      await downloadGenerated(path, name);
      toast.success(`${name} ready — download started.`);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not generate file.");
    }
  };

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="adm-tab-bar">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={qs.tab === t.key ? "active" : ""} onClick={() => qs.setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <div className="adm-toolbar">
        <div className="adm-search-wrap">
          <Icon name="search" size={18} />
          <input className="input" placeholder="Search orders…" value={qs.searchInput} onChange={(e) => qs.onSearchInput(e.target.value)} />
        </div>
        <div className="adm-toolbar-spacer" />
        <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/orders/export")}>Export CSV</button>
      </div>

      {selected.length > 0 && (
        <div className="adm-bulk-bar">
          <span>{selected.length} selected</span>
          <span className="adm-toolbar-spacer" />
          <select className="input" style={{ width: "auto" }} onChange={(e) => { if (e.target.value) runAction(() => ordersApi.bulkStatus(selected, e.target.value), "Order status updated."); }}>
            <option value="">Update status…</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState onClear={qs.clearFilters} />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead>
              <tr>
                <th className="adm-checkbox-col"><input type="checkbox" checked={selected.length === items.length} onChange={(e) => setSelected(e.target.checked ? items.map((i) => i.id) : [])} /></th>
                <th>Order</th><th>Customer</th><th>Vendor</th><th className="num">Value</th><th>Status</th><th className="adm-open-col" />
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id} className={selected.includes(o.id) ? "selected" : ""}>
                  <td><input type="checkbox" checked={selected.includes(o.id)} onChange={() => setSelected((s) => s.includes(o.id) ? s.filter((x) => x !== o.id) : [...s, o.id])} /></td>
                  <td>{o.orderNumber ?? o.id}<span className="sub-line">{formatDate(o.createdAt)}</span></td>
                  <td>{o.user?.name ?? "—"}</td>
                  <td>{vendorName(o)}</td>
                  <td className="num">{money(Number(o.totalAmount ?? 0))}</td>
                  <td><StatusTag status={displayStatus(o.status)} /></td>
                  <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(o)}>Open</button></td>
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

      {detail && (
        <Drawer
          kicker="Orders"
          title={detail.orderNumber ?? detail.id}
          subtitle={`${detail.user?.name ?? "—"} · ${detail.items?.length ?? 0} line items · placed ${formatDate(detail.createdAt)}`}
          status={displayStatus(detail.status)}
          tabs={[{ key: "line-items", label: "Line items" }, { key: "customer", label: "Customer" }, { key: "timeline", label: "Timeline" }, { key: "documents", label: "Documents" }]}
          activeTab={drawerTab}
          onTabChange={setDrawerTab}
          onClose={() => setDetail(null)}
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={() => runAction(() => ordersApi.approve(detail.id), "Order approved.")}>Approve</button>
              <button type="button" className="btn btn-ghost" onClick={() => runAction(() => ordersApi.cancel(detail.id), "Order cancelled.")}>Cancel order</button>
              <button type="button" className="btn btn-secondary" onClick={() => generateFile(() => ordersApi.invoice(detail.id), "Invoice")}>Generate invoice</button>
              <button type="button" className="btn btn-secondary" onClick={() => generateFile(() => ordersApi.packingSlip(detail.id), "Packing slip")}>Generate packing slip</button>
              <button type="button" className="btn btn-ghost" onClick={() => runAction(() => ordersApi.returnOrder(detail.id), "Return initiated.")}>Initiate return</button>
            </>
          }
        >
          {drawerTab === "line-items" && (
            <>
              <FieldGrid>
                <Field label="Order value" value={money(Number(detail.totalAmount ?? 0))} />
                <Field label="Vendor" value={vendorName(detail)} />
                <Field label="Coupon" value={detail.couponCode ? `${detail.couponCode} (−${money(Number(detail.couponDiscount ?? 0))})` : "—"} />
                <Field label="Place of supply" value={detail.placeOfSupply ?? "—"} />
                <Field label="GST breakup" value={detail.gstBreakup ? `CGST ${money(Number(detail.gstBreakup.cgst ?? 0))} · SGST ${money(Number(detail.gstBreakup.sgst ?? 0))} · IGST ${money(Number(detail.gstBreakup.igst ?? 0))}` : "—"} />
              </FieldGrid>
              <div>
                <div className="adm-section-label">Update status</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <select className="input" style={{ maxWidth: 220 }} value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button type="button" className="btn btn-secondary" onClick={() => runAction(() => ordersApi.setStatus(detail.id, nextStatus), "Status updated.")}>Update</button>
                </div>
              </div>
              {(detail.items?.length ?? 0) > 0 && (
                <div>
                  <div className="adm-section-label">Items (frozen tax snapshot at time of purchase)</div>
                  <table className="table">
                    <thead><tr><th>Product</th><th className="num">Qty</th><th className="num">MRP</th><th className="num">Base price</th><th className="num">GST</th><th className="num">Line total</th></tr></thead>
                    <tbody>
                      {detail.items!.map((it) => (
                        <tr key={it.id}>
                          <td>{it.product?.title ?? it.product?.name ?? "—"}</td>
                          <td className="num">{it.quantity}</td>
                          <td className="num">{it.mrpAtPurchase != null ? money(Number(it.mrpAtPurchase)) : "—"}</td>
                          <td className="num">{it.basePrice != null ? money(Number(it.basePrice)) : "—"}</td>
                          <td className="num">{it.gstAmount != null ? money(Number(it.gstAmount)) : "—"}</td>
                          <td className="num">{money(Number(it.lineTotal ?? 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          {drawerTab === "customer" && (
            <FieldGrid>
              <Field label="Name" value={detail.user?.name ?? "—"} />
              <Field label="Email" value={detail.user?.email ?? "—"} />
              <Field label="Mobile" value={detail.user?.mobileNumber ?? "—"} />
              <Field label="Shipping address" value={formatAddress(detail.shippingAddress)} />
              <Field label="Billing address" value={formatAddress(detail.billingAddress)} />
            </FieldGrid>
          )}
          {drawerTab === "timeline" && (
            <Timeline events={timeline.map((t) => ({ label: displayStatus(String(t.status ?? "Event")), at: String(t.createdAt ?? ""), by: t.note ? String(t.note) : undefined }))} />
          )}
          {drawerTab === "documents" && (
            <p style={{ fontSize: 13.5, color: "var(--color-neutral-600)" }}>Generate the invoice or packing slip from the action row above.</p>
          )}
          <NotesThread
            notes={detail.notes ?? []}
            draft={note}
            onDraftChange={setNote}
            onAdd={() => runAction(() => ordersApi.addNote(detail.id, note), "Note added.").then(() => setNote(""))}
          />
        </Drawer>
      )}
    </div>
  );
}
