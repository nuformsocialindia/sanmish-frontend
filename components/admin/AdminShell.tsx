"use client";
import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/auth-context";
import { navSectionsFor, PAGE_TITLES, type AdminModule } from "@/lib/admin/nav";
import { dashboardApi } from "@/lib/admin/api";

function moduleFromPath(pathname: string): AdminModule {
  if (pathname === "/admin") return "dashboard";
  const seg = pathname.split("/")[2] as AdminModule | undefined;
  return seg && seg in PAGE_TITLES ? seg : "dashboard";
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const { admin, hydrated, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [alerts, setAlerts] = useState<{ pendingVendors?: number; escalatedRfqs?: number } | null>(null);

  useEffect(() => {
    if (hydrated && !admin) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, admin, pathname, router]);

  useEffect(() => {
    if (admin) dashboardApi.alerts().then(setAlerts).catch(() => setAlerts(null));
  }, [admin]);

  if (!hydrated || !admin) {
    return (
      <div className="adm-root" style={{ display: "grid", placeItems: "center" }}>
        <p style={{ color: "var(--color-neutral-600)" }}>Checking your session…</p>
      </div>
    );
  }

  const sections = navSectionsFor(admin.role);
  const currentModule = moduleFromPath(pathname);
  const { title, subtitle } = PAGE_TITLES[currentModule];

  const badgeFor = (mod: AdminModule): number | undefined => {
    if (mod === "vendors") return alerts?.pendingVendors || undefined;
    if (mod === "rfq") return alerts?.escalatedRfqs || undefined;
    return undefined;
  };

  return (
    <div className="adm-root">
      <div className="adm-shell">
        <aside className="adm-sidebar">
          <div className="adm-brand">
            <Image src="/SanmishXLOGO.jpg" alt="SanmishX" width={93} height={58} style={{ height: 40, width: "auto" }} priority />
            <div className="adm-brand-sub">Admin console</div>
          </div>

          <nav className="adm-nav-sections">
            {sections.map((section) => (
              <div key={section.label} className="adm-nav-section">
                <div className="adm-nav-section-label">{section.label}</div>
                {section.items.map((item) => {
                  const active = item.module === currentModule;
                  const count = badgeFor(item.module);
                  return (
                    <Link key={item.href} href={item.href} className={`adm-nav-link${active ? " active" : ""}`}>
                      <span className="adm-nav-dot" />
                      {item.label}
                      {count ? <span className="adm-nav-count">{count}</span> : null}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="adm-signed-in">
            <span className="adm-signed-in-label">Signed in</span>
            <span className="adm-signed-in-name">{admin.name}</span>
            <span className="adm-signed-in-role">{admin.role.replace(/_/g, " ").toLowerCase()}</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={async () => { await logout(); router.push("/admin/login"); }}
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
