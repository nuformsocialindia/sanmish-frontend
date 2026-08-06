"use client";
import { useCallback, useEffect, useState } from "react";
import { shippingApi, AdminApiError } from "@/lib/admin/api";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";

type Rule = Record<string, unknown> & {
  id: string; name?: string; type?: string; coverage?: Record<string, unknown>; condition?: Record<string, unknown> | null;
  amount?: number | null; etaMinDays?: number; etaMaxDays?: number; priority?: number; isActive?: boolean;
};
type City = Record<string, unknown> & { id: string; name?: string; state?: string; pincodes?: string[]; expressDelivery?: boolean };

const RULE_TYPES = ["FREE_FREIGHT", "FLAT_RATE", "WEIGHT_SLAB", "EXPRESS", "SURCHARGE", "RETURNS"] as const;
const TABS = [{ key: "rules", label: "Shipping rules" }, { key: "cities", label: "Serviceable cities" }, { key: "test", label: "Serviceability tester" }];

const emptyRuleForm = () => ({ name: "", type: "FLAT_RATE" as (typeof RULE_TYPES)[number], amount: "", etaMinDays: "2", etaMaxDays: "5", priority: "0", isActive: true, coverageAll: true, minOrderValue: "", maxWeightKg: "" });
const emptyCityForm = () => ({ name: "", state: "", pincodes: "", expressDelivery: false });

export default function AdminShippingPage() {
  const toast = useAdminToast();
  const [tab, setTab] = useState("rules");

  const [rules, setRules] = useState<Rule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [ruleFormOpen, setRuleFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [ruleForm, setRuleForm] = useState(emptyRuleForm());
  const [savingRule, setSavingRule] = useState(false);

  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [cityFormOpen, setCityFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityForm, setCityForm] = useState(emptyCityForm());
  const [savingCity, setSavingCity] = useState(false);

  const [error, setError] = useState("");

  const [testPincode, setTestPincode] = useState("");
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null);
  const [testing, setTesting] = useState(false);

  const loadRules = useCallback(() => {
    setLoadingRules(true);
    shippingApi.rules().then((r) => setRules((r as Rule[]).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))))
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load shipping rules."))
      .finally(() => setLoadingRules(false));
  }, []);
  const loadCities = useCallback(() => {
    setLoadingCities(true);
    shippingApi.cities().then((r) => setCities(r as City[]))
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load cities."))
      .finally(() => setLoadingCities(false));
  }, []);

  useEffect(() => { loadRules(); loadCities(); }, [loadRules, loadCities]);

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      toast.success(successMsg);
      loadRules();
      loadCities();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Action failed.");
    }
  };

  const openCreateRule = () => { setEditingRule(null); setRuleForm(emptyRuleForm()); setRuleFormOpen(true); };
  const openEditRule = (r: Rule) => {
    setEditingRule(r);
    const cond = r.condition ?? {};
    setRuleForm({
      name: String(r.name ?? ""), type: (r.type as (typeof RULE_TYPES)[number]) ?? "FLAT_RATE", amount: r.amount != null ? String(r.amount) : "",
      etaMinDays: String(r.etaMinDays ?? 2), etaMaxDays: String(r.etaMaxDays ?? 5), priority: String(r.priority ?? 0), isActive: r.isActive !== false,
      coverageAll: (r.coverage as { scope?: string } | undefined)?.scope === "PAN_INDIA", minOrderValue: String(cond.minOrderValue ?? ""), maxWeightKg: String(cond.maxWeightKg ?? ""),
    });
    setRuleFormOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRule(true);
    try {
      const condition: Record<string, unknown> = {};
      if (ruleForm.minOrderValue) condition.minOrderValue = Number(ruleForm.minOrderValue);
      if (ruleForm.maxWeightKg) condition.maxWeightKg = Number(ruleForm.maxWeightKg);
      const body = {
        name: ruleForm.name, type: ruleForm.type, coverage: ruleForm.coverageAll ? { scope: "PAN_INDIA" } : {},
        condition: Object.keys(condition).length ? condition : undefined,
        amount: ruleForm.amount ? Number(ruleForm.amount) : undefined,
        etaMinDays: Number(ruleForm.etaMinDays), etaMaxDays: Number(ruleForm.etaMaxDays),
        priority: Number(ruleForm.priority) || 0, isActive: ruleForm.isActive,
      };
      if (editingRule) await shippingApi.updateRule(editingRule.id, body);
      else await shippingApi.createRule(body);
      toast.success(editingRule ? "Rule updated." : "Rule created.");
      setRuleFormOpen(false);
      loadRules();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save rule.");
    } finally {
      setSavingRule(false);
    }
  };

  const handleReorderRule = (id: string, direction: -1 | 1) => {
    const idx = rules.findIndex((r) => r.id === id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= rules.length) return;
    const a = rules[idx], b = rules[swapIdx];
    runAction(() => shippingApi.reorderRules([{ id: a.id, priority: swapIdx }, { id: b.id, priority: idx }]), "Order updated.");
  };

  const openCreateCity = () => { setEditingCity(null); setCityForm(emptyCityForm()); setCityFormOpen(true); };
  const openEditCity = (c: City) => {
    setEditingCity(c);
    setCityForm({ name: String(c.name ?? ""), state: String(c.state ?? ""), pincodes: (c.pincodes ?? []).join(", "), expressDelivery: Boolean(c.expressDelivery) });
    setCityFormOpen(true);
  };

  const handleSaveCity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCity(true);
    try {
      const body = { name: cityForm.name, state: cityForm.state, pincodes: cityForm.pincodes.split(",").map((p) => p.trim()).filter(Boolean), expressDelivery: cityForm.expressDelivery };
      if (editingCity) await shippingApi.updateCity(editingCity.id, body);
      else await shippingApi.createCity(body);
      toast.success(editingCity ? "City updated." : "City added.");
      setCityFormOpen(false);
      loadCities();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save city.");
    } finally {
      setSavingCity(false);
    }
  };

  const handleTest = async () => {
    if (!testPincode) return;
    setTesting(true);
    try {
      const res = await shippingApi.serviceability(testPincode);
      setTestResult(res);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not check serviceability.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="adm-list-block">
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <div className="adm-tab-bar">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === "rules" && (
        <>
          <div className="adm-toolbar">
            <div className="adm-toolbar-spacer" />
            <button type="button" className="btn btn-primary" onClick={openCreateRule}>New rule</button>
          </div>
          {loadingRules ? <TableSkeleton /> : rules.length === 0 ? <EmptyState onClear={() => {}} /> : (
            <div className="card elev-sm adm-table-card">
              <table className="table">
                <thead><tr><th>Order</th><th>Name</th><th>Type</th><th className="num">Amount</th><th>ETA</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {rules.map((r, i) => (
                    <tr key={r.id}>
                      <td style={{ display: "flex", gap: 4 }}>
                        <button type="button" className="btn btn-ghost btn-sm" disabled={i === 0} onClick={() => handleReorderRule(r.id, -1)}>↑</button>
                        <button type="button" className="btn btn-ghost btn-sm" disabled={i === rules.length - 1} onClick={() => handleReorderRule(r.id, 1)}>↓</button>
                      </td>
                      <td>{r.name}</td>
                      <td>{String(r.type ?? "—").replace(/_/g, " ")}</td>
                      <td className="num">{r.amount != null ? `₹${r.amount}` : "—"}</td>
                      <td>{r.etaMinDays}–{r.etaMaxDays} days</td>
                      <td><span className={`tag ${r.isActive ? "tag-positive" : "tag-muted"}`}>{r.isActive ? "active" : "inactive"}</span></td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEditRule(r)}>Edit</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => runAction(() => shippingApi.setRuleActive(r.id, !r.isActive), r.isActive ? "Rule deactivated." : "Rule activated.")}>{r.isActive ? "Deactivate" : "Activate"}</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { if (confirm("Delete this rule?")) runAction(() => shippingApi.removeRule(r.id), "Rule deleted."); }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "cities" && (
        <>
          <div className="adm-toolbar">
            <div className="adm-toolbar-spacer" />
            <button type="button" className="btn btn-primary" onClick={openCreateCity}>New city</button>
          </div>
          {loadingCities ? <TableSkeleton /> : cities.length === 0 ? <EmptyState onClear={() => {}} /> : (
            <div className="card elev-sm adm-table-card">
              <table className="table">
                <thead><tr><th>City</th><th>State</th><th>Pincodes</th><th>Express</th><th /></tr></thead>
                <tbody>
                  {cities.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.state}</td>
                      <td>{(c.pincodes ?? []).join(", ")}</td>
                      <td>{c.expressDelivery ? "Yes" : "No"}</td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEditCity(c)}>Edit</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { if (confirm("Delete this city?")) runAction(() => shippingApi.removeCity(c.id), "City deleted."); }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "test" && (
        <div className="card elev-sm adm-form-card">
          <div className="card-kicker">Shipping & delivery</div>
          <h3 className="card-title" style={{ fontSize: 21 }}>Serviceability tester</h3>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input className="input" placeholder="Pincode" value={testPincode} onChange={(e) => setTestPincode(e.target.value)} style={{ maxWidth: 200 }} />
            <button type="button" className="btn btn-primary" onClick={handleTest} disabled={testing}>{testing ? "Checking…" : "Check"}</button>
          </div>
          {testResult && (
            <div className="adm-analytics-strip">
              <div className="card adm-analytics-card"><span className="adm-analytics-label">Serviceable</span><span className="adm-analytics-value">{testResult.serviceable ? "Yes" : "No"}</span></div>
              <div className="card adm-analytics-card"><span className="adm-analytics-label">ETA</span><span className="adm-analytics-value">{String(testResult.etaMinDays)}–{String(testResult.etaMaxDays)}d</span></div>
              <div className="card adm-analytics-card"><span className="adm-analytics-label">Free shipping</span><span className="adm-analytics-value">{testResult.freeShipping ? "Yes" : "No"}</span></div>
              <div className="card adm-analytics-card"><span className="adm-analytics-label">Charges</span><span className="adm-analytics-value">₹{String(testResult.charges)}</span></div>
            </div>
          )}
        </div>
      )}

      {ruleFormOpen && (
        <div className="dialog-backdrop" onClick={() => setRuleFormOpen(false)}>
          <div className="dialog elev-lg" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">{editingRule ? "Edit shipping rule" : "New shipping rule"}</div>
            <form onSubmit={handleSaveRule}>
              <div className="adm-form-grid cols-2">
                <div className="field full"><label>Name *</label><input className="input" required value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} /></div>
                <div className="field">
                  <label>Type *</label>
                  <select className="input" value={ruleForm.type} onChange={(e) => setRuleForm({ ...ruleForm, type: e.target.value as (typeof RULE_TYPES)[number] })}>
                    {RULE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="field"><label>Amount (₹)</label><input className="input" type="number" value={ruleForm.amount} onChange={(e) => setRuleForm({ ...ruleForm, amount: e.target.value })} /></div>
                <div className="field"><label>ETA min days *</label><input className="input" type="number" required value={ruleForm.etaMinDays} onChange={(e) => setRuleForm({ ...ruleForm, etaMinDays: e.target.value })} /></div>
                <div className="field"><label>ETA max days *</label><input className="input" type="number" required value={ruleForm.etaMaxDays} onChange={(e) => setRuleForm({ ...ruleForm, etaMaxDays: e.target.value })} /></div>
                <div className="field"><label>Priority</label><input className="input" type="number" value={ruleForm.priority} onChange={(e) => setRuleForm({ ...ruleForm, priority: e.target.value })} /></div>
                <div className="field"><label>Min order value condition (₹)</label><input className="input" type="number" value={ruleForm.minOrderValue} onChange={(e) => setRuleForm({ ...ruleForm, minOrderValue: e.target.value })} /></div>
                <div className="field"><label>Max weight condition (kg)</label><input className="input" type="number" value={ruleForm.maxWeightKg} onChange={(e) => setRuleForm({ ...ruleForm, maxWeightKg: e.target.value })} /></div>
                <div className="field full"><label className="check"><input type="checkbox" checked={ruleForm.coverageAll} onChange={(e) => setRuleForm({ ...ruleForm, coverageAll: e.target.checked })} /> Pan-India coverage (applies everywhere)</label></div>
                <div className="field full"><label className="check"><input type="checkbox" checked={ruleForm.isActive} onChange={(e) => setRuleForm({ ...ruleForm, isActive: e.target.checked })} /> Active</label></div>
              </div>
              <div className="dialog-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setRuleFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingRule}>{savingRule ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cityFormOpen && (
        <div className="dialog-backdrop" onClick={() => setCityFormOpen(false)}>
          <div className="dialog elev-lg" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">{editingCity ? "Edit city" : "New serviceable city"}</div>
            <form onSubmit={handleSaveCity}>
              <div className="adm-form-grid cols-2">
                <div className="field"><label>City name *</label><input className="input" required value={cityForm.name} onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })} /></div>
                <div className="field"><label>State *</label><input className="input" required value={cityForm.state} onChange={(e) => setCityForm({ ...cityForm, state: e.target.value })} /></div>
                <div className="field full"><label>Pincodes (comma-separated) *</label><input className="input" required value={cityForm.pincodes} onChange={(e) => setCityForm({ ...cityForm, pincodes: e.target.value })} /></div>
                <div className="field full"><label className="check"><input type="checkbox" checked={cityForm.expressDelivery} onChange={(e) => setCityForm({ ...cityForm, expressDelivery: e.target.checked })} /> Express delivery available</label></div>
              </div>
              <div className="dialog-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setCityFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingCity}>{savingCity ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
