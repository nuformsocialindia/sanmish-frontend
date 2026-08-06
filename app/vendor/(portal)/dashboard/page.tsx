"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { vendorDashboardApi, VendorApiError } from "@/lib/vendor/api";
import { ErrorBanner } from "@/components/vendor/ListStates";

type Summary = {
  productCount: number;
  activeProductCount: number;
  pendingOrders: number;
  pendingSettlement: number;
  unreadNotifications: number;
  ratingAverage: number;
  ratingCount: number;
};

export default function VendorDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    vendorDashboardApi
      .summary()
      .then(setSummary)
      .catch((err) => setError(err instanceof VendorApiError ? err.message : "Could not load dashboard."));
  }, []);

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}
      <div className="adm-reports-grid">
        <Link href="/vendor/products" className="card elev-sm adm-report-card">
          <div className="adm-report-title">Products</div>
          <p className="adm-report-desc">{summary ? `${summary.activeProductCount} active of ${summary.productCount} total` : "—"}</p>
        </Link>
        <Link href="/vendor/orders" className="card elev-sm adm-report-card">
          <div className="adm-report-title">Orders in progress</div>
          <p className="adm-report-desc">{summary ? `${summary.pendingOrders} order(s) awaiting fulfilment` : "—"}</p>
        </Link>
        <Link href="/vendor/settlements" className="card elev-sm adm-report-card">
          <div className="adm-report-title">Pending settlement</div>
          <p className="adm-report-desc">{summary ? `₹${summary.pendingSettlement.toLocaleString("en-IN")} due to be paid out` : "—"}</p>
        </Link>
        <Link href="/vendor/notifications" className="card elev-sm adm-report-card">
          <div className="adm-report-title">Notifications</div>
          <p className="adm-report-desc">{summary ? `${summary.unreadNotifications} unread` : "—"}</p>
        </Link>
        <div className="card elev-sm adm-report-card">
          <div className="adm-report-title">Rating</div>
          <p className="adm-report-desc">{summary ? `${Number(summary.ratingAverage).toFixed(1)} / 5 · ${summary.ratingCount} review(s)` : "—"}</p>
        </div>
      </div>
    </div>
  );
}
