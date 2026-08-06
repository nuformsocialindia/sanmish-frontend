"use client";
import { useEffect, useState } from "react";
import { vendorOrdersApi, VendorApiError } from "@/lib/vendor/api";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/vendor/ListStates";

type Order = Record<string, unknown> & {
  id: string; orderNumber: string; status: string; totalAmount: string | number; createdAt: string;
  user?: { name?: string };
  items?: { id: string; quantity: number; product?: { title?: string } }[];
};

export default function VendorOrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    vendorOrdersApi
      .list()
      .then((res) => setItems(res as Order[]))
      .catch((err) => setError(err instanceof VendorApiError ? err.message : "Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}
      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState message="No orders include your products yet." />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Your items</th><th className="num">Total</th><th>Status</th><th>Placed</th></tr></thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id}>
                  <td>{o.orderNumber}</td>
                  <td>{o.user?.name ?? "—"}</td>
                  <td>{(o.items ?? []).map((it) => `${it.product?.title ?? "Item"} × ${it.quantity}`).join(", ") || "—"}</td>
                  <td className="num">₹{o.totalAmount}</td>
                  <td><span className="tag tag-attention">{o.status}</span></td>
                  <td>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
