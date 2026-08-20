"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { categoriesApi, downloadCsv, AdminApiError } from "@/lib/admin/api";
import { useAdminToast } from "@/components/admin/Toast";
import { useAdminAuth } from "@/lib/admin/auth-context";
import { ErrorBanner } from "@/components/admin/ListStates";
import Drawer, { FieldGrid, Field, NotesThread } from "@/components/admin/Drawer";
import Icon from "@/components/admin/Icon";

const FUEL_TYPES = ["CNG", "CBG", "BIO_GAS", "HYDROGEN", "MULTI_FUEL"] as const;

type Category = Record<string, unknown> & {
  id: string; name?: string; isActive?: boolean; priority?: number; fuelType?: string | null; children?: Category[];
  _count?: { products?: number };
  notes?: Record<string, unknown>[];
};
type Row = { category: Category; depth: number; rootId: string };

function flatten(nodes: Category[], depth = 0, rootId = ""): Row[] {
  const rows: Row[] = [];
  for (const n of nodes) {
    const rid = depth === 0 ? n.id : rootId;
    rows.push({ category: n, depth, rootId: rid });
    if (Array.isArray(n.children) && n.children.length > 0) rows.push(...flatten(n.children, depth + 1, rid));
  }
  return rows;
}

function flattenForOptions(nodes: Category[], depth = 0): { id: string; label: string }[] {
  const rows: { id: string; label: string }[] = [];
  for (const n of nodes) {
    rows.push({ id: n.id, label: `${"— ".repeat(depth)}${n.name}` });
    if (Array.isArray(n.children) && n.children.length > 0) rows.push(...flattenForOptions(n.children, depth + 1));
  }
  return rows;
}

export default function AdminCategoriesPage() {
  const toast = useAdminToast();
  const { admin } = useAdminAuth();
  const [tree, setTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [parentId, setParentId] = useState("");
  const [priority, setPriority] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<{ category: Category; depth: number } | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [note, setNote] = useState("");

  const dragId = useRef<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    categoriesApi
      .tree(showDeleted ? { deletedOnly: true } : undefined)
      .then((data) => setTree(data as Category[]))
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load categories."))
      .finally(() => setLoading(false));
  }, [showDeleted]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setName(""); setDescription(""); setMetaTitle(""); setMetaDescription(""); setFuelType(""); setParentId(""); setPriority(""); setImageFile(null);
  };

  const openEdit = (c: Category) => {
    setDetail(null);
    setEditing(c);
    setName(String(c.name ?? "")); setDescription(String(c.description ?? ""));
    setMetaTitle(String(c.metaTitle ?? "")); setMetaDescription(String(c.metaDescription ?? ""));
    setFuelType(String(c.fuelType ?? ""));
    setParentId(String(c.parentId ?? "")); setPriority(String(c.priority ?? "")); setImageFile(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openDrawer = (c: Category, depth: number) => {
    setDetail({ category: c, depth });
    setDrawerTab("overview");
    categoriesApi.get(c.id).then((full) => setDetail({ category: full as Category, depth })).catch(() => {});
  };

  const runAction = async (fn: () => Promise<unknown>, successMsg: string, keepOpen = false) => {
    try {
      await fn();
      toast.success(successMsg);
      load();
      if (keepOpen && detail) openDrawer(detail.category, detail.depth);
      else setDetail(null);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append("name", name);
    if (description) fd.append("description", description);
    if (metaTitle) fd.append("metaTitle", metaTitle);
    if (metaDescription) fd.append("metaDescription", metaDescription);
    if (fuelType) fd.append("fuelType", fuelType);
    if (parentId) fd.append("parentId", parentId);
    if (priority) fd.append("priority", priority);
    if (imageFile) fd.append("image", imageFile);
    try {
      if (editing) { await categoriesApi.update(editing.id, fd); toast.success("Category updated."); }
      else { await categoriesApi.create(fd); toast.success("Category created."); }
      setEditing(null);
      setName(""); setDescription(""); setMetaTitle(""); setMetaDescription(""); setFuelType(""); setParentId(""); setPriority(""); setImageFile(null);
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = async (targetId: string, rootId: string) => {
    const draggedId = dragId.current;
    dragId.current = null;
    if (!draggedId || draggedId === targetId) return;
    const siblings = flatten(tree).filter((r) => r.rootId === rootId && r.depth === flatten(tree).find((x) => x.category.id === targetId)?.depth);
    const ids = siblings.map((s) => s.category.id);
    const from = ids.indexOf(draggedId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    const items = ids.map((id, i) => ({ id, priority: i }));
    const prevTree = tree;
    try {
      await categoriesApi.reorder(items);
      toast.success("Category order updated.");
      load();
    } catch (err) {
      setTree(prevTree);
      toast.error(err instanceof AdminApiError ? err.message : "Could not reorder categories.");
    }
  };

  const rows = flatten(tree);
  const parentOptions = flattenForOptions(tree);

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="adm-page-head">
        <div />
        <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/categories/export")}>Export CSV</button>
      </div>

      <div className="card elev-sm adm-form-card" ref={formRef}>
        <div className="card-kicker">Catalogue</div>
        <h3 className="card-title" style={{ fontSize: 21 }}>Create or edit a category</h3>
        <form onSubmit={handleSave} className="adm-form-grid cols-3">
          <div className="field full"><label>Name *</label><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field">
            <label>Parent category</label>
            <select className="input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">None (top-level)</option>
              {parentOptions.filter((o) => o.id !== editing?.id).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <div className="field"><label>Priority</label><input className="input" type="number" value={priority} onChange={(e) => setPriority(e.target.value)} /></div>
          <div className="field">
            <label>Fuel type (root/fuel-family categories only)</label>
            <select className="input" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
              <option value="">— none —</option>
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div className="field"><label>Meta title</label><input className="input" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} /></div>
          <div className="field"><label>Meta description</label><input className="input" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} /></div>
          <div className="field full"><label>Description</label><textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="field"><label>Image</label><input className="input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} /></div>
          <div className="field full">
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: "flex-start" }}>
              {saving ? "Saving…" : editing ? "Save changes" : "Save category"}
            </button>
            {editing && <button type="button" className="btn btn-ghost" onClick={openCreate}>Cancel edit</button>}
          </div>
        </form>
      </div>

      <div className="card elev-sm adm-tree-card">
        <div className="adm-chart-head">
          <div>
            <div className="card-kicker">Tree view</div>
            <div className="adm-chart-title" style={{ fontSize: 21 }}>Category hierarchy</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <label className="check" style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
              <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
              Show deleted
            </label>
            {!showDeleted && <span style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>Drag a row to reorder — sends PATCH /reorder</span>}
          </div>
        </div>

        {loading ? (
          <p style={{ color: "var(--color-neutral-600)" }}>Loading categories…</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "var(--color-neutral-600)" }}>No categories yet.</p>
        ) : (
          rows.map(({ category: c, depth, rootId }) => (
            <div
              key={c.id}
              className={`adm-tree-row ${depth === 0 ? "root" : "child"}`}
              style={{ marginLeft: depth * 32 }}
              draggable={!showDeleted}
              onDragStart={() => { dragId.current = c.id; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(c.id, rootId)}
            >
              <span className="grip"><Icon name="grip-vertical" size={16} /></span>
              <span className="adm-tree-row-name">{String(c.name ?? "—")}</span>
              {c.fuelType && <span className="tag tag-accent-2">{String(c.fuelType).replace(/_/g, " ")}</span>}
              <span className="adm-tree-row-count">{c._count?.products ?? 0} products</span>
              <span className="tag tag-outline">priority {c.priority ?? 0}</span>
              <span className={`tag ${c.isActive ? "tag-positive" : "tag-muted"}`}>{c.isActive ? "active" : "inactive"}</span>
              {showDeleted ? (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => categoriesApi.restore(c.id), "Category restored.")}>Restore</button>
              ) : (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => openDrawer(c, depth)}>Edit</button>
              )}
            </div>
          ))
        )}
      </div>

      {detail && (
        <Drawer
          kicker="Category management"
          title={String(detail.category.name ?? "Category")}
          subtitle={`Depth: ${detail.depth} · Priority: ${detail.category.priority ?? 0}`}
          status={detail.category.isActive ? "Active" : "Inactive"}
          tabs={[{ key: "overview", label: "Overview" }, { key: "activity", label: "Activity" }]}
          activeTab={drawerTab}
          onTabChange={setDrawerTab}
          onClose={() => setDetail(null)}
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={() => openEdit(detail.category)}>Edit</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => (detail.category.isActive
                  ? runAction(() => categoriesApi.deactivate(detail.category.id), "Category deactivated.")
                  : runAction(() => categoriesApi.activate(detail.category.id), "Category activated."))}
              >
                {detail.category.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { if (confirm(`Soft delete "${detail.category.name}"?`)) runAction(() => categoriesApi.remove(detail.category.id), "Category soft deleted."); }}
              >
                Soft delete
              </button>
              {admin?.role === "SUPER_ADMIN" && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { if (confirm(`Permanently delete "${detail.category.name}"? This cannot be undone.`)) runAction(() => categoriesApi.hardDelete(detail.category.id), "Category permanently deleted."); }}
                >
                  Delete permanently
                </button>
              )}
            </>
          }
        >
          {drawerTab === "overview" ? (
            <>
              <FieldGrid>
                <Field label="Category" value={String(detail.category.name ?? "—")} />
                <Field label="Depth" value={String(detail.depth)} />
                <Field label="Fuel type" value={detail.category.fuelType ? String(detail.category.fuelType).replace(/_/g, " ") : "—"} />
                <Field label="Priority" value={String(detail.category.priority ?? 0)} />
                <Field label="Products" value={String(detail.category._count?.products ?? 0)} />
                <Field label="Status" value={detail.category.isActive ? "Active" : "Inactive"} />
              </FieldGrid>
              <NotesThread
                notes={detail.category.notes ?? []}
                draft={note}
                onDraftChange={setNote}
                onAdd={() => runAction(() => categoriesApi.addNote(detail.category.id, note), "Note added.", true).then(() => setNote(""))}
              />
            </>
          ) : (
            <p style={{ fontSize: 13.5, color: "var(--color-neutral-600)" }}>
              There's no activity log for categories yet — the backend doesn't expose a per-category audit trail.
            </p>
          )}
        </Drawer>
      )}
    </div>
  );
}
