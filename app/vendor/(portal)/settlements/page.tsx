"use client";
import { useEffect, useState } from "react";
import { vendorSettlementsApi, VendorApiError } from "@/lib/vendor/api";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/vendor/ListStates";

type Settlement = Record<string, unknown> & {
  id: string; periodStart: string; periodEnd: string; grossAmount: string | number; commissionAmount: string | number;
  netAmount: string | number; status: string; utr?: string | null; paidAt?: string | null;
};
type Earnings = { totalGross: number; totalCommission: number; totalNet: number; pendingSettlement: number; settlementCount: number };

export default function VendorSettlementsPage() {
  const [items, setItems] = useState<Settlement[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([vendorSettlementsApi.list(), vendorSettlementsApi.earnings()])
      .then(([s, e]) => { setItems(s as Settlement[]); setEarnings(e); })
      .catch((err) => setError(err instanceof VendorApiError ? err.message : "Could not load settlements."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {earnings && (
        <div className="adm-reports-grid">
          <div className="card elev-sm adm-report-card"><div className="adm-report-title">Total earned (net)</div><p className="adm-report-desc">₹{earnings.totalNet.toLocaleString("en-IN")}</p></div>
          <div className="card elev-sm adm-report-card"><div className="adm-report-title">Pending payout</div><p className="adm-report-desc">₹{earnings.pendingSettlement.toLocaleString("en-IN")}</p></div>
          <div className="card elev-sm adm-report-card"><div className="adm-report-title">Commission paid</div><p className="adm-report-desc">₹{earnings.totalCommission.toLocaleString("en-IN")}</p></div>
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState message="No settlements have been recorded for your account yet." />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Period</th><th className="num">Gross</th><th className="num">Commission</th><th className="num">Net</th><th>Status</th><th>UTR</th></tr></thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.periodStart).toLocaleDateString("en-IN")} – {new Date(s.periodEnd).toLocaleDateString("en-IN")}</td>
                  <td className="num">₹{s.grossAmount}</td>
                  <td className="num">₹{s.commissionAmount}</td>
                  <td className="num">₹{s.netAmount}</td>
                  <td><span className={`tag ${s.status === "paid" ? "tag-positive" : "tag-attention"}`}>{s.status}</span></td>
                  <td>{s.utr ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
