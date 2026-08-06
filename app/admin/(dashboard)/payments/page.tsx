"use client";
import { useCallback, useEffect, useState } from "react";
import { paymentsApi, downloadCsv, AdminApiError } from "@/lib/admin/api";
import { money, displayStatus } from "@/lib/admin/format";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";
import { ErrorBanner } from "@/components/admin/ListStates";
import StatusTag from "@/components/admin/StatusTag";
import Drawer, { FieldGrid, Field } from "@/components/admin/Drawer";

const TABS = [
  { key: "transactions", label: "Transactions" },
  { key: "refunds", label: "Refunds" },
  { key: "settlements", label: "Settlements" },
  { key: "commission", label: "Commission rules" },
];

export default function AdminPaymentsPage() {
  const qs = useQueryState({ tab: "transactions" });
  const toast = useAdminToast();
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [refunds, setRefunds] = useState<Record<string, unknown>[]>([]);
  const [settlements, setSettlements] = useState<Record<string, unknown>[]>([]);
  const [rules, setRules] = useState<Record<string, unknown>[]>([]);
  const [revenue, setRevenue] = useState<{ totalRevenue: number; orderCount: number } | null>(null);
  const [gst, setGst] = useState<{ totalGstCollected: number; lineItemCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [gatewayLogs, setGatewayLogs] = useState<Record<string, unknown>[]>([]);
  const [offlineOrderId, setOfflineOrderId] = useState("");
  const [offlineAmount, setOfflineAmount] = useState("");
  const [ruleScope, setRuleScope] = useState("GLOBAL");
  const [ruleTargetId, setRuleTargetId] = useState("");
  const [rulePct, setRulePct] = useState("");
  const [ruleEffectiveFrom, setRuleEffectiveFrom] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      paymentsApi.list({ limit: 20, status: qs.tab === "transactions" ? qs.statusFilter || undefined : undefined }).catch(() => ({ data: [] })),
      paymentsApi.refunds({ limit: 20 }).catch(() => ({ data: [] })),
      paymentsApi.settlements({ limit: 20 }).catch(() => ({ data: [] })),
      paymentsApi.commissionRules().catch(() => []),
      paymentsApi.revenueReport().catch(() => null),
      paymentsApi.gstReport().catch(() => null),
    ])
      .then(([p, r, s, cr, rev, g]) => { setPayments(p.data); setRefunds(r.data); setSettlements(s.data); setRules(cr); setRevenue(rev); setGst(g); })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load payments data."))
      .finally(() => setLoading(false));
  }, [qs.tab, qs.statusFilter]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      toast.success(successMsg);
      load();
      if (detail) paymentsApi.get(String(detail.id)).then(setDetail).catch(() => {});
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  const openDetail = (p: Record<string, unknown>) => {
    setDetail(p);
    paymentsApi.get(String(p.id)).then(setDetail).catch(() => {});
    paymentsApi.gatewayLogs(String(p.id)).then(setGatewayLogs).catch(() => setGatewayLogs([]));
  };

  const handleOffline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentsApi.recordOffline(offlineOrderId, Number(offlineAmount));
      toast.success(`Offline payment of ${money(Number(offlineAmount))} recorded.`);
      setOfflineOrderId(""); setOfflineAmount("");
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not record payment.");
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentsApi.createCommissionRule({
        scope: ruleScope, targetId: ruleScope === "GLOBAL" ? undefined : ruleTargetId || undefined,
        ratePercent: Number(rulePct), effectiveFrom: ruleEffectiveFrom || new Date().toISOString().slice(0, 10),
      });
      toast.success("Commission rule created.");
      setRuleScope("GLOBAL"); setRuleTargetId(""); setRulePct(""); setRuleEffectiveFrom("");
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not create rule.");
    }
  };

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {(revenue || gst) && (
        <div className="adm-analytics-strip">
          {revenue && (
            <>
              <div className="card adm-analytics-card"><span className="adm-analytics-label">Total revenue</span><span className="adm-analytics-value">{money(revenue.totalRevenue)}</span></div>
              <div className="card adm-analytics-card"><span className="adm-analytics-label">Completed orders</span><span className="adm-analytics-value">{revenue.orderCount}</span></div>
            </>
          )}
          {gst && <div className="card adm-analytics-card"><span className="adm-analytics-label">GST collected</span><span className="adm-analytics-value">{money(gst.totalGstCollected)}</span></div>}
        </div>
      )}

      <div className="adm-tab-bar">
        {TABS.map((t) => <button key={t.key} type="button" className={qs.tab === t.key ? "active" : ""} onClick={() => qs.setTab(t.key)}>{t.label}</button>)}
      </div>

      {qs.tab === "transactions" && (
        <div className="adm-toolbar">
          <span className="adm-toolbar-spacer" />
          <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/payments/export")}>Export CSV</button>
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--color-neutral-600)" }}>Loading…</p>
      ) : qs.tab === "transactions" ? (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Transaction</th><th>Order</th><th>Method</th><th className="num">Amount</th><th>Status</th><th className="adm-open-col" /></tr></thead>
            <tbody>
              {payments.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>No payments found.</td></tr> :
                payments.map((p) => (
                  <tr key={String(p.id)}>
                    <td>{String(p.id).slice(0, 8)}</td><td>{String((p.order as Record<string, unknown> | undefined)?.orderNumber ?? p.orderId ?? "—")}</td><td>{String(p.method ?? "—")}</td>
                    <td className="num">{money(Number(p.amount ?? 0))}</td><td><StatusTag status={displayStatus(String(p.status ?? ""))} /></td>
                    <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(p)}>Open</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : qs.tab === "refunds" ? (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Refund</th><th className="num">Amount</th><th>Status</th><th /></tr></thead>
            <tbody>
              {refunds.length === 0 ? <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>No refund requests.</td></tr> :
                refunds.map((r) => (
                  <tr key={String(r.id)}>
                    <td>{String(r.id).slice(0, 8)}</td><td className="num">{money(Number(r.amount ?? 0))}</td><td><StatusTag status={displayStatus(String(r.status ?? "requested"))} /></td>
                    <td>
                      <button type="button" className="btn btn-secondary btn-sm" disabled={r.status !== "requested"} onClick={() => runAction(() => paymentsApi.approveRefund(String(r.id)), "Refund approved.")}>Approve</button>{" "}
                      <button type="button" className="btn btn-ghost btn-sm" disabled={r.status !== "requested"} onClick={() => runAction(() => paymentsApi.rejectRefund(String(r.id)), "Refund rejected.")}>Reject</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : qs.tab === "settlements" ? (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Settlement</th><th>Vendor</th><th className="num">Amount</th><th>Status</th><th /></tr></thead>
            <tbody>
              {settlements.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>No settlements found.</td></tr> :
                settlements.map((s) => (
                  <tr key={String(s.id)}>
                    <td>{String(s.id).slice(0, 8)}</td><td>{String((s.vendor as Record<string, unknown> | undefined)?.businessName ?? "—")}</td><td className="num">{money(Number(s.netAmount ?? 0))}</td>
                    <td><StatusTag status={displayStatus(String(s.status ?? "pending"))} /></td>
                    <td>{String(s.status).toLowerCase() !== "paid" && (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => paymentsApi.markSettlementPaid(String(s.id)), "Settlement marked paid.")}>Mark paid</button>
                    )}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Category</th><th className="num">Commission %</th><th>Default</th></tr></thead>
            <tbody>
              {rules.length === 0 ? <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>No commission rules configured.</td></tr> :
                rules.map((r, i) => <tr key={i}><td>{String(r.categoryId ?? "All categories")}</td><td className="num">{String(r.commissionPct)}%</td><td>{r.isDefault ? <span className="tag tag-positive">default</span> : "—"}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {qs.tab === "transactions" && (
        <div className="card elev-sm adm-form-card">
          <div className="card-kicker">Offline</div>
          <h3 className="card-title" style={{ fontSize: 21 }}>Record an offline payment</h3>
          <form onSubmit={handleOffline} className="adm-form-grid cols-2">
            <div className="field"><label>Order ID</label><input className="input" required value={offlineOrderId} onChange={(e) => setOfflineOrderId(e.target.value)} /></div>
            <div className="field"><label>Amount</label><input className="input" type="number" required value={offlineAmount} onChange={(e) => setOfflineAmount(e.target.value)} /></div>
            <div className="field full"><button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Record payment</button></div>
          </form>
        </div>
      )}

      {qs.tab === "commission" && (
        <div className="card elev-sm adm-form-card">
          <div className="card-kicker">Rules</div>
          <h3 className="card-title" style={{ fontSize: 21 }}>Add a commission rule</h3>
          <form onSubmit={handleAddRule} className="adm-form-grid cols-2">
            <div className="field">
              <label>Scope</label>
              <select className="input" value={ruleScope} onChange={(e) => setRuleScope(e.target.value)}>
                <option value="GLOBAL">Global (default rate)</option>
                <option value="CATEGORY">Category</option>
                <option value="VENDOR">Vendor</option>
              </select>
            </div>
            {ruleScope !== "GLOBAL" && (
              <div className="field"><label>Target ID ({ruleScope.toLowerCase()})</label><input className="input" required value={ruleTargetId} onChange={(e) => setRuleTargetId(e.target.value)} /></div>
            )}
            <div className="field"><label>Rate %</label><input className="input" type="number" required value={rulePct} onChange={(e) => setRulePct(e.target.value)} /></div>
            <div className="field"><label>Effective from</label><input className="input" type="date" value={ruleEffectiveFrom} onChange={(e) => setRuleEffectiveFrom(e.target.value)} /></div>
            <div className="field full"><button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Save rule</button></div>
          </form>
        </div>
      )}

      {detail && (
        <Drawer kicker="Payments" title={String(detail.id)} subtitle={`Order ${String(detail.orderId ?? "—")}`} status={displayStatus(String(detail.status ?? ""))} onClose={() => setDetail(null)}
          actions={<button type="button" className="btn btn-primary" onClick={() => runAction(() => paymentsApi.verify(String(detail.id)), "Payment verified.")}>Verify</button>}
        >
          <FieldGrid>
            <Field label="Amount" value={money(Number(detail.amount ?? 0))} />
            <Field label="Method" value={String(detail.method ?? "—")} />
          </FieldGrid>
          <div>
            <div className="adm-section-label">Gateway logs</div>
            <pre style={{ fontFamily: "monospace", fontSize: 12, background: "var(--color-neutral-100)", borderRadius: "var(--radius-md)", padding: 14, overflowX: "auto" }}>
              {JSON.stringify(gatewayLogs, null, 2)}
            </pre>
          </div>
        </Drawer>
      )}
    </div>
  );
}
