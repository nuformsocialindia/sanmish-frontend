"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/data";
import { resolveHref } from "@/lib/nav";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeDrawer = () => {
    setDrawerOpen(false);
    document.body.style.overflow = "";
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    document.body.style.overflow = "hidden";
  };

  return (
    <>
      <header className={`header${scrolled ? " scrolled" : ""}`} id="header">
        <div className="wrap nav">
          <Link href={resolveHref("#home", pathname)} className="brand" aria-label="SANMISH home">
            <Image src="/SanmishXLOGO.jpg" alt="SANMISH — Clean Energy Smarter Solutions logo" width={93} height={58} style={{ height: 58, width: "auto" }} priority />
          </Link>
          <nav className="nav-menu" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === pathname;
              return (
                <Link
                  key={link.label}
                  href={resolveHref(link.href, pathname)}
                  className={isActive ? "active" : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="nav-actions">
            {user ? (
              <Link href="/account" className="link-btn desk-only nav-iconlink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
                {user.name || user.email}
              </Link>
            ) : (
              <Link href="/login" className="link-btn desk-only nav-iconlink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
                Login
              </Link>
            )}
            <Link href="/wishlist" className="link-btn desk-only nav-iconlink nav-cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Wishlist
              {wishCount > 0 && <span className="nav-cart-badge">{wishCount}</span>}
            </Link>
            <Link href="/cart" className="link-btn desk-only nav-iconlink nav-cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Cart
              {count > 0 && <span className="nav-cart-badge">{count}</span>}
            </Link>
            <Link href={resolveHref("#cta", pathname)} className="btn btn-ghost desk-only">Request Quote</Link>
            <Link href="/become-seller" className="btn btn-primary">Become Seller</Link>
            <button className="burger" id="burger" aria-label="Open menu" onClick={openDrawer}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`drawer${drawerOpen ? " open" : ""}`} id="drawer">
        <div className="drawer-bg" onClick={closeDrawer} />
        <div className="drawer-panel">
          <div className="drawer-top">
            <Image src="/SanmishXLOGO.jpg" alt="SANMISH" width={61} height={38} style={{ height: 38, width: "auto" }} />
            <button className="icon-btn" onClick={closeDrawer} aria-label="Close menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          {NAV_LINKS.map((link) => (
            <Link key={link.label} className={`mlink${link.href === pathname ? " active" : ""}`} href={resolveHref(link.href, pathname)} onClick={closeDrawer}>{link.label}</Link>
          ))}
          <div className="drawer-cta">
            {user ? (
              <Link href="/account" className="btn btn-ghost" onClick={closeDrawer}>
                My Account ({user.name || user.email})
              </Link>
            ) : (
              <Link href="/login" className="btn btn-ghost" onClick={closeDrawer}>Login</Link>
            )}
            <Link href="/wishlist" className="btn btn-ghost" onClick={closeDrawer}>
              Wishlist{wishCount > 0 ? ` (${wishCount})` : ""}
            </Link>
            <Link href="/cart" className="btn btn-ghost" onClick={closeDrawer}>
              Cart{count > 0 ? ` (${count})` : ""}
            </Link>
            <Link href="/become-seller" className="btn btn-primary" onClick={closeDrawer}>Become Seller</Link>
          </div>
        </div>
      </div>
    </>
  );
}
