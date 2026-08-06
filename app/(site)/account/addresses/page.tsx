"use client";
import { useState } from "react";
import { useAddresses } from "@/lib/address-context";

export default function AddressesPage() {
  const { addresses, addAddress, removeAddress, setDefault } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    addAddress({ label, name, phone, line1, city, state, pin });
    setLabel(""); setName(""); setPhone(""); setLine1(""); setCity(""); setState(""); setPin("");
    setShowForm(false);
  };

  return (
    <div>
      <div className="account-block-head">
        <h1 className="account-title" style={{ marginBottom: 0 }}>Saved Addresses</h1>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Add New Address"}
        </button>
      </div>
      <p className="account-sub">Manage delivery addresses used at checkout.</p>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit} noValidate style={{ marginBottom: 28 }}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="addr-label">Label</label>
              <input id="addr-label" type="text" placeholder="e.g. Head Office, Warehouse" value={label} onChange={(e) => setLabel(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="addr-name">Contact Name</label>
              <input id="addr-name" type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="addr-phone">Phone</label>
              <input id="addr-phone" type="tel" placeholder="+91 90000 00000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="addr-pin">PIN Code</label>
              <input id="addr-pin" type="text" inputMode="numeric" pattern="[0-9]{6}" placeholder="6-digit PIN" value={pin} onChange={(e) => setPin(e.target.value)} required />
            </div>
            <div className="field full">
              <label htmlFor="addr-line1">Address</label>
              <textarea id="addr-line1" placeholder="Plot / street / area" value={line1} onChange={(e) => setLine1(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="addr-city">City</label>
              <input id="addr-city" type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="addr-state">State</label>
              <input id="addr-state" type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary form-submit" style={{ width: "100%" }}>Save Address</button>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <h3>No saved addresses</h3>
          <p>Add a delivery address to speed up checkout.</p>
        </div>
      ) : (
        <div className="address-grid">
          {addresses.map((addr) => (
            <div key={addr.id} className="address-card">
              {addr.isDefault && <span className="address-default-badge">Default</span>}
              <b>{addr.label}</b>
              <p>{addr.name}</p>
              <p>{addr.line1}, {addr.city}, {addr.state} - {addr.pin}</p>
              <p>+91 {addr.phone.replace(/^\+?91\s?/, "")}</p>
              <div className="address-actions">
                {!addr.isDefault && (
                  <button type="button" className="auth-linkbtn" style={{ margin: 0 }} onClick={() => setDefault(addr.id)}>
                    Set as default
                  </button>
                )}
                <button type="button" className="cart-remove" onClick={() => removeAddress(addr.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
