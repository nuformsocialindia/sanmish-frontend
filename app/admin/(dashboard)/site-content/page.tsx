"use client";
import { useState } from "react";
import SectionListEditor, { type SectionField, type SectionItem } from "@/components/admin/SectionListEditor";
import { keyForIconMarkup } from "@/lib/sectionIcons";
import { DEFAULT_MISSION_VISION } from "@/components/AboutSections";
import { DEFAULT_CONTACT_METHODS, DEFAULT_CONTACT_DETAILS } from "@/components/ContactSections";
import { DEFAULT_WHY_SERVICES_ITEMS } from "@/components/ServicesSections";
import {
  ABOUT_STATS, STORY_POINTS, CORE_VALUES, JOURNEY, TEAM, CERTIFICATIONS, BRANDS, TESTIMONIALS,
  SUPPLIER_FILTERS, SUPPLIERS, SUPPLIER_STATS, SUPPLIER_WHY_ITEMS, SUPPLIER_JOIN_STEPS, SUPPLIER_BENEFITS,
  SUPPLIER_TESTIMONIALS, SUPPLIER_FAQ, OFFICES, CONTACT_FAQ,
  PROCESS_STEPS, INDUSTRIES, SERVICE_STATS, SERVICE_TESTIMONIALS, SERVICE_FAQ, SERVICES,
} from "@/lib/data";

// lib/data.ts still stores `icon` as raw SVG markup for these sections —
// map each to its matching key in SECTION_ICON_LIBRARY so the admin editor's
// icon picker shows the right preset selected on the very first edit.
function withIconKeys<T extends { icon: string }>(items: T[]): (Omit<T, "icon"> & { icon: string })[] {
  return items.map((item) => ({ ...item, icon: keyForIconMarkup(item.icon) }));
}
// SERVICES stores its icon under `i`, not `icon` — same idea, different key.
function withServiceIconKeys<T extends { i: string }>(items: T[]): (Omit<T, "i"> & { i: string })[] {
  return items.map((item) => ({ ...item, i: keyForIconMarkup(item.i) }));
}

type SectionDef = {
  key: string;
  path: string;
  title: string;
  itemLabel: string;
  fields: SectionField[];
  defaultItems: SectionItem[];
  singleton?: boolean;
};

const statsFields: SectionField[] = [
  { key: "count", label: "Count", type: "number" },
  { key: "suffix", label: "Suffix (e.g. +, %)", type: "text" },
  { key: "label", label: "Label", type: "text" },
];
const pointFields: SectionField[] = [
  { key: "t", label: "Title", type: "text" },
  { key: "s", label: "Subtitle", type: "text" },
];
const iconCardFields: SectionField[] = [
  { key: "icon", label: "Icon", type: "icon" },
  { key: "title", label: "Title", type: "text" },
  { key: "desc", label: "Description", type: "textarea" },
];
const testimonialFields: SectionField[] = [
  { key: "q", label: "Quote", type: "textarea" },
  { key: "n", label: "Name", type: "text" },
  { key: "r", label: "Role / Title", type: "text" },
  { key: "a", label: "Avatar initials", type: "text" },
];

const ABOUT_SECTIONS: SectionDef[] = [
  { key: "stats", path: "/about/stats", title: "About — Stats", itemLabel: "stat", fields: statsFields, defaultItems: ABOUT_STATS },
  { key: "story", path: "/about/story-points", title: "About — Story points", itemLabel: "point", fields: pointFields, defaultItems: STORY_POINTS },
  { key: "mission-vision", path: "/about/mission-vision", title: "About — Mission & Vision", itemLabel: "card", fields: iconCardFields, defaultItems: withIconKeys(DEFAULT_MISSION_VISION) },
  { key: "values", path: "/about/values", title: "About — Core values", itemLabel: "value", fields: iconCardFields, defaultItems: withIconKeys(CORE_VALUES) },
  {
    key: "journey", path: "/about/journey", title: "About — Journey / timeline", itemLabel: "milestone",
    fields: [{ key: "year", label: "Year", type: "text" }, { key: "title", label: "Title", type: "text" }, { key: "desc", label: "Description", type: "textarea" }, { key: "icon", label: "Icon", type: "icon" }],
    defaultItems: withIconKeys(JOURNEY),
  },
  {
    key: "team", path: "/about/team", title: "About — Team", itemLabel: "team member",
    fields: [{ key: "n", label: "Name", type: "text" }, { key: "r", label: "Role", type: "text" }, { key: "b", label: "Bio", type: "textarea" }, { key: "a", label: "Avatar initials", type: "text" }],
    defaultItems: TEAM,
  },
  { key: "certifications", path: "/about/certifications", title: "About — Certifications", itemLabel: "certification", fields: iconCardFields, defaultItems: withIconKeys(CERTIFICATIONS) },
  {
    key: "brands", path: "/about/brands", title: "About — Brand names", itemLabel: "brand",
    fields: [{ key: "name", label: "Brand name", type: "text" }],
    defaultItems: BRANDS.map((name) => ({ name })),
  },
  { key: "testimonials", path: "/about/testimonials", title: "About — Testimonials", itemLabel: "testimonial", fields: testimonialFields, defaultItems: TESTIMONIALS },
];

const SUPPLIERS_SECTIONS: SectionDef[] = [
  {
    key: "filters", path: "/suppliers/filters", title: "Suppliers — Category filters", itemLabel: "filter",
    fields: [{ key: "value", label: "Value (slug)", type: "text" }, { key: "label", label: "Label", type: "text" }],
    defaultItems: SUPPLIER_FILTERS,
  },
  {
    key: "directory", path: "/suppliers/directory", title: "Suppliers — Directory listings", itemLabel: "supplier",
    fields: [
      { key: "n", label: "Company name", type: "text" }, { key: "a", label: "Logo initials", type: "text" },
      { key: "t", label: "Type / category label", type: "text" }, { key: "loc", label: "Location", type: "text" },
      { key: "r", label: "Rating (e.g. 4.9)", type: "text" }, { key: "rv", label: "Review count", type: "number" },
      { key: "p", label: "Product count", type: "number" }, { key: "tags", label: "Display tags", type: "tags" },
      { key: "cats", label: "Filter categories (match filter values)", type: "tags" },
    ],
    defaultItems: SUPPLIERS,
  },
  { key: "stats", path: "/suppliers/stats", title: "Suppliers — Stats", itemLabel: "stat", fields: statsFields, defaultItems: SUPPLIER_STATS },
  { key: "why", path: "/suppliers/why-items", title: "Suppliers — Why source items", itemLabel: "point", fields: pointFields, defaultItems: SUPPLIER_WHY_ITEMS },
  {
    key: "join-steps", path: "/suppliers/join-steps", title: "Suppliers — Join steps", itemLabel: "step",
    fields: [{ key: "title", label: "Title", type: "text" }, { key: "desc", label: "Description", type: "textarea" }, { key: "icon", label: "Icon", type: "icon" }],
    defaultItems: withIconKeys(SUPPLIER_JOIN_STEPS),
  },
  { key: "benefits", path: "/suppliers/benefits", title: "Suppliers — Benefits", itemLabel: "benefit", fields: iconCardFields, defaultItems: withIconKeys(SUPPLIER_BENEFITS) },
  { key: "testimonials", path: "/suppliers/testimonials", title: "Suppliers — Testimonials", itemLabel: "testimonial", fields: testimonialFields, defaultItems: SUPPLIER_TESTIMONIALS },
  {
    key: "faq", path: "/suppliers/faq", title: "Suppliers — FAQ", itemLabel: "question",
    fields: [{ key: "q", label: "Question", type: "text" }, { key: "a", label: "Answer", type: "textarea" }],
    defaultItems: SUPPLIER_FAQ,
  },
];

const CONTACT_SECTIONS: SectionDef[] = [
  {
    key: "methods", path: "/contact/methods", title: "Contact — Contact methods", itemLabel: "method",
    fields: [
      { key: "icon", label: "Icon", type: "icon" }, { key: "title", label: "Title", type: "text" },
      { key: "value", label: "Value (shown text)", type: "text" }, { key: "href", label: "Link (tel:/mailto:/https:, optional)", type: "text" },
      { key: "note", label: "Note", type: "text" },
    ],
    defaultItems: withIconKeys(DEFAULT_CONTACT_METHODS),
  },
  {
    key: "details", path: "/contact/details", title: "Contact — Contact details", itemLabel: "record", singleton: true,
    fields: [
      { key: "headOfficeAddress", label: "Head office address", type: "textarea" },
      { key: "phone", label: "Phone (shown text)", type: "text" }, { key: "phoneHref", label: "Phone link (tel:...)", type: "text" },
      { key: "email", label: "Email (shown text)", type: "text" }, { key: "emailHref", label: "Email link (mailto:...)", type: "text" },
      { key: "workingHoursLine1", label: "Working hours — line 1", type: "text" }, { key: "workingHoursLine2", label: "Working hours — line 2", type: "text" },
    ],
    defaultItems: [DEFAULT_CONTACT_DETAILS],
  },
  {
    key: "offices", path: "/contact/offices", title: "Contact — Offices", itemLabel: "office",
    fields: [{ key: "city", label: "City / label", type: "text" }, { key: "addr", label: "Address", type: "text" }, { key: "phone", label: "Phone", type: "text" }],
    defaultItems: OFFICES,
  },
  {
    key: "faq", path: "/contact/faq", title: "Contact — FAQ", itemLabel: "question",
    fields: [{ key: "q", label: "Question", type: "text" }, { key: "a", label: "Answer", type: "textarea" }],
    defaultItems: CONTACT_FAQ,
  },
];

const SERVICES_SECTIONS: SectionDef[] = [
  {
    key: "grid", path: "/services/grid", title: "Services — What we offer (grid)", itemLabel: "service",
    fields: [{ key: "i", label: "Icon", type: "icon" }, { key: "t", label: "Title", type: "text" }, { key: "d", label: "Description", type: "textarea" }],
    defaultItems: withServiceIconKeys(SERVICES),
  },
  {
    key: "process-steps", path: "/services/process-steps", title: "Services — Delivery process", itemLabel: "step",
    fields: [{ key: "title", label: "Title", type: "text" }, { key: "desc", label: "Description", type: "textarea" }, { key: "icon", label: "Icon", type: "icon" }],
    defaultItems: withIconKeys(PROCESS_STEPS),
  },
  { key: "why", path: "/services/why-items", title: "Services — Why our services", itemLabel: "point", fields: pointFields, defaultItems: DEFAULT_WHY_SERVICES_ITEMS },
  {
    key: "industries", path: "/services/industries", title: "Services — Industries we support", itemLabel: "industry",
    fields: [{ key: "icon", label: "Icon", type: "icon" }, { key: "title", label: "Title", type: "text" }, { key: "desc", label: "Description", type: "text" }],
    defaultItems: withIconKeys(INDUSTRIES),
  },
  { key: "stats", path: "/services/stats", title: "Services — Stats", itemLabel: "stat", fields: statsFields, defaultItems: SERVICE_STATS },
  { key: "testimonials", path: "/services/testimonials", title: "Services — Testimonials", itemLabel: "testimonial", fields: testimonialFields, defaultItems: SERVICE_TESTIMONIALS },
  {
    key: "faq", path: "/services/faq", title: "Services — FAQ", itemLabel: "question",
    fields: [{ key: "q", label: "Question", type: "text" }, { key: "a", label: "Answer", type: "textarea" }],
    defaultItems: SERVICE_FAQ,
  },
];

export default function SiteContentPage() {
  const [page, setPage] = useState<"about" | "suppliers" | "contact" | "services">("about");
  const [active, setActive] = useState<SectionDef | null>(null);
  const sections = page === "about" ? ABOUT_SECTIONS : page === "suppliers" ? SUPPLIERS_SECTIONS : page === "contact" ? CONTACT_SECTIONS : SERVICES_SECTIONS;

  return (
    <div className="adm-list-block">
      <div className="adm-tab-bar">
        <button type="button" className={page === "about" ? "active" : ""} onClick={() => setPage("about")}>About page</button>
        <button type="button" className={page === "suppliers" ? "active" : ""} onClick={() => setPage("suppliers")}>Suppliers page</button>
        <button type="button" className={page === "contact" ? "active" : ""} onClick={() => setPage("contact")}>Contact page</button>
        <button type="button" className={page === "services" ? "active" : ""} onClick={() => setPage("services")}>Services page</button>
      </div>

      <div className="card elev-sm adm-table-card">
        <table className="table">
          <thead><tr><th>Section</th><th>Items (currently)</th><th className="adm-open-col" /></tr></thead>
          <tbody>
            {sections.map((s) => (
              <tr key={s.key}>
                <td>{s.title}</td>
                <td>{s.defaultItems.length} {s.itemLabel}(s) by default</td>
                <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => setActive(s)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active && (
        <div className="dialog-backdrop" onClick={() => setActive(null)}>
          <div className="dialog elev-lg" style={{ maxWidth: 980, width: "94vw", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">{active.title}</div>
            <SectionListEditor
              path={active.path}
              title={active.title}
              fields={active.fields}
              itemLabel={active.itemLabel}
              defaultItems={active.defaultItems}
              singleton={active.singleton}
            />
            <div className="dialog-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setActive(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
