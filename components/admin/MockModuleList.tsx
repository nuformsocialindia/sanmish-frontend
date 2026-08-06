"use client";
import { useState } from "react";
import { useAdminToast } from "@/components/admin/Toast";
import { EmptyState } from "@/components/admin/ListStates";
import StatusTag from "@/components/admin/StatusTag";
import Drawer, { FieldGrid, Field } from "@/components/admin/Drawer";
import Icon from "@/components/admin/Icon";
import { money } from "@/lib/admin/format";

// Shared shell for the modules that don't have a real backend yet (Brands,
// Merchandising, Coupons, Reviews, Services, Pages, Enquiries, Tax,
// Shipping). Renders the same list+drawer pattern as the wired-up modules,
// but every mutating action is a toast saying so instead of a fetch — so
// nothing here silently pretends to save. Swap a module over to real data
// by replacing its page.tsx with a page like categories/vendors once the
// backend for it exists; this component is not meant to survive that.
export type MockColumn = { label: string; align?: "left" | "right"; money?: boolean };
export type MockTab = { key: string; label: string };

export default function MockModuleList({
  moduleLabel, columns, rows, tabs, searchPlaceholder, newLabel = "New",
}: {
  moduleLabel: string;
  columns: MockColumn[];
  rows: (string | number)[][];
  tabs?: MockTab[];
  searchPlaceholder?: string;
  newLabel?: string;
}) {
  const toast = useAdminToast();
  const [tab, setTab] = useState(tabs?.[0]?.key ?? "");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<(string | number)[] | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const notWired = (verb: string) => toast.error(`${verb} isn't wired to a backend yet — this module is UI-only until the API is ready.`);

  let filtered = rows;
  if (tabs && tab) {
    filtered = filtered.filter((r) => String(r[r.length - 1]) === tab);
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((r) => r.join(" ").toLowerCase().includes(q));
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  const openDetail = (r: (string | number)[]) => {
    setDetail(r);
    setDrawerTab("overview");
  };

  return (
    <div className="adm-list-block">
      {tabs && (
        <div className="adm-tab-bar">
          {tabs.map((t) => (
            <button key={t.key} type="button" className={tab === t.key ? "active" : ""} onClick={() => { setTab(t.key); setPage(1); }}>{t.label}</button>
          ))}
        </div>
      )}

      <div className="adm-toolbar">
        <div className="adm-search-wrap">
          <Icon name="search" size={18} />
          <input className="input" placeholder={searchPlaceholder ?? `Search ${moduleLabel.toLowerCase()}…`} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="adm-toolbar-spacer" />
        <button type="button" className="btn btn-secondary" onClick={() => notWired("Export")}>Export CSV</button>
        <button type="button" className="btn btn-primary" onClick={() => notWired("Create")}>{newLabel}</button>
      </div>

      {pageRows.length === 0 ? (
        <EmptyState onClear={() => { setSearch(""); setTab(tabs?.[0]?.key ?? ""); setPage(1); }} />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c.label} className={c.align === "right" ? "num" : undefined}>{c.label}</th>)}
                <th className="adm-open-col" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => (
                <tr key={i}>
                  {r.map((v, j) => {
                    const col = columns[j];
                    const isStatusCol = j === r.length - 1 && typeof v === "string";
                    if (isStatusCol) return <td key={j}><StatusTag status={v} /></td>;
                    const display = col?.money ? money(Number(v) || 0) : String(v);
                    return <td key={j} className={col?.align === "right" ? "num" : undefined}>{display}</td>;
                  })}
                  <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(r)}>Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > perPage && (
        <div className="adm-pagination-row">
          <span>{filtered.length} records · showing {pageRows.length} per page</span>
          <span className="adm-toolbar-spacer" />
          <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}

      {detail && (
        <Drawer
          kicker={moduleLabel}
          title={String(detail[0])}
          subtitle={columns.slice(1, 3).map((c, i) => `${c.label}: ${detail[i + 1]}`).join(" · ")}
          status={String(detail[detail.length - 1])}
          tabs={[{ key: "overview", label: "Overview" }, { key: "activity", label: "Activity" }]}
          activeTab={drawerTab}
          onTabChange={setDrawerTab}
          onClose={() => setDetail(null)}
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={() => notWired("Edit")}>Edit</button>
              <button type="button" className="btn btn-secondary" onClick={() => notWired("Deactivate")}>Deactivate</button>
              <button type="button" className="btn btn-ghost" onClick={() => notWired("Soft delete")}>Soft delete</button>
              <button type="button" className="btn btn-ghost" onClick={() => notWired("Delete permanently")}>Delete permanently</button>
            </>
          }
        >
          {drawerTab === "overview" ? (
            <FieldGrid>
              {columns.map((c, i) => (
                <Field key={c.label} label={c.label} value={c.money ? money(Number(detail[i]) || 0) : String(detail[i])} />
              ))}
            </FieldGrid>
          ) : (
            <p style={{ fontSize: 13.5, color: "var(--color-neutral-600)" }}>
              No activity log for this module yet — it isn&apos;t wired to a backend.
            </p>
          )}
        </Drawer>
      )}
    </div>
  );
}
