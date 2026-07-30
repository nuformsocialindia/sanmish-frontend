"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOGO_BASE64 } from "@/lib/data";
import { resolveHref } from "@/lib/nav";

export default function Footer() {
  const pathname = usePathname();
  return (
    <footer className="footer" id="footer">
      <div className="wrap">
        <div className="foot-top">
          {/* Brand column */}
          <div className="foot-brand">
            <div className="logochip">
              <Image src={LOGO_BASE64} alt="SANMISH" width={110} height={38} style={{ height: 38 }} unoptimized />
            </div>
            <p>India&rsquo;s B2B marketplace for alternative fuel infrastructure — connecting buyers, manufacturers and industrial suppliers of CNG, CBG and Bio Gas equipment.</p>
            <div className="foot-social">
              <a href="#" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3L17.61 20.65z" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.09 0 12 0 12s0 3.91.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.91 24 12 24 12s0-3.91-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56-.79.3-1.46.72-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-10.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="foot-col">
            <h4>Categories</h4>
            <Link href={resolveHref("#categories", pathname)}>CNG Equipment</Link>
            <Link href={resolveHref("#categories", pathname)}>CBG Systems</Link>
            <Link href={resolveHref("#categories", pathname)}>Bio Gas Plants</Link>
            <Link href={resolveHref("#categories", pathname)}>Flow Meters</Link>
            <Link href={resolveHref("#categories", pathname)}>Compressors</Link>
            <Link href={resolveHref("#categories", pathname)}>Storage Tanks</Link>
          </div>

          <div className="foot-col">
            <h4>Industries</h4>
            <a href="#">Fuel Stations</a>
            <a href="#">OEM Partners</a>
            <a href="#">Gas Utilities</a>
            <a href="#">Municipalities</a>
            <a href="#">EPC Contractors</a>
          </div>

          <div className="foot-col">
            <h4>Support</h4>
            <Link href={resolveHref("#services", pathname)}>Installation</Link>
            <Link href={resolveHref("#services", pathname)}>AMC Services</Link>
            <Link href={resolveHref("#services", pathname)}>Spare Parts</Link>
            <Link href="/help-center">Help Center</Link>
            <Link href="/shipping-returns">Shipping &amp; Returns</Link>
            <Link href={resolveHref("#footer", pathname)}>Contact Us</Link>
          </div>

          <div className="foot-news">
            <h4 style={{ color: "#fff", fontFamily: "Poppins", fontWeight: 600, marginBottom: 14 }}>Newsletter</h4>
            <p>Get equipment launches, RFQ tips and market insights.</p>
            <div className="news-form">
              <input type="email" placeholder="Your work email" aria-label="Email address" />
              <button aria-label="Subscribe">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 8, fontSize: ".86rem", color: "#9aa7b4" }}>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                +91 90000 00000
              </span>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" />
                </svg>
                hello@sanmish.com
              </span>
            </div>
          </div>
        </div>

        <div className="foot-bottom">
          <p>© 2026 SANMISH · Clean Energy Smarter Solutions. All rights reserved.</p>
          <div className="fl">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
            <Link href="/cookie-policy">Cookie Policy</Link>
            <Link href="/legal">Legal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
