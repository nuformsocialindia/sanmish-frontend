import Link from "next/link";
import { ABOUT_STATS, STORY_POINTS, CORE_VALUES, JOURNEY, TEAM, CERTIFICATIONS } from "@/lib/data";
import { iconMarkup } from "@/lib/sectionIcons";

type Stat = { count: number; suffix: string; label: string };
type StoryPoint = { t: string; s: string };
type CoreValue = { icon: string; title: string; desc: string };
type JourneyStep = { year: string; title: string; desc: string; icon: string };
type TeamMember = { a: string; n: string; r: string; b: string };
type Certification = { icon: string; title: string; desc: string };

export function AboutHero() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <div className="blob g" />
        <div className="blob b" />
        <div className="grid-fade" />
      </div>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="eyebrow reveal"><span className="dot" />About SANMISH</span>
          <h1 className="reveal d1">
            We&rsquo;re building the marketplace behind India&rsquo;s <span className="grad-text">clean energy transition</span>
          </h1>
          <p className="hero-sub reveal d2">
            SANMISH connects buyers, manufacturers and industrial suppliers of alternative fuel infrastructure — bringing the rigour of engineering procurement to CNG, CBG, Bio Gas and Hydrogen equipment across the country.
          </p>
          <div className="hero-cta reveal d3">
            <Link href="/#products" className="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              Explore the marketplace
            </Link>
            <a href="#footer" className="btn btn-ghost">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Talk to our team
            </a>
          </div>
          <div className="hero-trust reveal d4">
            <div className="avatars"><span>NG</span><span>H₂</span><span>BG</span><span>+</span></div>
            <div>
              <strong>Since 2019 &middot; 500+ verified sellers</strong>
              <small><span className="stars">★★★★★</span> trusted for industrial gas procurement</small>
            </div>
          </div>
        </div>

        <div className="hero-illu reveal d2">
          <div className="illu-stage">
            <div className="illu-ring r1" />
            <div className="illu-ring r2" />
            <div className="illu-core">
              <svg viewBox="0 0 280 340" xmlns="http://www.w3.org/2000/svg" aria-label="Clean energy growth illustration">
                <defs>
                  <linearGradient id="gA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7BB145" /><stop offset="1" stopColor="#3E79BD" /></linearGradient>
                  <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eef4f9" /><stop offset="1" stopColor="#dbe8f3" /></linearGradient>
                </defs>
                <rect x="0" y="0" width="280" height="340" fill="url(#gB)" />
                <rect x="46" y="196" width="34" height="74" rx="8" fill="#c9dcef" />
                <rect x="92" y="160" width="34" height="110" rx="8" fill="#9fc0e0" />
                <rect x="138" y="120" width="34" height="150" rx="8" fill="url(#gA)" />
                <rect x="184" y="150" width="34" height="120" rx="8" fill="#7BB145" opacity=".8" />
                <path d="M63 190 L109 152 L155 112 L201 142" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
                <circle cx="63" cy="190" r="5" fill="#3E79BD" /><circle cx="109" cy="152" r="5" fill="#3E79BD" />
                <circle cx="155" cy="112" r="5" fill="#7BB145" /><circle cx="201" cy="142" r="5" fill="#7BB145" />
                <path d="M155 96c0-18 14-30 32-30-2 20-14 32-32 30z" fill="url(#gA)" />
                <path d="M158 92c8-8 18-13 26-15" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <rect x="0" y="270" width="280" height="70" fill="#cddceb" />
                <rect x="0" y="270" width="280" height="8" fill="#b7cbdd" />
                <circle cx="46" cy="70" r="20" fill="#fff" stroke="url(#gA)" strokeWidth="3" />
                <text x="46" y="77" fontFamily="Poppins,sans-serif" fontSize="15" fontWeight="700" fill="#3E79BD" textAnchor="middle">H₂</text>
              </svg>
            </div>
            <span className="particle" style={{ left: "44%", animationDelay: "0s" }} />
            <span className="particle" style={{ left: "52%", animationDelay: "1.4s", background: "var(--blue)" }} />
            <span className="particle" style={{ left: "48%", animationDelay: "2.6s" }} />
          </div>
          <div className="float-card fc1">
            <div className="fi" style={{ background: "var(--grad)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v4M16 2v4M3 10h18" /><rect x="3" y="4" width="18" height="18" rx="2" />
              </svg>
            </div>
            <div><b>Founded 2019</b><span>Built by engineers</span></div>
          </div>
          <div className="float-card fc2">
            <div className="fi" style={{ background: "#3E79BD" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div><b>PAN India</b><span>28+ states served</span></div>
          </div>
          <div className="float-card fc3">
            <div className="fi" style={{ background: "#7BB145" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div><b>ISO 9001</b><span>Quality assured</span></div>
          </div>
          <div className="float-card fc4">
            <div className="fi" style={{ background: "var(--grad)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div><b>500+ Sellers</b><span>Verified network</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutStatsSection({ stats = ABOUT_STATS }: { stats?: Stat[] }) {
  return (
    <section className="section stats" id="stats">
      <div className="blob g" /><div className="blob b" />
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal" style={{ background: "rgba(255,255,255,.08)", color: "#fff", borderColor: "rgba(255,255,255,.2)" }}>
            <span className="dot" />Our impact so far
          </span>
          <h2 className="reveal d1">Trusted at scale across India&rsquo;s energy industry</h2>
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

export function StorySection({ points = STORY_POINTS }: { points?: StoryPoint[] }) {
  return (
    <section className="section why" id="story">
      <div className="wrap why-grid">
        <div className="why-visual reveal">
          <div className="why-panel">
            <svg viewBox="0 0 520 420" xmlns="http://www.w3.org/2000/svg" aria-label="Connecting buyers and manufacturers across India">
              <defs>
                <linearGradient id="wgAbout" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7BB145" /><stop offset="1" stopColor="#3E79BD" /></linearGradient>
              </defs>
              <rect width="520" height="420" fill="#eaf3fa" />
              <rect x="54" y="150" width="120" height="120" rx="18" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
              <circle cx="114" cy="196" r="20" fill="url(#wgAbout)" />
              <path d="M96 240a18 18 0 0 1 36 0z" fill="url(#wgAbout)" />
              <text x="114" y="262" fontFamily="Poppins,sans-serif" fontSize="12" fontWeight="700" fill="#3E79BD" textAnchor="middle">Buyers</text>
              <rect x="346" y="150" width="120" height="120" rx="18" fill="#fff" stroke="#c3d3e0" strokeWidth="2" />
              <rect x="386" y="180" width="40" height="42" rx="4" fill="#7BB145" opacity=".7" />
              <path d="M386 180 L406 164 L426 180" fill="none" stroke="#3E79BD" strokeWidth="3" />
              <text x="406" y="262" fontFamily="Poppins,sans-serif" fontSize="12" fontWeight="700" fill="#3E79BD" textAnchor="middle">Suppliers</text>
              <circle cx="260" cy="210" r="52" fill="#fff" stroke="url(#wgAbout)" strokeWidth="4" />
              <path d="M240 210l14 14 26-28" fill="none" stroke="url(#wgAbout)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M174 210 H208" stroke="#9fb6cb" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M312 210 H346" stroke="#9fb6cb" strokeWidth="6" fill="none" strokeLinecap="round" />
              <circle cx="120" cy="90" r="5" fill="#7BB145" /><circle cx="200" cy="70" r="5" fill="#3E79BD" />
              <circle cx="300" cy="80" r="5" fill="#7BB145" /><circle cx="400" cy="96" r="5" fill="#3E79BD" />
              <rect x="0" y="360" width="520" height="60" fill="#cddceb" />
            </svg>
          </div>
          <div className="why-float a">
            <span className="n grad-text">2019</span>
            <div>
              <b style={{ fontFamily: "Poppins", fontSize: ".9rem" }}>Founded</b>
              <span style={{ fontSize: ".76rem", color: "var(--muted)" }}>Pune, India</span>
            </div>
          </div>
          <div className="why-float b">
            <div className="ck" style={{ width: 40, height: 40, borderRadius: 12 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <b style={{ fontFamily: "Poppins", fontSize: ".9rem" }}>PAN India</b>
              <span style={{ fontSize: ".76rem", color: "var(--muted)" }}>Nationwide reach</span>
            </div>
          </div>
        </div>
        <div className="why-copy">
          <span className="eyebrow reveal"><span className="dot" />Our Story</span>
          <h2 className="reveal d1" style={{ fontSize: "clamp(1.9rem,4vw,2.7rem)", fontWeight: 800, margin: "18px 0 16px" }}>
            Why we started <span className="grad-text">SANMISH</span>
          </h2>
          <p className="reveal d2" style={{ color: "var(--ink-soft)", fontSize: "1.05rem" }}>
            India&rsquo;s shift to cleaner fuels was accelerating, but procurement hadn&rsquo;t caught up. Buyers struggled to find verified suppliers, quotations took weeks, and quality was hard to trust. Our founders — engineers and procurement specialists from the gas sector — set out to fix that.
          </p>
          <p className="reveal d2" style={{ color: "var(--ink-soft)", fontSize: "1.05rem", marginTop: 14 }}>
            We began with CNG equipment and a simple promise: every supplier verified, every listing accountable. As demand grew, so did we — expanding into CBG, Bio Gas and Hydrogen, and adding installation, commissioning and lifecycle engineering services. Today SANMISH is where serious clean-energy procurement happens.
          </p>
          <div className="why-list">
            {points.map((item, i) => (
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
          <a href="#values" className="btn btn-primary reveal d3" style={{ marginTop: 32 }}>
            What drives us
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

export const DEFAULT_MISSION_VISION: CoreValue[] = [
  {
    icon: "target",
    title: "Our Mission",
    desc: "To make clean energy infrastructure easy to source and trust — giving every buyer access to verified suppliers, fair pricing and engineering support, and giving manufacturers a direct line to serious industrial demand across India.",
  },
  {
    icon: "eye",
    title: "Our Vision",
    desc: "To be the backbone of India’s alternative fuel economy — the platform where the country’s CNG, CBG, Bio Gas and Hydrogen projects get built, so cleaner energy reaches more places, faster.",
  },
];

export function MissionVisionSection({ items = DEFAULT_MISSION_VISION }: { items?: CoreValue[] }) {
  const delays = ["", " d1", " d2"];
  return (
    <section className="section" style={{ paddingTop: 20 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />What we&rsquo;re here to do</span>
          <h2 className="reveal d1">Mission &amp; <span className="grad-text">Vision</span></h2>
          <p className="reveal d2">The principles that shape every listing, quotation and project on SANMISH.</p>
        </div>
        <div className="mv-grid">
          {items.map((item, i) => (
            <div key={item.title} className={`mv-card reveal${delays[i % 3]}`}>
              <div className="mv-ic">
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

export function CoreValuesSection({ values = CORE_VALUES }: { values?: CoreValue[] }) {
  const delays = ["", " d1", " d2", " d3"];
  return (
    <section className="section" id="values" style={{ paddingTop: 20 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />How we work</span>
          <h2 className="reveal d1">Our core <span className="grad-text">values</span></h2>
          <p className="reveal d2">Four commitments we hold ourselves to on every transaction.</p>
        </div>
        <div className="feat-grid">
          {values.map((v, i) => (
            <div key={v.title} className={`feat-card reveal${delays[i % 4]}`}>
              <div className="feat-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: iconMarkup(v.icon) }} />
              </div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function JourneySection({ journey = JOURNEY }: { journey?: JourneyStep[] }) {
  return (
    <section className="section steps" id="journey">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />Our Journey</span>
          <h2 className="reveal d1">Milestones on the way <span className="grad-text">here</span></h2>
          <p className="reveal d2">From a single equipment category to a nationwide clean energy marketplace.</p>
        </div>
        <div className="steps-row">
          <div className="steps-line" />
          <div className="steps-pulse" />
          {journey.map((step, i) => (
            <div key={step.title} className={`step reveal${i > 0 ? ` d${i}` : ""}`}>
              <div className="step-circle">
                <span className="step-n">{i + 1}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: iconMarkup(step.icon) }} />
              </div>
              <span className="yr">{step.year}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeamSection({ team = TEAM }: { team?: TeamMember[] }) {
  const delays = ["", " d1", " d2", " d3"];
  return (
    <section className="section love" id="team">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />The People</span>
          <h2 className="reveal d1">Meet the <span className="grad-text">leadership</span></h2>
          <p className="reveal d2">Engineers and operators who&rsquo;ve spent their careers in India&rsquo;s gas and energy sector.</p>
        </div>
        <div className="team-grid">
          {team.map((m, i) => (
            <div key={m.n} className={`team-card reveal${delays[i % 4]}`}>
              <div className="team-av">{m.a}</div>
              <h3>{m.n}</h3>
              <div className="team-role">{m.r}</div>
              <p>{m.b}</p>
              <div className="team-social">
                <a href="#" aria-label={`${m.n} on LinkedIn`}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                  </svg>
                </a>
                <a href="#" aria-label={`${m.n} on X`}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3L17.61 20.65z" />
                  </svg>
                </a>
                <a href="#" aria-label={`Email ${m.n}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CertificationsSection({ certifications = CERTIFICATIONS }: { certifications?: Certification[] }) {
  return (
    <section className="section" id="certifications" style={{ paddingTop: 20 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />Trust &amp; Compliance</span>
          <h2 className="reveal d1">Built on <span className="grad-text">standards</span></h2>
          <p className="reveal d2">We hold ourselves — and our supplier network — to recognised industrial benchmarks.</p>
        </div>
        <div className="love-grid">
          {certifications.map((c, i) => (
            <div key={c.title} className={`love-card reveal${i > 0 ? ` d${i}` : ""}`}>
              <div className="love-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: iconMarkup(c.icon) }} />
              </div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutCTASection() {
  return (
    <section className="cta" id="cta">
      <div className="wrap">
        <div className="cta-box reveal">
          <div className="rings a" /><div className="rings b" />
          <h2>Let&rsquo;s build the clean energy backbone together</h2>
          <p>Whether you&rsquo;re sourcing equipment or supplying it, SANMISH is where India&rsquo;s CNG, CBG, Bio Gas and Hydrogen projects come to life.</p>
          <div className="cta-btns">
            <Link href="/#products" className="btn btn-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              Explore marketplace
            </Link>
            <Link href="/#cta" className="btn btn-light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" />
              </svg>
              Become a seller
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
