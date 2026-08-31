"use client";
import Link from "next/link";
import { useScrollAnimations } from "@/lib/useScrollAnimations";

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "section";
}

// Optional hero metadata an admin can put at the very top of Body HTML:
//   <!-- eyebrow: Please read carefully -->
//   <!-- updated: 20 July 2026 -->
//   <p>Intro paragraph shown under the title...</p>
// The eyebrow/updated comments and the intro paragraph (if it appears before
// the first <h2>) are pulled out and rendered in the hero banner, matching
// the old hardcoded legal pages — none of this is required; pages without
// it just render title + sections as before.
function extractHero(bodyHtml: string): { eyebrow: string | null; updated: string | null; intro: string | null; rest: string } {
  let rest = bodyHtml;
  let eyebrow: string | null = null;
  let updated: string | null = null;

  rest = rest.replace(/<!--\s*eyebrow:\s*([\s\S]*?)-->/i, (_m, text) => { eyebrow = text.trim(); return ""; });
  rest = rest.replace(/<!--\s*updated:\s*([\s\S]*?)-->/i, (_m, text) => { updated = text.trim(); return ""; });

  let intro: string | null = null;
  const leading = rest.match(/^\s*<p([^>]*)>([\s\S]*?)<\/p>/i);
  if (leading && rest.slice(0, rest.indexOf(leading[0]) + leading[0].length).search(/<h2/i) === -1) {
    intro = leading[2];
    rest = rest.slice(leading.index! + leading[0].length);
  }

  return { eyebrow, updated, intro, rest };
}

// Splits bodyHtml into sections at each <h2>, wrapping each heading + the
// content that follows it (up to the next <h2>) in a `.legal-section` div —
// that class is what actually carries the heading size, paragraph spacing,
// list styling and the divider between sections (see .legal-section* rules
// in globals.css). Without this wrapper, headings/paragraphs fall back to
// bare browser defaults: oversized headings, no spacing, no dividers.
// Also gives each heading a stable id (reusing one the admin already set,
// otherwise slugifying the heading text) and returns the heading list for
// an "On this page" jump nav, same as the old hardcoded legal pages had.
function buildSections(bodyHtml: string): { toc: { id: string; heading: string }[]; html: string } {
  const toc: { id: string; heading: string }[] = [];
  const seen = new Set<string>();
  const parts = bodyHtml.split(/(<h2[^>]*>[\s\S]*?<\/h2>)/gi);

  let html = "";
  let i = 0;
  if (parts.length && !/^\s*<h2/i.test(parts[0])) {
    html += parts[0];
    i = 1;
  }

  for (; i < parts.length; i += 2) {
    const match = parts[i]?.match(/<h2([^>]*)>([\s\S]*?)<\/h2>/i);
    if (!match) continue;
    const [, attrs, inner] = match;
    const content = parts[i + 1] ?? "";
    const heading = stripTags(inner);
    const existing = attrs.match(/\bid=["']([^"']+)["']/i);
    let id = existing ? existing[1] : slugify(heading);
    let n = 2;
    const base = id;
    while (seen.has(id)) id = `${base}-${n++}`;
    seen.add(id);
    toc.push({ id, heading });
    const attrsWithoutId = attrs.replace(/\s*\bid=["'][^"']*["']/i, "");
    html += `<div class="legal-section" id="${id}"><h2${attrsWithoutId}>${inner}</h2>${content}</div>`;
  }

  return { toc, html };
}

// Shared renderer for admin-managed CMS pages (docs/public-api.md: GET
// /public/pages/by-path) — used by the catch-all route for brand-new pages,
// and by any static route (e.g. /terms-of-service) that's been migrated to
// pull its content from the admin Pages panel instead of hardcoded JSX.
export default function CmsPageView({ title, bodyHtml }: { title: string; bodyHtml: string }) {
  useScrollAnimations();
  const { eyebrow, updated, intro, rest } = extractHero(bodyHtml);
  const { toc, html } = buildSections(rest);

  return (
    <>
      <section className="pg-banner" style={{ paddingBottom: 24 }}>
        <div className="hero-bg">
          <div className="blob g" />
          <div className="blob b" />
        </div>
        <div className="wrap">
          <div className="crumbs reveal">
            <Link href="/">Home</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="cur">{title}</span>
          </div>
          {eyebrow && <span className="eyebrow reveal"><span className="dot" />{eyebrow}</span>}
          <h1 className="reveal d1" style={{ marginTop: 14, maxWidth: 760 }}>{title}</h1>
          {intro && (
            <p className="reveal d2" style={{ color: "var(--ink-soft)", maxWidth: 700, marginTop: 10 }} dangerouslySetInnerHTML={{ __html: intro }} />
          )}
          {updated && <span className="legal-updated reveal d2">Last updated: {updated}</span>}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          {toc.length > 0 ? (
            <div className="legal-layout">
              <nav className="legal-toc reveal" aria-label="Table of contents">
                <b>On this page</b>
                {toc.map((t) => (
                  <a key={t.id} href={`#${t.id}`}>{t.heading}</a>
                ))}
              </nav>
              <div className="legal-content reveal d1" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          ) : (
            <div className="legal-content reveal d1" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </section>
    </>
  );
}
