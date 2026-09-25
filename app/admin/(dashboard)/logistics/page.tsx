"use client";
import { useCallback, useEffect, useState } from "react";
import { logisticsApi, downloadCsv, AdminApiError, type Paginated } from "@/lib/admin/api";
import { displayStatus } from "@/lib/admin/format";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";
import { ErrorBanner } from "@/components/admin/ListStates";
import StatusTag from "@/components/admin/StatusTag";
import Drawer, { Timeline } from "@/components/admin/Drawer";

// The shipments list endpoint only reads page/limit server-side (no status
// filter DTO) — status filtering for the dashboard's "failed shipments"
// deep-link is done client-side after fetch.
type Shipment = Record<string, unknown> & {
  id: string; orderId?: string; status?: string; awbNumber?: string;
  order?: { orderNumber?: string }; partner?: { name?: string };
};
const TABS = [{ key: "shipments", label: "Shipments" }, { key: "partners", label: "Partners" }, { key: "zones", label: "Zones" }];
const SHIPMENT_STATUSES = ["pending", "label_generated", "picked_up", "in_transit", "out_for_delivery", "delivered", "failed", "returned"];

export default function AdminLogisticsPage() {
  const qs = useQueryState({ tab: "shipments" });
  const toast = useAdminToast();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [meta, setMeta] = useState<Paginated<Shipment>["meta"] | null>(null);
  const [partners, setPartners] = useState<Record<string, unknown>[]>([]);
  const [zones, setZones] = useState<Record<string, unknown>[]>([]);
  const [reports, setReports] = useState<{ total: number; byStatus: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerCode, setNewPartnerCode] = useState("");
  const [shipOrderId, setShipOrderId] = useState("");
  const [shipPartnerId, setShipPartnerId] = useState("");
  const [shipWeight, setShipWeight] = useState("");

  const [detail, setDetail] = useState<Shipment | null>(null);
  const [failReason, setFailReason] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      logisticsApi.shipments({ page: qs.page, limit: 20 }).catch(() => ({ data: [], meta: null })),
      logisticsApi.partners().catch(() => []),
      logisticsApi.zones().catch(() => []),
      logisticsApi.reports().catch(() => null),
    ])
      .then(([s, p, z, r]) => {
        const rows = qs.statusFilter ? (s.data as Shipment[]).filter((x) => x.status === qs.statusFilter) : (s.data as Shipment[]);
        setShipments(rows); setMeta(s.meta as Paginated<Shipment>["meta"]); setPartners(p); setZones(z); setReports(r);
      })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load logistics data."))
      .finally(() => setLoading(false));
  }, [qs.page, qs.statusFilter]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      toast.success(successMsg);
      load();
      if (detail) logisticsApi.getShipment(detail.id).then((d) => setDetail(d as Shipment)).catch(() => {});
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  const openDetail = (s: Shipment) => {
    setDetail(s);
    logisticsApi.getShipment(s.id).then((d) => setDetail(d as Shipment)).catch(() => {});
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await logisticsApi.createShipment({ orderId: shipOrderId, partnerId: shipPartnerId, weightKg: Number(shipWeight) || undefined });
      toast.success(`${String((res as Record<string, unknown>).awbNumber ?? "AWB")} generated (mock courier) — label ready.`);
      setShipOrderId(""); setShipPartnerId(""); setShipWeight("");
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not generate shipment.");
    }
  };

  const handleProof = async (id: string, file: File) => {
    await runAction(() => logisticsApi.proofOfDelivery(id, file), "Proof uploaded — shipment marked delivered.");
  };

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {reports && (
        <div className="adm-analytics-strip">
          <div className="card adm-analytics-card"><span className="adm-analytics-label">Total shipments</span><span className="adm-analytics-value">{reports.total}</span></div>
          {Object.entries(reports.byStatus || {}).map(([k, v]) => (
            <div key={k} className="card adm-analytics-card"><span className="adm-analytics-label">{k.replace(/_/g, " ")}</span><span className="adm-analytics-value">{v}</span></div>
          ))}
        </div>
      )}

      <div className="adm-tab-bar">
        {TABS.map((t) => <button key={t.key} type="button" className={qs.tab === t.key ? "active" : ""} onClick={() => qs.setTab(t.key)}>{t.label}</button>)}
      </div>

      {qs.tab === "shipments" && (
        <div className="adm-toolbar">
          {qs.statusFilter && (
            <span className="tag tag-attention">
              Filtering: {displayStatus(qs.statusFilter)}
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 6 }} onClick={() => qs.setParams({ status: undefined })}>Clear</button>
            </span>
          )}
          <span className="adm-toolbar-spacer" />
          <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/logistics/export")}>Export CSV</button>
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--color-neutral-600)" }}>Loading…</p>
      ) : qs.tab === "shipments" ? (
        <>
          <div className="card elev-sm adm-table-card">
            <table className="table">
              <thead><tr><th>AWB</th><th>Order</th><th>Partner</th><th>Status</th><th className="adm-open-col" /></tr></thead>
              <tbody>
                {shipments.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>No shipments found.</td></tr> :
                  shipments.map((s) => (
                    <tr key={s.id}>
                      <td>{s.awbNumber ?? "—"}</td><td>{s.order?.orderNumber ?? s.orderId ?? "—"}</td><td>{s.partner?.name ?? "—"}</td>
                      <td><StatusTag status={displayStatus(s.status)} /></td>
                      <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(s)}>Open</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="adm-pagination-row">
              <span>{meta.total} records · showing {meta.limit} per page</span>
              <span className="adm-toolbar-spacer" />
              <button type="button" className="btn btn-secondary btn-sm" disabled={qs.page <= 1} onClick={() => qs.setPage(qs.page - 1)}>Previous</button>
              <span>Page {meta.page} of {meta.totalPages}</span>
              <button type="button" className="btn btn-secondary btn-sm" disabled={qs.page >= meta.totalPages} onClick={() => qs.setPage(qs.page + 1)}>Next</button>
            </div>
          )}
          <div className="card elev-sm adm-form-card">
            <div className="card-kicker">Shipments</div>
            <h3 className="card-title" style={{ fontSize: 21 }}>Generate a shipment</h3>
            <form onSubmit={handleCreateShipment} className="adm-form-grid cols-3">
              <div className="field"><label>Order</label><input className="input" required value={shipOrderId} onChange={(e) => setShipOrderId(e.target.value)} placeholder="Order ID" /></div>
              <div className="field">
                <label>Partner</label>
                <select className="input" required value={shipPartnerId} onChange={(e) => setShipPartnerId(e.target.value)}>
                  <option value="">— select —</option>
                  {partners.map((p) => <option key={String(p.id)} value={String(p.id)}>{String(p.name)} (mock courier)</option>)}
                </select>
              </div>
              <div className="field"><label>Weight (kg)</label><input className="input" type="number" value={shipWeight} onChange={(e) => setShipWeight(e.target.value)} /></div>
              <div className="field full"><button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Generate AWB</button></div>
            </form>
          </div>
        </>
      ) : qs.tab === "partners" ? (
        <div className="card elev-sm adm-form-card">
          <form
            className="adm-form-grid cols-3"
            onSubmit={(e) => { e.preventDefault(); runAction(() => logisticsApi.createPartner({ name: newPartnerName, code: newPartnerCode }), "Courier partner added (mock)."); setNewPartnerName(""); setNewPartnerCode(""); }}
          >
            <div className="field"><label>Partner name</label><input className="input" value={newPartnerName} onChange={(e) => setNewPartnerName(e.target.value)} required /></div>
            <div className="field"><label>Code</label><input className="input" value={newPartnerCode} onChange={(e) => setNewPartnerCode(e.target.value)} placeholder="e.g. DELHIVERY" required /></div>
            <div className="field" style={{ alignSelf: "flex-end" }}><button type="submit" className="btn btn-primary">Add</button></div>
          </form>
          <table className="table">
            <thead><tr><th>Name</th><th>Code</th><th /></tr></thead>
            <tbody>
              {partners.length === 0 ? <tr><td colSpan={3} style={{ color: "var(--color-neutral-600)" }}>No courier partners yet.</td></tr> :
                partners.map((p) => (
                  <tr key={String(p.id)}><td>{String(p.name)}</td><td>{String(p.code)}</td>
                    <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => logisticsApi.removePartner(String(p.id)), "Partner removed.")}>Remove</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Partner</th><th>Pincode prefix</th><th className="num">Charge</th></tr></thead>
            <tbody>
              {zones.length === 0 ? <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>No delivery zones configured.</td></tr> :
                zones.map((z, i) => (
                  <tr key={i}>
                    <td>{String((z.partner as Record<string, unknown> | undefined)?.name ?? "—")}</td>
                    <td>{String(z.pincodePrefix ?? "—")}</td>
                    <td className="num">{z.charge != null ? `₹${Number(z.charge).toLocaleString("en-IN")}` : "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <Drawer kicker="Logistics" title={detail.awbNumber ?? detail.id} subtitle={`Order ${detail.order?.orderNumber ?? detail.orderId ?? "—"} · mock courier tracking`} status={displayStatus(detail.status)} onClose={() => setDetail(null)}
          actions={
            <>
              <select className="input" style={{ maxWidth: 200 }} value={detail.status ?? ""} onChange={(e) => runAction(() => logisticsApi.setShipmentStatus(detail.id, e.target.value), "Shipment status updated.")}>
                {SHIPMENT_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
              <button type="button" className="btn btn-ghost" onClick={() => runAction(() => logisticsApi.returnShipment(detail.id), "Shipment marked returned.")}>Mark returned</button>
              <button type="button" className="btn btn-ghost" onClick={() => { if (failReason.trim()) runAction(() => logisticsApi.failShipment(detail.id, failReason), "Shipment marked failed."); }}>Mark failed</button>
              <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
                Upload proof of delivery
                <input type="file" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProof(detail.id, f); }} />
              </label>
            </>
          }
        >
          <div className="field"><label>Failure reason (used by &quot;Mark failed&quot;)</label><input className="input" value={failReason} onChange={(e) => setFailReason(e.target.value)} /></div>
          <Timeline events={(Array.isArray(detail.trackingEvents) ? detail.trackingEvents as Record<string, unknown>[] : []).map((t) => ({ label: displayStatus(String(t.status ?? "Event")), at: String(t.createdAt ?? "") }))} />
        </Drawer>
      )}
    </div>
  );
}
