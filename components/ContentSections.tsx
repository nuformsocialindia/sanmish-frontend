import { useMemo } from "react";
import { SERVICES, STATS, BRANDS, HOW_IT_WORKS, BUYERS_LOVE } from "@/lib/data";
import type { ApiBrand, ApiService } from "@/lib/publicApi";

const DEFAULT_SERVICE_ICON = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>`;

function normalizeApiServices(apiServices: ApiService[]) {
  return apiServices.map((s) => ({ t: s.name, d: s.summary, i: DEFAULT_SERVICE_ICON }));
}

export function WhySection() {
  return (
    <section className="section why" id="why">
      <div className="wrap why-grid">
        <div className="why-visual reveal">
          <div className="why-panel">
            <svg viewBox="0 0 520 420" xmlns="http://www.w3.org/2000/svg" aria-label="Verified industrial supplier network">
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#7BB145" /><stop offset="1" stopColor="#3E79BD" />
                </linearGradient>
              </defs>
              <rect width="520" height="420" fill="#eaf3fa" />
              <rect x="60" y="230" width="150" height="130" rx="8" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
              <path d="M60 230 L100 195 L140 230 M140 230 L180 195 L210 230" fill="none" stroke="#c3d3e0" strokeWidth="2" />
              <rect x="82" y="270" width="30" height="30" rx="3" fill="#7BB145" opacity=".7" />
              <rect x="130" y="270" width="30" height="30" rx="3" fill="#3E79BD" opacity=".7" />
              <rect x="240" y="140" width="26" height="220" rx="8" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
              <path d="M253 140v-30" stroke="#c3d3e0" strokeWidth="3" />
              <circle cx="253" cy="104" r="8" fill="url(#wg)" />
              <rect x="300" y="200" width="60" height="160" rx="30" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
              <rect x="300" y="240" width="60" height="10" fill="#7BB145" opacity=".6" />
              <rect x="380" y="230" width="70" height="130" rx="35" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
              <rect x="380" y="270" width="70" height="10" fill="#3E79BD" opacity=".6" />
              <path d="M210 300 H300 M360 300 H380" stroke="#9fb6cb" strokeWidth="6" fill="none" />
              <circle cx="360" cy="120" r="46" fill="#fff" stroke="url(#wg)" strokeWidth="4" />
              <path d="M340 120l14 14 26-28" fill="none" stroke="url(#wg)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="0" y="360" width="520" height="60" fill="#cddceb" />
            </svg>
          </div>
          <div className="why-float a">
            <span className="n grad-text">100%</span>
            <div>
              <b style={{ fontFamily: "Poppins", fontSize: ".9rem" }}>Verified</b>
              <span style={{ fontSize: ".76rem", color: "var(--muted)" }}>Every supplier</span>
            </div>
          </div>
          <div className="why-float b">
            <div className="ck" style={{ width: 40, height: 40, borderRadius: 12 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <b style={{ fontFamily: "Poppins", fontSize: ".9rem" }}>ISO Certified</b>
              <span style={{ fontSize: ".76rem", color: "var(--muted)" }}>Quality assured</span>
            </div>
          </div>
        </div>

        <div className="why-copy">
          <span className="eyebrow reveal"><span className="dot" />Why SANMISH</span>
          <h2 className="reveal d1" style={{ fontSize: "clamp(1.9rem,4vw,2.7rem)", fontWeight: 800, margin: "18px 0 16px" }}>
            Procurement built for <span className="grad-text">clean energy engineering</span>
          </h2>
          <p className="reveal d2" style={{ color: "var(--ink-soft)", fontSize: "1.05rem" }}>
            We bring the rigour of industrial procurement to alternative fuel infrastructure — so buyers source with confidence and manufacturers reach the right customers.
          </p>
          <div className="why-list">
            {[
              { t: "100% Verified Suppliers", s: "Documented & audited" },
              { t: "Industry Experts", s: "Gas-sector specialists" },
              { t: "Fast RFQ", s: "Quotes in hours" },
              { t: "Bulk Orders", s: "Volume pricing" },
              { t: "Secure Transactions", s: "Protected payments" },
              { t: "Installation & AMC", s: "Lifecycle support" },
            ].map((item, i) => (
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
          <a href="#services" className="btn btn-primary reveal d3" style={{ marginTop: 32 }}>
            Explore our services
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

export function ServicesSection({ apiServices = [] }: { apiServices?: ApiService[] }) {
  const delays = ["", " d1", " d2", " d3"];
  const services = useMemo(() => [...SERVICES, ...normalizeApiServices(apiServices)], [apiServices]);
  return (
    <section className="section" id="services">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />End-to-End Support</span>
          <h2 className="reveal d1">Our <span className="grad-text">Services</span></h2>
          <p className="reveal d2">Beyond the marketplace — full engineering support from supply to commissioning and lifecycle care.</p>
        </div>
        <div className="svc-grid">
          {services.map((s, i) => (
            <div key={`${s.t}-${i}`} className={`svc reveal${delays[i % 4]}`}>
              <span className="num">0{i + 1}</span>
              <div className="svc-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: s.i }} />
              </div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  return (
    <section className="section stats" id="stats">
      <div className="blob g" /><div className="blob b" />
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal" style={{ background: "rgba(255,255,255,.08)", color: "#fff", borderColor: "rgba(255,255,255,.2)" }}>
            <span className="dot" />Trusted at scale
          </span>
          <h2 className="reveal d1">India&rsquo;s clean energy marketplace, by the numbers</h2>
        </div>
        <div className="stat-grid">
          {STATS.map((s, i) => (
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

export function BrandsSection({ apiBrands = [] }: { apiBrands?: ApiBrand[] }) {
  const gearIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>`;
  const allBrands = [...BRANDS, ...apiBrands.map((b) => b.name)];
  const combined = [...allBrands, ...allBrands];
  return (
    <section className="brands">
      <div className="wrap"><p className="lbl">Compatible with equipment from leading industrial brands</p></div>
      <div className="marquee">
        <div className="marquee-track">
          {combined.map((b, i) => (
            <span key={i} className="brand-logo">
              <span dangerouslySetInnerHTML={{ __html: gearIcon }} />
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="section steps">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />Simple Process</span>
          <h2 className="reveal d1">How <span className="grad-text">SANMISH</span> works</h2>
          <p className="reveal d2">From search to site commissioning — a single, transparent procurement flow.</p>
        </div>
        <div className="steps-row">
          <div className="steps-line" />
          <div className="steps-pulse" />
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className={`step reveal${i > 0 ? ` d${i}` : ""}`}>
              <div className="step-circle">
                <span className="step-n">{step.n}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: step.icon }} />
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

export function BuyersLove() {
  return (
    <section className="section love">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />Buyer Benefits</span>
          <h2 className="reveal d1">Why buyers <span className="grad-text">love us</span></h2>
        </div>
        <div className="love-grid">
          {BUYERS_LOVE.map((item, i) => (
            <div key={item.title} className={`love-card reveal${i > 0 ? ` d${i}` : ""}`}>
              <div className="love-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: item.icon }} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
