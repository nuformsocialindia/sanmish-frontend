"use client";
import { useCallback, useEffect, useState } from "react";
import { notificationsApi, downloadCsv, AdminApiError } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/format";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";

const TABS = [{ key: "sent", label: "Sent log" }, { key: "announcements", label: "Announcements" }, { key: "subscribers", label: "Newsletter subscribers" }];

export default function AdminNotificationsPage() {
  const qs = useQueryState({ tab: "sent" });
  const toast = useAdminToast();
  const [sent, setSent] = useState<Record<string, unknown>[]>([]);
  const [announcements, setAnnouncements] = useState<Record<string, unknown>[]>([]);
  const [sending, setSending] = useState(false);

  const [recipientType, setRecipientType] = useState<"user" | "vendor" | "admin">("user");
  const [recipientId, setRecipientId] = useState("");
  const [channel, setChannel] = useState<"email" | "in_app" | "sms" | "push">("email");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annAudience, setAnnAudience] = useState<"user" | "vendor">("user");

  const [subscribers, setSubscribers] = useState<Record<string, unknown>[]>([]);
  const [subMeta, setSubMeta] = useState<{ total: number } | null>(null);

  const load = useCallback(() => {
    notificationsApi.list({ limit: 20 }).then((r) => setSent(r.data)).catch(() => {});
    notificationsApi.announcements().then(setAnnouncements).catch(() => {});
    notificationsApi.subscribers({ limit: 100 }).then((r) => { setSubscribers(r.data); setSubMeta(r.meta); }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await notificationsApi.send({ recipientType, recipientId, channel, title, body });
      const label = channel === "sms" || channel === "push" ? ` (mock ${channel} provider)` : "";
      toast.success(`Notification sent${label}.`);
      setRecipientId(""); setTitle(""); setBody("");
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not send notification.");
    } finally {
      setSending(false);
    }
  };

  const handleAnnounce = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await notificationsApi.createAnnouncement({ title: annTitle, body: annBody, audience: annAudience });
      toast.success("Announcement published.");
      setAnnTitle(""); setAnnBody("");
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not publish announcement.");
    }
  };

  const togglePublished = async (id: string, published: boolean) => {
    try {
      await notificationsApi.setAnnouncementPublished(id, published);
      toast.success(published ? "Announcement published." : "Announcement unpublished.");
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  const removeSubscriber = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    try {
      await notificationsApi.removeSubscriber(id);
      toast.success("Subscriber removed.");
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  return (
    <div className="adm-list-block">
      <div className="adm-tab-bar">
        {TABS.map((t) => <button key={t.key} type="button" className={qs.tab === t.key ? "active" : ""} onClick={() => qs.setTab(t.key)}>{t.label}</button>)}
      </div>

      {qs.tab === "subscribers" ? (
        <div className="adm-list-block">
          <div className="adm-toolbar">
            <span style={{ fontSize: 13.5, color: "var(--color-neutral-600)" }}>{subMeta?.total ?? subscribers.length} subscribers</span>
            <div className="adm-toolbar-spacer" />
            <button type="button" className="btn btn-secondary" onClick={() => downloadCsv(notificationsApi.subscribersExport())}>Export CSV</button>
          </div>
          <div className="card elev-sm adm-table-card">
            <table className="table">
              <thead><tr><th>Email</th><th>Subscribed</th><th /></tr></thead>
              <tbody>
                {subscribers.length === 0 ? <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>No subscribers yet.</td></tr> :
                  subscribers.map((s, i) => (
                    <tr key={i}>
                      <td>{String(s.email ?? "—")}</td>
                      <td>{formatDate(s.createdAt as string)}</td>
                      <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => removeSubscriber(String(s.id))}>Remove</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : qs.tab === "sent" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card elev-sm adm-form-card">
            <div className="card-kicker">Ad-hoc</div>
            <h3 className="card-title" style={{ fontSize: 21 }}>Send a notification</h3>
            <form onSubmit={handleSend} className="adm-form-grid cols-4">
              <div className="field">
                <label>Recipient type</label>
                <select className="input" value={recipientType} onChange={(e) => setRecipientType(e.target.value as typeof recipientType)}>
                  <option value="user">User</option><option value="vendor">Vendor</option><option value="admin">Admin</option>
                </select>
              </div>
              <div className="field full"><label>Recipient ID</label><input className="input" required value={recipientId} onChange={(e) => setRecipientId(e.target.value)} /></div>
              <div className="field">
                <label>Channel</label>
                <select className="input" value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)}>
                  <option value="email">Email</option><option value="in_app">In-app</option><option value="sms">SMS (mock)</option><option value="push">Push (mock)</option>
                </select>
              </div>
              <div className="field full"><label>Title</label><input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="field full"><label>Message</label><textarea className="input" required value={body} onChange={(e) => setBody(e.target.value)} /></div>
              <div className="field full"><button type="submit" className="btn btn-primary" disabled={sending} style={{ alignSelf: "flex-start" }}>{sending ? "Sending…" : "Send"}</button></div>
            </form>
          </div>

          <div className="card elev-sm adm-table-card">
            <table className="table">
              <thead><tr><th>Subject</th><th>Recipient</th><th>Channel</th><th>Sent</th><th>Status</th></tr></thead>
              <tbody>
                {sent.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>Nothing sent yet.</td></tr> :
                  sent.map((n, i) => (
                    <tr key={i}>
                      <td>{String(n.title ?? "—")}</td><td>{String(n.recipientType ?? "—")}</td>
                      <td><span className="tag tag-muted">{String(n.channel ?? "—")}</span></td>
                      <td>{n.createdAt ? new Date(String(n.createdAt)).toLocaleDateString("en-IN") : "—"}</td>
                      <td><span className="tag tag-positive">sent</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card elev-sm adm-form-card">
            <div className="card-kicker">Announcements</div>
            <h3 className="card-title" style={{ fontSize: 21 }}>Create an announcement</h3>
            <form onSubmit={handleAnnounce} className="adm-form-grid cols-2">
              <div className="field">
                <label>Audience</label>
                <select className="input" value={annAudience} onChange={(e) => setAnnAudience(e.target.value as typeof annAudience)}>
                  <option value="user">Users</option><option value="vendor">Vendors</option>
                </select>
              </div>
              <div className="field full"><label>Title</label><input className="input" required value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} /></div>
              <div className="field full"><label>Body</label><textarea className="input" required value={annBody} onChange={(e) => setAnnBody(e.target.value)} /></div>
              <div className="field full"><button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Publish announcement</button></div>
            </form>
          </div>

          <div className="card elev-sm adm-table-card">
            <table className="table">
              <thead><tr><th>Title</th><th>Audience</th><th>Status</th><th /></tr></thead>
              <tbody>
                {announcements.length === 0 ? <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>No announcements yet.</td></tr> :
                  announcements.map((a, i) => {
                    const isPublished = Boolean(a.publishedAt);
                    return (
                      <tr key={i}>
                        <td>{String(a.title ?? "—")}</td><td>{String(a.audience ?? "—")}</td>
                        <td><span className={`tag ${isPublished ? "tag-positive" : "tag-muted"}`}>{isPublished ? "published" : "unpublished"}</span></td>
                        <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => togglePublished(String(a.id), !isPublished)}>{isPublished ? "Unpublish" : "Publish"}</button></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
