"use client";
import { useEffect, useRef, useState } from "react";
import { taxApi } from "@/lib/admin/api";
import Icon from "@/components/admin/Icon";

type HsnEntry = { id?: string; code: string; description?: string; gstRate?: number };

// Searchable HSN/SAC picker — replaces a plain text box admins had to
// remember exact codes for. Loads the tax master once, filters by code OR
// description as you type, and reports a clear match/no-match state instead
// of a flat gray line that looked identical whether it succeeded or failed.
export default function HsnCodeCombobox({
  value,
  onChange,
  onResolved,
}: {
  value: string;
  onChange: (code: string) => void;
  onResolved: (hsn: HsnEntry) => void;
}) {
  const [entries, setEntries] = useState<HsnEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    taxApi.hsnList()
      .then((list) => setEntries(list as HsnEntry[]))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const query = value.trim().toLowerCase();
  const matches = (query
    ? entries.filter((e) => e.code.toLowerCase().includes(query) || (e.description ?? "").toLowerCase().includes(query))
    : entries
  ).slice(0, 30);

  const exactMatch = entries.find((e) => e.code.toLowerCase() === query);

  const select = (e: HsnEntry) => {
    onChange(e.code);
    onResolved(e);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input
        className="input"
        required
        value={value}
        placeholder={loaded ? "Search by code or description…" : "Loading tax master…"}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <div className="adm-combobox-menu">
          {matches.map((e) => (
            <button type="button" key={e.id ?? e.code} className="adm-combobox-item" onClick={() => select(e)}>
              <strong>{e.code}</strong>
              {e.description && <span className="adm-combobox-desc"> — {e.description}</span>}
              {e.gstRate != null && <span className="adm-combobox-rate">GST {e.gstRate}%</span>}
            </button>
          ))}
        </div>
      )}
      {loaded && query && exactMatch && (
        <p className="adm-field-success">
          <Icon name="check-circle" size={13} />
          Found: {exactMatch.description || exactMatch.code} — GST {exactMatch.gstRate}%
        </p>
      )}
      {loaded && query && !exactMatch && (
        <p className="adm-field-error">
          <Icon name="alert-circle" size={13} />
          Not in the tax master yet — register it in Tax &amp; GST → HSN/SAC codes, or pick a match above.
        </p>
      )}
    </div>
  );
}
