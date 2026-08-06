"use client";
import { useCallback, useEffect, useState } from "react";
import { vendorNotificationsApi, VendorApiError } from "@/lib/vendor/api";
import { useVendorToast } from "@/components/vendor/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/vendor/ListStates";

type Notification = Record<string, unknown> & {
  id: string; title: string; body: string; channel: string; isRead: boolean; createdAt: string;
};

export default function VendorNotificationsPage() {
  const toast = useVendorToast();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    vendorNotificationsApi
      .list()
      .then((res) => setItems(res as Notification[]))
      .catch((err) => setError(err instanceof VendorApiError ? err.message : "Could not load notifications."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    try {
      await vendorNotificationsApi.markRead(id);
      load();
    } catch (err) {
      toast.error(err instanceof VendorApiError ? err.message : "Could not update notification.");
    }
  };

  const markAllRead = async () => {
    try {
      await vendorNotificationsApi.markAllRead();
      toast.success("All notifications marked as read.");
      load();
    } catch (err) {
      toast.error(err instanceof VendorApiError ? err.message : "Could not update notifications.");
    }
  };

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="adm-toolbar">
        <span>{unreadCount} unread</span>
        <div className="adm-toolbar-spacer" />
        <button type="button" className="btn btn-secondary" disabled={unreadCount === 0} onClick={markAllRead}>Mark all as read</button>
      </div>

      {loading ? (
        <TableSkeleton columns={3} />
      ) : items.length === 0 ? (
        <EmptyState message="No notifications yet." />
      ) : (
        <div className="card elev-sm" style={{ padding: 0 }}>
          {items.map((n) => (
            <div
              key={n.id}
              className="adm-notes-list"
              style={{ padding: "14px 18px", borderBottom: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)", display: "flex", justifyContent: "space-between", gap: 16, opacity: n.isRead ? 0.6 : 1 }}
            >
              <div>
                <strong>{n.title}</strong>
                <p style={{ margin: "4px 0 0", fontSize: 13.5 }}>{n.body}</p>
                <span className="sub-line">{new Date(n.createdAt).toLocaleString("en-IN")}</span>
              </div>
              {!n.isRead && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)}>Mark read</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
