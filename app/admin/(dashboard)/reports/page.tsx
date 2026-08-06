"use client";
import { useState } from "react";
import { reportsApi, downloadGenerated, AdminApiError, type ReportKey } from "@/lib/admin/api";
import { useAdminToast } from "@/components/admin/Toast";

const REPORTS: { key: ReportKey; label: string; desc: string }[] = [
  { key: "sales", label: "Sales", desc: "Order value by period, vendor and channel." },
  { key: "revenue", label: "Revenue", desc: "Net revenue after commission and refunds." },
  { key: "products", label: "Products", desc: "Listing counts, approvals and stock health." },
  { key: "vendors", label: "Vendors", desc: "Onboarding funnel, earnings and settlements." },
  { key: "customers", label: "Customers", desc: "Signups, repeat rate and lifetime value." },
  { key: "orders", label: "Orders", desc: "Volume, fulfilment time and cancellations." },
  { key: "rfq", label: "RFQ", desc: "Enquiries, quote turnaround and conversion." },
  { key: "payments", label: "Payments", desc: "Collections, failures and refunds." },
  { key: "logistics", label: "Logistics", desc: "Shipment status, SLA and failed deliveries." },
  { key: "refunds", label: "Refunds", desc: "Requests, approvals and value refunded." },
  { key: "categories", label: "Categories", desc: "Demand and revenue split by category." },
  { key: "monthly-business", label: "Monthly Business", desc: "One-page month close across all modules." },
];

export default function AdminReportsPage() {
  const toast = useAdminToast();
  const [preview, setPreview] = useState<{ title: string; columns: string[]; rows: (string | number)[][] } | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const view = async (key: ReportKey) => {
    setLoadingKey(key);
    try {
      const res = await reportsApi.run(key);
      setPreview(res as { title: string; columns: string[]; rows: (string | number)[][] });
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not load report.");
    } finally {
      setLoadingKey(null);
    }
  };

  const download = async (key: ReportKey, format: "pdf" | "excel") => {
    setLoadingKey(`${key}-${format}`);
    try {
      const res = (await reportsApi.run(key, format)) as { path: string };
      await downloadGenerated(res.path);
      toast.success(`${key} report (${format.toUpperCase()}) ready — download started.`);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not generate report.");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="adm-list-block">
      <div className="adm-reports-grid">
        {REPORTS.map((r) => (
          <div key={r.key} className="card elev-sm adm-report-card">
            <div className="adm-report-title">{r.label}</div>
            <p className="adm-report-desc">{r.desc}</p>
            <div className="adm-report-actions">
              <button type="button" className="btn btn-primary btn-sm" disabled={loadingKey === r.key} onClick={() => view(r.key)}>
                {loadingKey === r.key ? "Loading…" : "View"}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" disabled={loadingKey === `${r.key}-pdf`} onClick={() => download(r.key, "pdf")}>PDF</button>
              <button type="button" className="btn btn-secondary btn-sm" disabled={loadingKey === `${r.key}-excel`} onClick={() => download(r.key, "excel")}>Excel</button>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div className="dialog-backdrop" onClick={() => setPreview(null)}>
          <div className="dialog elev-lg" style={{ maxWidth: 900, width: "94vw", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">{preview.title}</div>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead><tr>{preview.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>
                  {preview.rows.length === 0 ? (
                    <tr><td colSpan={preview.columns.length} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 24 }}>No data for this report yet.</td></tr>
                  ) : preview.rows.map((row, i) => (
                    <tr key={i}>{preview.columns.map((c, ci) => <td key={c}>{row[ci] ?? "—"}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setPreview(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
