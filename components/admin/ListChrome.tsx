// Shared chrome for admin list pages — the toolbar/tabs/pagination/bulk-bar
// wrapper markup that was copy-pasted near-identically across every
// app/admin/(dashboard)/*/page.tsx file. Pulling it in here means a change to
// how, say, the "Show deleted" toggle looks only has to happen once.
import Icon from "@/components/admin/Icon";

export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="adm-tab-bar">
      {tabs.map((t) => (
        <button key={t.key} type="button" className={active === t.key ? "active" : ""} onClick={() => onChange(t.key)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The search box + right-aligned action slot every list page has, plus an
 * optional "Show deleted" checkbox for modules that soft-delete. When
 * `showDeleted` is wired, the caller is responsible for passing
 * `deletedOnly: showDeleted` into its list query — this component only
 * renders the toggle and reports its state.
 */
export function ListToolbar({
  search,
  onSearch,
  placeholder = "Search…",
  showDeleted,
  onShowDeletedChange,
  children,
}: {
  search: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  showDeleted?: boolean;
  onShowDeletedChange?: (value: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="adm-toolbar">
      <div className="adm-search-wrap">
        <Icon name="search" size={18} />
        <input className="input" placeholder={placeholder} value={search} onChange={(e) => onSearch(e.target.value)} />
      </div>
      {onShowDeletedChange && (
        <label className="check" style={{ fontSize: 13, color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>
          <input type="checkbox" checked={Boolean(showDeleted)} onChange={(e) => onShowDeletedChange(e.target.checked)} />
          Show deleted
        </label>
      )}
      <div className="adm-toolbar-spacer" />
      <div className="adm-toolbar-actions">{children}</div>
    </div>
  );
}

export function PaginationRow({
  meta,
  page,
  onPrev,
  onNext,
}: {
  meta: { total: number; limit: number; totalPages: number } | null;
  page: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="adm-pagination-row">
      <span>{meta.total} records · showing {meta.limit} per page</span>
      <span className="adm-toolbar-spacer" />
      <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={onPrev}>Previous</button>
      <span>Page {page} of {meta.totalPages}</span>
      <button type="button" className="btn btn-secondary btn-sm" disabled={page >= meta.totalPages} onClick={onNext}>Next</button>
    </div>
  );
}

export function BulkBar({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children?: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="adm-bulk-bar">
      <span>{count} selected</span>
      <span className="adm-toolbar-spacer" />
      {children}
      <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>Clear</button>
    </div>
  );
}

/**
 * Row-level status tag that also doubles as the entry point back to life for
 * a soft-deleted record. Renders a plain status pill when the record isn't
 * deleted; renders a muted "deleted" pill plus an inline Restore button when
 * it is. `deletedAt` accepts the raw field straight off the API response.
 */
export function DeletedOrRestore({
  deletedAt,
  onRestore,
}: {
  deletedAt: string | null | undefined;
  onRestore: () => void;
}) {
  if (!deletedAt) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span className="tag tag-muted">deleted</span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onRestore}>Restore</button>
    </span>
  );
}
