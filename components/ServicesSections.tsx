import Link from "next/link";
import { SERVICES, PROCESS_STEPS, INDUSTRIES, SERVICE_STATS } from "@/lib/data";
import type { ApiService } from "@/lib/publicApi";
import { iconMarkup } from "@/lib/sectionIcons";

const DEFAULT_SERVICE_ICON = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>`;

type Stat = { count: number; suffix: string; label: string };
type ProcessStep = { title: string; desc: string; icon: string };
type WhyItem = { t: string; s: string };
type Industry = { title: string; desc: string; icon: string };
type ServiceItem = { t: string; d: string; i: string };

export const DEFAULT_WHY_SERVICES_ITEMS: WhyItem[] = [
  { t: "Certified engineers", s: "Trained & audited" },
  { t: "Safety first", s: "Compliant to code" },
  { t: "Genuine spares", s: "Fast fulfilment" },
  { t: "Nationwide teams", s: "28+ states" },
];

function normalizeApiServices(apiServices: ApiService[]) {
  return apiServices.map((s) => ({ t: s.name, d: s.summary, i: DEFAULT_SERVICE_ICON }));
}

export function ServicesHero() {
  return (
    <section className="hero" id="home" style={{ padding: "56px 0 80px" }}>
      <div className="hero-bg">
        <div className="blob g" />
        <div className="blob b" />
        <div className="grid-fade" />
      </div>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="eyebrow reveal"><span className="dot" />End-to-End Support</span>
          <h1 className="reveal d1">
            Engineering-grade services for <span className="grad-text">clean energy infrastructure</span>
          </h1>
          <p className="hero-sub reveal d2">
            Beyond the marketplace, SANMISH delivers the full lifecycle — supply, installation, commissioning and maintenance of CNG, CBG, Bio Gas and Hydrogen systems, handled by certified engineers.
          </p>
          <div className="hero-cta reveal d3">
            <Link href="/contact" className="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 15l2 2 4-4" />
              </svg>
              Request a quote
            </Link>
            <a href="#services-list" className="btn btn-ghost">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              View all services
            </a>
          </div>
          <div className="hero-trust reveal d4">
            <div className="avatars"><span>EPC</span><span>AMC</span><span>H₂</span><span>+</span></div>
            <div>
              <strong>40+ certified field engineers</strong>
              <small><span className="stars">★★★★★</span> turnkey delivery across 28+ states</small>
            </div>
          </div>
        </div>
        <div className="hero-illu reveal d2">
          <div className="illu-stage">
            <div className="illu-ring r1" />
            <div className="illu-ring r2" />
            <div className="illu-core">
              <svg viewBox="0 0 280 340" xmlns="http://www.w3.org/2000/svg" aria-label="Engineering services illustration">
                <defs>
                  <linearGradient id="gA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7BB145" /><stop offset="1" stopColor="#3E79BD" /></linearGradient>
                  <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eef4f9" /><stop offset="1" stopColor="#dbe8f3" /></linearGradient>
                </defs>
                <rect x="0" y="0" width="280" height="340" fill="url(#gB)" />
                <rect x="46" y="52" width="188" height="150" rx="10" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
                <path d="M62 84h84M62 100h120M62 116h96M62 132h120M62 148h64" stroke="#c3d3e0" strokeWidth="3" strokeLinecap="round" />
                <circle cx="196" cy="132" r="24" fill="none" stroke="url(#gA)" strokeWidth="3" />
                <path d="M196 118v28M182 132h28" stroke="#7BB145" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="96" cy="240" r="34" fill="#fff" stroke="url(#gA)" strokeWidth="4" />
                <path d="M96 224a16 16 0 1 0 .01 0M96 214v-6M96 272v-6M72 240h-6M126 240h-6" stroke="#3E79BD" strokeWidth="3" strokeLinecap="round" fill="none" />
                <rect x="152" y="214" width="82" height="70" rx="10" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
                <path d="M166 232l6 6 10-10" stroke="#7BB145" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M166 256l6 6 10-10" stroke="#3E79BD" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <rect x="188" y="230" width="34" height="6" rx="3" fill="#e2ebf3" />
                <rect x="188" y="254" width="34" height="6" rx="3" fill="#e2ebf3" />
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
                <path d="M2 20h20M4 20V8l8-5 8 5v12M9 20v-6h6v6" />
              </svg>
            </div>
            <div><b>Turnkey EPC</b><span>Concept to commissioning</span></div>
          </div>
          <div className="float-card fc2">
            <div className="fi" style={{ background: "#3E79BD" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
              </svg>
            </div>
            <div><b>AMC Plans</b><span>Lifecycle upkeep</span></div>
          </div>
          <div className="float-card fc3">
            <div className="fi" style={{ background: "#7BB145" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div><b>Certified Engineers</b><span>On-site expertise</span></div>
          </div>
          <div className="float-card fc4">
            <div className="fi" style={{ background: "var(--grad)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div><b>Priority Support</b><span>Fast response</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServicesGridSection({ services = SERVICES, apiServices = [] }: { services?: ServiceItem[]; apiServices?: ApiService[] }) {
  const delays = ["", " d1", " d2", " d3"];
  const allServices = [...services, ...normalizeApiServices(apiServices)];
  return (
    <section className="section" id="services-list" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />What we offer</span>
          <h2 className="reveal d1">Our <span className="grad-text">Services</span></h2>
          <p className="reveal d2">A complete engineering stack for alternative fuel infrastructure — pick a single service or a full turnkey scope.</p>
        </div>
        <div className="svc-grid">
          {allServices.map((s, i) => (
            <div key={`${s.t}-${i}`} className={`svc reveal${delays[i % 4]}`}>
              <span className="num">0{i + 1}</span>
              <div className="svc-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: iconMarkup(s.i) }} />
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

export function ProcessSection({ steps = PROCESS_STEPS }: { steps?: ProcessStep[] }) {
  return (
    <section className="section steps" id="process">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />How we deliver</span>
          <h2 className="reveal d1">Our delivery <span className="grad-text">process</span></h2>
          <p className="reveal d2">A single, transparent workflow from first consultation to long-term support.</p>
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

export function WhyServicesSection({ items = DEFAULT_WHY_SERVICES_ITEMS }: { items?: WhyItem[] }) {
  return (
    <section className="section why" id="why-services">
      <div className="wrap why-grid">
        <div className="why-visual reveal">
          <div className="why-panel">
            <svg viewBox="0 0 520 420" xmlns="http://www.w3.org/2000/svg" aria-label="On-site engineering and commissioning">
              <defs><linearGradient id="wgSvc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7BB145" /><stop offset="1" stopColor="#3E79BD" /></linearGradient></defs>
              <rect width="520" height="420" fill="#eaf3fa" />
              <rect x="60" y="220" width="150" height="140" rx="8" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
              <path d="M60 220 L100 185 L140 220 M140 220 L180 185 L210 220" fill="none" stroke="#c3d3e0" strokeWidth="2" />
              <rect x="82" y="262" width="30" height="30" rx="3" fill="#7BB145" opacity=".7" />
              <rect x="130" y="262" width="30" height="30" rx="3" fill="#3E79BD" opacity=".7" />
              <rect x="300" y="200" width="60" height="160" rx="30" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
              <rect x="300" y="240" width="60" height="10" fill="#7BB145" opacity=".6" />
              <rect x="380" y="230" width="70" height="130" rx="35" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
              <rect x="380" y="270" width="70" height="10" fill="#3E79BD" opacity=".6" />
              <path d="M210 300 H300 M360 300 H380" stroke="#9fb6cb" strokeWidth="6" fill="none" />
              <circle cx="360" cy="120" r="46" fill="#fff" stroke="url(#wgSvc)" strokeWidth="4" />
              <path d="M340 120l14 14 26-28" fill="none" stroke="url(#wgSvc)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="0" y="360" width="520" height="60" fill="#cddceb" />
            </svg>
          </div>
          <div className="why-float a">
            <span className="n grad-text">98%</span>
            <div>
              <b style={{ fontFamily: "Poppins", fontSize: ".9rem" }}>On-time</b>
              <span style={{ fontSize: ".76rem", color: "var(--muted)" }}>Delivery record</span>
            </div>
          </div>
          <div className="why-float b">
            <div className="ck" style={{ width: 40, height: 40, borderRadius: 12 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <b style={{ fontFamily: "Poppins", fontSize: ".9rem" }}>Certified</b>
              <span style={{ fontSize: ".76rem", color: "var(--muted)" }}>PESO &amp; ISO</span>
            </div>
          </div>
        </div>
        <div className="why-copy">
          <span className="eyebrow reveal"><span className="dot" />Why our services</span>
          <h2 className="reveal d1" style={{ fontSize: "clamp(1.9rem,4vw,2.7rem)", fontWeight: 800, margin: "18px 0 16px" }}>
            Built and backed by <span className="grad-text">gas-sector engineers</span>
          </h2>
          <p className="reveal d2" style={{ color: "var(--ink-soft)", fontSize: "1.05rem" }}>
            Every project is handled by specialists who understand pressure, safety and uptime — not generalists. That&rsquo;s how we keep installations compliant and stations running.
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
            Talk to an engineer
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function IndustriesSection({ industries = INDUSTRIES }: { industries?: Industry[] }) {
  const delays = ["", " d1", " d2", " d3", " d4"];
  return (
    <section className="section love" id="industries">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />Who we serve</span>
          <h2 className="reveal d1">Industries we <span className="grad-text">support</span></h2>
        </div>
        <div className="love-grid">
          {industries.map((item, i) => (
            <div key={item.title} className={`love-card reveal${delays[i % 5]}`}>
              <div className="love-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: iconMarkup(item.icon) }} />
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

export function ServiceStatsSection({ stats = SERVICE_STATS }: { stats?: Stat[] }) {
  return (
    <section className="section stats" id="stats">
      <div className="blob g" /><div className="blob b" />
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal" style={{ background: "rgba(255,255,255,.08)", color: "#fff", borderColor: "rgba(255,255,255,.2)" }}>
            <span className="dot" />Service track record
          </span>
          <h2 className="reveal d1">Delivery you can plan around</h2>
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

export function ServicesCTASection() {
  return (
    <section className="cta" id="cta">
      <div className="wrap">
        <div className="cta-box reveal">
          <div className="rings a" /><div className="rings b" />
          <h2>Have a project scope in mind?</h2>
          <p>Tell us what you&rsquo;re building — from a single dispenser to a full station — and our engineers will scope it with you.</p>
          <div className="cta-btns">
            <Link href="/contact" className="btn btn-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
              </svg>
              Request a quote
            </Link>
            <Link href="/products" className="btn btn-light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              Browse equipment
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
