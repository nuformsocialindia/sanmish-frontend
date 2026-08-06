"use client";
import { useCallback, useEffect, useState } from "react";
import { enquiriesApi, adminsApi, downloadCsv, AdminApiError, type Paginated } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/format";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import { ListToolbar, PaginationRow } from "@/components/admin/ListChrome";
import Drawer, { FieldGrid, Field, NotesThread } from "@/components/admin/Drawer";

// Enquiries arrive from the storefront's contact form / product page / service
// pages — there is no admin "create enquiry" endpoint; admins only triage.
type Enquiry = Record<string, unknown> & {
  id: string; reference?: string; type?: string; name?: string; company?: string | null; email?: string; phone?: string | null;
  city?: string | null; subject?: string | null; message?: string; quantity?: number | null; deliveryPincode?: string | null;
  source?: string; status?: string; assignedToAdminId?: string | null; buyerId?: string | null; convertedRfqId?: string | null;
  createdAt?: string; notes?: Record<string, unknown>[];
  product?: { id: string; title?: string } | null; service?: { id: string; name?: string } | null;
};

const TABS = [
  { key: "", label: "All" }, { key: "NEW", label: "New" }, { key: "IN_PROGRESS", label: "In progress" },
  { key: "ANSWERED", label: "Answered" }, { key: "CLOSED", label: "Closed" }, { key: "SPAM", label: "Spam" },
];

export default function AdminEnquiriesPage() {
  const qs = useQueryState();
  const toast = useAdminToast();
  const [items, setItems] = useState<Enquiry[]>([]);
  const [meta, setMeta] = useState<Paginated<Enquiry>["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [admins, setAdmins] = useState<Record<string, unknown>[]>([]);

  const [detail, setDetail] = useState<Enquiry | null>(null);
  const [note, setNote] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    enquiriesApi.list({ page: qs.page, limit: 20, search: qs.search || undefined, status: showDeleted ? undefined : qs.tab || undefined, deletedOnly: showDeleted || undefined })
      .then((r) => { setItems(r.data as Enquiry[]); setMeta(r.meta); })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load enquiries."))
      .finally(() => setLoading(false));
  }, [qs.page, qs.search, qs.tab, showDeleted]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { adminsApi.list({ limit: 100 }).then((r) => setAdmins(r.data as Record<string, unknown>[])).catch(() => {}); }, []);

  const toggleSelect = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const openDetail = (e: Enquiry) => {
    setDetail(e);
    setReplySubject(`Re: ${e.subject ?? e.reference ?? "your enquiry"}`);
    setReplyBody("");
    enquiriesApi.get(e.id).then((d) => setDetail(d as Enquiry)).catch(() => {});
  };

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      toast.success(successMsg);
      load();
      if (detail) enquiriesApi.get(detail.id).then((d) => setDetail(d as Enquiry)).catch(() => {});
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  const handleReply = async () => {
    if (!detail || !replyBody.trim()) return;
    await runAction(() => enquiriesApi.reply(detail.id, replySubject, replyBody), "Reply sent by email.");
    setReplyBody("");
  };

  const handleConvert = async () => {
    if (!detail) return;
    try {
      await enquiriesApi.convertToRfq(detail.id);
      toast.success("Converted to an RFQ.");
      load();
      enquiriesApi.get(detail.id).then((d) => setDetail(d as Enquiry)).catch(() => {});
    } catch (err) {
      if (err instanceof AdminApiError && err.code === "ENQUIRY_NO_BUYER") {
        toast.error("Can't convert — this enquiry has no linked buyer account (the visitor wasn't logged in when they submitted it).");
      } else if (err instanceof AdminApiError && err.code === "ENQUIRY_ALREADY_CONVERTED") {
        toast.error("This enquiry has already been converted to an RFQ.");
      } else {
        toast.error(err instanceof AdminApiError ? err.message : "Could not convert to RFQ.");
      }
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
        placeholder="Search enquiries…"
        showDeleted={showDeleted}
        onShowDeletedChange={(v) => { setShowDeleted(v); setSelected([]); }}
      >
        <button type="button" className="btn btn-secondary" onClick={() => downloadCsv("/admin/enquiries/export")}>Export CSV</button>
      </ListToolbar>

      {selected.length > 0 && (
        <div className="adm-bulk-bar">
          <span>{selected.length} selected</span>
          <span className="adm-toolbar-spacer" />
          {showDeleted ? (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => Promise.all(selected.map((id) => enquiriesApi.restore(id))), "Enquiries restored.")}>Restore</button>
          ) : (
            <>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => enquiriesApi.bulkStatus(selected, "IN_PROGRESS"), "Marked in progress.")}>Mark in progress</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction(() => enquiriesApi.bulkStatus(selected, "CLOSED"), "Marked closed.")}>Close</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => enquiriesApi.bulkStatus(selected, "SPAM"), "Marked spam.")}>Mark spam</button>
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
                <th>Reference</th><th>From</th><th>Type</th><th>Subject</th><th>Received</th><th>Status</th><th className="adm-open-col" />
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className={selected.includes(e.id) ? "selected" : ""}>
                  <td><input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggleSelect(e.id)} /></td>
                  <td>{e.reference}</td>
                  <td>{e.name}<span className="sub-line">{e.email}</span></td>
                  <td>{String(e.type ?? "—").replace(/_/g, " ")}</td>
                  <td style={{ maxWidth: 240 }}>{e.subject ?? String(e.message ?? "").slice(0, 60)}</td>
                  <td>{formatDate(e.createdAt)}</td>
                  <td><span className={`tag ${e.status === "CLOSED" ? "tag-muted" : e.status === "SPAM" ? "tag-adverse" : e.status === "ANSWERED" ? "tag-positive" : "tag-attention"}`}>{e.status}</span></td>
                  <td>
                    {showDeleted ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => enquiriesApi.restore(e.id), "Enquiry restored.")}>Restore</button>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(e)}>Open</button>
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
          kicker="Contact enquiries"
          title={String(detail.subject ?? detail.reference ?? "Enquiry")}
          subtitle={`${detail.name ?? "—"} · ${detail.email ?? "—"} · ${formatDate(detail.createdAt)}`}
          status={detail.status}
          onClose={() => setDetail(null)}
          actions={
            <>
              {!detail.convertedRfqId && <button type="button" className="btn btn-primary" onClick={handleConvert}>Convert to RFQ</button>}
              {detail.convertedRfqId && <span className="tag tag-positive">Converted to RFQ</span>}
              <button type="button" className="btn btn-ghost" onClick={() => { if (confirm(`Soft delete enquiry ${detail.reference}?`)) { runAction(() => enquiriesApi.remove(detail.id), "Enquiry soft deleted."); setDetail(null); } }}>Soft delete</button>
            </>
          }
        >
          <FieldGrid>
            <Field label="Company" value={detail.company ?? "—"} />
            <Field label="Phone" value={detail.phone ?? "—"} />
            <Field label="City" value={detail.city ?? "—"} />
            <Field label="Source" value={String(detail.source ?? "—").replace(/_/g, " ")} />
            <Field label="Related product" value={detail.product?.title ?? "—"} />
            <Field label="Related service" value={detail.service?.name ?? "—"} />
            <Field label="Quantity" value={detail.quantity != null ? String(detail.quantity) : "—"} />
            <Field label="Delivery pincode" value={detail.deliveryPincode ?? "—"} />
            <Field
              label="Status"
              value={String(detail.status ?? "—")}
              action
              actionLabel="Change"
              onAction={() => {
                const next = window.prompt("New status (NEW, IN_PROGRESS, ANSWERED, CLOSED, SPAM):", String(detail.status ?? ""));
                if (next) runAction(() => enquiriesApi.update(detail.id, { status: next }), "Status updated.");
              }}
            />
            <Field
              label="Assigned to"
              value={admins.find((a) => String(a.id) === detail.assignedToAdminId)?.name ? String(admins.find((a) => String(a.id) === detail.assignedToAdminId)?.name) : "Unassigned"}
              action
              actionLabel="Reassign"
              onAction={() => {
                const options = admins.map((a) => `${a.name} (${a.id})`).join("\n");
                const id = window.prompt(`Enter admin ID to assign:\n${options}`, String(detail.assignedToAdminId ?? ""));
                if (id) runAction(() => enquiriesApi.update(detail.id, { assignedToAdminId: id }), "Reassigned.");
              }}
            />
          </FieldGrid>

          <div className="adm-section-label">Message</div>
          <p style={{ fontSize: 13.5, marginBottom: 16, whiteSpace: "pre-wrap" }}>{String(detail.message ?? "—")}</p>

          <div className="adm-section-label">Reply by email</div>
          <input className="input" placeholder="Subject" value={replySubject} onChange={(e) => setReplySubject(e.target.value)} style={{ marginBottom: 8 }} />
          <textarea className="input" placeholder="Reply body…" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} style={{ marginBottom: 10 }} />
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleReply} style={{ marginBottom: 20 }}>Send reply</button>

          <NotesThread
            notes={detail.notes ?? []}
            draft={note}
            onDraftChange={setNote}
            onAdd={() => runAction(() => enquiriesApi.addNote(detail.id, note), "Note added.").then(() => setNote(""))}
          />
        </Drawer>
      )}
    </div>
  );
}
