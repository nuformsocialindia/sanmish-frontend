"use client";
import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  {
    href: "/account",
    label: "Dashboard",
    icon: `<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>`,
  },
  {
    href: "/account/orders",
    label: "Orders",
    icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>`,
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    icon: `<path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
  },
  {
    href: "/account/payments",
    label: "Payments",
    icon: `<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>`,
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    icon: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
  },
];

export default function AccountShell({ children }: { children: ReactNode }) {
  const { user, hydrated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const loggingOutRef = useRef(false);

  useEffect(() => {
    if (hydrated && !user && !loggingOutRef.current) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, user, pathname, router]);

  if (!hydrated || !user) {
    return (
      <section className="section" style={{ paddingTop: 60, textAlign: "center" }}>
        <div className="wrap">
          <p style={{ color: "var(--muted)" }}>Checking your session…</p>
        </div>
      </section>
    );
  }

  const initials = (user.name || user.mobile).slice(0, 2).toUpperCase();

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">Home</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="cur">My Account</span>
        </div>

        <div className="account-grid">
          <aside className="account-sidebar">
            <div className="account-user">
              <div className="account-avatar">{initials}</div>
              <div>
                <b>{user.name || "SANMISH Buyer"}</b>
                <span>+91 {user.mobile}</span>
              </div>
            </div>
            <nav className="account-nav">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={active ? "active" : undefined}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: item.icon }} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              className="account-logout"
              onClick={() => {
                loggingOutRef.current = true;
                logout();
                router.push("/");
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" />
              </svg>
              Logout
            </button>
          </aside>

          <div className="account-content">{children}</div>
        </div>
      </div>
    </section>
  );
}
