"use client";
import { useEffect, useState } from "react";
import { pagesApi, AdminApiError } from "@/lib/admin/api";
import { useAdminToast } from "@/components/admin/Toast";
import { SECTION_ICON_KEYS, SECTION_ICON_LABELS, resolveSectionIcon } from "@/lib/sectionIcons";

export type SectionField =
  | { key: string; label: string; type: "text" | "textarea" | "number" }
  | { key: string; label: string; type: "tags" } // comma-separated -> string[]
  | { key: string; label: string; type: "icon" };

export type SectionItem = Record<string, unknown>;

// Looks up a CMS page by its synthetic section path. Paginates instead of
// trusting a single large `limit` — some backends cap the page size below
// what's requested, which would otherwise silently miss a match once enough
// CMS pages exist and cause every future save to retry `create()` and fail
// with "path already exists" forever.
async function findPageByPath(path: string): Promise<Record<string, unknown> | null> {
  const limit = 100;
  for (let page = 1; page <= 20; page++) {
    const res = await pagesApi.list({ limit, page });
    const data = (res.data ?? []) as Record<string, unknown>[];
    const found = data.find((p) => p.path === path);
    if (found) return found;
    if (data.length < limit) break;
  }
  return null;
}

// Generic add/edit/remove/reorder editor for one "section" — a repeatable
// list of content items (team members, stats, FAQ, etc.) stored as a JSON
// blob in a CMS page's bodyHtml at a synthetic path (see fetchApiSection in
// lib/publicApi.ts). One component + a field schema covers every section
// instead of hand-building a form per content type.
export default function SectionListEditor({
  path,
  title,
  fields,
  itemLabel = "item",
  defaultItems = [],
  singleton = false,
}: {
  path: string;
  title: string;
  fields: SectionField[];
  itemLabel?: string;
  defaultItems?: SectionItem[];
  // For content that's a single record (e.g. contact details) rather than a
  // repeatable list — stored the same way (a JSON array in bodyHtml) so it
  // reuses the same save/lookup machinery, but the UI hides add/remove/
  // reorder and is guaranteed to hold exactly one item.
  singleton?: boolean;
}) {
  const toast = useAdminToast();
  const [pageId, setPageId] = useState<string | null>(null);
  const [items, setItems] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    findPageByPath(path)
      .then((found) => {
        if (found) {
          setPageId(String(found.id));
          try {
            const parsed = JSON.parse(String(found.bodyHtml ?? "[]"));
            const arr = Array.isArray(parsed) ? parsed : [];
            setItems(singleton ? arr.slice(0, 1) : arr);
          } catch {
            setItems([]);
          }
        } else {
          setPageId(null);
          setItems(singleton ? defaultItems.slice(0, 1) : defaultItems);
        }
      })
      .catch(() => setItems(defaultItems))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const updateField = (index: number, key: string, value: unknown) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  };

  const addItem = () => {
    const blank: SectionItem = {};
    for (const f of fields) blank[f.key] = f.type === "tags" ? [] : f.type === "number" ? 0 : "";
    setItems((prev) => [...prev, blank]);
  };

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    const bodyHtml = JSON.stringify(items);
    try {
      if (pageId) {
        await pagesApi.update(pageId, { bodyHtml, status: "PUBLISHED" });
      } else {
        try {
          const created = await pagesApi.create({ title, path, group: "MARKETING", bodyHtml, status: "PUBLISHED" });
          setPageId(String((created as Record<string, unknown>).id));
        } catch (err) {
          // A page at this path can already exist (e.g. an earlier save created
          // it but this component's local pageId never got set — a stale
          // reopen, a double-click, or a lookup that missed it). Recover by
          // finding that page and updating it instead of failing forever.
          if (err instanceof AdminApiError && /already exists/i.test(err.message)) {
            const found = await findPageByPath(path);
            if (!found) throw err;
            const id = String(found.id);
            await pagesApi.update(id, { bodyHtml, status: "PUBLISHED" });
            setPageId(id);
          } else {
            throw err;
          }
        }
      }
      toast.success(`${title} saved.`);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save this section.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: "var(--color-neutral-600)" }}>Loading…</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map((item, i) => (
        <div key={i} className="card elev-sm" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {!singleton && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <b style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>{itemLabel} {i + 1}</b>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(i)}>Remove</button>
              </div>
            </div>
          )}
          <div className="adm-form-grid cols-2">
            {fields.map((f) => (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    className="input"
                    value={String(item[f.key] ?? "")}
                    onChange={(e) => updateField(i, f.key, e.target.value)}
                  />
                ) : f.type === "number" ? (
                  <input
                    className="input"
                    type="number"
                    value={Number(item[f.key] ?? 0)}
                    onChange={(e) => updateField(i, f.key, Number(e.target.value))}
                  />
                ) : f.type === "tags" ? (
                  <input
                    className="input"
                    placeholder="comma, separated, values"
                    value={Array.isArray(item[f.key]) ? (item[f.key] as string[]).join(", ") : ""}
                    onChange={(e) => updateField(i, f.key, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  />
                ) : f.type === "icon" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--color-brand-600, currentColor)" }} dangerouslySetInnerHTML={{ __html: resolveSectionIcon(String(item[f.key] ?? "")) }} />
                    <select className="input" value={String(item[f.key] ?? "")} onChange={(e) => updateField(i, f.key, e.target.value)}>
                      {SECTION_ICON_KEYS.map((opt) => <option key={opt} value={opt}>{SECTION_ICON_LABELS[opt] ?? opt}</option>)}
                    </select>
                  </div>
                ) : (
                  <input
                    className="input"
                    value={String(item[f.key] ?? "")}
                    onChange={(e) => updateField(i, f.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: 12 }}>
        {!singleton && <button type="button" className="btn btn-secondary" onClick={addItem}>+ Add {itemLabel}</button>}
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save section"}</button>
      </div>
    </div>
  );
}
