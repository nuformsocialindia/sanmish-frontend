"use client";
import { useState } from "react";
import { usePayments } from "@/lib/payment-context";

export default function PaymentsPage() {
  const { methods, addMethod, removeMethod, setDefault } = usePayments();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<"card" | "upi">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [upiId, setUpiId] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (type === "card") {
      const last4 = cardNumber.replace(/\D/g, "").slice(-4);
      addMethod({ type: "card", label: `Card ending ${last4}` });
      setCardNumber("");
    } else {
      addMethod({ type: "upi", label: upiId });
      setUpiId("");
    }
    setShowForm(false);
  };

  return (
    <div>
      <div className="account-block-head">
        <h1 className="account-title" style={{ marginBottom: 0 }}>Payment Methods</h1>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Add Payment Method"}
        </button>
      </div>
      <p className="account-sub">
        SANMISH works on an RFQ model — saved methods are used only once a supplier confirms final pricing.
      </p>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit} noValidate style={{ marginBottom: 28 }}>
          <div className="payment-type-toggle">
            <button type="button" className={type === "card" ? "active" : ""} onClick={() => setType("card")}>Card</button>
            <button type="button" className={type === "upi" ? "active" : ""} onClick={() => setType("upi")}>UPI</button>
          </div>
          {type === "card" ? (
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="pay-card">Card Number</label>
                <input
                  id="pay-card"
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  pattern="[0-9 ]{12,19}"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="pay-upi">UPI ID</label>
                <input id="pay-upi" type="text" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} required />
              </div>
            </div>
          )}
          <button type="submit" className="btn btn-primary form-submit" style={{ width: "100%" }}>Save Payment Method</button>
        </form>
      )}

      {methods.length === 0 && !showForm ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
          </svg>
          <h3>No payment methods saved</h3>
          <p>Add a card or UPI ID to have it ready for confirmed orders.</p>
        </div>
      ) : (
        <div className="address-grid">
          {methods.map((m) => (
            <div key={m.id} className="address-card">
              {m.isDefault && <span className="address-default-badge">Default</span>}
              <div className="payment-icon">
                {m.type === "card" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                )}
              </div>
              <b>{m.label}</b>
              <p>{m.type === "card" ? "Credit / Debit Card" : "UPI"}</p>
              <div className="address-actions">
                {!m.isDefault && (
                  <button type="button" className="auth-linkbtn" style={{ margin: 0 }} onClick={() => setDefault(m.id)}>
                    Set as default
                  </button>
                )}
                <button type="button" className="cart-remove" onClick={() => removeMethod(m.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
