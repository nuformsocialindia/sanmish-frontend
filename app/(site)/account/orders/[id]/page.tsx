"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrders } from "@/lib/orders-context";

const inr = (n: number) => "₹ " + n.toLocaleString("en-IN");

const STEPS = ["Pending Review", "Quote Sent", "Confirmed", "Delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getOrder } = useOrders();
  const order = getOrder(id);

  if (!order) {
    return (
      <div className="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <h3>Order not found</h3>
        <p>This order may have been placed on a different device or browser.</p>
        <Link href="/account/orders" className="btn btn-primary" style={{ marginTop: 20 }}>Back to Orders</Link>
      </div>
    );
  }

  const activeStep = STEPS.indexOf(order.status);

  return (
    <div>
      <Link href="/account/orders" className="account-back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Orders
      </Link>

      <div className="account-block-head" style={{ marginTop: 18 }}>
        <h3>Order {order.id}</h3>
        <span className={`order-status status-${order.status.replace(/\s+/g, "-").toLowerCase()}`}>{order.status}</span>
      </div>
      <p className="account-sub" style={{ marginTop: -8 }}>
        Placed on {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="order-tracker">
        {STEPS.map((step, i) => (
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
            <div key={item.slug} className="checkout-item-row">
              <div className="checkout-item-thumb" dangerouslySetInnerHTML={{ __html: item.icon }} />
              <div className="checkout-item-info">
                <b>{item.title}</b>
                <span>Qty {item.qty}</span>
              </div>
              <span className="checkout-item-price">{item.priceLabel}</span>
            </div>
          ))}
        </div>
        <p className="cart-summary-line" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          Subtotal: <b>{inr(order.subtotal)}</b>
        </p>
      </div>

      <div className="account-section-block">
        <h4 className="account-block-subtitle">Delivery &amp; Business Details</h4>
        <div className="order-detail-grid">
          <div><span>Company</span><b>{order.company}</b></div>
          <div><span>Contact Person</span><b>{order.contact}</b></div>
          <div><span>Phone</span><b>{order.phone}</b></div>
          <div><span>Email</span><b>{order.email}</b></div>
          <div className="full"><span>Address</span><b>{order.address}, {order.city}, {order.state} - {order.pin}</b></div>
        </div>
      </div>
    </div>
  );
}
