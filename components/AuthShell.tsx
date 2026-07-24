import type { ReactNode } from "react";

const HIGHLIGHTS = [
  { n: "500+", l: "Verified Suppliers" },
  { n: "10,000+", l: "Products Listed" },
  { n: "28+", l: "States Served" },
  { n: "24–48h", l: "Average RFQ Response" },
];

export default function AuthShell({
  eyebrow,
  heading,
  subtext,
  children,
}: {
  eyebrow: string;
  heading: ReactNode;
  subtext: string;
  children: ReactNode;
}) {
  return (
    <section className="auth-shell">
      <div className="auth-panel">
        <div className="rings a" /><div className="rings b" />
        <div className="auth-panel-inner">
          <span className="auth-panel-brand">
            SANMISH<span>X</span>
          </span>
          <span className="eyebrow"><span className="dot" />{eyebrow}</span>
          <h1>{heading}</h1>
          <p>{subtext}</p>
          <div className="auth-highlights-list">
            {HIGHLIGHTS.map((h) => (
              <div key={h.l} className="auth-highlight-item">
                <b>{h.n}</b>
                <span>{h.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-form-col">{children}</div>
    </section>
  );
}
