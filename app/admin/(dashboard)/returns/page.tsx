"use client";
import { useCallback, useEffect, useState } from "react";
import { returnsApi, AdminApiError, type Paginated } from "@/lib/admin/api";
import { money, formatDate, displayStatus } from "@/lib/admin/format";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import StatusTag from "@/components/admin/StatusTag";
import { FieldGrid, Field } from "@/components/admin/Drawer";
import Icon from "@/components/admin/Icon";

type ReturnItem = {
  id: string;
  quantity: number;
  orderItem?: { product?: { title?: string } | null } | null;
};
type ReturnRequest = Record<string, unknown> & {
  id: string;
  type: "RETURN" | "EXCHANGE";
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
  reason: string;
  adminNote?: string | null;
  createdAt: string;
  order?: { id: string; orderNumber: string; status?: string; totalAmount?: number } | null;
  user?: { id: string; name: string; email: string } | null;
  reviewedByAdmin?: { id: string; name: string } | null;
  items?: ReturnItem[];
};

const TABS = [
  { key: "", label: "All" },
  { key: "REQUESTED", label: "Requested" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "COMPLETED", label: "Completed" },
];

export default function AdminReturnsPage() {
  const qs = useQueryState();
  const toast = useAdminToast();
  const [items, setItems] = useState<ReturnRequest[]>([]);
  const [meta, setMeta] = useState<Paginated<ReturnRequest>["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detail, setDetail] = useState<ReturnRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    returnsApi
      .list({ page: qs.page, limit: 20, status: qs.tab || undefined })
      .then((res) => { setItems((res.data as ReturnRequest[]) || []); setMeta(res.meta); })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load return requests."))
      .finally(() => setLoading(false));
  }, [qs.page, qs.tab]);

  useEffect(() => { load(); }, [load]);

  const openDetail = (r: ReturnRequest) => {
    setDetail(r);
    setAdminNote(String(r.adminNote ?? ""));
    returnsApi.get(r.id).then((d) => setDetail(d as ReturnRequest)).catch(() => {});
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

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="adm-tab-bar">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={qs.tab === t.key ? "active" : ""} onClick={() => qs.setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState onClear={qs.clearFilters} />
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Type</th><th>Items</th><th>Status</th><th>Requested</th><th className="adm-open-col" />
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.order?.orderNumber ?? "—"}</td>
                  <td>{r.user?.name ?? "—"}</td>
                  <td>{r.type === "EXCHANGE" ? "Exchange" : "Return"}</td>
                  <td>{r.items?.length ?? 0} item{(r.items?.length ?? 0) === 1 ? "" : "s"}</td>
                  <td><StatusTag status={displayStatus(r.status)} /></td>
                  <td>{formatDate(r.createdAt)}</td>
                  <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(r)}>Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="adm-pagination-row">
          <span>{meta.total} records · showing {meta.limit} per page</span>
          <span className="adm-toolbar-spacer" />
          <button type="button" className="btn btn-secondary btn-sm" disabled={qs.page <= 1} onClick={() => qs.setPage(qs.page - 1)}>Previous</button>
          <span>Page {meta.page} of {meta.totalPages}</span>
          <button type="button" className="btn btn-secondary btn-sm" disabled={qs.page >= meta.totalPages} onClick={() => qs.setPage(qs.page + 1)}>Next</button>
        </div>
      )}

      {detail && (
        <div className="adm-fullpage-backdrop" onClick={() => setDetail(null)}>
          <div className="adm-fullpage-panel elev-lg" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-fullpage-head">
              <div>
                <div className="adm-fullpage-kicker">Returns &amp; exchanges</div>
                <div className="adm-fullpage-title">
                  {detail.order?.orderNumber ?? "—"}
                  <StatusTag status={displayStatus(detail.status)} />
                </div>
                <div className="adm-fullpage-sub">
                  {detail.type === "EXCHANGE" ? "Exchange" : "Return"} request · {detail.user?.name ?? "—"} · requested {formatDate(detail.createdAt)}
                </div>
              </div>
              <div className="adm-fullpage-actions">
                {detail.status === "REQUESTED" && (
                  <>
                    <button type="button" className="btn btn-primary" onClick={() => runAction(() => returnsApi.approve(detail.id, adminNote), "Request approved.")}>Approve</button>
                    <button type="button" className="btn btn-ghost" onClick={() => runAction(() => returnsApi.reject(detail.id, adminNote), "Request rejected.")}>Reject</button>
                  </>
                )}
                {detail.status === "APPROVED" && (
                  <button type="button" className="btn btn-primary" onClick={() => runAction(() => returnsApi.complete(detail.id), "Marked complete.")}>Mark complete</button>
                )}
                <button type="button" className="btn btn-icon btn-secondary" onClick={() => setDetail(null)} aria-label="Close">
                  <Icon name="x" size={18} />
                </button>
              </div>
            </div>

            <div className="adm-fullpage-body">
              <div className="adm-fullpage-grid">
                <div className="adm-fullpage-main">
                  <div className="adm-fullpage-card">
                    <div className="adm-fullpage-card-title">
                      Items <span style={{ fontWeight: 400, color: "var(--color-neutral-600)" }}>({detail.items?.length ?? 0})</span>
                    </div>
                    <div className="adm-order-items-scroll">
                      {(detail.items ?? []).map((it) => (
                        <div key={it.id} className="adm-order-item-card">
                          <div className="adm-order-item-body">
                            <div style={{ fontWeight: 700, marginBottom: 10 }}>{it.orderItem?.product?.title ?? "—"}</div>
                            <FieldGrid>
                              <Field label="Qty requested" value={String(it.quantity)} />
                            </FieldGrid>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="adm-fullpage-card">
                    <div className="adm-fullpage-card-title">Customer's reason</div>
                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{detail.reason}</p>
                  </div>

                  <div className="adm-fullpage-card">
                    <div className="adm-fullpage-card-title">Admin note</div>
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="Add a note (shown to the customer)…"
                      value={adminNote}
                      disabled={detail.status !== "REQUESTED"}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                  </div>
                </div>

                <div className="adm-fullpage-side">
                  <div className="adm-fullpage-card">
                    <div className="adm-fullpage-card-title">Order</div>
                    <FieldGrid>
                      <Field label="Order #" value={detail.order?.orderNumber ?? "—"} />
                      <Field label="Order status" value={detail.order?.status ? displayStatus(detail.order.status) : "—"} />
                      <Field label="Order value" value={detail.order?.totalAmount != null ? money(Number(detail.order.totalAmount)) : "—"} />
                    </FieldGrid>
                  </div>

                  <div className="adm-fullpage-card">
                    <div className="adm-fullpage-card-title">Customer</div>
                    <FieldGrid>
                      <Field label="Name" value={detail.user?.name ?? "—"} />
                      <Field label="Email" value={detail.user?.email ?? "—"} />
                    </FieldGrid>
                  </div>

                  {detail.reviewedByAdmin && (
                    <div className="adm-fullpage-card">
                      <div className="adm-fullpage-card-title">Reviewed by</div>
                      <FieldGrid>
                        <Field label="Admin" value={detail.reviewedByAdmin.name} />
                      </FieldGrid>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
