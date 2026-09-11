"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { myOrders, type MyOrder } from "@/lib/api";

const inr = (n: number | string) => "₹ " + Number(n).toLocaleString("en-IN");

const STEPS: Record<string, number> = {
  pending: 0,
  approved: 1,
  processing: 2,
  shipped: 2,
  delivered: 3,
  completed: 3,
};
const STEP_LABELS = ["Pending Review", "Approved", "Processing", "Delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<MyOrder | null | undefined>(undefined);

  useEffect(() => {
    myOrders
      .get(id)
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [id]);

  if (order === undefined) {
    return <p className="account-sub">Loading…</p>;
  }

  if (!order) {
    return (
      <div className="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <h3>Order not found</h3>
        <p>This order may not exist, or may not belong to your account.</p>
        <Link href="/account/orders" className="btn btn-primary" style={{ marginTop: 20 }}>Back to Orders</Link>
      </div>
    );
  }

  const activeStep = STEPS[order.status] ?? 0;
  const address = order.shippingAddress;

  return (
    <div>
      <Link href="/account/orders" className="account-back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Orders
      </Link>

      <div className="account-block-head" style={{ marginTop: 18 }}>
        <h3>Order {order.orderNumber}</h3>
        <span className={`order-status status-${order.status}`}>{order.status}</span>
      </div>
      <p className="account-sub" style={{ marginTop: -8 }}>
        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="order-tracker">
        {STEP_LABELS.map((step, i) => (
          <div key={step} className={`order-tracker-step${i <= activeStep ? " done" : ""}`}>
            <span className="order-tracker-dot" />
            <span>{step}</span>
          </div>
        ))}
      </div>

      <div className="account-section-block">
        <h4 className="account-block-subtitle">Items</h4>
        <div className="checkout-items">
          {order.items.map((item) => (
            <div key={item.id} className="checkout-item-row">
              <div className="checkout-item-thumb" style={{ background: "var(--color-neutral-100)", borderRadius: 8, overflow: "hidden" }}>
                {item.product.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.product.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
              <div className="checkout-item-info">
                <b>{item.product.title}</b>
                <span>Qty {item.quantity}</span>
              </div>
              <span className="checkout-item-price">{inr(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <p className="cart-summary-line" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          Subtotal: <b>{inr(order.subtotal)}</b> &middot; GST: <b>{inr(order.gstAmount)}</b> &middot; Total: <b>{inr(order.totalAmount)}</b>
        </p>
      </div>

      {address && (
        <div className="account-section-block">
          <h4 className="account-block-subtitle">Delivery Address</h4>
          <div className="order-detail-grid">
            <div className="full">
              <span>Address</span>
              <b>{[address.line1, address.city, address.state].filter(Boolean).join(", ")}{address.pincode ? ` - ${address.pincode}` : ""}</b>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
