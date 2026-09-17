"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { myOrders, type MyOrder } from "@/lib/api";

const inr = (n: number | string) => "₹ " + Math.round(Number(n)).toLocaleString("en-IN");

export default function OrdersPage() {
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    myOrders
      .list()
      .then(setOrders)
      .catch(() => setError("Couldn't load your orders. Please try again."));
  }, []);

  return (
    <div>
      <h1 className="account-title">Your Orders</h1>
      <p className="account-sub">Track orders you&rsquo;ve placed through checkout.</p>

      {error && <p style={{ color: "var(--color-danger-600, #dc2626)" }}>{error}</p>}

      {!error && orders === null && <p className="account-sub">Loading…</p>}

      {orders !== null && orders.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" />
          </svg>
          <h3>No orders yet</h3>
          <p>Orders you place at checkout will show up here.</p>
          <Link href="/products" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Products</Link>
        </div>
      ) : orders !== null && (
        <div className="account-order-list">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.orderNumber}`} className="account-order-row">
              <div>
                <b>{order.orderNumber}</b>
                <span>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}
                  {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </span>
              </div>
              <span className={`order-status status-${order.status}`}>{order.status}</span>
              <b className="account-order-amount">{inr(order.totalAmount)}</b>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
