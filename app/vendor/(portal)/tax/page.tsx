"use client";
import { useEffect, useState } from "react";
import { vendorTaxApi, VendorApiError, type VendorTaxSummary } from "@/lib/vendor/api";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/vendor/ListStates";

export default function VendorTaxPage() {
  const [summary, setSummary] = useState<VendorTaxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    vendorTaxApi
      .summary()
      .then(setSummary)
      .catch((err) => setError(err instanceof VendorApiError ? err.message : "Could not load tax summary."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="adm-list-block">
      {error ? (
        <ErrorBanner message={error} onDismiss={() => setError("")} />
      ) : loading ? (
        <TableSkeleton />
      ) : !summary || summary.lineItems.length === 0 ? (
        <EmptyState message="No taxable sales recorded yet." />
      ) : (
        <>
          <div className="adm-reports-grid">
            <div className="card elev-sm adm-report-card"><div className="adm-report-title">Taxable value</div><p className="adm-report-desc">₹{summary.totalTaxable.toLocaleString("en-IN")}</p></div>
            <div className="card elev-sm adm-report-card"><div className="adm-report-title">GST collected</div><p className="adm-report-desc">₹{summary.totalGst.toLocaleString("en-IN")}</p></div>
            <div className="card elev-sm adm-report-card"><div className="adm-report-title">Total with tax</div><p className="adm-report-desc">₹{summary.totalWithTax.toLocaleString("en-IN")}</p></div>
          </div>

          <div className="card elev-sm adm-table-card">
            <table className="table">
              <thead><tr><th>GST rate</th><th className="num">Taxable value</th><th className="num">GST</th></tr></thead>
              <tbody>
                {summary.byRate.map((r) => (
                  <tr key={r.gstRate}>
                    <td>{r.gstRate}%</td>
                    <td className="num">₹{r.taxable.toLocaleString("en-IN")}</td>
                    <td className="num">₹{r.gst.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card elev-sm adm-table-card">
            <table className="table">
              <thead><tr><th>Order</th><th>Date</th><th className="num">Qty</th><th className="num">Base price</th><th>GST %</th><th className="num">GST amount</th><th className="num">Line total</th></tr></thead>
              <tbody>
                {summary.lineItems.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.orderNumber}</td>
                    <td>{new Date(i.date).toLocaleDateString("en-IN")}</td>
                    <td className="num">{i.quantity}</td>
                    <td className="num">₹{i.basePrice.toLocaleString("en-IN")}</td>
                    <td>{i.gstPercent}%</td>
                    <td className="num">₹{i.gstAmount.toLocaleString("en-IN")}</td>
                    <td className="num">₹{i.lineTotal.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
