"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { SUPPLIERS, SUPPLIER_FILTERS } from "@/lib/data";

type Supplier = { n: string; a: string; t: string; loc: string; r: string; rv: number; p: number; tags: string[]; cats: string[] };
type SupplierFilter = { value: string; label: string };

export default function SupplierDirectory({
  suppliers = SUPPLIERS,
  filters = SUPPLIER_FILTERS,
}: {
  suppliers?: Supplier[];
  filters?: SupplierFilter[];
}) {
  const [active, setActive] = useState("all");

  const filtered = useMemo(
    () => (active === "all" ? suppliers : suppliers.filter((s) => s.cats.includes(active))),
    [active, suppliers]
  );

  return (
    <section className="section" id="directory" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />Supplier directory</span>
          <h2 className="reveal d1">Find your <span className="grad-text">verified supplier</span></h2>
          <p className="reveal d2">Filter by category to browse manufacturers, OEMs and EPC partners across India.</p>
        </div>
        <div className="sup-filters reveal">
          {filters.map((f) => (
            <button
              key={f.value}
              className={`filt${active === f.value ? " active" : ""}`}
              onClick={() => setActive(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="sup-grid">
          {filtered.map((s, i) => (
            <div key={s.n} className={`sup reveal${i > 0 ? ` d${i % 4}` : ""}`}>
              <div className="sup-top">
                <div className="sup-logo">{s.a}</div>
                <span className="sup-verify">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Verified
                </span>
              </div>
              <div className="sup-body">
                <h3>{s.n}</h3>
                <span className="sup-type">{s.t}</span>
                <div className="sup-meta">
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {s.loc}
                  </span>
                  <span className="sup-rate">
                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                    </svg>
                    {s.r} ({s.rv})
                  </span>
                </div>
                <div className="sup-tags">
                  {s.tags.map((t) => (
                    <span key={t} className="sup-chip">{t}</span>
                  ))}
                </div>
              </div>
              <div className="sup-foot">
                <span>{s.p} products</span>
                <Link href="/contact" className="btn btn-ghost">Request quote</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
