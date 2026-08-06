"use client";
import { useEffect, useState } from "react";
import { vendorRfqsApi, VendorApiError } from "@/lib/vendor/api";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/vendor/ListStates";

type Assignment = Record<string, unknown> & {
  id: string;
  rfq?: { rfqNumber?: string; productName?: string; quantity?: number; unit?: string; status?: string; priority?: string; user?: { name?: string }; category?: { name?: string } };
  quotation?: { price?: string | number; leadTimeDays?: number; isApproved?: boolean; isRejected?: boolean } | null;
};

export default function VendorRfqsPage() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    vendorRfqsApi
      .list()
      .then((res) => setItems(res as Assignment[]))
      .catch((err) => setError(err instanceof VendorApiError ? err.message : "Could not load RFQs."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}
      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState message="No RFQs have been assigned to you yet." />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>RFQ</th><th>Buyer</th><th>Product</th><th className="num">Qty</th><th>Status</th><th>Your quote</th></tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td>{a.rfq?.rfqNumber}</td>
                  <td>{a.rfq?.user?.name ?? "—"}</td>
                  <td>{a.rfq?.productName}</td>
                  <td className="num">{a.rfq?.quantity} {a.rfq?.unit}</td>
                  <td><span className="tag tag-attention">{a.rfq?.status}</span></td>
                  <td>
                    {a.quotation
                      ? `₹${a.quotation.price} · ${a.quotation.leadTimeDays}d${a.quotation.isApproved ? " · Approved" : a.quotation.isRejected ? " · Rejected" : ""}`
                      : "Not quoted yet"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
