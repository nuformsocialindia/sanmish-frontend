"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { myOrders, type MyOrder } from "@/lib/api";
import { useAddresses } from "@/lib/address-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";

const inr = (n: number | string) => "₹ " + Number(n).toLocaleString("en-IN");

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const { addresses } = useAddresses();
  const { count: wishCount } = useWishlist();
  const { count: cartCount } = useCart();
  const [orders, setOrders] = useState<MyOrder[]>([]);

  useEffect(() => {
    myOrders.list().then(setOrders).catch(() => setOrders([]));
  }, []);

  const stats = [
    { label: "Orders", value: orders.length, href: "/account/orders" },
    { label: "Saved Addresses", value: addresses.length, href: "/account/addresses" },
    { label: "Wishlist Items", value: wishCount, href: "/wishlist" },
    { label: "Items in Cart", value: cartCount, href: "/cart" },
  ];

  return (
    <div>
      <h1 className="account-title">Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
      <p className="account-sub">Here&rsquo;s an overview of your SANMISH account.</p>

      <div className="account-stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="account-stat-card">
            <b>{s.value}</b>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="account-section-block">
        <div className="account-block-head">
          <h3>Recent Orders</h3>
          <Link href="/account/orders">View all</Link>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" />
            </svg>
            <h3>No orders yet</h3>
            <p>Orders you place at checkout will show up here.</p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Products</Link>
          </div>
        ) : (
          <div className="account-order-list">
            {orders.slice(0, 3).map((order) => (
              <Link key={order.id} href={`/account/orders/${order.orderNumber}`} className="account-order-row">
                <div>
                  <b>{order.orderNumber}</b>
                  <span>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} &middot; {order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
                </div>
                <span className={`order-status status-${order.status}`}>{order.status}</span>
                <b className="account-order-amount">{inr(order.totalAmount)}</b>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
