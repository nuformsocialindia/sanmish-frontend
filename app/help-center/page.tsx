"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useScrollAnimations } from "@/lib/useScrollAnimations";
import { HELP_CENTER_FAQ } from "@/lib/data";
import FAQAccordion from "@/components/FAQAccordion";

export default function HelpCenterPage() {
  useScrollAnimations();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HELP_CENTER_FAQ;
    return HELP_CENTER_FAQ.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [query]);

  const totalResults = filtered.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <>
      <section className="page-hero" id="home">
        <div className="hero-bg">
          <div className="blob g" />
          <div className="blob b" />
          <div className="grid-fade" />
        </div>
        <div className="wrap">
          <div className="ph-inner">
            <span className="eyebrow reveal"><span className="dot" />Help Center</span>
            <h1 className="reveal d1">How can we <span className="grad-text">help you today?</span></h1>
            <p className="reveal d2">
              Search common questions about orders, payments, shipping, returns, and selling on SANMISH — or reach our team directly.
            </p>
            <div className="search-card reveal d3" style={{ marginTop: 30 }}>
              <div className="search-input" style={{ flex: 1 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for a topic — e.g. “tracking”, “returns”, “OTP”"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          {query.trim() && (
            <p className="reveal" style={{ color: "var(--muted)", marginBottom: 24 }}>
              {totalResults} result{totalResults === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <h3>No results found</h3>
              <p>Try a different search term, or reach out to our team directly.</p>
              <Link href="/contact" className="btn btn-primary" style={{ marginTop: 20 }}>Contact SANMISH</Link>
            </div>
          ) : (
            filtered.map((cat, ci) => (
              <div key={cat.category} className="help-category" style={{ marginBottom: 48 }}>
                <h2 className={`reveal${ci > 0 ? " d1" : ""}`} style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: 20 }}>
                  {cat.category}
                </h2>
                <FAQAccordion items={cat.items} />
              </div>
            ))
          )}
        </div>
      </section>

      <section className="cta" id="cta">
        <div className="wrap">
          <div className="cta-box reveal">
            <div className="rings a" /><div className="rings b" />
            <h2>Still need help?</h2>
            <p>Our team responds within one business day — reach out and we&rsquo;ll sort it out.</p>
            <div className="cta-btns">
              <Link href="/contact" className="btn btn-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                </svg>
                Contact Us
              </Link>
              <Link href="/products" className="btn btn-light">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
