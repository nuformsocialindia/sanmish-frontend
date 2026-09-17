import type { AdminRole } from "@/lib/admin/api";

export type AdminModule =
  | "dashboard" | "users" | "vendors" | "categories" | "products" | "orders" | "returns"
  | "payments" | "logistics" | "rfq" | "reports" | "notifications" | "admins" | "settings"
  | "brands" | "merchandising" | "coupons" | "reviews" | "services" | "pages" | "site-content"
  | "enquiries" | "tax" | "shipping";

// Mirrors ROUTES.md's lib/auth/roleModules.ts — nav visibility only, not
// authorization. The server enforces access and answers 403 ADMIN_FORBIDDEN.
// The nine modules added after "brands" are UI-only mocks for now (no real
// backend endpoints yet) — see AGENTS.md note in each page file.
export const ROLE_MODULES: Record<AdminRole, AdminModule[] | null> = {
  SUPER_ADMIN: null, // null = everything
  OPERATIONS_ADMIN: ["dashboard", "users", "orders", "returns", "rfq", "enquiries", "services", "pages", "site-content", "reports", "notifications"],
  FINANCE_ADMIN: ["dashboard", "payments", "tax", "reports"],
  PRODUCT_ADMIN: ["dashboard", "categories", "products", "brands", "merchandising", "coupons", "reviews", "tax", "reports"],
  LOGISTICS_ADMIN: ["dashboard", "logistics", "shipping", "orders", "returns", "reports"],
  VENDOR_MANAGER: ["dashboard", "vendors", "reports"],
};

export function canSee(role: AdminRole, m: AdminModule): boolean {
  if (m === "settings") return true;
  const allowed = ROLE_MODULES[role];
  return allowed === null || allowed.includes(m);
}

export const canAccess = canSee;

export type NavItem = { module: AdminModule; href: string; label: string; icon: string };
export type NavSection = { label: string; items: NavItem[] };

const ICONS: Record<AdminModule, string> = {
  dashboard: `<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>`,
  reports: `<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>`,
  notifications: `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`,
  categories: `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>`,
  products: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0"/><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M3 11h18"/>`,
  orders: `<path d="M6 2h12l1 5H5z"/><path d="M5 7h14v13H5z"/><path d="M9 11h6"/>`,
  returns: `<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>`,
  rfq: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>`,
  users: `<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a7 7 0 0 1 14 0v1"/><circle cx="18" cy="8" r="3"/><path d="M22 21v-1a6 6 0 0 0-5-5.9"/>`,
  vendors: `<path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6"/>`,
  admins: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  payments: `<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>`,
  logistics: `<rect x="1" y="6" width="15" height="12" rx="1"/><path d="M16 10h4l3 3v5h-7z"/><circle cx="6" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/>`,
  settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
  brands: `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>`,
  merchandising: `<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>`,
  coupons: `<path d="M3 9a2 2 0 0 0 0 4v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 1 0-4V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 17v2M13 11v2"/>`,
  reviews: `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/>`,
  services: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>`,
  pages: `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>`,
  "site-content": `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>`,
  enquiries: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>`,
  tax: `<path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2V4a2 2 0 0 0-2-2z"/><path d="M9 8h6M9 12h4"/>`,
  shipping: `<path d="M5 18H3V6a1 1 0 0 1 1-1h9v13"/><path d="M14 9h4l3 3v6h-3"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="17.5" cy="18.5" r="1.5"/>`,
};

const LABELS: Record<AdminModule, string> = {
  dashboard: "Dashboard", reports: "Reports & analytics", notifications: "Notifications",
  categories: "Categories", products: "Products", orders: "Orders", returns: "Returns & exchanges", rfq: "RFQ / Enquiries",
  users: "Customers", vendors: "Vendors", admins: "Admin management", payments: "Payments",
  logistics: "Logistics", settings: "Settings",
  brands: "Brands & OEMs", merchandising: "Merchandising", coupons: "Deals & coupons",
  reviews: "Ratings & reviews", services: "Services", pages: "Pages & policies",
  "site-content": "Site content", enquiries: "Contact enquiries", tax: "Tax & GST", shipping: "Shipping & delivery",
};

const HREFS: Record<AdminModule, string> = {
  dashboard: "/admin", reports: "/admin/reports", notifications: "/admin/notifications",
  categories: "/admin/categories", products: "/admin/products", orders: "/admin/orders", returns: "/admin/returns",
  rfq: "/admin/rfq", users: "/admin/users", vendors: "/admin/vendors", admins: "/admin/admins",
  payments: "/admin/payments", logistics: "/admin/logistics", settings: "/admin/settings",
  brands: "/admin/brands", merchandising: "/admin/merchandising", coupons: "/admin/coupons",
  reviews: "/admin/reviews", services: "/admin/services", pages: "/admin/pages",
  "site-content": "/admin/site-content", enquiries: "/admin/enquiries", tax: "/admin/tax", shipping: "/admin/shipping",
};

const SECTIONS: { label: string; modules: AdminModule[] }[] = [
  { label: "Overview", modules: ["dashboard", "reports", "notifications"] },
  { label: "Catalogue", modules: ["categories", "products", "brands"] },
  { label: "Storefront", modules: ["merchandising", "coupons", "reviews", "services", "pages", "site-content"] },
  { label: "Demand", modules: ["orders", "returns", "rfq", "enquiries"] },
  { label: "People", modules: ["users", "vendors", "admins"] },
  { label: "Money & ops", modules: ["payments", "tax", "logistics", "shipping"] },
  { label: "Account", modules: ["settings"] },
];

export function navSectionsFor(role: AdminRole): NavSection[] {
  return SECTIONS.map((s) => ({
    label: s.label,
    items: s.modules.filter((m) => canSee(role, m)).map((m) => ({
      module: m, href: HREFS[m], label: LABELS[m], icon: ICONS[m],
    })),
  })).filter((s) => s.items.length > 0);
}

export const PAGE_TITLES: Record<AdminModule, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Marketplace health at a glance" },
  users: { title: "Customer management", subtitle: "Buyer accounts, orders, RFQs and payments" },
  vendors: { title: "Vendor management", subtitle: "The Become a Seller approval queue" },
  categories: { title: "Category management", subtitle: "Hierarchy, priority and SEO" },
  products: { title: "Product management", subtitle: "Listings, pricing, stock and approvals" },
  orders: { title: "Order management", subtitle: "Fulfilment, invoices and status" },
  returns: { title: "Returns & exchanges", subtitle: "Review buyer return/exchange requests and process refunds" },
  payments: { title: "Payment management", subtitle: "Transactions, refunds, settlements, commission" },
  logistics: { title: "Logistics management", subtitle: "Partners, zones, shipments" },
  rfq: { title: "RFQ / Enquiry management", subtitle: "Assign vendors, record quotes, convert to orders" },
  admins: { title: "Admin management", subtitle: "Accounts, audit log and login history" },
  reports: { title: "Reports & analytics", subtitle: "Twelve reports, viewable or exportable" },
  notifications: { title: "Notifications", subtitle: "Sent log, ad-hoc sends and announcements" },
  settings: { title: "Settings", subtitle: "Security and environment" },
  brands: { title: "Brands & OEMs", subtitle: "Manufacturer names, logos and the compatibility strip" },
  merchandising: { title: "Merchandising", subtitle: "Homepage rails, category tiles and deal banners" },
  coupons: { title: "Deals & coupons", subtitle: "Offer banners, discount codes and volume campaigns" },
  reviews: { title: "Ratings & reviews", subtitle: "Moderate buyer reviews and supplier ratings" },
  services: { title: "Services", subtitle: "Installation, commissioning, AMC, spares, turnkey" },
  pages: { title: "Pages & policies", subtitle: "Help centre, shipping, returns and legal copy" },
  "site-content": { title: "Site content", subtitle: "About page and Suppliers page sections — team, stats, testimonials and more" },
  enquiries: { title: "Contact enquiries", subtitle: "Quote requests and contact-form submissions" },
  tax: { title: "Tax & GST", subtitle: "HSN codes, GST rates and invoicing rules" },
  shipping: { title: "Shipping & delivery", subtitle: "Free-shipping rules, serviceable cities, lead times" },
};
