import Icon from "@/components/admin/Icon";

export function TableSkeleton({ columns = 5 }: { columns?: number }) {
  const widths = [2, 1, 1, 1, 0.6];
  return (
    <div className="card elev-sm" style={{ padding: 16 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="adm-skeleton-row">
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={c}
              className="adm-skeleton-bar"
              style={{ flex: widths[c % widths.length], animationDelay: `${(i % 4) * 0.2}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <div className="card adm-empty-state">
      <div className="adm-empty-icon"><Icon name="trash" size={30} /></div>
      <h3 className="adm-empty-title">Nothing here yet</h3>
      <p className="adm-empty-desc">No records match this filter. Clear the search or switch tabs to see more.</p>
      {onClear && <button type="button" className="btn btn-secondary" onClick={onClear}>Clear filters</button>}
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="adm-error-banner">
      <Icon name="alert-circle" size={18} />
      <span>{message}</span>
      <span className="adm-toolbar-spacer" />
      {onDismiss && <button type="button" className="btn btn-ghost btn-sm" onClick={onDismiss}>Dismiss</button>}
    </div>
  );
}
