"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { myOrders, returns, ApiError, type MyOrder, type MyReturnRequest, type ReturnRequestType } from "@/lib/api";

const inr = (n: number | string) => "₹ " + Math.round(Number(n)).toLocaleString("en-IN");

const STEPS: Record<string, number> = {
  pending: 0,
  approved: 1,
  processing: 2,
  shipped: 2,
  delivered: 3,
  completed: 3,
};
const STEP_LABELS = ["Pending Review", "Approved", "Processing", "Delivered"];
const RETURN_ELIGIBLE_STATUSES = ["delivered", "completed"];

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
        <h4 className="account-block-subtitle">Items ({order.items.length})</h4>
        {order.placeOfSupply && (
          <p style={{ fontSize: ".85rem", color: "var(--muted)", marginBottom: 10 }}>
            Place of Supply: <b style={{ color: "var(--ink)" }}>{order.placeOfSupply}</b>
          </p>
        )}
        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Items</th>
                <th className="num">Quantity</th>
                <th className="num">Price per Unit</th>
                <th className="num">Tax per Unit</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product.title}</td>
                  <td className="num">{item.quantity}</td>
                  <td className="num">{inr(item.basePrice)}</td>
                  <td className="num">
                    {inr(item.gstAmount)}
                    {item.gstPercent != null && <span style={{ color: "var(--muted)" }}> ({Number(item.gstPercent)}%)</span>}
                  </td>
                  <td className="num">{inr(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="checkout-breakdown-row"><span>Subtotal</span><span>{inr(order.subtotal)}</span></div>
          <div className="checkout-breakdown-row">
            <span>
              GST
              {order.gstBreakup && (
                <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>
                  {" "}({order.gstBreakup.type === "IGST" ? "IGST" : "CGST + SGST"})
                </span>
              )}
            </span>
            <span>{inr(order.gstAmount)}</span>
          </div>
          <div className="checkout-breakdown-row total"><span>Total</span><span>{inr(order.totalAmount)}</span></div>
        </div>
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

      <ReturnExchangeSection order={order} />
    </div>
  );
}

function ReturnExchangeSection({ order }: { order: MyOrder }) {
  const [requests, setRequests] = useState<MyReturnRequest[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<ReturnRequestType>("RETURN");
  const [reason, setReason] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadRequests = () => {
    returns.list(order.orderNumber).then(setRequests).catch(() => setRequests([]));
  };

  useEffect(() => { loadRequests(); }, [order.orderNumber]);

  const eligible = RETURN_ELIGIBLE_STATUSES.includes(order.status);
  const toggleItem = (itemId: string, maxQty: number) => {
    setQuantities((q) => {
      const next = { ...q };
      if (next[itemId] != null) delete next[itemId];
      else next[itemId] = maxQty;
      return next;
    });
  };

  const submit = async () => {
    const items = Object.entries(quantities).map(([orderItemId, quantity]) => ({ orderItemId, quantity }));
    if (items.length === 0) { setError("Select at least one item."); return; }
    if (reason.trim().length < 10) { setError("Please describe the reason in a bit more detail (at least 10 characters)."); return; }
    setSubmitting(true);
    setError("");
    try {
      await returns.create({ orderNumber: order.orderNumber, type, reason: reason.trim(), items });
      setShowForm(false);
      setReason("");
      setQuantities({});
      loadRequests();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="account-section-block">
      <div className="account-block-head">
        <h4 className="account-block-subtitle" style={{ margin: 0 }}>Return / Exchange</h4>
        {eligible && !showForm && (
          <button type="button" className="btn btn-secondary" onClick={() => setShowForm(true)}>Request Return / Exchange</button>
        )}
      </div>

      {!eligible && (!requests || requests.length === 0) && (
        <p className="account-sub" style={{ marginTop: 4 }}>
          Returns and exchanges can be requested once this order has been delivered.
        </p>
      )}

      {requests && requests.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: showForm ? 20 : 0 }}>
          {requests.map((r) => (
            <div key={r.id} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b>{r.type === "EXCHANGE" ? "Exchange" : "Return"} request</b>
                <span className={`order-status status-${r.status.toLowerCase()}`}>{r.status.toLowerCase()}</span>
              </div>
              <p style={{ fontSize: ".85rem", color: "var(--muted)", margin: "6px 0 0" }}>
                {r.items.map((i) => `${i.orderItem.product.title} × ${i.quantity}`).join(", ")}
              </p>
              <p style={{ fontSize: ".85rem", margin: "6px 0 0" }}>{r.reason}</p>
              {r.adminNote && (
                <p style={{ fontSize: ".85rem", color: "var(--muted)", margin: "6px 0 0" }}>
                  <b style={{ color: "var(--ink)" }}>Note from seller: </b>{r.adminNote}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 20, marginTop: requests && requests.length > 0 ? 0 : 12 }}>
          <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="radio" name="return-type" checked={type === "RETURN"} onChange={() => setType("RETURN")} /> Return
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="radio" name="return-type" checked={type === "EXCHANGE"} onChange={() => setType("EXCHANGE")} /> Exchange
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {order.items.map((item) => (
              <label key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={quantities[item.id] != null}
                  onChange={() => toggleItem(item.id, item.quantity)}
                />
                <span style={{ flex: 1 }}>{item.product.title}</span>
                {quantities[item.id] != null && (
                  <input
                    type="number"
                    min={1}
                    max={item.quantity}
                    value={quantities[item.id]}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(item.quantity, Number(e.target.value) || 1));
                      setQuantities((q) => ({ ...q, [item.id]: v }));
                    }}
                    style={{ width: 60 }}
                    className="input"
                  />
                )}
                <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>of {item.quantity}</span>
              </label>
            ))}
          </div>

          <textarea
            className="input"
            rows={3}
            placeholder="Tell us why you'd like to return or exchange this…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: "100%", marginBottom: 12 }}
          />

          {error && <p style={{ color: "#b91c1c", fontSize: ".85rem", marginBottom: 12 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-primary" disabled={submitting} onClick={submit}>
              {submitting ? "Submitting…" : "Submit request"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setError(""); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
