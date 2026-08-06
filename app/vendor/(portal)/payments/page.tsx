"use client";
import { useEffect, useState } from "react";
import { vendorPaymentsApi, VendorApiError } from "@/lib/vendor/api";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/vendor/ListStates";

type Payment = Record<string, unknown> & {
  id: string; amount: string | number; method: string; status: string; createdAt: string;
  order?: { orderNumber?: string };
};

export default function VendorPaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    vendorPaymentsApi
      .list()
      .then((res) => setItems(res as Payment[]))
      .catch((err) => setError(err instanceof VendorApiError ? err.message : "Could not load payments."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="adm-list-block">
      {error ? (
        <ErrorBanner message={error} onDismiss={() => setError("")} />
      ) : loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState message="No payments have been received on your orders yet." />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Order</th><th className="num">Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.order?.orderNumber ?? "—"}</td>
                  <td className="num">₹{p.amount}</td>
                  <td>{String(p.method).replace(/_/g, " ")}</td>
                  <td><span className={`tag ${p.status === "success" ? "tag-positive" : "tag-attention"}`}>{p.status}</span></td>
                  <td>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
