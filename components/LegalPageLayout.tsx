"use client";
import Link from "next/link";
import { useScrollAnimations } from "@/lib/useScrollAnimations";

export type LegalSection = {
  id: string;
  heading: string;
  body: (string | { list: string[] })[];
};

export default function LegalPageLayout({
  eyebrow,
  title,
  intro,
  lastUpdated,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  useScrollAnimations();

  return (
    <>
      <section className="pg-banner" style={{ paddingBottom: 24 }}>
        <div className="hero-bg">
          <div className="blob g" />
          <div className="blob b" />
        </div>
        <div className="wrap">
          <div className="crumbs reveal">
            <Link href="/">Home</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="cur">{title}</span>
          </div>
          <span className="eyebrow reveal"><span className="dot" />{eyebrow}</span>
          <h1 className="reveal d1" style={{ marginTop: 14, maxWidth: 760 }}>{title}</h1>
          <p className="reveal d2" style={{ color: "var(--ink-soft)", maxWidth: 700, marginTop: 10 }}>{intro}</p>
          <span className="legal-updated reveal d2">Last updated: {lastUpdated}</span>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="legal-layout">
            <nav className="legal-toc reveal" aria-label="Table of contents">
              <b>On this page</b>
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`}>{s.heading}</a>
              ))}
            </nav>

            <div className="legal-content reveal d1">
              {sections.map((s) => (
                <div key={s.id} id={s.id} className="legal-section">
                  <h2>{s.heading}</h2>
                  {s.body.map((block, i) =>
                    typeof block === "string" ? (
                      <p key={i}>{block}</p>
                    ) : (
                      <ul key={i}>
                        {block.list.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              ))}

              <div className="legal-contact-box">
                <b>Questions about this policy?</b>
                <p>Reach out to our team and we&rsquo;ll get back within one business day.</p>
                <Link href="/contact" className="btn btn-primary">Contact SANMISH</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
