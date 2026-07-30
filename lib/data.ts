// ============================================================
// SANMISH — All page data (extracted from original HTML JS)
// ============================================================

export const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "#categories", label: "Categories" },
  { href: "#why", label: "Manufacturers" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const CATEGORIES = [
  { icon: `<rect x="5" y="2" width="14" height="20" rx="4"/><path d="M9 6h6M12 10v6"/>`, label: "CNG", sub: "12 groups" },
  { icon: `<path d="M4 20h16M6 20V10l6-6 6 6v10M10 14h4"/>`, label: "CBG", sub: "6 groups" },
  { icon: `<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>`, label: "Bio Gas", sub: "7 groups" },
  { icon: `<path d="M3.5 18a9 9 0 1 1 17 0"/><path d="M12 18l4.5-5.5"/><circle cx="12" cy="18" r="1.6"/>`, label: "Flow Meters", sub: "Metering" },
  { icon: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`, label: "Compressors", sub: "Packaged" },
  { icon: `<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v14a7 3 0 0 0 14 0V5"/><path d="M5 12a7 3 0 0 0 14 0"/>`, label: "Storage Tanks", sub: "Cascades" },
  { icon: `<rect x="4" y="2" width="16" height="20" rx="3"/><path d="M9 22v-4h6v4M8 6h.01M8 10h.01"/>`, label: "Dispensers", sub: "All fuels" },
  { icon: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>`, label: "Safety Equipment", sub: "Sensors" },
  { icon: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>`, label: "Automation", sub: "PLC panels" },
  { icon: `<path d="M4 6h10a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H4M18 10h2M4 6V4M4 14v6"/>`, label: "Pipelines", sub: "Networks" },
  { icon: `<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><circle cx="12" cy="12" r="3"/>`, label: "Industrial Valves", sub: "Regulators" },
  { icon: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h4M6 12h4M6 16h4M15 8v8"/>`, label: "Control Panels", sub: "Electrical" },
];

export const FEATURE_HIGHLIGHTS = [
  {
    icon: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`,
    title: "Verified Manufacturers",
    desc: "Every supplier is document-verified and quality audited before listing on SANMISH.",
  },
  {
    icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>`,
    title: "Bulk Quotations",
    desc: "Send one RFQ to multiple sellers and compare pricing on large-volume orders instantly.",
  },
  {
    icon: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
    title: "Installation Support",
    desc: "Certified engineers for site commissioning, turnkey plant setup and annual maintenance.",
  },
  {
    icon: `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>`,
    title: "PAN India Delivery",
    desc: "Logistics across 28+ states with tracked dispatch for heavy industrial equipment.",
  },
];


const svgDisp = `<svg viewBox="0 0 120 120" fill="none" stroke="#3E79BD" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><rect x="38" y="20" width="44" height="80" rx="8" fill="#fff"/><rect x="48" y="32" width="24" height="18" rx="3" fill="#7BB145" stroke="none"/><circle cx="60" cy="70" r="9"/></svg>`;
const svgComp = `<svg viewBox="0 0 120 120" fill="none" stroke="#7BB145" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><rect x="24" y="44" width="72" height="44" rx="8" fill="#fff"/><circle cx="46" cy="66" r="11"/><path d="M60 44V28h20"/><rect x="76" y="22" width="14" height="14" rx="3" fill="#fff"/></svg>`;
const svgTank = `<svg viewBox="0 0 120 120" fill="none" stroke="#3E79BD" stroke-width="3.5"><rect x="34" y="24" width="24" height="72" rx="12" fill="#fff"/><rect x="64" y="34" width="22" height="62" rx="11" fill="#fff"/></svg>`;
const svgValve = `<svg viewBox="0 0 120 120" fill="none" stroke="#7BB145" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="60" cy="60" r="14"/><path d="M60 46V26h20M60 74v20H40M46 60H26v20"/></svg>`;
const svgSkid = `<svg viewBox="0 0 120 120" fill="none" stroke="#3E79BD" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><rect x="24" y="30" width="72" height="60" rx="8"/><path d="M38 44h20M38 56h30M38 68h16"/><circle cx="80" cy="46" r="5" fill="#7BB145" stroke="none"/></svg>`;

export const PRODUCTS = [
  { t: "High-Flow CNG Dispenser", c: "CNG", s: "Kirloskar Verified", p: "₹ 6,80,000", b: "Bestseller", ic: svgDisp },
  { t: "CBG Refueling Unit", c: "CBG", s: "GreenFuel Systems", p: "On Request", b: "New", ic: svgDisp },
  { t: "Packaged Gas Compressor", c: "Compressors", s: "Atlas Pro Systems", p: "₹ 12,50,000", b: "Popular", ic: svgComp },
  { t: "Cascade Storage System", c: "Storage", s: "CylinTech India", p: "₹ 9,20,000", b: "Featured", ic: svgTank },
  { t: "Bio-CNG Filling Station", c: "CBG", s: "GreenFuel EPC", p: "On Request", b: "Turnkey", ic: svgDisp },
  { t: "Priority Panel Assembly", c: "CNG", s: "FlowLine Controls", p: "₹ 2,40,000", b: "In Stock", ic: svgComp },
  { t: "Gas Storage Vessel", c: "Storage", s: "PressureSafe Ltd", p: "₹ 15,00,000", b: "Certified", ic: svgTank },
  { t: "Biogas Purification Skid", c: "Bio Gas", s: "PuriGas Solutions", p: "On Request", b: "Turnkey", ic: svgComp },
];

export const SERVICES = [
  { t: "Equipment Supply", d: "Verified CNG, CBG, biogas and hydrogen equipment sourced nationwide.", i: `<path d="M16 16h6M19 13v6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/>` },
  { t: "Plant Installation", d: "Site-ready installation of stations, skids and full plants.", i: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>` },
  { t: "Commissioning", d: "Testing, calibration and safe start-up by certified engineers.", i: `<path d="M12 2v4M12 18v4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M2 12h4M18 12h4"/><circle cx="12" cy="12" r="4"/>` },
  { t: "AMC", d: "Annual maintenance contracts to keep assets running at peak.", i: `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>` },
  { t: "Spare Parts", d: "Genuine spares and consumables with fast fulfilment.", i: `<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/>` },
  { t: "Engineering Consultancy", d: "Design, feasibility and compliance advisory for gas projects.", i: `<path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/><path d="M9 3v6h6M13 3l8 8"/>` },
  { t: "Turnkey Projects", d: "End-to-end delivery from concept to commissioned station.", i: `<path d="M2 20h20M4 20V8l8-5 8 5v12M9 20v-6h6v6"/>` },
  { t: "Bulk Procurement", d: "Volume sourcing and negotiated pricing for large orders.", i: `<path d="M16 16h6M19 13v6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/>` },
];

export const STATS = [
  { count: 10000, suffix: "+", label: "Products" },
  { count: 500, suffix: "+", label: "Verified Sellers" },
  { count: 5000, suffix: "+", label: "Buyers" },
  { count: 28, suffix: "+", label: "States Served" },
  { count: 100, suffix: "+", label: "Projects Delivered" },
];

export const BRANDS = ["Atlas Copco", "Ingersoll Rand", "Kirloskar", "Cummins", "Honeywell", "Parker", "Emerson", "Siemens", "Schneider"];

export const HOW_IT_WORKS = [
  { n: 1, icon: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`, title: "Search Equipment", desc: "Find the exact gas equipment by category and spec." },
  { n: 2, icon: `<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3M7 12h10"/>`, title: "Compare Suppliers", desc: "Weigh price, ratings and delivery side by side." },
  { n: 3, icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15h6"/>`, title: "Request Quote", desc: "Send one RFQ, receive competitive quotations." },
  { n: 4, icon: `<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>`, title: "Place Order", desc: "Confirm securely with buyer protection." },
  { n: 5, icon: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`, title: "Installation", desc: "Certified engineers commission on site." },
];

export const BUYERS_LOVE = [
  { icon: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`, title: "Verified Sellers", desc: "Trade only with vetted, audited suppliers." },
  { icon: `<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`, title: "Transparent Pricing", desc: "Clear quotes with no hidden margins." },
  { icon: `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>`, title: "Fast Delivery", desc: "Tracked dispatch across 28+ states." },
  { icon: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>`, title: "Warranty", desc: "Manufacturer-backed warranty on listings." },
  { icon: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`, title: "After Sales Support", desc: "AMC, spares and engineering help." },
];

export const TESTIMONIALS = [
  { q: "SANMISH cut our CNG station procurement time in half. Comparing verified suppliers in one place is a game changer for our rollout.", n: "Rajesh Menon", r: "Operations Head, City Gas Distributor", a: "RM" },
  { q: "We listed our compressor range and started receiving qualified bulk RFQs within the first week. The buyers are serious and the platform is clean.", n: "Priya Sharma", r: "Director, Industrial Equipment OEM", a: "PS" },
  { q: "From dispensers to full commissioning, the installation support was flawless. Exactly the engineering rigour our hydrogen project needed.", n: "Arjun Nair", r: "Project Lead, Clean Energy EPC", a: "AN" },
  { q: "Transparent pricing and genuine warranties. SANMISH feels built by people who actually understand gas infrastructure.", n: "Vikram Patel", r: "Owner, Multi-Fuel Station Network", a: "VP" },
];

// SVG icon helpers for new arrivals / bestsellers
const mk = (p: string, c = "#3E79BD") =>
  `<svg viewBox="0 0 120 120" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

export const ICONS = {
  regulator: mk(`<circle cx="60" cy="60" r="18"/><path d="M60 30v-8M60 98v-8M30 60h-8M98 60h-8M39 39l-6-6M87 87l6 6M87 39l6-6M39 87l-6 6"/>`, "#7BB145"),
  valve: mk(`<circle cx="60" cy="60" r="14"/><path d="M60 46V26h20M60 74v20H40M46 60H26v20"/>`),
  gauge: mk(`<circle cx="60" cy="60" r="34"/><path d="M60 60l16-14"/><circle cx="60" cy="60" r="4" fill="#3E79BD" stroke="none"/><path d="M60 26v6M94 60h-6M26 60h6"/>`, "#7BB145"),
  sensor: mk(`<rect x="42" y="24" width="36" height="72" rx="8"/><circle cx="60" cy="46" r="8"/><path d="M52 68h16M52 80h16"/>`),
  pipe: mk(`<path d="M24 44h40a16 16 0 0 1 0 32H24"/><path d="M96 44h-8M88 76h8"/><circle cx="24" cy="60" r="4" fill="#3E79BD" stroke="none"/>`, "#7BB145"),
  breaker: mk(`<rect x="34" y="24" width="52" height="72" rx="8"/><rect x="46" y="34" width="10" height="20" rx="3" fill="#3E79BD" stroke="none"/><rect x="64" y="34" width="10" height="20" rx="3" fill="#7BB145" stroke="none"/><path d="M46 68h28M46 80h28"/>`),
  panel: mk(`<rect x="24" y="30" width="72" height="60" rx="8"/><path d="M38 44h20M38 56h30M38 68h16"/><circle cx="80" cy="46" r="5" fill="#7BB145" stroke="none"/>`, "#7BB145"),
  boot: mk(`<path d="M46 26h14v40h20a14 14 0 0 1 14 14v6H46z"/><path d="M46 74h48"/>`),
  drill: mk(`<path d="M30 46h34v24H30zM64 52h16v12H64zM80 56h14"/><path d="M38 70v18M52 70v18"/>`, "#7BB145"),
  meter: mk(`<rect x="30" y="28" width="60" height="64" rx="10"/><rect x="42" y="40" width="36" height="20" rx="4"/><circle cx="50" cy="74" r="4"/><circle cx="70" cy="74" r="4"/>`),
  scale: mk(`<rect x="30" y="70" width="60" height="16" rx="4"/><rect x="52" y="40" width="16" height="30" rx="3"/><rect x="42" y="26" width="36" height="16" rx="4"/>`, "#7BB145"),
  cable: mk(`<circle cx="60" cy="60" r="30"/><circle cx="60" cy="60" r="12"/><path d="M60 30v10M60 80v10M30 60h10M80 60h10"/>`),
};

export const NEW_ARRIVALS = [
  { t: "Digital Pressure Gauge", p: "₹ 3,499", ic: ICONS.gauge },
  { t: "LED Zone Light", p: "₹ 2,150", ic: ICONS.panel },
  { t: "Gas Leak Sensor", p: "₹ 4,899", ic: ICONS.sensor },
  { t: "On-Grid Solar Inverter", p: "₹ 41,583", ic: ICONS.breaker },
];

export const BEST_SELLING = [
  { t: "Safety Footwear (S3)", p: "₹ 1,320", ic: ICONS.boot },
  { t: "High-Pressure Regulator", p: "₹ 5,650", ic: ICONS.regulator },
  { t: "Welding Electrodes", p: "₹ 1,180", ic: ICONS.pipe },
  { t: "Miniature Circuit Breaker", p: "₹ 471", ic: ICONS.breaker },
];

export const DEALS = [
  { dg: "linear-gradient(135deg,#1f5c3a,#2f7d8f)", tag: "Solar Products", h: "Power Your Site With The Sun", off: "UP TO 29%", offSub: " OFF", cta: "Shop Now" },
  { dg: "linear-gradient(135deg,#2b4a7a,#3E79BD)", tag: "Compressor Combos", h: "Packaged Gas Compressors", off: "FROM ₹9.9L", offSub: " onwards", cta: "View Deals" },
  { dg: "linear-gradient(135deg,#5a7d2a,#7BB145)", tag: "Biogas Season", h: "Purification Skids & Kits", off: "SAVE 18%", offSub: " this month", cta: "Explore" },
];

export const BESTSELLERS = [
  { t: "Twin-Cylinder Gas Compressor", r: "4.8", rv: "35 Reviews", p: "₹ 1,41,900", s: "₹ 3,59,000", off: "60% OFF", ic: ICONS.regulator },
  { t: "FR PVC Power Cable — Red", r: "4.7", rv: "249 Reviews", p: "₹ 4,690", s: "₹ 16,000", off: "70% OFF", ic: ICONS.cable },
  { t: "Digital Gas Analyser", r: "4.9", rv: "92 Reviews", p: "₹ 5,420", s: "₹ 8,490", off: "36% OFF", ic: ICONS.meter },
  { t: "Cascade Storage Module", r: "4.9", rv: "21 Reviews", p: "₹ 42,990", s: "₹ 1,05,000", off: "59% OFF", ic: ICONS.sensor },
  { t: "CNG Dispenser Head Unit", r: "4.7", rv: "125 Reviews", p: "₹ 19,690", s: "₹ 49,900", off: "60% OFF", ic: ICONS.gauge },
  { t: "Priority Panel Assembly", r: "4.7", rv: "56 Reviews", p: "₹ 59,490", s: "₹ 1,00,000", off: "40% OFF", ic: ICONS.breaker },
  { t: "Rotary Screw Compressor", r: "4.6", rv: "63 Reviews", p: "₹ 26,990", s: "₹ 70,000", off: "61% OFF", ic: ICONS.drill },
  { t: "Industrial Ball Valve", r: "4.5", rv: "110 Reviews", p: "₹ 8,790", s: "₹ 27,400", off: "67% OFF", ic: ICONS.valve },
];

export const CITIES = ["Delhi-NCR", "Bengaluru", "Chennai", "Indore", "Mumbai", "Ahmedabad", "Kolkata", "Pune", "Jaipur", "Chandigarh", "Hyderabad", "Surat", "Lucknow", "Coimbatore", "Vadodara"];

export const CITY_PRODUCTS = [
  { t: "Gas Analysers", p: "₹399", ic: ICONS.meter },
  { t: "Circuit Breakers", p: "₹287", ic: ICONS.breaker },
  { t: "Impact Drills", p: "₹891", ic: ICONS.drill },
  { t: "Tool Kits", p: "₹545", ic: ICONS.valve },
  { t: "Compressor Combos", p: "₹1189", ic: ICONS.regulator },
  { t: "Angle Grinders", p: "₹1099", ic: ICONS.drill },
  { t: "Soldering Kits", p: "₹335", ic: ICONS.sensor },
  { t: "Pressure Regulators", p: "₹3569", ic: ICONS.regulator },
  { t: "Platform Scales", p: "₹1669", ic: ICONS.scale },
  { t: "Bench Gauges", p: "₹1299", ic: ICONS.gauge },
];

// ============================================================
// About page data
// ============================================================

export const ABOUT_STATS = [
  { count: 7, suffix: "+", label: "Years Operating" },
  { count: 500, suffix: "+", label: "Verified Sellers" },
  { count: 10000, suffix: "+", label: "Products Listed" },
  { count: 28, suffix: "+", label: "States Served" },
  { count: 100, suffix: "+", label: "Projects Delivered" },
];

export const STORY_POINTS = [
  { t: "Verification first", s: "No unvetted sellers" },
  { t: "Engineering depth", s: "Gas-sector expertise" },
  { t: "Transparent pricing", s: "No hidden margins" },
  { t: "Lifecycle support", s: "From RFQ to AMC" },
];

export const CORE_VALUES = [
  {
    icon: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`,
    title: "Integrity & Verification",
    desc: "Every supplier is document-verified and quality-audited. Trust isn't a badge here — it's the entry requirement.",
  },
  {
    icon: `<path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/><path d="M9 3v6h6M13 3l8 8"/>`,
    title: "Engineering Rigour",
    desc: "We speak the language of specs, standards and commissioning — so procurement decisions are technically sound, not just transactional.",
  },
  {
    icon: `<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>`,
    title: "Sustainability at the Core",
    desc: "Cleaner fuels move India forward. Everything we enable — from a single valve to a full station — serves that transition.",
  },
  {
    icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>`,
    title: "Partnership over Transactions",
    desc: "We stay through installation, spares and AMC. A closed order is the start of the relationship, not the end of it.",
  },
];

export const JOURNEY = [
  {
    n: 1,
    year: "2019",
    title: "Founded",
    desc: "Started in Pune to fix opaque gas-equipment procurement.",
    icon: `<path d="M12 2v4M4.9 4.9l2.9 2.9M2 12h4M19.1 4.9l-2.9 2.9M22 12h-4"/><circle cx="12" cy="14" r="6"/>`,
  },
  {
    n: 2,
    year: "2020",
    title: "First 100 sellers",
    desc: "Built the CNG catalogue with verified manufacturers.",
    icon: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`,
  },
  {
    n: 3,
    year: "2021",
    title: "CBG & Bio Gas",
    desc: "Expanded into biogas systems and purification skids.",
    icon: `<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>`,
  },
  {
    n: 4,
    year: "2023",
    title: "Hydrogen + Services",
    desc: "Added hydrogen equipment and full engineering services.",
    icon: `<circle cx="12" cy="12" r="9"/><text x="12" y="16" font-size="9" font-family="Poppins" font-weight="700" fill="currentColor" text-anchor="middle" stroke="none">H₂</text>`,
  },
  {
    n: 5,
    year: "2026",
    title: "10,000+ products",
    desc: "A PAN-India marketplace serving 28+ states.",
    icon: `<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>`,
  },
];

export const TEAM = [
  { a: "AK", n: "Anaya Krishnan", r: "Founder & CEO", b: "20 years in industrial gas procurement; built SANMISH to make clean-energy sourcing trustworthy." },
  { a: "RD", n: "Rohan Deshpande", r: "Co-founder & CTO", b: "Leads the platform and verification engine that keeps every listing accountable." },
  { a: "MI", n: "Meera Iyer", r: "Head of Supplier Success", b: "Onboards and audits manufacturers, growing a network of 500+ verified sellers." },
  { a: "KR", n: "Karthik Rao", r: "Director, Engineering Services", b: "Runs installation, commissioning and AMC for turnkey gas projects nationwide." },
];

export const CERTIFICATIONS = [
  {
    icon: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`,
    title: "ISO 9001",
    desc: "Quality management certified.",
  },
  {
    icon: `<path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z"/>`,
    title: "PESO Approved",
    desc: "Compliant gas-equipment listings.",
  },
  {
    icon: `<circle cx="12" cy="8" r="6"/><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5"/>`,
    title: "BIS Standards",
    desc: "Aligned to Indian benchmarks.",
  },
  {
    icon: `<path d="M9 12a4 4 0 1 0 4-4M15 12a4 4 0 1 1-4 4"/>`,
    title: "CE Marked",
    desc: "For eligible imported equipment.",
  },
  {
    icon: `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
    title: "Secure Payments",
    desc: "Protected, escrow-backed orders.",
  },
];

// ============================================================
// Contact page data
// ============================================================

export const OFFICES = [
  { city: "Pune — Head Office", addr: "Baner High Street, Pune 411045", phone: "+91 90000 00000" },
  { city: "Ahmedabad — West", addr: "SG Highway, Ahmedabad 380015", phone: "+91 90000 00001" },
  { city: "Delhi NCR — North", addr: "Sector 62, Noida 201301", phone: "+91 90000 00002" },
];

export const INQUIRY_TYPES = [
  "Request a quotation (RFQ)",
  "Become a seller / list products",
  "Installation & commissioning",
  "AMC & spare parts",
  "Turnkey project enquiry",
  "General question",
];

export const CONTACT_FAQ = [
  { q: "How soon will I get a response?", a: "We reply to messages within one business day. For urgent procurement, calling sales is the fastest route." },
  { q: "How do I request a quotation (RFQ)?", a: "Use the form above with \"Request a quotation\" selected, or send one RFQ from the marketplace to multiple verified sellers at once." },
  { q: "I want to sell on SANMISH — where do I start?", a: "Choose \"Become a seller\" in the form, or use the Become Seller button in the top bar. Our supplier team will guide you through verification." },
  { q: "Do you support projects outside major cities?", a: "Yes. We serve 28+ states with regional teams and tracked logistics for heavy industrial equipment." },
  { q: "Can I visit your office?", a: "Absolutely — our head office is in Pune, with regional offices in Ahmedabad and Delhi NCR. Working hours are Mon–Sat, 9am–7pm IST." },
];

export const HELP_CENTER_FAQ = [
  {
    category: "Orders & RFQs",
    items: [
      { q: "How does the RFQ (Request for Quotation) process work?", a: "Add equipment to your cart or submit an enquiry from a product page. Verified sellers respond with formal pricing within 24–48 hours, which you can review and accept from My Account → Orders." },
      { q: "Can I request quotes from multiple sellers at once?", a: "Yes — SANMISH's RFQ model is built for this. One submitted requirement can be routed to multiple verified sellers so you can compare pricing and lead times." },
      { q: "How do I check my order status?", a: "Go to My Account → Orders and select the order. You'll see its current stage — confirmed, dispatched, out for delivery, or delivered — along with tracking details where available." },
      { q: "Can I edit an order after placing it?", a: "Contact our support team as soon as possible with your order ID. We can usually accommodate changes before the order is dispatched by the seller." },
    ],
  },
  {
    category: "Payments & Pricing",
    items: [
      { q: "Are the prices shown final?", a: "Listed prices are starting prices inclusive of GST. Final pricing depends on quantity, delivery location and any specification changes, confirmed in the seller's formal quotation before you pay." },
      { q: "Do you offer bulk / volume discounts?", a: "Yes. Most listings show tiered \"Buy more, save more\" pricing on the product page. For 21+ units, request a custom bulk quote and our team will negotiate directly with the seller on your behalf." },
      { q: "What payment methods are accepted?", a: "We support major cards, net banking, UPI and bank transfer for confirmed orders. For large B2B purchases, our team can also arrange invoicing against a formal purchase order." },
      { q: "Will I get a GST invoice?", a: "Yes — a GST-compliant invoice is generated automatically once your order is confirmed, and is available from My Account → Orders." },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      { q: "How long does delivery take?", a: "Most standard equipment ships in 7–14 business days; the exact estimate is shown on each product page. Made-to-order or bulk equipment may take longer, confirmed at quotation." },
      { q: "Do you deliver outside major cities?", a: "Yes — we deliver across 28+ states with tracked dispatch, including semi-urban and industrial zones. Enter your pincode on the product page to confirm serviceability." },
      { q: "Is installation included?", a: "Some listings include installation support; this is indicated on the product page. Where it isn't, our team can help you arrange certified installation and commissioning separately." },
    ],
  },
  {
    category: "Returns, Cancellations & Warranty",
    items: [
      { q: "What is your return policy?", a: "Eligible equipment (marked \"7 Days Return Policy\" on the listing) can be returned within 7 days of delivery if unused and in original packaging. See our full Shipping & Returns Policy for exclusions." },
      { q: "Can I cancel an order?", a: "Yes, free of charge before dispatch from My Account → Orders. Once shipped, cancellation may involve a logistics fee or no longer be possible for made-to-order items." },
      { q: "What if my equipment arrives damaged?", a: "Report it within 48 hours with photos via My Account → Orders → Report an Issue. We coordinate a replacement, repair or refund with the seller at no cost to you." },
      { q: "How do warranty claims work?", a: "Contact SANMISH support with your order ID and issue description — we route the claim to the manufacturer and follow up until it's resolved." },
    ],
  },
  {
    category: "Becoming a Seller",
    items: [
      { q: "How do I list my products on SANMISH?", a: "Click \"Become Seller\" in the header and submit your business and product details. Our supplier team reviews documentation and verifies your listing before it goes live." },
      { q: "What documents are required for seller verification?", a: "Typically GST registration, business incorporation proof, and relevant product certifications (e.g. PESO approval for gas equipment). Our team will confirm the exact list for your category." },
      { q: "How long does seller verification take?", a: "Most applications are reviewed within 3–5 business days, provided all required documents are submitted." },
    ],
  },
  {
    category: "Account & Security",
    items: [
      { q: "How do I log in?", a: "SANMISH uses passwordless login — enter your registered email and we'll send a one-time code (OTP) to verify it's you." },
      { q: "I didn't receive my OTP — what should I do?", a: "Check your spam folder first. If it still hasn't arrived after a couple of minutes, use \"Change email address\" to re-request the code, or contact support if the issue persists." },
      { q: "How do I delete my account?", a: "Contact our support team or refer to our Privacy Policy for the account deletion process and what happens to your data." },
    ],
  },
];

// ============================================================
// Products listing page data
// ============================================================

export const FILTER_CATEGORIES = [
  { value: "CNG", label: "CNG Equipment", count: 612, defaultChecked: true },
  { value: "CBG", label: "CBG Systems", count: 348 },
  { value: "Bio Gas", label: "Bio Gas Plants", count: 204 },
  { value: "Compressors", label: "Compressors", count: 387 },
  { value: "Storage", label: "Storage & Cascade", count: 256 },
];

export const SUPPLIER_TYPES = [
  { value: "verified", label: "Verified Manufacturer", defaultChecked: true },
  { value: "oem", label: "Authorized OEM" },
  { value: "turnkey", label: "Turnkey / EPC" },
];

export const BRAND_FILTERS = ["Kirloskar", "GreenFuel", "Atlas", "CylinTech", "PressureSafe", "FlowLine"];

export const PRODUCT_CATALOGUE = [
  { t: "High-Flow CNG Dispenser", c: "CNG", s: "Kirloskar Verified", brand: "Kirloskar", type: "verified", p: 680000, b: "Bestseller", ic: svgDisp },
  { t: "CBG Refueling Unit", c: "CBG", s: "GreenFuel Systems", brand: "GreenFuel", type: "verified", p: 940000, b: "New", ic: svgDisp },
  { t: "Packaged Gas Compressor", c: "Compressors", s: "Atlas Pro Systems", brand: "Atlas", type: "oem", p: 1250000, b: "Popular", ic: svgComp },
  { t: "Cascade Storage System", c: "Storage", s: "CylinTech India", brand: "CylinTech", type: "verified", p: 920000, b: "Featured", ic: svgTank },
  { t: "Bio-CNG Filling Station", c: "CBG", s: "GreenFuel EPC", brand: "GreenFuel", type: "turnkey", p: 1850000, b: "Turnkey", ic: svgDisp },
  { t: "Priority Panel Assembly", c: "CNG", s: "FlowLine Controls", brand: "FlowLine", type: "verified", p: 240000, b: "In Stock", ic: svgComp },
  { t: "Gas Storage Vessel", c: "Storage", s: "PressureSafe Ltd", brand: "PressureSafe", type: "verified", p: 1500000, b: "Certified", ic: svgTank },
  { t: "Biogas Purification Skid", c: "Bio Gas", s: "PuriGas Solutions", brand: "PuriGas", type: "turnkey", p: 1120000, b: "Turnkey", ic: svgSkid },
  { t: "Twin-Cylinder CNG Compressor", c: "Compressors", s: "Atlas Pro Systems", brand: "Atlas", type: "oem", p: 980000, b: "Popular", ic: svgComp },
  { t: "Digital Sequencing Panel", c: "CNG", s: "FlowLine Controls", brand: "FlowLine", type: "verified", p: 186000, b: "In Stock", ic: svgValve },
  { t: "CBG Bottling Unit", c: "CBG", s: "GreenFuel Systems", brand: "GreenFuel", type: "verified", p: 1340000, b: "New", ic: svgSkid },
  { t: "High-Pressure Regulator Set", c: "CNG", s: "Kirloskar Verified", brand: "Kirloskar", type: "verified", p: 56000, b: "In Stock", ic: svgValve },
  { t: "Mobile Cascade Trailer", c: "Storage", s: "CylinTech India", brand: "CylinTech", type: "verified", p: 2100000, b: "Featured", ic: svgTank },
  { t: "Biogas Digester Skid", c: "Bio Gas", s: "PuriGas Solutions", brand: "PuriGas", type: "turnkey", p: 1680000, b: "Turnkey", ic: svgSkid },
  { t: "Dual-Hose CNG Dispenser", c: "CNG", s: "Kirloskar Verified", brand: "Kirloskar", type: "verified", p: 720000, b: "Bestseller", ic: svgDisp },
  { t: "Compact CBG Compressor", c: "Compressors", s: "Atlas Pro Systems", brand: "Atlas", type: "oem", p: 860000, b: "Popular", ic: svgComp },
  { t: "Bio Gas Scrubber Unit", c: "Bio Gas", s: "PuriGas Solutions", brand: "PuriGas", type: "verified", p: 540000, b: "New", ic: svgSkid },
  { t: "Cylinder Test Bench", c: "Storage", s: "PressureSafe Ltd", brand: "PressureSafe", type: "verified", p: 410000, b: "Certified", ic: svgTank },
  { t: "Control Valve Manifold", c: "CNG", s: "FlowLine Controls", brand: "FlowLine", type: "verified", p: 128000, b: "In Stock", ic: svgValve },
  { t: "CBG Turnkey Filling Skid", c: "CBG", s: "GreenFuel EPC", brand: "GreenFuel", type: "turnkey", p: 2450000, b: "Turnkey", ic: svgSkid },
  { t: "Reciprocating Gas Compressor", c: "Compressors", s: "Atlas Pro Systems", brand: "Atlas", type: "oem", p: 1420000, b: "Popular", ic: svgComp },
  { t: "Standing Cascade Rack", c: "Storage", s: "CylinTech India", brand: "CylinTech", type: "verified", p: 760000, b: "Featured", ic: svgTank },
  { t: "Biomethane Compression Unit", c: "Bio Gas", s: "PuriGas Solutions", brand: "PuriGas", type: "turnkey", p: 1960000, b: "Turnkey", ic: svgComp },
  { t: "Emergency Shut-off Valve", c: "CNG", s: "FlowLine Controls", brand: "FlowLine", type: "verified", p: 64000, b: "In Stock", ic: svgValve },
  { t: "CNG Kiosk Dispenser", c: "CNG", s: "Kirloskar Verified", brand: "Kirloskar", type: "verified", p: 590000, b: "Bestseller", ic: svgDisp },
  { t: "Booster Compressor Skid", c: "Compressors", s: "Atlas Pro Systems", brand: "Atlas", type: "oem", p: 1080000, b: "Popular", ic: svgComp },
  { t: "CBG Storage Cascade", c: "Storage", s: "CylinTech India", brand: "CylinTech", type: "verified", p: 1030000, b: "Featured", ic: svgTank },
  { t: "Bio Gas Flare Stack", c: "Bio Gas", s: "PuriGas Solutions", brand: "PuriGas", type: "verified", p: 320000, b: "New", ic: svgSkid },
  { t: "Pressure Relief Assembly", c: "Storage", s: "PressureSafe Ltd", brand: "PressureSafe", type: "verified", p: 96000, b: "Certified", ic: svgValve },
  { t: "CBG Priority Panel", c: "CBG", s: "GreenFuel Systems", brand: "GreenFuel", type: "verified", p: 210000, b: "New", ic: svgValve },
  { t: "Turnkey CNG Station Package", c: "CNG", s: "Kirloskar Verified", brand: "Kirloskar", type: "turnkey", p: 6800000, b: "Turnkey", ic: svgDisp },
  { t: "Skid-Mounted Bio Compressor", c: "Bio Gas", s: "PuriGas Solutions", brand: "PuriGas", type: "oem", p: 1560000, b: "Popular", ic: svgComp },
];

// ============================================================
// Services page data
// ============================================================

export const PROCESS_STEPS = [
  { n: 1, title: "Consult", desc: "We map your requirement, site and compliance needs.", icon: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>` },
  { n: 2, title: "Design", desc: "Engineering, feasibility and equipment specification.", icon: `<path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/><path d="M9 3v6h6M13 3l8 8"/>` },
  { n: 3, title: "Supply", desc: "Verified equipment sourced and delivered on schedule.", icon: `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>` },
  { n: 4, title: "Install", desc: "Certified engineers build and integrate on site.", icon: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>` },
  { n: 5, title: "Support", desc: "Commissioning, AMC and spares for the long run.", icon: `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>` },
];

export const INDUSTRIES = [
  { title: "Fuel Stations", desc: "CNG, CBG & H₂ retail outlets.", icon: `<rect x="4" y="2" width="16" height="20" rx="3"/><path d="M9 22v-4h6v4M8 6h.01M8 10h.01"/>` },
  { title: "OEM Partners", desc: "Equipment makers scaling up.", icon: `<path d="M2 20h20M4 20V8l8-5 8 5v12M9 20v-6h6v6"/>` },
  { title: "Gas Utilities", desc: "City gas & distribution.", icon: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>` },
  { title: "Municipalities", desc: "Public clean-energy projects.", icon: `<path d="M3 21h18M6 21V7l6-4 6 4v14M10 12h4M10 16h4"/>` },
  { title: "EPC Contractors", desc: "Large turnkey builds.", icon: `<path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/><path d="M9 3v6h6M13 3l8 8"/>` },
];

export const SERVICE_STATS = [
  { count: 100, suffix: "+", label: "Turnkey Projects" },
  { count: 40, suffix: "+", label: "Field Engineers" },
  { count: 28, suffix: "+", label: "States Covered" },
  { count: 98, suffix: "%", label: "On-time Delivery" },
  { count: 5000, suffix: "+", label: "AMC Visits" },
];

export const SERVICE_TESTIMONIALS = [
  { q: "SANMISH handled our full CNG station build — supply, installation and commissioning — on time and to code. One accountable partner made all the difference.", n: "Rajesh Menon", r: "Operations Head, City Gas Distributor", a: "RM" },
  { q: "Their AMC team keeps our compressors running with near-zero downtime. Genuine spares, fast response, engineers who actually know gas systems.", n: "Arjun Nair", r: "Project Lead, Clean Energy EPC", a: "AN" },
  { q: "From feasibility to a commissioned hydrogen unit, the engineering rigour was exactly what a project like ours needed.", n: "Priya Sharma", r: "Director, Industrial Equipment OEM", a: "PS" },
  { q: "Transparent scope, clear pricing and dependable delivery across multiple sites. SANMISH is now our default for turnkey work.", n: "Vikram Patel", r: "Owner, Multi-Fuel Station Network", a: "VP" },
];

export const SERVICE_FAQ = [
  { q: "Do you handle turnkey projects end to end?", a: "Yes. We take projects from consultation and design through equipment supply, installation, commissioning and ongoing maintenance — a single accountable partner for the whole scope." },
  { q: "Which fuel systems do you service?", a: "CNG, CBG, Bio Gas and Hydrogen equipment — dispensers, compressors, cascade storage, purification skids and complete stations." },
  { q: "Are your engineers certified?", a: "All field engineers are trained and audited, and installations are carried out to PESO and applicable safety codes." },
  { q: "Do you offer AMC and spare parts?", a: "Yes. We offer annual maintenance contracts with scheduled service visits and genuine spares with fast fulfilment across 28+ states." },
  { q: "How quickly can you mobilise for a site?", a: "Timelines depend on scope and location, but our nationwide teams typically respond within days. Share your details and we will confirm a schedule." },
];

// ============================================================
// Suppliers directory page data
// ============================================================

export const SUPPLIER_FILTERS = [
  { value: "all", label: "All Suppliers" },
  { value: "cng", label: "CNG" },
  { value: "cbg", label: "CBG" },
  { value: "biogas", label: "Bio Gas" },
  { value: "hydrogen", label: "Hydrogen" },
  { value: "compressors", label: "Compressors" },
  { value: "storage", label: "Storage" },
  { value: "dispensers", label: "Dispensers" },
  { value: "valves", label: "Valves" },
];

export const SUPPLIERS = [
  { n: "Kirloskar Pneumatic", a: "KP", t: "Compressor Manufacturer", loc: "Pune, MH", r: "4.9", rv: 320, p: 48, tags: ["CNG", "Compressors"], cats: ["cng", "compressors"] },
  { n: "GreenFuel Systems", a: "GF", t: "CBG Equipment Maker", loc: "Ahmedabad, GJ", r: "4.8", rv: 214, p: 36, tags: ["CBG", "Turnkey"], cats: ["cbg"] },
  { n: "HydroTech Industries", a: "HT", t: "Hydrogen Refuelling OEM", loc: "Bengaluru, KA", r: "4.9", rv: 98, p: 22, tags: ["Hydrogen", "Dispensers"], cats: ["hydrogen", "dispensers"] },
  { n: "CylinTech India", a: "CT", t: "Storage & Cascade Systems", loc: "Vadodara, GJ", r: "4.7", rv: 176, p: 41, tags: ["Storage", "CNG"], cats: ["storage", "cng"] },
  { n: "FlowLine Controls", a: "FL", t: "Valve & Panel Manufacturer", loc: "Chennai, TN", r: "4.6", rv: 143, p: 29, tags: ["Valves", "CNG"], cats: ["valves", "cng"] },
  { n: "PressureSafe Ltd", a: "PS", t: "Pressure Vessel Manufacturer", loc: "Faridabad, HR", r: "4.8", rv: 189, p: 33, tags: ["Storage", "Hydrogen"], cats: ["storage", "hydrogen"] },
  { n: "PuriGas Solutions", a: "PG", t: "Biogas Purification Skids", loc: "Nagpur, MH", r: "4.7", rv: 121, p: 27, tags: ["Bio Gas", "Turnkey"], cats: ["biogas"] },
  { n: "Atlas Pro Systems", a: "AP", t: "Packaged Compressor OEM", loc: "Coimbatore, TN", r: "4.6", rv: 205, p: 39, tags: ["Compressors", "CBG"], cats: ["compressors", "cbg"] },
  { n: "GreenFuel EPC", a: "GE", t: "Turnkey Filling Stations", loc: "Surat, GJ", r: "4.8", rv: 87, p: 19, tags: ["CBG", "Turnkey"], cats: ["cbg"] },
  { n: "Kirloskar Verified", a: "KV", t: "CNG Dispenser Manufacturer", loc: "Pune, MH", r: "4.9", rv: 268, p: 52, tags: ["CNG", "Dispensers"], cats: ["cng", "dispensers"] },
  { n: "SafeValve Engineering", a: "SV", t: "Industrial Valve Manufacturer", loc: "Jaipur, RJ", r: "4.5", rv: 96, p: 24, tags: ["Valves", "Storage"], cats: ["valves", "storage"] },
  { n: "H2Core Systems", a: "H2", t: "Hydrogen Storage Vessels", loc: "Hyderabad, TS", r: "4.8", rv: 64, p: 15, tags: ["Hydrogen", "Storage"], cats: ["hydrogen", "storage"] },
];

export const SUPPLIER_STATS = [
  { count: 500, suffix: "+", label: "Verified Suppliers" },
  { count: 40, suffix: "+", label: "Categories" },
  { count: 28, suffix: "+", label: "States Covered" },
  { count: 4, suffix: "h", label: "Avg. Quote Time" },
  { count: 5000, suffix: "+", label: "Buyer Reviews" },
];

export const SUPPLIER_WHY_ITEMS = [
  { t: "Document verified", s: "Every listing checked" },
  { t: "Quality audited", s: "On-site inspections" },
  { t: "Rated by buyers", s: "Real transaction reviews" },
  { t: "One RFQ, many quotes", s: "Compare and decide fast" },
];

export const SUPPLIER_JOIN_STEPS = [
  { n: 1, title: "Register", desc: "Create your supplier account with basic business details.", icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>` },
  { n: 2, title: "Get Verified", desc: "Submit documents for our verification and quality audit.", icon: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>` },
  { n: 3, title: "List Products", desc: "Add your equipment catalogue with pricing and specs.", icon: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>` },
  { n: 4, title: "Receive RFQs", desc: "Get matched with buyers actively sourcing your products.", icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>` },
  { n: 5, title: "Grow Sales", desc: "Convert quotes into orders and build a repeat buyer base.", icon: `<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>` },
];

export const SUPPLIER_BENEFITS = [
  { icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>`, title: "Qualified Buyers", desc: "Reach procurement teams actively sourcing gas equipment." },
  { icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>`, title: "Steady RFQ Flow", desc: "Consistent inbound quote requests matched to your catalogue." },
  { icon: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`, title: "Verified Badge", desc: "Stand out with a trust badge earned through our audit process." },
  { icon: `<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>`, title: "Growth Insights", desc: "Track views, RFQs and conversion with supplier analytics." },
];

export const SUPPLIER_TESTIMONIALS = [
  { q: "Listing on SANMISH connected us with buyers we never reached through cold outreach. Verified RFQs, no time wasted on tyre-kickers.", n: "Priya Sharma", r: "Director, Industrial Equipment OEM", a: "PS" },
  { q: "Our compressor range started getting qualified bulk enquiries within the first month of being listed. The verification process builds real buyer trust.", n: "Sanjay Gupta", r: "Founder, Compressor Manufacturer", a: "SG" },
  { q: "As a storage systems maker, ratings from real buyers have been the biggest credibility boost for our new accounts.", n: "Anita Rao", r: "Sales Head, Storage Systems Maker", a: "AR" },
  { q: "One RFQ from a buyer led to three repeat orders. SANMISH's supplier dashboard makes it easy to track every enquiry.", n: "Imran Sheikh", r: "MD, Biogas Skid Builder", a: "IS" },
];

export const SUPPLIER_FAQ = [
  { q: "What does \"verified supplier\" mean?", a: "Every verified supplier has submitted business and quality documents that our team has reviewed and audited before the listing goes live." },
  { q: "How do I request quotes from suppliers?", a: "Use the search or filters to find relevant suppliers, then send a single RFQ — it reaches multiple matching sellers so you can compare quotes quickly." },
  { q: "How do I become a listed supplier?", a: "Register an account, submit your documents for verification, then list your products. Once approved you start receiving RFQs from buyers." },
  { q: "Is there a cost to list as a supplier?", a: "Basic listing is free. Optional priority placement and analytics plans are available once your account is verified." },
  { q: "Can buyers see supplier ratings?", a: "Yes — every supplier profile shows a rating and review count from verified buyer transactions, visible before you send an RFQ." },
];

// The SANMISH logo as base64 (extracted from original HTML)
export const LOGO_BASE64 = "data:image/png;base64,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";
