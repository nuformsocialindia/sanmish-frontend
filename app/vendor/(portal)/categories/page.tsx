"use client";
import { useCallback, useEffect, useState } from "react";
import { vendorCategoriesApi, VendorApiError } from "@/lib/vendor/api";
import { useVendorToast } from "@/components/vendor/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/vendor/ListStates";

type Category = { id: string; name: string; slug: string; imageUrl?: string | null; _count: { products: number } };

const FUEL_TYPES = ["", "CNG", "CBG", "BIO_GAS", "HYDROGEN", "MULTI_FUEL"] as const;

export default function VendorCategoriesPage() {
  const toast = useVendorToast();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [fuelType, setFuelType] = useState<(typeof FUEL_TYPES)[number]>("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("0");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    vendorCategoriesApi
      .list()
      .then(setItems)
      .catch((err) => setError(err instanceof VendorApiError ? err.message : "Could not load categories."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await vendorCategoriesApi.create({
        name,
        fuelType: fuelType || undefined,
        description: description || undefined,
        priority: priority ? Number(priority) : undefined,
      });
      toast.success("Category created — now visible to every vendor and customer.");
      setCreating(false);
      setName(""); setFuelType(""); setDescription(""); setPriority("0");
      load();
    } catch (err) {
      toast.error(err instanceof VendorApiError ? err.message : "Could not create category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="adm-toolbar">
        <span style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>
          New categories are shared marketplace-wide — every vendor and customer will see them.
        </span>
        <div className="adm-toolbar-spacer" />
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>New category</button>
      </div>

      {loading ? (
        <TableSkeleton columns={2} />
      ) : items.length === 0 ? (
        <EmptyState message="None of your products are categorised yet." />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Category</th><th className="num">Your products in this category</th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td className="num">{c._count.products}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <div className="dialog-backdrop" onClick={() => setCreating(false)}>
          <div className="dialog elev-lg" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">New category</div>
            <form onSubmit={handleCreate}>
              <div className="adm-form-grid cols-2">
                <div className="field full"><label>Name *</label><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="field">
                  <label>Fuel type</label>
                  <select className="input" value={fuelType} onChange={(e) => setFuelType(e.target.value as (typeof FUEL_TYPES)[number])}>
                    <option value="">— none —</option>
                    {FUEL_TYPES.filter(Boolean).map((f) => <option key={f} value={f}>{f.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="field"><label>Priority</label><input className="input" type="number" value={priority} onChange={(e) => setPriority(e.target.value)} /></div>
                <div className="field full"><label>Description</label><textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
              </div>
              <div className="dialog-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating…" : "Create category"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
