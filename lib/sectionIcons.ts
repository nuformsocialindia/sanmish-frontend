// Shared icon-key -> SVG markup library for admin-editable "sections"
// (About core values/journey/certifications, Suppliers join-steps/benefits).
// Same pattern as TRUST_ICON_LIBRARY in components/ProductDetailView.tsx:
// admins pick a short key from a dropdown, never author raw HTML — the
// public renderer resolves the key to real <path>/<circle> markup via
// SECTION_ICON_LIBRARY before using dangerouslySetInnerHTML. Keys are
// seeded from the exact SVG markup already hardcoded in lib/data.ts, so
// existing content renders identically once migrated to the CMS.
export const SECTION_ICON_LIBRARY: Record<string, string> = {
  "shield-check": `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`,
  "document-flow": `<path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/><path d="M9 3v6h6M13 3l8 8"/>`,
  leaf: `<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>`,
  users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>`,
  compass: `<path d="M12 2v4M4.9 4.9l2.9 2.9M2 12h4M19.1 4.9l-2.9 2.9M22 12h-4"/><circle cx="12" cy="14" r="6"/>`,
  "hydrogen-badge": `<circle cx="12" cy="12" r="9"/><text x="12" y="16" font-size="9" font-family="Poppins" font-weight="700" fill="currentColor" text-anchor="middle" stroke="none">H₂</text>`,
  "chart-growth": `<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>`,
  "peso-shield": `<path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z"/>`,
  "award-ribbon": `<circle cx="12" cy="8" r="6"/><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5"/>`,
  "infinity-loop": `<path d="M9 12a4 4 0 1 0 4-4M15 12a4 4 0 1 1-4 4"/>`,
  "lock-secure": `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
  "user-plus": `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>`,
  "grid-list": `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>`,
  "inbox-check": `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>`,
  target: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
  eye: `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>`,
  "phone-call": `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>`,
  "mail-envelope": `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>`,
  "chat-bubble": `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>`,
  "map-pin": `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>`,
  building: `<path d="M3 21h18M6 21V7l6-4 6 4v14M10 12h4M10 16h4"/>`,
  "truck-plus": `<path d="M16 16h6M19 13v6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/>`,
  wrench: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
  "commissioning-sun": `<path d="M12 2v4M12 18v4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M2 12h4M18 12h4"/><circle cx="12" cy="12" r="4"/>`,
  "refresh-arrow": `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>`,
  gear: `<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/>`,
  "house-building": `<path d="M2 20h20M4 20V8l8-5 8 5v12M9 20v-6h6v6"/>`,
};

export const SECTION_ICON_KEYS = Object.keys(SECTION_ICON_LIBRARY);

export const SECTION_ICON_LABELS: Record<string, string> = {
  "shield-check": "Shield check (verified)",
  "document-flow": "Document / spec",
  leaf: "Leaf (sustainability)",
  users: "Two people (partnership)",
  compass: "Compass (founded)",
  "hydrogen-badge": "H₂ badge",
  "chart-growth": "Growth chart",
  "peso-shield": "Certificate shield",
  "award-ribbon": "Award ribbon",
  "infinity-loop": "Infinity loop",
  "lock-secure": "Lock (secure)",
  "user-plus": "Person + plus (register)",
  "grid-list": "Grid list (catalogue)",
  "inbox-check": "Inbox check (RFQ)",
  target: "Target (mission)",
  eye: "Eye (vision)",
  "phone-call": "Phone call",
  "mail-envelope": "Mail envelope",
  "chat-bubble": "Chat bubble (WhatsApp)",
  "map-pin": "Map pin",
  building: "Building",
  "truck-plus": "Truck (supply)",
  wrench: "Wrench (installation)",
  "commissioning-sun": "Gauge (commissioning)",
  "refresh-arrow": "Refresh arrow (AMC)",
  gear: "Gear (spare parts)",
  "house-building": "House (turnkey)",
};

// Resolves a stored icon key to its SVG markup for dangerouslySetInnerHTML.
// Falls back to the shield-check icon for an unrecognised/empty key so a
// section never renders visually blank.
export function resolveSectionIcon(key: string | null | undefined): string {
  return SECTION_ICON_LIBRARY[key ?? ""] ?? SECTION_ICON_LIBRARY["shield-check"];
}

// Icon fields hold raw SVG markup when they come from a lib/data.ts (or
// component-local) hardcoded default, but a short icon KEY once an admin has
// edited the section via SectionListEditor. Handle both transparently.
export function iconMarkup(icon: string): string {
  return icon.includes("<") ? icon : resolveSectionIcon(icon);
}

// Reverse lookup used only to seed admin defaultItems from lib/data.ts,
// where CORE_VALUES/JOURNEY/CERTIFICATIONS/etc. still store raw SVG markup
// rather than a key — lets the very first admin edit show the correct
// preset instead of falling back to "shield-check" for everything.
export function keyForIconMarkup(markup: string): string {
  const found = Object.entries(SECTION_ICON_LIBRARY).find(([, svg]) => svg === markup);
  return found ? found[0] : "shield-check";
}
