"use client";
import { useCallback, useEffect, useState } from "react";
import { productsApi, categoriesApi, vendorsApi, brandsApi, taxApi, downloadCsv, fileUrl, AdminApiError, type Paginated } from "@/lib/admin/api";
import { money, displayStatus } from "@/lib/admin/format";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import { ListToolbar, PaginationRow, BulkBar } from "@/components/admin/ListChrome";
import StatusTag from "@/components/admin/StatusTag";
import Icon from "@/components/admin/Icon";

// v2 Product: title (was name), mrp/sellingPrice (was price), gstApplicable/
// gstRate/priceIncludesGst (was gstPercent), priceSlabs (via separate PUT
// /:id/slabs, not the create/update body), fuelType, brandId, quoteOnly,
// fulfilment block, storefront flags, SEO fields. status is a lifecycle enum
// (DRAFT|PENDING|ACTIVE|REJECTED|OUT_OF_STOCK|QUOTE_ONLY|ARCHIVED), separate
// from the isActive visibility toggle. basePrice/gstAmount/grandTotal/
// discountPercent are server-computed on every read, never stored.
type Slab = { minQty: number; maxQty?: number | null; pricePerUnit?: number | null; requiresQuote?: boolean };
type Spec = { key: string; value: string };
type Product = Record<string, unknown> & {
  id: string; title?: string; status?: string; isActive?: boolean; stockQty?: number;
  mrp?: number; sellingPrice?: number; gstApplicable?: boolean; gstRate?: number; priceIncludesGst?: boolean;
  basePrice?: number; gstAmount?: number; grandTotal?: number; discountPercent?: number;
  quoteOnly?: boolean; isFeatured?: boolean; isTrending?: boolean; fuelType?: string;
  priceSlabs?: Slab[]; minOrderQty?: number; qtyStep?: number; maxOrderQty?: number; slabTailRequiresQuote?: boolean;
  trustBadges?: { label: string; icon: string }[] | null;
  category?: { id: string; name: string } | null;
  vendor?: { id: string; businessName: string } | null;
  brand?: { id: string; name: string } | null;
  images?: { id: string; url: string }[];
  documents?: { id: string; label?: string; type?: string; url?: string }[];
};

const TABS = [
  { key: "", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "ACTIVE", label: "Active" },
  { key: "REJECTED", label: "Rejected" },
  { key: "OUT_OF_STOCK", label: "Out of stock" },
  { key: "QUOTE_ONLY", label: "Quote only" },
  { key: "ARCHIVED", label: "Archived" },
];
const FUEL_TYPES = ["CNG", "CBG", "BIO_GAS", "HYDROGEN", "MULTI_FUEL"] as const;
const GST_RATES = [0, 5, 12, 18, 28];
const BADGE_OPTIONS = ["Bestseller", "New arrival", "Featured", "Trending", "Turnkey", "Certified"];
// Icon keys match the storefront's whitelisted TRUST_ICON_LIBRARY
// (components/ProductDetailView.tsx) — admins pick a key, never raw markup.
const TRUST_ICON_OPTIONS = [
  { key: "RETURN", label: "Return arrow" },
  { key: "ORIGINAL", label: "Ribbon" },
  { key: "PAYMENT", label: "Lock" },
  { key: "PROTECTION", label: "Shield" },
  { key: "BRAND", label: "Medal" },
  { key: "SHIPPING", label: "Delivery truck" },
  { key: "STAR", label: "Star" },
  { key: "CHECK", label: "Checkmark" },
];
const DEFAULT_TRUST_BADGES = [
  { label: "7 Days Return Policy", icon: "RETURN" },
  { label: "100% Original Products", icon: "ORIGINAL" },
  { label: "Secure Payments", icon: "PAYMENT" },
  { label: "100% Buyer Protection", icon: "PROTECTION" },
  { label: "Top Brands", icon: "BRAND" },
];

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
  title: "", sku: "", hsnCode: "", unit: "unit", fuelType: "CNG", categoryId: "", brandId: "", vendorId: "",
  shortDescription: "", description: "", specifications: [] as Spec[], quoteOnly: false,
  mrp: "", sellingPrice: "", gstApplicable: true, gstRate: "18", priceIncludesGst: false, gstInvoiceAvailable: true,
  minOrderQty: "1", qtyStep: "1", maxOrderQty: "", slabTailRequiresQuote: false, priceSlabs: [] as Slab[],
  leadTimeText: "", freeShippingEligible: false, freeShippingNote: "", shippedBy: "", codAvailable: false,
  returnWindowDays: "0", grossWeightKg: "", dimL: "", dimW: "", dimH: "", warrantyText: "",
  installationOffered: false, amcAvailable: false, badges: "", ribbonTextOverride: "", isFeatured: false, isTrending: false,
  metaTitle: "", metaDescription: "", metaKeywords: "", canonicalUrl: "",
  trustBadges: null as { label: string; icon: string }[] | null,
});

export default function AdminProductsPage() {
  const qs = useQueryState();
  const toast = useAdminToast();
  const [items, setItems] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Paginated<Product>["meta"] | null>(null);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [vendors, setVendors] = useState<Record<string, unknown>[]>([]);
  const [brands, setBrands] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [hsnLookupMsg, setHsnLookupMsg] = useState("");
  const [pendingImages, setPendingImages] = useState<File[]>([]);

  const [importVendor, setImportVendor] = useState("");
  const [importCategory, setImportCategory] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ created: number; failed: number; errors: { row: number; error: string }[] } | null>(null);
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [bulkPriceMode, setBulkPriceMode] = useState<"PERCENT" | "ABSOLUTE">("PERCENT");
  const [bulkPriceValue, setBulkPriceValue] = useState("");
  const [bulkPriceApplyTo, setBulkPriceApplyTo] = useState<"MRP" | "SELLING">("SELLING");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    productsApi
      .list({ page: qs.page, limit: 20, search: qs.search || undefined, status: showDeleted ? undefined : qs.tab || undefined, deletedOnly: showDeleted || undefined })
      .then((r) => { setItems(r.data as Product[]); setMeta(r.meta); })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load products."))
      .finally(() => setLoading(false));
  }, [qs.page, qs.search, qs.tab, showDeleted]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    categoriesApi.flat({ limit: 100 }).then((r) => setCategories(r.data)).catch(() => {});
    vendorsApi.list({ limit: 100 }).then((r) => setVendors(r.data as Record<string, unknown>[])).catch(() => {});
    brandsApi.list({ limit: 100 }).then((r) => setBrands(r.data as Record<string, unknown>[])).catch(() => {});
  }, []);

  const toggleSelect = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const clearSelection = () => setSelected([]);

  const handleUploadImages = (files: FileList | null) => {
    if (!editing || !files || files.length === 0) return;
    runOnEditing(() => productsApi.uploadImages(editing.id, Array.from(files)), "Images uploaded.");
  };

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      toast.success(successMsg);
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  // Actions taken from inside the editor (activate/reject/remove image, etc.)
  // refresh `editing` in place so the same page reflects the new status/images
  // without kicking the admin back out to the list.
  const runOnEditing = async (fn: () => Promise<unknown>, successMsg: string) => {
    if (!editing) return;
    try {
      await fn();
      toast.success(successMsg);
      const fresh = await productsApi.get(editing.id);
      setEditing(fresh as Product);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setHsnLookupMsg("");
    setPendingImages([]);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      ...emptyForm(),
      title: String(p.title ?? ""), sku: String(p.sku ?? ""), hsnCode: String(p.hsnCode ?? ""), unit: String(p.unit ?? "unit"),
      fuelType: String(p.fuelType ?? "CNG"), categoryId: String(p.category?.id ?? ""), brandId: String(p.brand?.id ?? ""),
      vendorId: String(p.vendor?.id ?? ""), shortDescription: String(p.shortDescription ?? ""), description: String(p.description ?? ""),
      specifications: Array.isArray(p.specifications) ? (p.specifications as Spec[]) : [], quoteOnly: Boolean(p.quoteOnly),
      mrp: p.mrp != null ? String(p.mrp) : "", sellingPrice: p.sellingPrice != null ? String(p.sellingPrice) : "",
      gstApplicable: p.gstApplicable !== false, gstRate: String(p.gstRate ?? 18), priceIncludesGst: Boolean(p.priceIncludesGst),
      gstInvoiceAvailable: p.gstInvoiceAvailable !== false,
      minOrderQty: String(p.minOrderQty ?? 1), qtyStep: String(p.qtyStep ?? 1), maxOrderQty: p.maxOrderQty != null ? String(p.maxOrderQty) : "",
      slabTailRequiresQuote: Boolean(p.slabTailRequiresQuote), priceSlabs: Array.isArray(p.priceSlabs) ? p.priceSlabs : [],
      leadTimeText: String(p.leadTimeText ?? ""), freeShippingEligible: Boolean(p.freeShippingEligible), freeShippingNote: String(p.freeShippingNote ?? ""),
      shippedBy: String(p.shippedBy ?? ""), codAvailable: Boolean(p.codAvailable), returnWindowDays: String(p.returnWindowDays ?? 0),
      grossWeightKg: p.grossWeightKg != null ? String(p.grossWeightKg) : "",
      dimL: String((p.dimensionsCm as Record<string, unknown> | undefined)?.l ?? ""), dimW: String((p.dimensionsCm as Record<string, unknown> | undefined)?.w ?? ""), dimH: String((p.dimensionsCm as Record<string, unknown> | undefined)?.h ?? ""),
      warrantyText: String(p.warrantyText ?? ""), installationOffered: Boolean(p.installationOffered), amcAvailable: Boolean(p.amcAvailable),
      badges: Array.isArray(p.badges) ? (p.badges as string[]).join(", ") : "", ribbonTextOverride: String(p.ribbonTextOverride ?? ""),
      isFeatured: Boolean(p.isFeatured), isTrending: Boolean(p.isTrending),
      metaTitle: String(p.metaTitle ?? ""), metaDescription: String(p.metaDescription ?? ""), metaKeywords: String(p.metaKeywords ?? ""), canonicalUrl: String(p.canonicalUrl ?? ""),
      trustBadges: Array.isArray(p.trustBadges) ? (p.trustBadges as { label: string; icon: string }[]) : null,
    });
    setHsnLookupMsg("");
    setPendingImages([]);
    setFormOpen(true);
  };

  const openProduct = (p: Product) => {
    openEdit(p);
    productsApi.get(p.id).then((d) => openEdit(d as Product)).catch(() => {});
  };

  const handleHsnLookup = async () => {
    if (!form.hsnCode) return;
    try {
      const hsn = await taxApi.hsnLookup(form.hsnCode);
      setForm((f) => ({ ...f, gstRate: String(hsn.gstRate ?? f.gstRate) }));
      setHsnLookupMsg(`Found: ${String(hsn.description ?? "")} — GST ${hsn.gstRate}%`);
    } catch {
      setHsnLookupMsg("HSN code not found in the tax master.");
    }
  };

  const addSpec = () => setForm((f) => ({ ...f, specifications: [...f.specifications, { key: "", value: "" }] }));
  const updateSpec = (i: number, key: "key" | "value", val: string) =>
    setForm((f) => ({ ...f, specifications: f.specifications.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)) }));
  const removeSpec = (i: number) => setForm((f) => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }));

  const addSlab = () => setForm((f) => ({ ...f, priceSlabs: [...f.priceSlabs, { minQty: 0, maxQty: null, pricePerUnit: null, requiresQuote: false }] }));
  const updateSlab = (i: number, patch: Partial<Slab>) =>
    setForm((f) => ({ ...f, priceSlabs: f.priceSlabs.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  const removeSlab = (i: number) => setForm((f) => ({ ...f, priceSlabs: f.priceSlabs.filter((_, idx) => idx !== i) }));

  const addTrustBadge = () =>
    setForm((f) => ({ ...f, trustBadges: [...(f.trustBadges ?? []), { label: "", icon: "CHECK" }] }));
  const updateTrustBadge = (i: number, patch: Partial<{ label: string; icon: string }>) =>
    setForm((f) => ({ ...f, trustBadges: (f.trustBadges ?? []).map((b, idx) => (idx === i ? { ...b, ...patch } : b)) }));
  const removeTrustBadge = (i: number) =>
    setForm((f) => ({ ...f, trustBadges: (f.trustBadges ?? []).filter((_, idx) => idx !== i) }));

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
    title: form.title, sku: form.sku || undefined, hsnCode: form.hsnCode || undefined, unit: form.unit,
    fuelType: form.fuelType, categoryId: form.categoryId || undefined, brandId: form.brandId || undefined, vendorId: form.vendorId || undefined,
    shortDescription: form.shortDescription || undefined, description: form.description || undefined,
    specifications: form.specifications.filter((s) => s.key).length ? form.specifications.filter((s) => s.key) : undefined,
    quoteOnly: form.quoteOnly,
    mrp: form.mrp ? Number(form.mrp) : undefined, sellingPrice: form.quoteOnly ? undefined : Number(form.sellingPrice) || undefined,
    gstApplicable: form.gstApplicable, gstRate: form.gstApplicable ? Number(form.gstRate) : undefined,
    priceIncludesGst: form.priceIncludesGst, gstInvoiceAvailable: form.gstInvoiceAvailable,
    slabTailRequiresQuote: form.slabTailRequiresQuote,
    minOrderQty: Number(form.minOrderQty) || 1, qtyStep: Number(form.qtyStep) || 1, maxOrderQty: form.maxOrderQty ? Number(form.maxOrderQty) : undefined,
    leadTimeText: form.leadTimeText || undefined, freeShippingEligible: form.freeShippingEligible, freeShippingNote: form.freeShippingNote || undefined,
    shippedBy: form.shippedBy || undefined, codAvailable: form.codAvailable, returnWindowDays: Number(form.returnWindowDays) || 0,
    grossWeightKg: form.grossWeightKg ? Number(form.grossWeightKg) : undefined,
    dimensionsCm: (form.dimL || form.dimW || form.dimH) ? { l: Number(form.dimL) || 0, w: Number(form.dimW) || 0, h: Number(form.dimH) || 0 } : undefined,
    warrantyText: form.warrantyText || undefined, installationOffered: form.installationOffered, amcAvailable: form.amcAvailable,
    badges: form.badges.trim() ? form.badges.split(",").map((b) => b.trim()).filter(Boolean) : undefined,
    ribbonTextOverride: form.ribbonTextOverride || undefined, isFeatured: form.isFeatured, isTrending: form.isTrending,
    metaTitle: form.metaTitle || undefined, metaDescription: form.metaDescription || undefined,
    metaKeywords: form.metaKeywords || undefined, canonicalUrl: form.canonicalUrl || undefined,
    // Sent as an explicit value (never `undefined`) so choosing "use default"
    // (null) actually clears a previous customization instead of leaving it
    // in place — the same silent-no-op bug the price slabs save had.
    trustBadges: form.trustBadges,
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
      const saved = editing ? await productsApi.update(editing.id, body) : await productsApi.create(body);
      const id = String((saved as Product).id ?? editing?.id);
      {
        // Loaded slabs carry id/productId from GET; the PUT replaces the
        // whole set and only accepts these 4 fields, so strip the rest.
        // Always call this — including with an empty array — so removing
        // every slab in the form actually clears them server-side instead
        // of silently leaving the previously-saved slabs in place.
        const cleanSlabs = form.priceSlabs.map(({ minQty, maxQty, pricePerUnit, requiresQuote }) => ({
          minQty: Number(minQty),
          maxQty: maxQty === null || maxQty === undefined || (maxQty as unknown) === "" ? null : Number(maxQty),
          pricePerUnit: pricePerUnit === null || pricePerUnit === undefined || (pricePerUnit as unknown) === "" ? null : Number(pricePerUnit),
          requiresQuote: Boolean(requiresQuote),
        }));
        await productsApi.setSlabs(id, cleanSlabs, form.slabTailRequiresQuote);
      }
      if (pendingImages.length > 0) {
        await productsApi.uploadImages(id, pendingImages);
      }
      toast.success(editing ? "Product updated." : "Product created.");
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const toggleBadge = (b: string) => setForm((f) => ({
    ...f, badges: f.badges.split(",").map((x) => x.trim()).filter(Boolean).includes(b)
      ? f.badges.split(",").map((x) => x.trim()).filter((x) => x && x !== b).join(", ")
      : [...f.badges.split(",").map((x) => x.trim()).filter(Boolean), b].join(", "),
  }));

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    try {
      const res = await productsApi.bulkImport(importFile);
      setImportResult(res);
      toast.success(`Import finished — ${res.created} created, ${res.failed} failed.`);
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Import failed.");
    }
  };

  const handleBulkPrice = async () => {
    const value = Number(bulkPriceValue);
    if (!value) return;
    await runAction(
      () => productsApi.bulkPrice(selected, bulkPriceMode, value, bulkPriceApplyTo),
      `Price updated for ${selected.length} product(s).`
    );
    setBulkPriceOpen(false);
    setBulkPriceValue("");
    clearSelection();
  };

  const preview = gstPreview(Number(form.sellingPrice) || 0, form.gstApplicable, Number(form.gstRate) || 0, form.priceIncludesGst, Number(form.mrp) || 0);
  const activeBadges = form.badges.split(",").map((x) => x.trim()).filter(Boolean);

  if (formOpen) {
    return (
      <form onSubmit={handleSave} className="adm-list-block">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(false)}>← Back to products</button>
          {editing && <StatusTag status={displayStatus(editing.status)} />}
          <div style={{ flex: 1 }} />
          {editing && (
            <>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => runOnEditing(() => productsApi.activate(editing.id), "Product activated (visible).")}>Activate</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => runOnEditing(() => productsApi.deactivate(editing.id), "Product deactivated (hidden).")}>Deactivate</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => runOnEditing(() => productsApi.approve(editing.id), "Product approved.")}>Approve</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { const reason = window.prompt("Reason for rejecting this product?"); if (reason) runOnEditing(() => productsApi.reject(editing.id, reason), "Product rejected."); }}>Reject</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { if (confirm("Soft delete this product?")) runAction(() => productsApi.remove(editing.id), "Product soft deleted.").then(() => setFormOpen(false)); }}>Soft delete</button>
            </>
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
                <div className="field">
                  <label>HSN / SAC code *</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="input" required value={form.hsnCode} onChange={(e) => setForm({ ...form, hsnCode: e.target.value })} />
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleHsnLookup}>Lookup</button>
                  </div>
                  {hsnLookupMsg && <span style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>{hsnLookupMsg}</span>}
                </div>
                <div className="field"><label>Unit of sale *</label><input className="input" required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
              </div>
              <div className="adm-form-grid cols-3">
                <div className="field">
                  <label>Fuel type *</label>
                  <select className="input" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
                    {FUEL_TYPES.map((f) => <option key={f} value={f}>{f.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Category *</label>
                  <select className="input" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">— select —</option>
                    {categories.map((c) => <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Brand / OEM</label>
                  <select className="input" value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
                    <option value="">— select —</option>
                    {brands.map((b) => <option key={String(b.id)} value={String(b.id)}>{String(b.name)}</option>)}
                  </select>
                </div>
              </div>
              <div className="adm-form-grid cols-2">
                <div className="field">
                  <label>Seller / vendor *</label>
                  <select className="input" required value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}>
                    <option value="">— select —</option>
                    {vendors.map((v) => <option key={String(v.id)} value={String(v.id)}>{String(v.businessName ?? v.id)}</option>)}
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
                    <div style={{ fontSize: 13 }}>{form.gstInvoiceAvailable ? `Get GST invoice and save up to ${form.gstRate}% on business purchases.` : "GST invoice not offered on this listing."}</div>
                  </div>
                </>
              ) : (
                <div style={{ padding: "18px 22px", borderRadius: "var(--radius-md)", background: "var(--color-accent-200)", color: "var(--color-accent-800)", fontSize: 13.5, lineHeight: 1.55 }}>
                  The storefront will show <strong>Starting from On Request</strong> and replace Add to Cart with Request Quote. Volume slabs below are ignored while this is on — pricing is settled through the RFQ module instead.
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
                <textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What the equipment does, where it is used, what is included in the supply scope…" />
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
              <div className="card-kicker">Storefront</div>
              <h3 className="card-title" style={{ fontSize: 20 }}>Badges and placement</h3>
              <div className="field full">
                <label>Ribbon badges</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {BADGE_OPTIONS.map((b) => (
                    <label key={b} className="check" style={{ padding: "8px 14px", borderRadius: 999, background: "var(--color-neutral-200)" }}>
                      <input type="checkbox" checked={activeBadges.includes(b)} onChange={() => toggleBadge(b)} /> {b}
                    </label>
                  ))}
                </div>
              </div>
              <div className="field full">
                <label>Product page trust strip</label>
                <label className="check" style={{ display: "block", marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={form.trustBadges === null}
                    onChange={(e) => setForm({ ...form, trustBadges: e.target.checked ? null : DEFAULT_TRUST_BADGES.map((b) => ({ ...b })) })}
                  /> Use default (show all 5)
                </label>
                {form.trustBadges !== null && (
                  <>
                    <table className="table" style={{ marginBottom: 8 }}>
                      <thead>
                        <tr><th>Label</th><th>Icon</th><th /></tr>
                      </thead>
                      <tbody>
                        {form.trustBadges.map((b, i) => (
                          <tr key={i}>
                            <td>
                              <input
                                className="input"
                                style={{ padding: "7px 12px", fontSize: 13 }}
                                placeholder="e.g. Made in India"
                                value={b.label}
                                onChange={(e) => updateTrustBadge(i, { label: e.target.value })}
                              />
                            </td>
                            <td>
                              <select
                                className="input"
                                style={{ padding: "7px 12px", fontSize: 13 }}
                                value={b.icon}
                                onChange={(e) => updateTrustBadge(i, { icon: e.target.value })}
                              >
                                {TRUST_ICON_OPTIONS.map((o) => (
                                  <option key={o.key} value={o.key}>{o.label}</option>
                                ))}
                              </select>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeTrustBadge(i)}>Remove</button>
                            </td>
                          </tr>
                        ))}
                        {form.trustBadges.length === 0 && (
                          <tr><td colSpan={3} style={{ color: "var(--color-neutral-600)" }}>No badges — nothing shows in the trust strip on this product's page.</td></tr>
                        )}
                      </tbody>
                    </table>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addTrustBadge}>Add badge</button>
                  </>
                )}
              </div>
              <div className="field full">
                <label>Homepage rail placement</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <label className="check" style={{ padding: "8px 14px", borderRadius: 999, background: "var(--color-neutral-200)" }}>
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Show in Featured rail
                  </label>
                  <label className="check" style={{ padding: "8px 14px", borderRadius: 999, background: "var(--color-neutral-200)" }}>
                    <input type="checkbox" checked={form.isTrending} onChange={(e) => setForm({ ...form, isTrending: e.target.checked })} /> Show in Trending rail
                  </label>
                </div>
              </div>
              <div className="field"><label>Ribbon text override</label><input className="input" placeholder="Bestseller" value={form.ribbonTextOverride} onChange={(e) => setForm({ ...form, ribbonTextOverride: e.target.value })} /></div>
            </div>

            <div className="card elev-sm adm-form-card">
              <div className="card-kicker">Media</div>
              <h3 className="card-title" style={{ fontSize: 20 }}>Gallery and documents</h3>
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
                          onClick={() => runOnEditing(() => productsApi.removeImage(editing.id, img.id), "Image removed.")}
                          aria-label="Remove image"
                        >
                          <Icon name="x" size={11} />
                        </button>
                      </div>
                    ))}
                    {(editing.images ?? []).length === 0 && <p style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>No images uploaded yet.</p>}
                  </div>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", alignSelf: "flex-start" }}>
                    Upload images
                    <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleUploadImages(e.target.files)} />
                  </label>
                  <p style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>Datasheet, certificate, test report uploads are managed once the product's own tools support them.</p>
                </>
              ) : (
                <>
                  <label htmlFor="prod-images" className="adm-dropzone" style={{ cursor: "pointer" }}>
                    <Icon name="upload" size={22} />
                    <span className="adm-dropzone-title">{pendingImages.length ? `${pendingImages.length} image(s) queued` : "Drop product images here — field images"}</span>
                  </label>
                  <input id="prod-images" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => setPendingImages(Array.from(e.target.files ?? []))} />
                  <p style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>Images upload once the listing is saved. Documents can be added after creation.</p>
                </>
              )}
            </div>

            <div className="card elev-sm adm-form-card">
              <div className="card-kicker">SEO</div>
              <h3 className="card-title" style={{ fontSize: 20 }}>Search listing</h3>
              <div className="field"><label>Meta title</label><input className="input" placeholder="High-Flow CNG Dispenser — Kirloskar Verified | SANMISH" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} /></div>
              <div className="field"><label>Meta description</label><textarea className="input" rows={3} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} /></div>
              <div className="field"><label>Keywords</label><input className="input" placeholder="CNG dispenser, high flow, gas equipment" value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })} /></div>
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

      <div className="adm-page-head">
        <div />
        <button type="button" className="btn btn-primary" onClick={openCreate}>New product</button>
      </div>

      <div className="card elev-sm adm-form-card">
        <div className="card-kicker">Bulk import</div>
        <h3 className="card-title" style={{ fontSize: 21 }}>Import products from CSV</h3>
        <form onSubmit={handleImport} className="adm-form-grid cols-2">
          <div className="field">
            <label>Default vendor</label>
            <select className="input" value={importVendor} onChange={(e) => setImportVendor(e.target.value)}>
              <option value="">— none —</option>
              {vendors.map((v) => <option key={String(v.id)} value={String(v.id)}>{String(v.businessName ?? v.id)}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Default category</label>
            <select className="input" value={importCategory} onChange={(e) => setImportCategory(e.target.value)}>
              <option value="">— none —</option>
              {categories.map((c) => <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}
            </select>
          </div>
          <div className="field full">
            <label htmlFor="csv-file" className="adm-dropzone" style={{ cursor: "pointer" }}>
              <Icon name="upload" size={26} />
              <span className="adm-dropzone-title">{importFile ? importFile.name : "Drop a CSV here, or browse"}</span>
              <span className="adm-dropzone-note">Uploaded as multipart/form-data, field name file</span>
            </label>
            <input id="csv-file" type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="field full" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button type="submit" className="btn btn-primary" disabled={!importFile}>Start import</button>
            <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/products/import-template")}>Download template</button>
          </div>
        </form>
        {importResult && (
          <div style={{ background: "var(--color-accent-2-200)", borderRadius: "var(--radius-md)", padding: "12px 16px", fontSize: 13.5 }}>
            Created {importResult.created} · Failed {importResult.failed}
            {importResult.errors[0] && <div style={{ marginTop: 4 }}>{importResult.errors[0].error}</div>}
          </div>
        )}
      </div>

      <div className="adm-tab-bar">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={qs.tab === t.key ? "active" : ""} onClick={() => qs.setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <ListToolbar
        search={qs.searchInput}
        onSearch={qs.onSearchInput}
        placeholder="Search products…"
        showDeleted={showDeleted}
        onShowDeletedChange={(v) => { setShowDeleted(v); clearSelection(); }}
      >
        <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/products/export")}>Export CSV</button>
      </ListToolbar>

      <BulkBar count={selected.length} onClear={clearSelection}>
        {showDeleted ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => Promise.all(selected.map((id) => productsApi.restore(id))), "Products restored.")}>Restore</button>
        ) : (
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => productsApi.bulkStatus(selected, "ACTIVE"), "Products activated.")}>Activate</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => productsApi.bulkStatus(selected, "ARCHIVED"), "Products archived.")}>Archive</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setBulkPriceOpen(true)}>Update price</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => runAction(() => productsApi.bulkDelete(selected), "Products deleted.")}>Delete</button>
          </>
        )}
      </BulkBar>

      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState onClear={qs.clearFilters} />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead>
              <tr>
                <th className="adm-checkbox-col"><input type="checkbox" checked={selected.length === items.length} onChange={(e) => setSelected(e.target.checked ? items.map((i) => i.id) : [])} /></th>
                <th>Product</th><th>Category</th><th>Vendor</th><th className="num">Stock</th><th className="num">Price</th><th>Status</th><th className="adm-open-col" />
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className={selected.includes(p.id) ? "selected" : ""}>
                  <td><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                  <td>{String(p.title ?? "—")}<span className="sub-line">{String(p.sku ?? "—")}</span></td>
                  <td>{p.category?.name ?? "—"}</td>
                  <td>{p.vendor?.businessName ?? "—"}</td>
                  <td className="num">{String(p.stockQty ?? 0)}</td>
                  <td className="num">{p.quoteOnly ? "Quote only" : money(Number(p.sellingPrice ?? 0))}</td>
                  <td><StatusTag status={displayStatus(p.status)} /></td>
                  <td>
                    {showDeleted ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => productsApi.restore(p.id), "Product restored.")}>Restore</button>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openProduct(p)}>Open</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationRow meta={meta} page={qs.page} onPrev={() => qs.setPage(qs.page - 1)} onNext={() => qs.setPage(qs.page + 1)} />

      {bulkPriceOpen && (
        <div className="dialog-backdrop" onClick={() => setBulkPriceOpen(false)}>
          <div className="dialog elev-lg" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">Update price for {selected.length} product(s)</div>
            <div className="dialog-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="field">
                <label>Apply to</label>
                <select className="input" value={bulkPriceApplyTo} onChange={(e) => setBulkPriceApplyTo(e.target.value as "MRP" | "SELLING")}>
                  <option value="SELLING">Selling price</option>
                  <option value="MRP">MRP</option>
                </select>
              </div>
              <div className="field">
                <label>Mode</label>
                <select className="input" value={bulkPriceMode} onChange={(e) => setBulkPriceMode(e.target.value as "PERCENT" | "ABSOLUTE")}>
                  <option value="PERCENT">Percentage</option>
                  <option value="ABSOLUTE">Flat amount (₹)</option>
                </select>
              </div>
              <div className="field">
                <label>{bulkPriceMode === "PERCENT" ? "Adjust by (%)" : "Adjust by (₹)"}</label>
                <input className="input" type="number" value={bulkPriceValue} onChange={(e) => setBulkPriceValue(e.target.value)} placeholder="e.g. 10 or -5" />
              </div>
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setBulkPriceOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleBulkPrice}>Update</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
