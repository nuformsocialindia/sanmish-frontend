"use client";
import Link from "next/link";
import { useOrders } from "@/lib/orders-context";

const inr = (n: number) => "₹ " + n.toLocaleString("en-IN");

export default function OrdersPage() {
  const { orders } = useOrders();

  return (
    <div>
      <h1 className="account-title">Your Orders</h1>
      <p className="account-sub">Track quotation requests you&rsquo;ve submitted through checkout.</p>

      {orders.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" />
          </svg>
          <h3>No orders yet</h3>
          <p>Requests you submit at checkout will show up here.</p>
          <Link href="/products" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Products</Link>
        </div>
      ) : (
        <div className="account-order-list">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="account-order-row">
              <div>
                <b>{order.id}</b>
                <span>
                  {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}
                  {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </span>
              </div>
              <span className={`order-status status-${order.status.replace(/\s+/g, "-").toLowerCase()}`}>{order.status}</span>
              <b className="account-order-amount">{inr(order.subtotal)}</b>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
