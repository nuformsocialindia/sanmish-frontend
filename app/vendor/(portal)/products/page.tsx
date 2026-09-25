"use client";
import { useCallback, useEffect, useState } from "react";
import { vendorProductsApi, vendorCategoriesApi, vendorBrandsApi, fileUrl, VendorApiError, type VendorProduct, type VendorPriceSlab } from "@/lib/vendor/api";
import { useVendorToast } from "@/components/vendor/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/vendor/ListStates";

type Slab = VendorPriceSlab;
type Spec = { key: string; value: string };

const FUEL_TYPES = ["CNG", "CBG", "BIO_GAS", "HYDROGEN", "MULTI_FUEL"] as const;
const GST_RATES = [0, 5, 12, 18, 28];

function money(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function gstPreview(sellingPrice: number, gstApplicable: boolean, gstRate: number, priceIncludesGst: boolean, mrp: number) {
  let basePrice = sellingPrice, gstAmount = 0;
  if (gstApplicable) {
    if (priceIncludesGst) { basePrice = sellingPrice / (1 + gstRate / 100); gstAmount = sellingPrice - basePrice; }
    else { gstAmount = (sellingPrice * gstRate) / 100; }
  }
  const grandTotal = gstApplicable && priceIncludesGst ? sellingPrice : sellingPrice + gstAmount;
  const discountPercent = mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100 * 100) / 100 : 0;
  return { basePrice, gstAmount, grandTotal, discountPercent };
}

const emptyForm = () => ({
  title: "", sku: "", hsnCode: "", unit: "unit", fuelType: "CNG" as (typeof FUEL_TYPES)[number], categoryId: "", brandId: "",
  shortDescription: "", description: "", specifications: [] as Spec[], quoteOnly: false,
  mrp: "", sellingPrice: "", gstApplicable: true, gstRate: "18", priceIncludesGst: false, gstInvoiceAvailable: true,
  minOrderQty: "1", qtyStep: "1", maxOrderQty: "", stockQty: "0", slabTailRequiresQuote: false, priceSlabs: [] as Slab[],
  leadTimeText: "", freeShippingEligible: false, freeShippingNote: "", shippedBy: "", codAvailable: false,
  returnWindowDays: "0", grossWeightKg: "", dimL: "", dimW: "", dimH: "", warrantyText: "",
  installationOffered: false, amcAvailable: false,
  metaTitle: "", metaDescription: "", metaKeywords: "", canonicalUrl: "",
});

export default function VendorProductsPage() {
  const toast = useVendorToast();
  const [items, setItems] = useState<VendorProduct[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryOptions, setCategoryOptions] = useState<{ id: string; name: string }[]>([]);
  const [brandOptions, setBrandOptions] = useState<{ id: string; name: string }[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<VendorProduct | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [pendingImages, setPendingImages] = useState<File[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    vendorProductsApi
      .list(search || undefined)
      .then(setItems)
      .catch((err) => setError(err instanceof VendorApiError ? err.message : "Could not load products."))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    vendorCategoriesApi.options().then(setCategoryOptions).catch(() => {});
    vendorBrandsApi.options().then(setBrandOptions).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setPendingImages([]);
    setFormOpen(true);
  };

  const openEdit = (p: VendorProduct) => {
    setEditing(p);
    setForm({
      ...emptyForm(),
      title: String(p.title ?? ""), sku: String(p.sku ?? ""), hsnCode: String(p.hsnCode ?? ""), unit: String(p.unit ?? "unit"),
      fuelType: (String(p.fuelType ?? "CNG") as (typeof FUEL_TYPES)[number]), categoryId: String(p.category?.id ?? ""), brandId: String((p.brand as { id?: string } | undefined)?.id ?? ""),
      shortDescription: String(p.shortDescription ?? ""), description: String(p.description ?? ""),
      specifications: Array.isArray(p.specifications) ? (p.specifications as Spec[]) : [], quoteOnly: Boolean(p.quoteOnly),
      mrp: p.mrp != null ? String(p.mrp) : "", sellingPrice: p.sellingPrice != null ? String(p.sellingPrice) : "",
      gstApplicable: p.gstApplicable !== false, gstRate: String(p.gstRate ?? 18), priceIncludesGst: Boolean(p.priceIncludesGst),
      gstInvoiceAvailable: p.gstInvoiceAvailable !== false,
      minOrderQty: String(p.minOrderQty ?? 1), qtyStep: String(p.qtyStep ?? 1), maxOrderQty: p.maxOrderQty != null ? String(p.maxOrderQty) : "",
      stockQty: String(p.stockQty ?? 0),
      slabTailRequiresQuote: Boolean(p.slabTailRequiresQuote), priceSlabs: Array.isArray(p.priceSlabs) ? (p.priceSlabs as Slab[]) : [],
      leadTimeText: String(p.leadTimeText ?? ""), freeShippingEligible: Boolean(p.freeShippingEligible), freeShippingNote: String(p.freeShippingNote ?? ""),
      shippedBy: String(p.shippedBy ?? ""), codAvailable: Boolean(p.codAvailable), returnWindowDays: String(p.returnWindowDays ?? 0),
      grossWeightKg: p.grossWeightKg != null ? String(p.grossWeightKg) : "",
      dimL: String((p.dimensionsCm as Record<string, unknown> | undefined)?.l ?? ""), dimW: String((p.dimensionsCm as Record<string, unknown> | undefined)?.w ?? ""), dimH: String((p.dimensionsCm as Record<string, unknown> | undefined)?.h ?? ""),
      warrantyText: String(p.warrantyText ?? ""), installationOffered: Boolean(p.installationOffered), amcAvailable: Boolean(p.amcAvailable),
      metaTitle: String(p.metaTitle ?? ""), metaDescription: String(p.metaDescription ?? ""), metaKeywords: String(p.metaKeywords ?? ""), canonicalUrl: String(p.canonicalUrl ?? ""),
    });
    setPendingImages([]);
    setFormOpen(true);
  };

  const addSpec = () => setForm((f) => ({ ...f, specifications: [...f.specifications, { key: "", value: "" }] }));
  const updateSpec = (i: number, key: "key" | "value", val: string) =>
    setForm((f) => ({ ...f, specifications: f.specifications.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)) }));
  const removeSpec = (i: number) => setForm((f) => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }));

  const addSlab = () => setForm((f) => ({ ...f, priceSlabs: [...f.priceSlabs, { minQty: 0, maxQty: null, pricePerUnit: null, requiresQuote: false }] }));
  const updateSlab = (i: number, patch: Partial<Slab>) =>
    setForm((f) => ({ ...f, priceSlabs: f.priceSlabs.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  const removeSlab = (i: number) => setForm((f) => ({ ...f, priceSlabs: f.priceSlabs.filter((_, idx) => idx !== i) }));

  const validateSlabs = (): string | null => {
    const slabs = form.priceSlabs;
    if (slabs.length === 0) return null;
    const moq = Number(form.minOrderQty) || 0;
    if (slabs[0].minQty !== moq) return `First slab must start at the minimum order qty (${moq}).`;
    for (let i = 0; i < slabs.length; i++) {
      const s = slabs[i];
      if (s.requiresQuote && s.pricePerUnit != null) return `Slab ${i + 1}: a quote-required slab must have no price per unit.`;
      if (!s.requiresQuote && s.pricePerUnit == null) return `Slab ${i + 1}: needs a price per unit, or mark it quote-required.`;
      if (i < slabs.length - 1) {
        if (s.maxQty == null) return `Slab ${i + 1}: only the last slab may have an open-ended max qty.`;
        const next = slabs[i + 1];
        if (next.minQty !== s.maxQty + 1) return `Slabs ${i + 1} and ${i + 2} aren't contiguous — expected slab ${i + 2} to start at ${s.maxQty + 1}.`;
        if (s.pricePerUnit != null && next.pricePerUnit != null && next.pricePerUnit > s.pricePerUnit) return `Slab ${i + 2}'s price must not be higher than slab ${i + 1}'s.`;
      }
    }
    return null;
  };

  const buildBody = () => ({
    title: form.title, sku: form.sku, hsnCode: form.hsnCode, unit: form.unit, fuelType: form.fuelType,
    categoryId: form.categoryId, brandId: form.brandId || undefined,
    shortDescription: form.shortDescription || undefined, description: form.description || undefined,
    specifications: form.specifications.filter((s) => s.key).length ? form.specifications.filter((s) => s.key) : undefined,
    quoteOnly: form.quoteOnly,
    mrp: form.mrp ? Number(form.mrp) : undefined, sellingPrice: form.quoteOnly ? undefined : Number(form.sellingPrice) || undefined,
    gstApplicable: form.gstApplicable, gstRate: form.gstApplicable ? Number(form.gstRate) : undefined,
    priceIncludesGst: form.priceIncludesGst, gstInvoiceAvailable: form.gstInvoiceAvailable,
    minOrderQty: Number(form.minOrderQty) || 1, qtyStep: Number(form.qtyStep) || 1, maxOrderQty: form.maxOrderQty ? Number(form.maxOrderQty) : undefined,
    stockQty: Number(form.stockQty) || 0,
    leadTimeText: form.leadTimeText || undefined, freeShippingEligible: form.freeShippingEligible, freeShippingNote: form.freeShippingNote || undefined,
    shippedBy: form.shippedBy || undefined, codAvailable: form.codAvailable, returnWindowDays: Number(form.returnWindowDays) || 0,
    grossWeightKg: form.grossWeightKg ? Number(form.grossWeightKg) : undefined,
    dimensionsCm: (form.dimL || form.dimW || form.dimH) ? { l: Number(form.dimL) || 0, w: Number(form.dimW) || 0, h: Number(form.dimH) || 0 } : undefined,
    warrantyText: form.warrantyText || undefined, installationOffered: form.installationOffered, amcAvailable: form.amcAvailable,
    metaTitle: form.metaTitle || undefined, metaDescription: form.metaDescription || undefined,
    metaKeywords: form.metaKeywords || undefined, canonicalUrl: form.canonicalUrl || undefined,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const slabError = validateSlabs();
    if (slabError) {
      toast.error(slabError);
      return;
    }
    setSaving(true);
    try {
      const body = buildBody();
      const saved = editing ? await vendorProductsApi.update(editing.id, body) : await vendorProductsApi.create(body);
      const id = String((saved as VendorProduct).id ?? editing?.id);
      if (form.priceSlabs.length > 0) {
        const cleanSlabs = form.priceSlabs.map(({ minQty, maxQty, pricePerUnit, requiresQuote }) => ({
          minQty: Number(minQty),
          maxQty: maxQty === null || maxQty === undefined || (maxQty as unknown) === "" ? null : Number(maxQty),
          pricePerUnit: pricePerUnit === null || pricePerUnit === undefined || (pricePerUnit as unknown) === "" ? null : Number(pricePerUnit),
          requiresQuote: Boolean(requiresQuote),
        }));
        await vendorProductsApi.setSlabs(id, cleanSlabs, form.slabTailRequiresQuote);
      }
      if (pendingImages.length > 0) {
        await vendorProductsApi.uploadImages(id, pendingImages);
      }
      toast.success(editing ? "Product updated." : "Product created — pending SANMISH approval.");
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof VendorApiError ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImages = async (files: FileList | null) => {
    if (!editing || !files || files.length === 0) return;
    try {
      await vendorProductsApi.uploadImages(editing.id, Array.from(files));
      toast.success("Images uploaded.");
      const fresh = await vendorProductsApi.get(editing.id);
      setEditing(fresh);
    } catch (err) {
      toast.error(err instanceof VendorApiError ? err.message : "Could not upload images.");
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    if (!editing) return;
    try {
      await vendorProductsApi.removeImage(editing.id, imageId);
      toast.success("Image removed.");
      const fresh = await vendorProductsApi.get(editing.id);
      setEditing(fresh);
    } catch (err) {
      toast.error(err instanceof VendorApiError ? err.message : "Could not remove image.");
    }
  };

  const handleDelete = async (p: VendorProduct): Promise<boolean> => {
    if (!confirm(`Delete "${p.title}"? It will be removed from your listings.`)) return false;
    try {
      await vendorProductsApi.remove(p.id);
      toast.success("Product deleted.");
      load();
      return true;
    } catch (err) {
      toast.error(err instanceof VendorApiError ? err.message : "Could not delete product.");
      return false;
    }
  };

  const preview = gstPreview(Number(form.sellingPrice) || 0, form.gstApplicable, Number(form.gstRate) || 0, form.priceIncludesGst, Number(form.mrp) || 0);

  if (formOpen) {
    return (
      <form onSubmit={handleSave} className="adm-list-block">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(false)}>← Back to products</button>
          {editing && <span className="tag tag-attention">{String(editing.status)}</span>}
          <div style={{ flex: 1 }} />
          {editing && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(editing).then((ok) => { if (ok) setFormOpen(false); })}>Delete</button>
          )}
          <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>Discard</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save listing"}</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 20, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div className="card elev-sm adm-form-card">
              <div className="card-kicker">Identity</div>
              <h3 className="card-title" style={{ fontSize: 21 }}>Listing and taxonomy</h3>
              <div className="field full"><label>Product title *</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="adm-form-grid cols-3">
                <div className="field"><label>SKU *</label><input className="input" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
                <div className="field"><label>HSN / SAC code *</label><input className="input" required value={form.hsnCode} onChange={(e) => setForm({ ...form, hsnCode: e.target.value })} /></div>
                <div className="field"><label>Unit of sale *</label><input className="input" required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
              </div>
              <div className="adm-form-grid cols-3">
                <div className="field">
                  <label>Fuel type *</label>
                  <select className="input" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value as (typeof FUEL_TYPES)[number] })}>
                    {FUEL_TYPES.map((f) => <option key={f} value={f}>{f.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Category *</label>
                  <select className="input" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">— select —</option>
                    {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Brand / OEM</label>
                  <select className="input" value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
                    <option value="">— select —</option>
                    {brandOptions.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card elev-sm adm-form-card">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div className="card-kicker">Pricing and tax</div>
                  <h3 className="card-title" style={{ fontSize: 21 }}>Price, GST and invoicing</h3>
                </div>
                <label className="check" style={{ padding: "9px 16px", borderRadius: 999, background: "var(--color-neutral-200)", whiteSpace: "nowrap" }}>
                  <input type="checkbox" checked={form.quoteOnly} onChange={(e) => setForm({ ...form, quoteOnly: e.target.checked })} />
                  Price on request only
                </label>
              </div>

              {!form.quoteOnly ? (
                <>
                  <div className="adm-form-grid cols-3">
                    <div className="field"><label>MRP / list price (₹) *</label><input className="input" type="number" required value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} /></div>
                    <div className="field"><label>Selling price (₹) *</label><input className="input" type="number" required value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} /></div>
                    <div className="field">
                      <label>GST rate</label>
                      <select className="input" value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: e.target.value })} disabled={!form.gstApplicable}>
                        {GST_RATES.map((r) => <option key={r} value={r}>{r === 0 ? "0% — exempt / nil-rated" : `${r}%`}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <label className="check" style={{ padding: "9px 16px", borderRadius: 999, background: "var(--color-neutral-200)" }}>
                      <input type="checkbox" checked={form.gstApplicable} onChange={(e) => setForm({ ...form, gstApplicable: e.target.checked })} />
                      GST applicable
                    </label>
                    <label className="check" style={{ padding: "9px 16px", borderRadius: 999, background: "var(--color-neutral-200)" }}>
                      <input type="checkbox" checked={form.priceIncludesGst} onChange={(e) => setForm({ ...form, priceIncludesGst: e.target.checked })} disabled={!form.gstApplicable} />
                      Selling price includes GST
                    </label>
                    <label className="check" style={{ padding: "9px 16px", borderRadius: 999, background: "var(--color-neutral-200)" }}>
                      <input type="checkbox" checked={form.gstInvoiceAvailable} onChange={(e) => setForm({ ...form, gstInvoiceAvailable: e.target.checked })} />
                      Offer GST invoice to businesses
                    </label>
                  </div>
                  <div style={{ padding: "20px 22px", borderRadius: "var(--radius-md)", background: "var(--color-accent-2-200)", color: "var(--color-accent-2-800)", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 11.5, letterSpacing: "0.07em", textTransform: "uppercase" }}>Storefront shows</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-heading)", fontSize: 26 }}>{money(preview.grandTotal)}</span>
                      <span style={{ fontSize: 13.5 }}>/ {form.unit}</span>
                      {preview.discountPercent > 0 && <span style={{ fontSize: 13.5, fontWeight: 600 }}>−{preview.discountPercent}% off MRP</span>}
                    </div>
                    <div style={{ fontSize: 13.5 }}>
                      {money(preview.basePrice)} + {money(preview.gstAmount)} GST ({form.gstApplicable ? form.gstRate : 0}%) · {form.gstApplicable && form.priceIncludesGst ? "Inclusive of all taxes" : "Exclusive of taxes — GST added at checkout"}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ padding: "18px 22px", borderRadius: "var(--radius-md)", background: "var(--color-accent-200)", color: "var(--color-accent-800)", fontSize: 13.5, lineHeight: 1.55 }}>
                  The storefront will show <strong>Starting from On Request</strong> and replace Add to Cart with Request Quote.
                </div>
              )}
            </div>

            <div className="card elev-sm adm-form-card">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div className="card-kicker">Volume pricing</div>
                  <h3 className="card-title" style={{ fontSize: 21 }}>Buy more, save more</h3>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addSlab}>Add slab</button>
              </div>
              <table className="table" style={{ width: "100%" }}>
                <thead><tr><th style={{ width: 100 }}>Min qty</th><th style={{ width: 150 }}>Max qty</th><th>Price / {form.unit} (₹)</th><th>Requires quote</th><th style={{ width: 70 }} /></tr></thead>
                <tbody>
                  {form.priceSlabs.map((s, i) => (
                    <tr key={i}>
                      <td><input className="input" style={{ padding: "7px 12px", fontSize: 13 }} type="number" value={s.minQty} onChange={(e) => updateSlab(i, { minQty: Number(e.target.value) })} /></td>
                      <td><input className="input" style={{ padding: "7px 12px", fontSize: 13 }} type="number" placeholder="open-ended" value={s.maxQty ?? ""} onChange={(e) => updateSlab(i, { maxQty: e.target.value ? Number(e.target.value) : null })} /></td>
                      <td><input className="input" style={{ padding: "7px 12px", fontSize: 13 }} type="number" disabled={Boolean(s.requiresQuote)} value={s.pricePerUnit ?? ""} onChange={(e) => updateSlab(i, { pricePerUnit: e.target.value ? Number(e.target.value) : null })} /></td>
                      <td><label className="check"><input type="checkbox" checked={Boolean(s.requiresQuote)} onChange={(e) => updateSlab(i, { requiresQuote: e.target.checked, pricePerUnit: e.target.checked ? null : s.pricePerUnit })} /></label></td>
                      <td style={{ textAlign: "right" }}><button type="button" className="btn btn-ghost btn-sm" onClick={() => removeSlab(i)}>Remove</button></td>
                    </tr>
                  ))}
                  {form.priceSlabs.length === 0 && <tr><td colSpan={5} style={{ color: "var(--color-neutral-600)" }}>No slabs — flat selling price applies at every quantity.</td></tr>}
                </tbody>
              </table>
              <label className="check" style={{ fontSize: 13.5 }}>
                <input type="checkbox" checked={form.slabTailRequiresQuote} onChange={(e) => setForm({ ...form, slabTailRequiresQuote: e.target.checked })} />
                Beyond the last slab, show “Request Quote for Bulk” instead of a price
              </label>
            </div>

            <div className="card elev-sm adm-form-card">
              <div className="card-kicker">Content</div>
              <h3 className="card-title" style={{ fontSize: 21 }}>Description and specifications</h3>
              <div className="field"><label>Short description</label><input className="input" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></div>
              <div className="field">
                <label>Description</label>
                <textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 12, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-neutral-600)", flex: 1 }}>Specification table</div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addSpec}>Add row</button>
              </div>
              {form.specifications.map((s, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr auto", gap: 10, alignItems: "center" }}>
                  <input className="input" style={{ padding: "8px 14px", fontSize: 13 }} placeholder="Attribute" value={s.key} onChange={(e) => updateSpec(i, "key", e.target.value)} />
                  <input className="input" style={{ padding: "8px 14px", fontSize: 13 }} placeholder="Value" value={s.value} onChange={(e) => updateSpec(i, "value", e.target.value)} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeSpec(i)}>Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div className="card elev-sm adm-form-card">
              <div className="card-kicker">Order rules</div>
              <h3 className="card-title" style={{ fontSize: 20 }}>Quantity and stock</h3>
              <div className="adm-form-grid cols-2">
                <div className="field"><label>Min order qty</label><input className="input" type="number" value={form.minOrderQty} onChange={(e) => setForm({ ...form, minOrderQty: e.target.value })} /></div>
                <div className="field"><label>Step qty</label><input className="input" type="number" value={form.qtyStep} onChange={(e) => setForm({ ...form, qtyStep: e.target.value })} /></div>
                <div className="field"><label>Max per order</label><input className="input" type="number" value={form.maxOrderQty} onChange={(e) => setForm({ ...form, maxOrderQty: e.target.value })} /></div>
                <div className="field"><label>Stock quantity</label><input className="input" type="number" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })} /></div>
              </div>
              <div className="field"><label>Lead time shown to buyers</label><input className="input" value={form.leadTimeText} onChange={(e) => setForm({ ...form, leadTimeText: e.target.value })} placeholder="7–14 business days" /></div>
            </div>

            <div className="card elev-sm adm-form-card">
              <div className="card-kicker">Fulfilment</div>
              <h3 className="card-title" style={{ fontSize: 20 }}>Shipping and returns</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label className="check"><input type="checkbox" checked={form.freeShippingEligible} onChange={(e) => setForm({ ...form, freeShippingEligible: e.target.checked })} /> Eligible for free shipping</label>
                <label className="check"><input type="checkbox" checked={form.codAvailable} onChange={(e) => setForm({ ...form, codAvailable: e.target.checked })} /> Cash on delivery allowed</label>
                <label className="check"><input type="checkbox" checked={form.installationOffered} onChange={(e) => setForm({ ...form, installationOffered: e.target.checked })} /> Installation and commissioning offered</label>
                <label className="check"><input type="checkbox" checked={form.amcAvailable} onChange={(e) => setForm({ ...form, amcAvailable: e.target.checked })} /> AMC available after warranty</label>
              </div>
              {form.freeShippingEligible && <div className="field"><label>Free shipping note</label><input className="input" value={form.freeShippingNote} onChange={(e) => setForm({ ...form, freeShippingNote: e.target.value })} /></div>}
              <div className="adm-form-grid cols-2">
                <div className="field"><label>Shipped by</label><input className="input" placeholder="SANMISH Fulfilment" value={form.shippedBy} onChange={(e) => setForm({ ...form, shippedBy: e.target.value })} /></div>
                <div className="field"><label>Return window (days)</label><input className="input" type="number" value={form.returnWindowDays} onChange={(e) => setForm({ ...form, returnWindowDays: e.target.value })} /></div>
                <div className="field"><label>Gross weight (kg)</label><input className="input" type="number" value={form.grossWeightKg} onChange={(e) => setForm({ ...form, grossWeightKg: e.target.value })} /></div>
                <div className="field"><label>Warranty</label><input className="input" placeholder="12 months" value={form.warrantyText} onChange={(e) => setForm({ ...form, warrantyText: e.target.value })} /></div>
              </div>
              <div className="field full">
                <label>Dimensions (cm)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" type="number" placeholder="L" value={form.dimL} onChange={(e) => setForm({ ...form, dimL: e.target.value })} />
                  <input className="input" type="number" placeholder="W" value={form.dimW} onChange={(e) => setForm({ ...form, dimW: e.target.value })} />
                  <input className="input" type="number" placeholder="H" value={form.dimH} onChange={(e) => setForm({ ...form, dimH: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="card elev-sm adm-form-card">
              <div className="card-kicker">Media</div>
              <h3 className="card-title" style={{ fontSize: 20 }}>Gallery</h3>
              {editing ? (
                <>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {(editing.images ?? []).map((img) => (
                      <div key={img.id} style={{ position: "relative", width: 72, height: 72 }}>
                        <img src={fileUrl(img.url)} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: "var(--radius-sm)" }} />
                        <button
                          type="button"
                          className="btn btn-icon btn-secondary"
                          style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22 }}
                          onClick={() => handleRemoveImage(img.id)}
                          aria-label="Remove image"
                        >×</button>
                      </div>
                    ))}
                    {(editing.images ?? []).length === 0 && <p style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>No images uploaded yet.</p>}
                  </div>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", alignSelf: "flex-start" }}>
                    Upload images
                    <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleUploadImages(e.target.files)} />
                  </label>
                </>
              ) : (
                <>
                  <label htmlFor="vnd-prod-images" className="adm-dropzone" style={{ cursor: "pointer" }}>
                    <span className="adm-dropzone-title">{pendingImages.length ? `${pendingImages.length} image(s) queued` : "Drop product images here"}</span>
                  </label>
                  <input id="vnd-prod-images" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => setPendingImages(Array.from(e.target.files ?? []))} />
                  <p style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>Images upload once the listing is saved.</p>
                </>
              )}
            </div>

            <div className="card elev-sm adm-form-card">
              <div className="card-kicker">SEO</div>
              <h3 className="card-title" style={{ fontSize: 20 }}>Search listing</h3>
              <div className="field"><label>Meta title</label><input className="input" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} /></div>
              <div className="field"><label>Meta description</label><textarea className="input" rows={3} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} /></div>
              <div className="field"><label>Keywords</label><input className="input" value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })} /></div>
              <div className="field"><label>Canonical URL</label><input className="input" value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} /></div>
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="adm-toolbar">
        <input className="input" placeholder="Search your products…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="adm-toolbar-spacer" />
        <button type="button" className="btn btn-primary" onClick={openCreate}>New product</button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState message="No products are listed under your vendor account yet — add your first one above." />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th className="num">Price</th><th className="num">Stock</th><th>Status</th><th className="adm-open-col" /></tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{String(p.title)}</td>
                  <td>{String(p.sku)}</td>
                  <td>{p.category?.name ?? "—"}</td>
                  <td className="num">{p.quoteOnly ? "On request" : p.sellingPrice != null ? `₹${p.sellingPrice}` : "—"}</td>
                  <td className="num">{p.stockQty}</td>
                  <td><span className={`tag ${p.isActive ? "tag-positive" : "tag-muted"}`}>{String(p.status)}</span></td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => { openEdit(p); vendorProductsApi.get(p.id).then(openEdit).catch(() => {}); }}>Edit</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
