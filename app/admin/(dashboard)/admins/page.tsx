"use client";
import { Fragment, useCallback, useEffect, useState } from "react";
import { adminsApi, AdminApiError, type AdminRole } from "@/lib/admin/api";
import { useAdminAuth } from "@/lib/admin/auth-context";
import { useQueryState } from "@/lib/admin/useQueryState";
import { useAdminToast } from "@/components/admin/Toast";
import Forbidden from "@/components/admin/Forbidden";

const ROLES: AdminRole[] = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "FINANCE_ADMIN", "PRODUCT_ADMIN", "LOGISTICS_ADMIN", "VENDOR_MANAGER"];
type Admin = Record<string, unknown> & { id: string; name?: string; email?: string; role?: AdminRole; status?: string };
const TABS = [{ key: "accounts", label: "Accounts" }, { key: "audit", label: "Audit log" }, { key: "logins", label: "Login history" }];

export default function AdminAdminsPage() {
  const { admin: me } = useAdminAuth();
  const qs = useQueryState({ tab: "accounts" });
  const toast = useAdminToast();
  const [items, setItems] = useState<Admin[]>([]);
  const [audit, setAudit] = useState<Record<string, unknown>[]>([]);
  const [logins, setLogins] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("OPERATIONS_ADMIN");
  const [saving, setSaving] = useState(false);

  const [moduleFilter, setModuleFilter] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminsApi.list({ limit: 50 }).then((r) => setItems(r.data as Admin[])).catch(() => {}).finally(() => setLoading(false));
    adminsApi.auditLogs({ limit: 50, module: moduleFilter || undefined }).then((r) => setAudit(r.data)).catch(() => {});
  }, [moduleFilter]);

  useEffect(() => { load(); }, [load]);

  // Vendor/Product/Category/Order capture full before/after snapshots server-side;
  // other modules only log the raw request body (no diff to compute).
  const DIFF_MODULES = ["vendor", "product", "category", "order"];
  const diffKeys = (before: Record<string, unknown> | undefined, after: Record<string, unknown> | undefined) => {
    if (!before || !after) return [];
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    return Array.from(keys).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
  };

  if (me && me.role !== "SUPER_ADMIN") {
    return <Forbidden role={me.role} />;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminsApi.create({ name, email, password, role });
      toast.success("Admin account created.");
      setName(""); setEmail(""); setPassword(""); setRole("OPERATIONS_ADMIN");
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not create admin.");
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async (id: string, newRole: AdminRole) => {
    try {
      await adminsApi.update(id, { role: newRole });
      toast.success("Role updated.");
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not update role.");
    }
  };

  const deactivate = async (id: string) => {
    if (!confirm("Deactivate this admin account?")) return;
    try {
      await adminsApi.deactivate(id);
      toast.success("Admin deactivated.");
      load();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not deactivate admin.");
    }
  };

  const viewLogins = async (id: string) => {
    try {
      const r = await adminsApi.loginHistory(id);
      setLogins(r);
      qs.setTab("logins");
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not load login history.");
    }
  };

  return (
    <div className="adm-list-block">
      <div className="adm-tab-bar">
        {TABS.map((t) => <button key={t.key} type="button" className={qs.tab === t.key ? "active" : ""} onClick={() => qs.setTab(t.key)}>{t.label}</button>)}
      </div>

      {qs.tab === "accounts" ? (
        <>
          <div className="card elev-sm adm-table-card">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last login</th><th>Status</th><th /></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>Loading admins…</td></tr> :
                  items.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>No admins found.</td></tr> :
                  items.map((a) => (
                    <tr key={a.id}>
                      <td>{String(a.name ?? "—")}</td>
                      <td>{String(a.email ?? "—")}</td>
                      <td>
                        <select className="input" style={{ width: "auto" }} value={a.role} onChange={(e) => updateRole(a.id, e.target.value as AdminRole)}>
                          {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                        </select>
                      </td>
                      <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => viewLogins(a.id)}>View</button></td>
                      <td><span className={`tag ${String(a.status ?? "active").toLowerCase() === "active" ? "tag-positive" : "tag-muted"}`}>{String(a.status ?? "active")}</span></td>
                      <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => deactivate(a.id)}>Deactivate</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="card elev-sm adm-form-card">
            <div className="card-kicker">Accounts</div>
            <h3 className="card-title" style={{ fontSize: 21 }}>Create an admin account</h3>
            <form onSubmit={handleCreate} className="adm-form-grid cols-4">
              <div className="field"><label>Name</label><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="field"><label>Email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="field"><label>Password</label><input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <div className="field">
                <label>Role</label>
                <select className="input" value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
                  {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="field full"><button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: "flex-start" }}>{saving ? "Creating…" : "Create admin"}</button></div>
            </form>
          </div>
        </>
      ) : qs.tab === "audit" ? (
        <div className="adm-list-block">
          <div className="adm-toolbar">
            <select className="input" style={{ maxWidth: 220 }} value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
              <option value="">All modules</option>
              {["vendor", "product", "category", "order", "user", "coupon", "merchandising", "review", "service", "page", "enquiry", "shipping"].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="card elev-sm adm-table-card">
            <table className="table">
              <thead><tr><th>Admin</th><th>Module</th><th>Action</th><th>When</th><th /></tr></thead>
              <tbody>
                {audit.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>No audit entries yet.</td></tr> :
                  audit.map((a, i) => {
                    const mod = String(a.module ?? "");
                    const before = a.before as Record<string, unknown> | undefined;
                    const after = a.after as Record<string, unknown> | undefined;
                    const hasDiff = DIFF_MODULES.includes(mod) && before && after;
                    const changed = hasDiff ? diffKeys(before, after) : [];
                    const isExpanded = expandedRow === i;
                    return (
                      <Fragment key={i}>
                        <tr>
                          <td>{String((a.admin as Record<string, unknown> | undefined)?.name ?? a.adminId ?? "—")}</td>
                          <td>{mod || "—"}</td>
                          <td>{String(a.action ?? "—")}</td>
                          <td>{a.createdAt ? new Date(String(a.createdAt)).toLocaleString("en-IN") : "—"}</td>
                          <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => setExpandedRow(isExpanded ? null : i)}>{isExpanded ? "Hide" : "View"}</button></td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} style={{ background: "var(--color-neutral-100)" }}>
                              {hasDiff ? (
                                changed.length === 0 ? (
                                  <p style={{ fontSize: 13, color: "var(--color-neutral-600)", padding: 12 }}>No field changes captured for this entry.</p>
                                ) : (
                                  <table className="table" style={{ margin: 12 }}>
                                    <thead><tr><th>Field</th><th>Before</th><th>After</th></tr></thead>
                                    <tbody>
                                      {changed.map((k) => (
                                        <tr key={k}>
                                          <td><code>{k}</code></td>
                                          <td style={{ color: "var(--color-accent-800)" }}>{JSON.stringify(before![k])}</td>
                                          <td style={{ color: "var(--color-accent-2-800)" }}>{JSON.stringify(after![k])}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )
                              ) : (
                                <pre style={{ padding: 12, fontSize: 12, overflowX: "auto", whiteSpace: "pre-wrap" }}>{JSON.stringify(a.requestBody ?? {}, null, 2)}</pre>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card elev-sm adm-table-card">
          <table className="table">
            <thead><tr><th>When</th><th>IP</th><th>Result</th></tr></thead>
            <tbody>
              {logins.length === 0 ? <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--color-neutral-600)", padding: 32 }}>Select an admin's &quot;View&quot; to load login history.</td></tr> :
                logins.map((l, i) => (
                  <tr key={i}>
                    <td>{l.createdAt ? new Date(String(l.createdAt)).toLocaleString("en-IN") : "—"}</td>
                    <td>{String(l.ipAddress ?? "—")}</td>
                    <td>{String(l.success !== false ? "success" : "failed")}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
