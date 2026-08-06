"use client";
import { useEffect, useState } from "react";
import { vendorReviewsApi, VendorApiError } from "@/lib/vendor/api";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/vendor/ListStates";

type Review = Record<string, unknown> & {
  id: string; rating: number; title?: string | null; body: string; status: string; createdAt: string;
  product?: { title?: string };
};

export default function VendorReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    vendorReviewsApi
      .list()
      .then((res) => setItems(res as Review[]))
      .catch((err) => setError(err instanceof VendorApiError ? err.message : "Could not load reviews."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}
      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState message="No reviews on your products yet." />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Rating</th><th>Product</th><th>Review</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{"★".repeat(Number(r.rating ?? 0))}</td>
                  <td>{r.product?.title ?? "—"}</td>
                  <td style={{ maxWidth: 320 }}>{r.title ? <strong>{r.title}</strong> : null} {String(r.body).slice(0, 100)}</td>
                  <td><span className={`tag ${r.status === "PUBLISHED" ? "tag-positive" : "tag-attention"}`}>{r.status}</span></td>
                  <td>{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
