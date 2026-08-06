"use client";
import { useCallback, useEffect, useState } from "react";
import { reviewsApi, downloadCsv, AdminApiError, type Paginated } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/format";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import Drawer, { FieldGrid, Field } from "@/components/admin/Drawer";
import { ListToolbar, PaginationRow } from "@/components/admin/ListChrome";

// Reviews are submitted by customers on the storefront — there is no admin
// "create review" endpoint; admins only moderate.
type Review = Record<string, unknown> & {
  id: string; rating?: number; title?: string; body?: string; status?: string; adminReply?: string | null; createdAt?: string;
  user?: { id: string; name?: string } | null;
  product?: { id: string; title?: string } | null;
  vendor?: { id: string; businessName?: string } | null;
};

const TABS = [
  { key: "", label: "All" }, { key: "PENDING", label: "Pending" }, { key: "PUBLISHED", label: "Published" }, { key: "REJECTED", label: "Rejected" },
];

export default function AdminReviewsPage() {
  const qs = useQueryState();
  const toast = useAdminToast();
  const [items, setItems] = useState<Review[]>([]);
  const [meta, setMeta] = useState<Paginated<Review>["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const [detail, setDetail] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    reviewsApi.list({ page: qs.page, limit: 20, search: qs.search || undefined, status: showDeleted ? undefined : qs.tab || undefined, rating: ratingFilter || undefined, deletedOnly: showDeleted || undefined })
      .then((r) => { setItems(r.data as Review[]); setMeta(r.meta); })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load reviews."))
      .finally(() => setLoading(false));
  }, [qs.page, qs.search, qs.tab, ratingFilter, showDeleted]);

  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const openDetail = (r: Review) => {
    setDetail(r);
    setReplyText(String(r.adminReply ?? ""));
    reviewsApi.get(r.id).then((d) => setDetail(d as Review)).catch(() => {});
  };

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      toast.success(successMsg);
      load();
      setDetail(null);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  const handleReply = async () => {
    if (!detail || !replyText.trim()) return;
    try {
      await reviewsApi.reply(detail.id, replyText);
      toast.success("Reply posted — visible under the review on the storefront.");
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not post reply.");
    }
  };

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="adm-tab-bar">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={qs.tab === t.key ? "active" : ""} onClick={() => qs.setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <ListToolbar
        search={qs.searchInput}
        onSearch={qs.onSearchInput}
        placeholder="Search reviews…"
        showDeleted={showDeleted}
        onShowDeletedChange={(v) => { setShowDeleted(v); setSelected([]); }}
      >
        <select className="input" style={{ maxWidth: 160 }} disabled={showDeleted} value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star</option>)}
        </select>
        <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/reviews/export")}>Export CSV</button>
      </ListToolbar>

      {selected.length > 0 && (
        <div className="adm-bulk-bar">
          <span>{selected.length} selected</span>
          <span className="adm-toolbar-spacer" />
          {showDeleted ? (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => Promise.all(selected.map((id) => reviewsApi.restore(id))), "Reviews restored.")}>Restore</button>
          ) : (
            <>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => reviewsApi.bulkStatus(selected, "PUBLISHED"), "Reviews approved.")}>Approve</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => runAction(() => reviewsApi.bulkStatus(selected, "REJECTED"), "Reviews rejected.")}>Reject</button>
            </>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
        </div>
      )}

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
                <th>Rating</th><th>Reviewer</th><th>Product / Vendor</th><th>Review</th><th>Status</th><th className="adm-open-col" />
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className={selected.includes(r.id) ? "selected" : ""}>
                  <td><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} /></td>
                  <td>{"★".repeat(Number(r.rating ?? 0))}</td>
                  <td>{r.user?.name ?? "—"}</td>
                  <td>{r.product?.title ?? r.vendor?.businessName ?? "—"}</td>
                  <td style={{ maxWidth: 280 }}>{r.title ? <strong>{r.title}</strong> : null} {r.body ? String(r.body).slice(0, 80) : "—"}</td>
                  <td><span className={`tag ${r.status === "PUBLISHED" ? "tag-positive" : r.status === "REJECTED" ? "tag-muted" : "tag-attention"}`}>{r.status}</span></td>
                  <td>
                    {showDeleted ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => reviewsApi.restore(r.id), "Review restored.")}>Restore</button>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(r)}>Open</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationRow meta={meta} page={qs.page} onPrev={() => qs.setPage(qs.page - 1)} onNext={() => qs.setPage(qs.page + 1)} />

      {detail && (
        <Drawer
          kicker="Ratings & reviews"
          title={`${"★".repeat(Number(detail.rating ?? 0))} · ${detail.title ?? "Review"}`}
          subtitle={`by ${detail.user?.name ?? "—"} · ${formatDate(detail.createdAt)}`}
          status={detail.status}
          onClose={() => setDetail(null)}
          actions={
            <>
              {detail.status !== "PUBLISHED" && <button type="button" className="btn btn-primary" onClick={() => runAction(() => reviewsApi.approve(detail.id), "Review approved and published.")}>Approve</button>}
              {detail.status !== "REJECTED" && <button type="button" className="btn btn-ghost" onClick={() => { const reason = window.prompt("Reason for rejecting this review?"); if (reason) runAction(() => reviewsApi.reject(detail.id, reason), "Review rejected."); }}>Reject</button>}
              <button type="button" className="btn btn-ghost" onClick={() => { if (confirm("Soft delete this review?")) runAction(() => reviewsApi.remove(detail.id), "Review soft deleted."); }}>Soft delete</button>
            </>
          }
        >
          <FieldGrid>
            <Field label="Product" value={detail.product?.title ?? "—"} />
            <Field label="Vendor" value={detail.vendor?.businessName ?? "—"} />
            <Field label="Reviewer" value={detail.user?.name ?? "—"} />
            <Field label="Rating" value={`${detail.rating}/5`} />
          </FieldGrid>
          <div className="adm-section-label">Review body</div>
          <p style={{ fontSize: 13.5, marginBottom: 16 }}>{String(detail.body ?? "—")}</p>
          <div className="adm-section-label">Admin reply (public, shown under the review)</div>
          <textarea className="input" value={replyText} onChange={(e) => setReplyText(e.target.value)} style={{ marginBottom: 10 }} />
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleReply}>Post reply</button>
        </Drawer>
      )}
    </div>
  );
}
