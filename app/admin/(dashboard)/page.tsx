"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { dashboardApi, AdminApiError } from "@/lib/admin/api";
import { money, initials, relativeTime } from "@/lib/admin/format";
import { ErrorBanner } from "@/components/admin/ListStates";
import KpiTile from "@/components/admin/charts/KpiTile";
import LineChart from "@/components/admin/charts/LineChart";
import DonutChart from "@/components/admin/charts/DonutChart";
import BarList from "@/components/admin/charts/BarList";
import Icon from "@/components/admin/Icon";

type Summary = Record<string, number>;
type Alerts = { refundRequests: number; failedShipments: number; escalatedRfqs: number; pendingVendors: number };
type TopSelling = { products: Record<string, unknown>[]; categories: Record<string, unknown>[] };
type RecentActivity = Record<string, Record<string, unknown>[]>;
type Range = "daily" | "weekly" | "monthly";

const ALERT_LINKS: Record<keyof Alerts, string> = {
  refundRequests: "/admin/payments?tab=refunds",
  failedShipments: "/admin/logistics?tab=shipments&status=failed",
  escalatedRfqs: "/admin/rfq?tab=escalated",
  pendingVendors: "/admin/vendors?tab=pending",
};
const ALERT_LABELS: Record<keyof Alerts, string> = {
  refundRequests: "Refund requests",
  failedShipments: "Failed shipments",
  escalatedRfqs: "Escalated RFQs",
  pendingVendors: "Pending vendors",
};

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<Alerts | null>(null);
  const [topSelling, setTopSelling] = useState<TopSelling | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [logistics, setLogistics] = useState<Record<string, number> | null>(null);
  const [revenue, setRevenue] = useState<{ totalRevenue: number; byCategory: Record<string, unknown>[] } | null>(null);
  const [salesRange, setSalesRange] = useState<Range>("daily");
  const [salesGraph, setSalesGraph] = useState<{ date: string; total: number }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      dashboardApi.summary().catch(() => null),
      dashboardApi.alerts().catch(() => null),
      dashboardApi.topSelling().catch(() => null),
      dashboardApi.recentActivity().catch(() => null),
      dashboardApi.logisticsOverview().catch(() => null),
      dashboardApi.revenueAnalytics().catch(() => null),
    ])
      .then(([s, a, t, r, l, rev]) => {
        setSummary(s); setAlerts(a as Alerts | null); setTopSelling(t); setRecentActivity(r as RecentActivity | null);
        setLogistics(l); setRevenue(rev);
      })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => {
    dashboardApi.salesGraph(salesRange).then((rows) => setSalesGraph(rows as unknown as { date: string; total: number }[])).catch(() => setSalesGraph([]));
  }, [salesRange]);

  const kpi = (key: string, fallback = 0) => summary?.[key] ?? fallback;

  return (
    <>
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}
      {loading && <p style={{ color: "var(--color-neutral-600)" }}>Loading dashboard…</p>}

      {summary && (
        <div className="adm-kpi-grid">
          <KpiTile label="Total revenue" value={money(kpi("totalRevenue"))} delta="Lifetime" tone="good" />
          <KpiTile label="Orders" value={String(kpi("totalOrders"))} delta={`${kpi("pendingOrders")} pending`} tone="attn" />
          <KpiTile label="Customers" value={String(kpi("totalUsers"))} delta="Registered" tone="neutral" />
          <KpiTile label="Vendors" value={String(kpi("totalVendors"))} delta="Onboarded" tone="neutral" />
          <KpiTile label="Products live" value={String(kpi("totalProducts"))} delta="Active listings" tone="good" />
          <KpiTile label="Payments successful" value={String(kpi("successfulPayments"))} delta="Completed" tone="good" />
          <KpiTile label="Refund requests" value={String(kpi("pendingRefunds") || alerts?.refundRequests || 0)} delta="Awaiting review" tone="attn" />
          <KpiTile label="Open RFQs" value={String(kpi("openRfqs"))} delta="In progress" tone="neutral" />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>
        <div className="card elev-sm adm-chart-card">
          <div className="adm-chart-head">
            <div>
              <div className="card-kicker">Sales graph</div>
              <div className="adm-chart-title">Order value over time</div>
            </div>
            <div className="seg">
              {(["daily", "weekly", "monthly"] as Range[]).map((r) => (
                <button key={r} type="button" className={`seg-opt${salesRange === r ? " active" : ""}`} onClick={() => setSalesRange(r)}>
                  {r[0].toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <LineChart points={salesGraph} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {alerts && (
            <div className="card elev-sm adm-chart-card">
              <div className="card-kicker">Needs attention</div>
              <div className="adm-chart-title" style={{ fontSize: 21 }}>Alerts</div>
              {(Object.keys(ALERT_LABELS) as (keyof Alerts)[]).map((key) => (
                <Link
                  key={key}
                  href={ALERT_LINKS[key]}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, background: "var(--color-neutral-200)",
                    borderRadius: "var(--radius-md)", padding: "12px 14px", textDecoration: "none", color: "var(--color-text)",
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--color-accent-500)", flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{ALERT_LABELS[key]}</span>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 18 }}>{alerts[key] ?? 0}</span>
                </Link>
              ))}
            </div>
          )}

          {logistics && (
            <div className="card elev-sm adm-chart-card">
              <div className="card-kicker">Logistics overview</div>
              <DonutChart data={logistics} />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card elev-sm adm-chart-card">
          <div className="card-kicker">Revenue by category</div>
          <BarList
            items={(revenue?.byCategory || []).map((c) => ({
              label: String(c.name ?? c.category ?? "—"),
              value: Number(c.revenue ?? c.total ?? 0),
            }))}
          />
        </div>

        <div className="card elev-sm adm-chart-card">
          <div className="card-kicker">Top selling</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <b style={{ fontSize: 12.5 }}>Products</b>
              {(topSelling?.products || []).slice(0, 5).map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(p.name ?? "—")}</span>
                  <b>{String(p.quantitySold ?? p.qty ?? 0)}</b>
                </div>
              ))}
            </div>
            <div>
              <b style={{ fontSize: 12.5 }}>Categories</b>
              {(topSelling?.categories || []).slice(0, 5).map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(c.name ?? "—")}</span>
                  <b>{String(c.quantitySold ?? c.qty ?? 0)}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {recentActivity && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {Object.entries(recentActivity).map(([key, items]) => (
            <div key={key} className="card elev-sm adm-chart-card">
              <div className="card-kicker">{key.replace(/([A-Z])/g, " $1")}</div>
              {items.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>Nothing recent.</p>
              ) : items.slice(0, 5).map((it, i) => (
                <div key={i} className="adm-activity-row">
                  <span className="adm-avatar">{initials(String(it.name ?? it.title ?? "—"))}</span>
                  <div>
                    <div className="adm-activity-main">{String(it.name ?? it.title ?? "—")}</div>
                    <div className="adm-activity-sub">{String(it.email ?? it.orderNumber ?? "")}</div>
                  </div>
                  <span className="adm-activity-time">{relativeTime(String(it.createdAt ?? ""))}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="adm-mock-note">
        <Icon name="info" size={18} />
        <span>
          Payment charges, courier AWB generation and SMS/push delivery run on mock providers for now.
          Workflows are complete and testable; nothing physically ships or charges a card yet.
        </span>
      </div>
    </>
  );
}
