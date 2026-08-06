"use client";
import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useVendorAuth } from "@/lib/vendor/auth-context";

const NAV_ITEMS: { href: string; label: string; module: string; permission?: string }[] = [
  { href: "/vendor/dashboard", label: "Dashboard", module: "dashboard" },
  { href: "/vendor/products", label: "My products", module: "products", permission: "products" },
  { href: "/vendor/categories", label: "My categories", module: "categories", permission: "categories" },
  { href: "/vendor/orders", label: "Orders", module: "orders", permission: "orders" },
  { href: "/vendor/rfqs", label: "RFQs", module: "rfqs", permission: "rfqs" },
  { href: "/vendor/settlements", label: "Settlements", module: "settlements", permission: "settlements" },
  { href: "/vendor/payments", label: "Payments", module: "payments", permission: "payments" },
  { href: "/vendor/tax", label: "Tax & GST", module: "tax", permission: "taxGst" },
  { href: "/vendor/reviews", label: "Reviews", module: "reviews", permission: "reviews" },
  { href: "/vendor/notifications", label: "Notifications", module: "notifications", permission: "notifications" },
];

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Your account at a glance." },
  products: { title: "My products", subtitle: "Products listed under your vendor account." },
  categories: { title: "My categories", subtitle: "Categories your products are listed under." },
  orders: { title: "Orders", subtitle: "Orders that include your products." },
  rfqs: { title: "RFQs", subtitle: "Quote requests assigned to you." },
  settlements: { title: "Settlements", subtitle: "Payouts and earnings." },
  payments: { title: "Payments", subtitle: "Payments received on your orders." },
  tax: { title: "Tax & GST", subtitle: "GST collected on your sales." },
  reviews: { title: "Reviews", subtitle: "Customer reviews on your products." },
  notifications: { title: "Notifications", subtitle: "Messages from the SANMISH team." },
};

function moduleFromPath(pathname: string): string {
  const seg = pathname.split("/")[2];
  return seg && seg in PAGE_TITLES ? seg : "dashboard";
}

export default function VendorShell({ children }: { children: ReactNode }) {
  const { vendor, hydrated, logout } = useVendorAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !vendor) {
      router.replace(`/vendor/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, vendor, pathname, router]);

  if (!hydrated || !vendor) {
    return (
      <div className="adm-root" style={{ display: "grid", placeItems: "center" }}>
        <p style={{ color: "var(--color-neutral-600)" }}>Checking your session…</p>
      </div>
    );
  }

  const currentModule = moduleFromPath(pathname);
  const { title, subtitle } = PAGE_TITLES[currentModule];

  return (
    <div className="adm-root">
      <div className="adm-shell">
        <aside className="adm-sidebar">
          <div className="adm-brand">
            <span className="adm-brand-dot">S</span>
            <div>
              <div className="adm-brand-name">SANMISH</div>
              <div className="adm-brand-sub">Vendor portal</div>
            </div>
          </div>

          <nav className="adm-nav-sections">
            <div className="adm-nav-section">
              {NAV_ITEMS.filter((item) => !item.permission || vendor.portalPermissions?.[item.permission as keyof typeof vendor.portalPermissions] !== false).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`adm-nav-link${item.module === currentModule ? " active" : ""}`}
                >
                  <span className="adm-nav-dot" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="adm-signed-in">
            <span className="adm-signed-in-label">Signed in</span>
            <span className="adm-signed-in-name">{vendor.businessName}</span>
            <span className="adm-signed-in-role">{vendor.email}</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={async () => { await logout(); router.push("/vendor/login"); }}
            >
              Log out
            </button>
          </div>
        </aside>

        <div className="adm-main">
          <header className="adm-topbar">
            <div>
              <h1 className="adm-topbar-title">{title}</h1>
              <p className="adm-topbar-sub" style={{ margin: 0 }}>{subtitle}</p>
            </div>
          </header>
          <div className="adm-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
