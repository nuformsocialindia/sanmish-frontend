"use client";
import { useCallback, useEffect, useState } from "react";
import { taxApi, AdminApiError } from "@/lib/admin/api";
import { money } from "@/lib/admin/format";
import { useAdminToast } from "@/components/admin/Toast";
import { TableSkeleton, EmptyState, ErrorBanner } from "@/components/admin/ListStates";
import Icon from "@/components/admin/Icon";

type Hsn = Record<string, unknown> & {
  id: string; code?: string; description?: string; gstRate?: number; cessRate?: number | null;
  applicability?: string; isActive?: boolean; productCount?: number;
};
type TaxSettings = Record<string, unknown> & {
  legalName?: string; gstin?: string; pan?: string; stateCode?: string; placeOfSupplyRule?: string;
  pricesIncludeGstByDefault?: boolean; gstInvoiceEnabled?: boolean; invoicePrefix?: string; invoiceStartNumber?: number;
  tcsApplicable?: boolean; tcsRate?: number; tdsSection194OEnabled?: boolean; reverseChargeSupported?: boolean;
  eInvoiceEnabled?: boolean; eWayBillThreshold?: number;
};

const GST_RATES = [0, 5, 12, 18, 28];
const TABS = [{ key: "hsn", label: "HSN / SAC codes" }, { key: "settings", label: "Tax settings" }, { key: "report", label: "GST report" }];

export default function AdminTaxPage() {
  const toast = useAdminToast();
  const [tab, setTab] = useState("hsn");

  const [hsnList, setHsnList] = useState<Hsn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<Hsn | null>(null);
  const [form, setForm] = useState({ code: "", description: "", gstRate: "18", cessRate: "", applicability: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<TaxSettings | null>(null);
  const [settingsForm, setSettingsForm] = useState<TaxSettings>({});
  const [savingSettings, setSavingSettings] = useState(false);

  const [report, setReport] = useState<Record<string, unknown> | null>(null);

  const loadHsn = useCallback(() => {
    setLoading(true);
    setError("");
    taxApi.hsnList()
      .then((r) => setHsnList(r as Hsn[]))
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Could not load HSN codes."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadHsn(); }, [loadHsn]);
  useEffect(() => {
    if (tab === "settings" && !settings) {
      taxApi.settings().then((s) => { setSettings(s as TaxSettings); setSettingsForm(s as TaxSettings); }).catch(() => {});
    }
    if (tab === "report" && !report) {
      taxApi.gstReport().then(setReport).catch(() => {});
    }
  }, [tab, settings, report]);

  const filtered = hsnList.filter((h) =>
    !search || String(h.code ?? "").toLowerCase().includes(search.toLowerCase()) || String(h.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => { setEditing(null); setForm({ code: "", description: "", gstRate: "18", cessRate: "", applicability: "", isActive: true }); };
  const openEdit = (h: Hsn) => {
    setEditing(h);
    setForm({
      code: String(h.code ?? ""), description: String(h.description ?? ""), gstRate: String(h.gstRate ?? 18),
      cessRate: h.cessRate != null ? String(h.cessRate) : "", applicability: String(h.applicability ?? ""), isActive: h.isActive !== false,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        code: form.code, description: form.description, gstRate: Number(form.gstRate),
        cessRate: form.cessRate ? Number(form.cessRate) : undefined, applicability: form.applicability || undefined, isActive: form.isActive,
      };
      if (editing) await taxApi.hsnUpdate(editing.id, body);
      else await taxApi.hsnCreate(body);
      toast.success(editing ? "HSN code updated." : "HSN code created.");
      resetForm();
      loadHsn();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save HSN code.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (h: Hsn) => {
    if (!confirm(`Delete HSN ${h.code}? This is blocked if any product still references it.`)) return;
    try {
      await taxApi.hsnRemove(h.id);
      toast.success("HSN code deleted.");
      loadHsn();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not delete — products may still reference this HSN code.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const saved = await taxApi.updateSettings(settingsForm);
      setSettings(saved as TaxSettings);
      toast.success("Tax settings updated.");
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Could not save settings.");
    } finally {
      setSavingSettings(false);
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

      {tab === "hsn" && (
        <>
          <div className="card elev-sm adm-form-card">
            <div className="card-kicker">Tax & GST</div>
            <h3 className="card-title" style={{ fontSize: 21 }}>{editing ? "Edit HSN code" : "New HSN code"}</h3>
            <form onSubmit={handleSave} className="adm-form-grid cols-3">
              <div className="field"><label>HSN / SAC code *</label><input className="input" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
              <div className="field full"><label>Description *</label><input className="input" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="field">
                <label>GST rate *</label>
                <select className="input" value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: e.target.value })}>
                  {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                </select>
              </div>
              <div className="field"><label>Cess rate (%)</label><input className="input" type="number" value={form.cessRate} onChange={(e) => setForm({ ...form, cessRate: e.target.value })} /></div>
              <div className="field"><label>Applicability</label><input className="input" value={form.applicability} onChange={(e) => setForm({ ...form, applicability: e.target.value })} placeholder="e.g. Goods, Services" /></div>
              <div className="field">
                <label className="check" style={{ marginTop: 22 }}>
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  Active
                </label>
              </div>
              <div className="field full">
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: "flex-start" }}>{saving ? "Saving…" : editing ? "Save changes" : "Create HSN code"}</button>
                {editing && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel edit</button>}
              </div>
            </form>
          </div>

          <div className="adm-toolbar">
            <div className="adm-search-wrap">
              <Icon name="search" size={18} />
              <input className="input" placeholder="Search HSN codes…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState onClear={() => setSearch("")} />
          ) : (
            <div className="card elev-sm adm-table-card">
              <table className="table">
                <thead><tr><th>Code</th><th>Description</th><th className="num">GST %</th><th>Applicability</th><th className="num">Products</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {filtered.map((h) => (
                    <tr key={h.id}>
                      <td>{h.code}</td>
                      <td>{h.description}</td>
                      <td className="num">{h.gstRate}%{h.cessRate ? ` + ${h.cessRate}% cess` : ""}</td>
                      <td>{h.applicability ?? "—"}</td>
                      <td className="num">{h.productCount ?? 0}</td>
                      <td><span className={`tag ${h.isActive ? "tag-positive" : "tag-muted"}`}>{h.isActive ? "active" : "inactive"}</span></td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(h)}>Edit</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(h)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "settings" && (
        <div className="card elev-sm adm-form-card">
          <div className="card-kicker">Tax & GST</div>
          <h3 className="card-title" style={{ fontSize: 21 }}>Company tax configuration</h3>
          {!settings ? <TableSkeleton /> : (
            <form onSubmit={handleSaveSettings} className="adm-form-grid cols-2">
              <div className="field"><label>Legal name</label><input className="input" value={settingsForm.legalName ?? ""} onChange={(e) => setSettingsForm({ ...settingsForm, legalName: e.target.value })} /></div>
              <div className="field"><label>GSTIN</label><input className="input" value={settingsForm.gstin ?? ""} onChange={(e) => setSettingsForm({ ...settingsForm, gstin: e.target.value })} /></div>
              <div className="field"><label>PAN</label><input className="input" value={settingsForm.pan ?? ""} onChange={(e) => setSettingsForm({ ...settingsForm, pan: e.target.value })} /></div>
              <div className="field"><label>State code</label><input className="input" value={settingsForm.stateCode ?? ""} onChange={(e) => setSettingsForm({ ...settingsForm, stateCode: e.target.value })} /></div>
              <div className="field full"><label>Place of supply rule</label><input className="input" value={settingsForm.placeOfSupplyRule ?? ""} onChange={(e) => setSettingsForm({ ...settingsForm, placeOfSupplyRule: e.target.value })} /></div>
              <div className="field"><label>Invoice prefix</label><input className="input" value={settingsForm.invoicePrefix ?? ""} onChange={(e) => setSettingsForm({ ...settingsForm, invoicePrefix: e.target.value })} /></div>
              <div className="field"><label>Invoice start number</label><input className="input" type="number" value={settingsForm.invoiceStartNumber ?? ""} onChange={(e) => setSettingsForm({ ...settingsForm, invoiceStartNumber: Number(e.target.value) })} /></div>
              <div className="field"><label>TCS rate (%)</label><input className="input" type="number" value={settingsForm.tcsRate ?? ""} onChange={(e) => setSettingsForm({ ...settingsForm, tcsRate: Number(e.target.value) })} /></div>
              <div className="field"><label>E-way bill threshold (₹)</label><input className="input" type="number" value={settingsForm.eWayBillThreshold ?? ""} onChange={(e) => setSettingsForm({ ...settingsForm, eWayBillThreshold: Number(e.target.value) })} /></div>
              <div className="field full" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <label className="check"><input type="checkbox" checked={Boolean(settingsForm.pricesIncludeGstByDefault)} onChange={(e) => setSettingsForm({ ...settingsForm, pricesIncludeGstByDefault: e.target.checked })} /> Prices include GST by default</label>
                <label className="check"><input type="checkbox" checked={Boolean(settingsForm.gstInvoiceEnabled)} onChange={(e) => setSettingsForm({ ...settingsForm, gstInvoiceEnabled: e.target.checked })} /> GST invoice enabled</label>
                <label className="check"><input type="checkbox" checked={Boolean(settingsForm.tcsApplicable)} onChange={(e) => setSettingsForm({ ...settingsForm, tcsApplicable: e.target.checked })} /> TCS applicable</label>
                <label className="check"><input type="checkbox" checked={Boolean(settingsForm.tdsSection194OEnabled)} onChange={(e) => setSettingsForm({ ...settingsForm, tdsSection194OEnabled: e.target.checked })} /> TDS 194-O enabled</label>
                <label className="check"><input type="checkbox" checked={Boolean(settingsForm.reverseChargeSupported)} onChange={(e) => setSettingsForm({ ...settingsForm, reverseChargeSupported: e.target.checked })} /> Reverse charge supported</label>
                <label className="check"><input type="checkbox" checked={Boolean(settingsForm.eInvoiceEnabled)} onChange={(e) => setSettingsForm({ ...settingsForm, eInvoiceEnabled: e.target.checked })} /> e-Invoice enabled</label>
              </div>
              <div className="field full">
                <button type="submit" className="btn btn-primary" disabled={savingSettings}>{savingSettings ? "Saving…" : "Save settings"}</button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === "report" && (
        <div className="card elev-sm adm-form-card">
          <div className="card-kicker">Tax & GST</div>
          <h3 className="card-title" style={{ fontSize: 21 }}>GST collected report</h3>
          {!report ? <TableSkeleton /> : (
            <div className="adm-analytics-strip">
              {Object.entries(report).map(([k, v]) => (
                <div key={k} className="card adm-analytics-card">
                  <span className="adm-analytics-label">{k.replace(/([A-Z])/g, " $1")}</span>
                  <span className="adm-analytics-value">{typeof v === "number" ? money(v) : String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
