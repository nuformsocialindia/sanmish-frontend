"use client";
import { useCallback, useEffect, useState } from "react";
import { usersApi, downloadCsv, AdminApiError, type Paginated } from "@/lib/admin/api";
import { money, formatDate, displayStatus } from "@/lib/admin/format";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import { ListToolbar, PaginationRow } from "@/components/admin/ListChrome";
import StatusTag from "@/components/admin/StatusTag";
import Drawer, { FieldGrid, Field, NotesThread } from "@/components/admin/Drawer";

// v2 User: phoneVerified (renamed from mobileVerified) + B2B fields
// (companyName/gstin/pan/city/state/pincode/creditTermsEnabled/creditLimit).
// billingAddress/shippingAddresses are customer-managed, read-only here.
type Customer = Record<string, unknown> & {
  id: string; name?: string; email?: string; mobileNumber?: string; status?: string; phoneVerified?: boolean; createdAt?: string;
  companyName?: string | null; gstin?: string | null; pan?: string | null; city?: string | null; state?: string | null; pincode?: string | null;
  creditTermsEnabled?: boolean; creditLimit?: number | null;
  billingAddress?: Record<string, unknown> | null; shippingAddresses?: Record<string, unknown>[] | null;
  notes?: Record<string, unknown>[];
  _count?: { orders?: number; rfqs?: number };
};

function formatAddress(a: Record<string, unknown> | null | undefined) {
  if (!a) return "—";
  return [a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(", ") || "—";
}

export default function AdminUsersPage() {
  const qs = useQueryState();
  const toast = useAdminToast();
  const [items, setItems] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<Paginated<Customer>["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [detail, setDetail] = useState<Customer | null>(null);
  const [drawerTab, setDrawerTab] = useState("profile");
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [rfqs, setRfqs] = useState<Record<string, unknown>[]>([]);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [note, setNote] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", email: "", mobileNumber: "", companyName: "", gstin: "", pan: "", city: "", state: "", pincode: "",
    creditTermsEnabled: false, creditLimit: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    usersApi
      .list({ page: qs.page, limit: 20, search: qs.search || undefined, status: showDeleted ? undefined : qs.tab || undefined, deletedOnly: showDeleted || undefined })
      .then((res) => { setItems((res.data as Customer[]) || []); setMeta(res.meta); })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load users."))
      .finally(() => setLoading(false));
  }, [qs.page, qs.search, qs.tab, showDeleted]);

  useEffect(() => { load(); }, [load]);

  const openDetail = (u: Customer) => {
    setDetail(u);
    setDrawerTab("profile");
    setOtpSent(false);
    setEditing(false);
    usersApi.get(u.id).then((d) => setDetail(d as Customer)).catch(() => {});
    usersApi.orders(u.id).then(setOrders).catch(() => setOrders([]));
    usersApi.rfqs(u.id).then(setRfqs).catch(() => setRfqs([]));
    usersApi.payments(u.id).then(setPayments).catch(() => setPayments([]));
  };

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      toast.success(successMsg);
      load();
      if (detail) usersApi.get(detail.id).then((d) => setDetail(d as Customer)).catch(() => {});
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  const toggleSelect = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const openEdit = () => {
    if (!detail) return;
    setEditForm({
      name: String(detail.name ?? ""), email: String(detail.email ?? ""), mobileNumber: String(detail.mobileNumber ?? ""),
      companyName: String(detail.companyName ?? ""), gstin: String(detail.gstin ?? ""), pan: String(detail.pan ?? ""),
      city: String(detail.city ?? ""), state: String(detail.state ?? ""), pincode: String(detail.pincode ?? ""),
      creditTermsEnabled: Boolean(detail.creditTermsEnabled), creditLimit: detail.creditLimit != null ? String(detail.creditLimit) : "",
    });
    setEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    setSavingEdit(true);
    try {
      await usersApi.update(detail.id, {
        name: editForm.name, email: editForm.email, mobileNumber: editForm.mobileNumber,
        companyName: editForm.companyName || undefined, gstin: editForm.gstin || undefined, pan: editForm.pan || undefined,
        city: editForm.city || undefined, state: editForm.state || undefined, pincode: editForm.pincode || undefined,
        creditTermsEnabled: editForm.creditTermsEnabled,
        creditLimit: editForm.creditTermsEnabled && editForm.creditLimit ? Number(editForm.creditLimit) : undefined,
      });
      toast.success("Customer updated.");
      setEditing(false);
      load();
      usersApi.get(detail.id).then((d) => setDetail(d as Customer)).catch(() => {});
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save changes.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <ListToolbar
        search={qs.searchInput}
        onSearch={qs.onSearchInput}
        placeholder="Search customers…"
        showDeleted={showDeleted}
        onShowDeletedChange={(v) => { setShowDeleted(v); setSelected([]); }}
      >
        <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/users/export")}>Export CSV</button>
      </ListToolbar>

      {selected.length > 0 && (
        <div className="adm-bulk-bar">
          <span>{selected.length} selected</span>
          <span className="adm-toolbar-spacer" />
          {showDeleted ? (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => Promise.all(selected.map((id) => usersApi.restore(id))), "Customers restored.")}>Restore</button>
          ) : (
            <>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => usersApi.bulkActivate(selected), "Users activated.")}>Activate</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => usersApi.bulkDeactivate(selected), "Users deactivated.")}>Deactivate</button>
            </>
          )}
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
                <th>Customer</th><th>Company / GSTIN</th><th>Mobile</th><th>Joined</th><th>Status</th><th className="adm-open-col" />
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className={selected.includes(u.id) ? "selected" : ""}>
                  <td><input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)} /></td>
                  <td>{u.name ?? "—"}<span className="sub-line">{u.email ?? "—"}</span></td>
                  <td>{u.companyName ?? "—"}{u.gstin ? <span className="sub-line">{u.gstin}</span> : null}</td>
                  <td>{u.mobileNumber ?? "—"} {u.phoneVerified ? <span className="tag tag-positive" style={{ marginLeft: 6 }}>verified</span> : null}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td><StatusTag status={displayStatus(u.status)} /></td>
                  <td>
                    {showDeleted ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => usersApi.restore(u.id), "Customer restored.")}>Restore</button>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(u)}>Open</button>
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
          kicker="Customers"
          title={detail.name ?? detail.email ?? "Customer"}
          subtitle={`${detail.email ?? "—"} · joined ${formatDate(detail.createdAt)}`}
          status={displayStatus(detail.status)}
          tabs={[{ key: "profile", label: "Profile" }, { key: "orders", label: "Orders" }, { key: "rfqs", label: "RFQs" }, { key: "payments", label: "Payments" }]}
          activeTab={drawerTab}
          onTabChange={setDrawerTab}
          onClose={() => setDetail(null)}
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={openEdit}>Edit</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => runAction(() => (detail.status === "active" ? usersApi.deactivate(detail.id) : usersApi.activate(detail.id)), "Status updated.")}
              >
                {detail.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => runAction(() => usersApi.invalidateSession(detail.id), "Session invalidated — the customer must sign in again.")}>Force re-login</button>
              <button type="button" className="btn btn-ghost" onClick={() => { if (confirm("Soft delete this customer?")) runAction(() => usersApi.remove(detail.id), "Customer soft deleted."); }}>Soft delete</button>
            </>
          }
        >
          {drawerTab === "profile" && (
            <>
              {editing ? (
                <form onSubmit={handleSaveEdit} className="adm-form-grid cols-2" style={{ marginBottom: 20 }}>
                  <div className="field"><label>Name</label><input className="input" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                  <div className="field"><label>Email</label><input className="input" type="email" required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
                  <div className="field"><label>Mobile number</label><input className="input" required value={editForm.mobileNumber} onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })} /></div>
                  <div className="field"><label>Company name</label><input className="input" value={editForm.companyName} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} /></div>
                  <div className="field"><label>GSTIN</label><input className="input" value={editForm.gstin} onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value })} /></div>
                  <div className="field"><label>PAN</label><input className="input" value={editForm.pan} onChange={(e) => setEditForm({ ...editForm, pan: e.target.value })} /></div>
                  <div className="field"><label>City</label><input className="input" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} /></div>
                  <div className="field"><label>State</label><input className="input" value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} /></div>
                  <div className="field"><label>Pincode</label><input className="input" value={editForm.pincode} onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })} /></div>
                  <div className="field">
                    <label className="check" style={{ marginTop: 22 }}>
                      <input type="checkbox" checked={editForm.creditTermsEnabled} onChange={(e) => setEditForm({ ...editForm, creditTermsEnabled: e.target.checked })} />
                      Credit terms enabled
                    </label>
                  </div>
                  {editForm.creditTermsEnabled && (
                    <div className="field"><label>Credit limit (₹)</label><input className="input" type="number" value={editForm.creditLimit} onChange={(e) => setEditForm({ ...editForm, creditLimit: e.target.value })} /></div>
                  )}
                  <div className="field full">
                    <button type="submit" className="btn btn-primary" disabled={savingEdit} style={{ alignSelf: "flex-start" }}>{savingEdit ? "Saving…" : "Save changes"}</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <FieldGrid>
                  <Field
                    label="Email"
                    value={detail.email ?? "—"}
                    action
                    actionLabel="Mark verified"
                    onAction={() => runAction(() => usersApi.verifyEmail(detail.id), "Email marked verified.")}
                  />
                  <Field
                    label="Mobile"
                    value={detail.mobileNumber ?? "—"}
                    action
                    actionLabel={otpSent ? "Resend OTP" : "Send OTP"}
                    onAction={() => runAction(() => usersApi.sendMobileOtp(detail.id), "OTP sent (mock — logged server-side, not delivered).").then(() => setOtpSent(true))}
                  />
                  {otpSent && (
                    <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1" }}>
                      <input className="input" placeholder="Enter OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} style={{ maxWidth: 160 }} />
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => usersApi.verifyMobileOtp(detail.id, otpCode), "Mobile verified.")}>Verify</button>
                    </div>
                  )}
                  <Field label="Company" value={detail.companyName ?? "—"} />
                  <Field label="GSTIN" value={detail.gstin ?? "—"} />
                  <Field label="PAN" value={detail.pan ?? "—"} />
                  <Field label="Location" value={[detail.city, detail.state, detail.pincode].filter(Boolean).join(", ") || "—"} />
                  <Field label="Credit terms" value={detail.creditTermsEnabled ? `Enabled · limit ${money(Number(detail.creditLimit ?? 0))}` : "Disabled"} />
                  <Field label="Billing address" value={formatAddress(detail.billingAddress)} />
                  <Field label="Shipping addresses" value={detail.shippingAddresses?.length ? `${detail.shippingAddresses.length} saved` : "—"} />
                  <Field label="Orders" value={String(detail._count?.orders ?? orders.length)} />
                  <Field label="RFQs" value={String(detail._count?.rfqs ?? rfqs.length)} />
                  <Field label="Joined" value={formatDate(detail.createdAt)} />
                </FieldGrid>
              )}
              <NotesThread
                notes={detail.notes ?? []}
                draft={note}
                onDraftChange={setNote}
                onAdd={() => runAction(() => usersApi.addNote(detail.id, note), "Note added.").then(() => setNote(""))}
              />
            </>
          )}
          {drawerTab === "orders" && (
            <table className="table">
              <thead><tr><th>Order</th><th className="num">Value</th><th>Status</th></tr></thead>
              <tbody>
                {orders.length === 0 ? <tr><td colSpan={3} style={{ color: "var(--color-neutral-600)" }}>No orders yet.</td></tr> :
                  orders.map((o, i) => <tr key={i}><td>{String(o.orderNumber ?? o.id)}</td><td className="num">{money(Number(o.totalAmount ?? 0))}</td><td><StatusTag status={displayStatus(String(o.status ?? ""))} /></td></tr>)}
              </tbody>
            </table>
          )}
          {drawerTab === "rfqs" && (
            <table className="table">
              <thead><tr><th>Requirement</th><th>Status</th></tr></thead>
              <tbody>
                {rfqs.length === 0 ? <tr><td colSpan={2} style={{ color: "var(--color-neutral-600)" }}>No RFQs yet.</td></tr> :
                  rfqs.map((r, i) => <tr key={i}><td>{String(r.productName ?? r.id)}</td><td><StatusTag status={displayStatus(String(r.status ?? ""))} /></td></tr>)}
              </tbody>
            </table>
          )}
          {drawerTab === "payments" && (
            <table className="table">
              <thead><tr><th>Order</th><th className="num">Amount</th><th>Status</th></tr></thead>
              <tbody>
                {payments.length === 0 ? <tr><td colSpan={3} style={{ color: "var(--color-neutral-600)" }}>No payments yet.</td></tr> :
                  payments.map((p, i) => <tr key={i}><td>{String((p.order as Record<string, unknown> | undefined)?.orderNumber ?? p.orderId ?? "—")}</td><td className="num">{money(Number(p.amount ?? 0))}</td><td><StatusTag status={displayStatus(String(p.status ?? ""))} /></td></tr>)}
              </tbody>
            </table>
          )}
        </Drawer>
      )}
    </div>
  );
}
