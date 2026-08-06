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

export function EmptyState({ message = "No records to show yet." }: { message?: string }) {
  return (
    <div className="card adm-empty-state">
      <h3 className="adm-empty-title">Nothing here yet</h3>
      <p className="adm-empty-desc">{message}</p>
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="adm-error-banner">
      <span>{message}</span>
      <span className="adm-toolbar-spacer" />
      {onDismiss && <button type="button" className="btn btn-ghost btn-sm" onClick={onDismiss}>Dismiss</button>}
    </div>
  );
}
