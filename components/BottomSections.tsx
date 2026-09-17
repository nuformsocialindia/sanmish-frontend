// CTASection — matches original exactly
import Link from "next/link";

export function CTASection() {
  return (
    <section className="cta" id="cta">
      <div className="wrap">
        <div className="cta-box reveal">
          <div className="rings a" />
          <div className="rings b" />
          <h2>Ready to build the future of clean energy?</h2>
          <p>
            Join India&rsquo;s fastest-growing marketplace for CNG, CBG and Bio Gas
            infrastructure — whether you&rsquo;re sourcing equipment or selling it.
          </p>
          <div className="cta-btns">
            <Link href="/become-seller" className="btn btn-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6M22 11h-6" />
              </svg>
              Become Seller
            </Link>
            <Link href="/contact" className="btn btn-light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              Request Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// AppDownloadSection + HelpBand — matches original exactly (same section wrapper)
export function AppDownloadSection() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        {/* App Download Panel */}
        <div className="appdl reveal">
          {/* Left: copy */}
          <div className="appdl-copy">
            <h2>Source Smarter, Faster — Get the SANMISH Buyer App</h2>

            <div className="appdl-feat reveal d1">
              <div className="fic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <b>Compare verified suppliers</b>
                <span>Send one RFQ, get multiple quotes and pick the best on the go.</span>
              </div>
            </div>

            <div className="appdl-feat reveal d2">
              <div className="fic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <div>
                <b>Browse the full catalogue</b>
                <span>CNG, CBG and biogas equipment across every category.</span>
              </div>
            </div>

            <div className="appdl-feat reveal d3">
              <div className="fic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <b>Secure payments &amp; tracking</b>
                <span>Protected transactions, credit terms and live dispatch tracking.</span>
              </div>
            </div>
          </div>

          {/* Right: phone mockup + store badges */}
          <div className="appdl-right reveal d2">
            <div className="phone">
              <div className="phone-screen">
                <div className="phone-top">
                  <div className="ps">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                    Search equipment…
                  </div>
                </div>
                <div className="phone-hero">
                  <div className="ph-tag">Simplify Your Sourcing</div>
                  <div className="ph-sub">One RFQ. Multiple verified quotes. All in one place.</div>
                  <span className="ph-btn">Get Quotes</span>
                </div>
                <div className="phone-tiles">
                  <div className="pt">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="4" /><path d="M9 6h6M12 10v6" />
                    </svg>
                  </div>
                  <div className="pt">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="3" /><path d="M9 22v-4h6v4" />
                    </svg>
                  </div>
                  <div className="pt">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 18a9 9 0 1 1 17 0" /><path d="M12 18l4.5-5.5" /><circle cx="12" cy="18" r="1.6" />
                    </svg>
                  </div>
                  <div className="pt">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v14a7 3 0 0 0 14 0V5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="appdl-get">
              {/* QR code */}
              <div className="qr-box">
                <small>Scan to download</small>
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
                  <rect width="100" height="100" fill="#fff" />
                  <g fill="#0f1722">
                    <rect x="8" y="8" width="24" height="24" /><rect x="14" y="14" width="12" height="12" fill="#fff" /><rect x="17" y="17" width="6" height="6" fill="#0f1722" />
                    <rect x="68" y="8" width="24" height="24" /><rect x="74" y="14" width="12" height="12" fill="#fff" /><rect x="77" y="17" width="6" height="6" fill="#0f1722" />
                    <rect x="8" y="68" width="24" height="24" /><rect x="14" y="74" width="12" height="12" fill="#fff" /><rect x="17" y="77" width="6" height="6" fill="#0f1722" />
                    <rect x="40" y="8" width="6" height="6" /><rect x="52" y="8" width="6" height="6" />
                    <rect x="40" y="20" width="6" height="6" /><rect x="46" y="14" width="6" height="6" /><rect x="58" y="14" width="6" height="6" />
                    <rect x="8" y="40" width="6" height="6" /><rect x="20" y="40" width="6" height="6" /><rect x="14" y="46" width="6" height="6" /><rect x="8" y="52" width="6" height="6" />
                    <rect x="40" y="40" width="6" height="6" /><rect x="52" y="46" width="6" height="6" /><rect x="46" y="52" width="6" height="6" />
                    <rect x="58" y="40" width="6" height="6" /><rect x="64" y="52" width="6" height="6" />
                    <rect x="72" y="40" width="6" height="6" /><rect x="84" y="46" width="6" height="6" /><rect x="78" y="58" width="6" height="6" />
                    <rect x="72" y="72" width="6" height="6" /><rect x="84" y="72" width="6" height="6" /><rect x="78" y="84" width="6" height="6" />
                    <rect x="40" y="72" width="6" height="6" /><rect x="52" y="78" width="6" height="6" /><rect x="46" y="84" width="6" height="6" /><rect x="58" y="72" width="6" height="6" />
                  </g>
                </svg>
              </div>

              <a href="#" className="store-badge">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3.5v17c0 .4.4.6.7.4l9.6-8.5c.3-.3.3-.8 0-1L3.7 3.1c-.3-.2-.7 0-.7.4z" opacity=".9" />
                  <path d="m14.5 10.4 3.9-2.2-11-6.3 7.1 8.5zM14.5 13.6l-7.1 8.5 11-6.3-3.9-2.2z" />
                </svg>
                <div><small>GET IT ON</small><b>Google Play</b></div>
              </a>

              <a href="#" className="store-badge">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 1.6c-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.9-1.4.6-.8 1.1-1.9 1-3zM19.6 8.4c-1.1-1.4-2.7-1.5-3.2-1.5-1.4-.1-2.6.8-3.3.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.8-.4 6.9 1.1 9.2.7 1.1 1.6 2.3 2.7 2.3 1.1 0 1.5-.7 2.8-.7s1.6.7 2.8.7c1.2 0 1.9-1.1 2.6-2.2.8-1.2 1.2-2.4 1.2-2.5-.1 0-2.3-.9-2.3-3.5 0-2.2 1.8-3.2 1.9-3.3z" />
                </svg>
                <div><small>Download on the</small><b>App Store</b></div>
              </a>
            </div>
          </div>
        </div>

        {/* Help Band — inside same section wrapper */}
        <div className="help-band reveal d1">
          <div className="help-item">
            <div className="hic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1v3l-3-3H7a2 2 0 0 1-2-2v-1" />
                <path d="M18 6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2" />
              </svg>
            </div>
            <div>
              <b>Need assistance? We&rsquo;re here to help</b>
              <span>Our support team is ready for quick, expert guidance.</span>
            </div>
          </div>

          <div className="help-item">
            <div className="hic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <a href="tel:+919000000000" className="big">+91 90000 00000</a>
              <span>Monday – Friday, 9:15 AM to 6:15 PM</span>
            </div>
          </div>

          <div className="help-item">
            <div className="hic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" />
              </svg>
            </div>
            <div>
              <a href="mailto:help@sanmish.com" className="big">help@sanmish.com</a>
              <span>Mail us directly, we reply within a day.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Empty export to keep page.tsx imports working
export function HelpBand() { return null; }
