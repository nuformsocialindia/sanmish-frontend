import Link from "next/link";
import { SUPPLIER_STATS, SUPPLIER_WHY_ITEMS, SUPPLIER_JOIN_STEPS, SUPPLIER_BENEFITS } from "@/lib/data";
import { iconMarkup } from "@/lib/sectionIcons";

type Stat = { count: number; suffix: string; label: string };
type WhyItem = { t: string; s: string };
type JoinStep = { title: string; desc: string; icon: string };
type Benefit = { icon: string; title: string; desc: string };

export function SuppliersHero() {
  return (
    <section className="hero" id="home" style={{ padding: "56px 0 80px" }}>
      <div className="hero-bg">
        <div className="blob g" />
        <div className="blob b" />
        <div className="grid-fade" />
      </div>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="eyebrow reveal"><span className="dot" />Verified Supplier Network</span>
          <h1 className="reveal d1">
            Source from India&rsquo;s network of <span className="grad-text">verified suppliers</span>
          </h1>
          <p className="hero-sub reveal d2">
            Every supplier on SANMISH is document-verified and quality audited — browse manufacturers, OEMs and EPC partners across CNG, CBG, Bio Gas and Hydrogen equipment.
          </p>
          <div className="hero-cta reveal d3">
            <a href="#directory" className="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              Browse suppliers
            </a>
            <a href="#join" className="btn btn-ghost">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Become a supplier
            </a>
          </div>
          <div className="hero-trust reveal d4">
            <div className="avatars"><span>KP</span><span>GF</span><span>HT</span><span>+</span></div>
            <div>
              <strong>500+ verified suppliers</strong>
              <small><span className="stars">★★★★★</span> rated by 5000+ buyers</small>
            </div>
          </div>
        </div>
        <div className="hero-illu reveal d2">
          <div className="illu-stage">
            <div className="illu-ring r1" />
            <div className="illu-ring r2" />
            <div className="illu-core">
              <svg viewBox="0 0 280 340" xmlns="http://www.w3.org/2000/svg" aria-label="Verified supplier network illustration">
                <defs>
                  <linearGradient id="gSup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7BB145" /><stop offset="1" stopColor="#3E79BD" /></linearGradient>
                </defs>
                <rect x="0" y="0" width="280" height="340" fill="#eaf3fa" />
                <circle cx="140" cy="150" r="40" fill="#fff" stroke="url(#gSup)" strokeWidth="4" />
                <path d="M126 150l10 10 18-20" fill="none" stroke="url(#gSup)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="60" cy="90" r="20" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
                <circle cx="220" cy="90" r="20" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
                <circle cx="60" cy="230" r="20" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
                <circle cx="220" cy="230" r="20" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
                <path d="M78 102 L112 130M202 102 L168 130M78 218 L112 172M202 218 L168 172" stroke="#c3d3e0" strokeWidth="2.4" strokeDasharray="4 4" />
                <rect x="0" y="300" width="280" height="40" fill="#cddceb" />
              </svg>
            </div>
            <span className="particle" style={{ left: "44%", animationDelay: "0s" }} />
            <span className="particle" style={{ left: "52%", animationDelay: "1.4s", background: "var(--blue)" }} />
            <span className="particle" style={{ left: "48%", animationDelay: "2.6s" }} />
          </div>
          <div className="float-card fc1">
            <div className="fi" style={{ background: "var(--grad)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div><b>100% Verified</b><span>Document audited</span></div>
          </div>
          <div className="float-card fc2">
            <div className="fi" style={{ background: "#3E79BD" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 15l2 2 4-4" />
              </svg>
            </div>
            <div><b>Bulk RFQ</b><span>One request, many quotes</span></div>
          </div>
          <div className="float-card fc3">
            <div className="fi" style={{ background: "#7BB145" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M2 12h4M18 12h4" /><circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <div><b>Fast Quotes</b><span>~4h average</span></div>
          </div>
          <div className="float-card fc4">
            <div className="fi" style={{ background: "var(--grad)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              </svg>
            </div>
            <div><b>PAN India</b><span>28+ states</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SupplierStatsSection({ stats = SUPPLIER_STATS }: { stats?: Stat[] }) {
  return (
    <section className="section stats" id="stats">
      <div className="blob g" /><div className="blob b" />
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal" style={{ background: "rgba(255,255,255,.08)", color: "#fff", borderColor: "rgba(255,255,255,.2)" }}>
            <span className="dot" />Network at a glance
          </span>
          <h2 className="reveal d1">A network built on trust</h2>
        </div>
        <div className="stat-grid">
          {stats.map((s, i) => (
            <div key={s.label} className={`stat reveal${i > 0 ? ` d${i}` : ""}`}>
              <div className="num" data-count={String(s.count)} data-suffix={s.suffix}>0</div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhySourceSection({ items = SUPPLIER_WHY_ITEMS }: { items?: WhyItem[] }) {
  return (
    <section className="section why" id="why-suppliers">
      <div className="wrap why-grid">
        <div className="why-visual reveal">
          <div className="why-panel">
            <svg viewBox="0 0 520 420" xmlns="http://www.w3.org/2000/svg" aria-label="Document verification and quality audit">
              <defs><linearGradient id="wgSup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7BB145" /><stop offset="1" stopColor="#3E79BD" /></linearGradient></defs>
              <rect width="520" height="420" fill="#eaf3fa" />
              <rect x="80" y="60" width="220" height="280" rx="12" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
              <path d="M104 100h140M104 130h172M104 160h150M104 190h172M104 220h100" stroke="#c3d3e0" strokeWidth="3" strokeLinecap="round" />
              <path d="M104 250l14 14 24-26" fill="none" stroke="#7BB145" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M104 284l14 14 24-26" fill="none" stroke="#7BB145" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="380" cy="120" r="52" fill="#fff" stroke="url(#wgSup)" strokeWidth="4" />
              <path d="M358 120l14 14 28-30" fill="none" stroke="url(#wgSup)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="0" y="360" width="520" height="60" fill="#cddceb" />
            </svg>
          </div>
          <div className="why-float a">
            <span className="n grad-text">100%</span>
            <div>
              <b style={{ fontFamily: "Poppins", fontSize: ".9rem" }}>Verified</b>
              <span style={{ fontSize: ".76rem", color: "var(--muted)" }}>Document audited</span>
            </div>
          </div>
          <div className="why-float b">
            <div className="ck" style={{ width: 40, height: 40, borderRadius: 12 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <b style={{ fontFamily: "Poppins", fontSize: ".9rem" }}>ISO Ready</b>
              <span style={{ fontSize: ".76rem", color: "var(--muted)" }}>Quality-audited</span>
            </div>
          </div>
        </div>
        <div className="why-copy">
          <span className="eyebrow reveal"><span className="dot" />Why source here</span>
          <h2 className="reveal d1" style={{ fontSize: "clamp(1.9rem,4vw,2.7rem)", fontWeight: 800, margin: "18px 0 16px" }}>
            Every supplier, <span className="grad-text">verified and audited</span>
          </h2>
          <p className="reveal d2" style={{ color: "var(--ink-soft)", fontSize: "1.05rem" }}>
            We check documents, audit quality and let real buyers rate every transaction — so you can source with confidence instead of guesswork.
          </p>
          <div className="why-list">
            {items.map((item, i) => (
              <div key={item.t} className={`why-item reveal d${(i % 2) + 1}`}>
                <div className="ck">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5 9-9" />
                  </svg>
                </div>
                <div><b>{item.t}</b><span>{item.s}</span></div>
              </div>
            ))}
          </div>
          <Link href="/contact" className="btn btn-primary reveal d3" style={{ marginTop: 32 }}>
            Request a quotation
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function JoinStepsSection({ steps = SUPPLIER_JOIN_STEPS }: { steps?: JoinStep[] }) {
  return (
    <section className="section steps" id="join">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />Sell on SANMISH</span>
          <h2 className="reveal d1">Become a <span className="grad-text">verified supplier</span></h2>
          <p className="reveal d2">Five simple steps from registration to your first order.</p>
        </div>
        <div className="steps-row">
          <div className="steps-line" />
          <div className="steps-pulse" />
          {steps.map((step, i) => (
            <div key={step.title} className={`step reveal${i > 0 ? ` d${i}` : ""}`}>
              <div className="step-circle">
                <span className="step-n">{i + 1}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: iconMarkup(step.icon) }} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BenefitsSection({ benefits = SUPPLIER_BENEFITS }: { benefits?: Benefit[] }) {
  return (
    <section className="section" id="benefits">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />What you get</span>
          <h2 className="reveal d1">Benefits for <span className="grad-text">suppliers</span></h2>
        </div>
        <div className="feat-grid">
          {benefits.map((f, i) => (
            <div key={f.title} className={`feat-card reveal${i > 0 ? ` d${i}` : ""}`}>
              <div className="feat-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: iconMarkup(f.icon) }} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SuppliersCTASection() {
  return (
    <section className="cta" id="cta">
      <div className="wrap">
        <div className="cta-box reveal">
          <div className="rings a" /><div className="rings b" />
          <h2>Ready to reach more buyers?</h2>
          <p>Join 500+ verified suppliers already receiving qualified RFQs from buyers across India.</p>
          <div className="cta-btns">
            <Link href="/#cta" className="btn btn-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
              Become a seller
            </Link>
            <Link href="/contact" className="btn btn-light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Talk to our team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
