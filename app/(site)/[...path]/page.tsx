import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchApiPageByPath } from "@/lib/publicApi";

// Catch-all for admin-managed CMS pages (docs/public-api.md: GET /public/pages/by-path).
// Only reached when no static route already claims the path — e.g. /privacy-policy
// keeps rendering its own hardcoded page; a brand-new admin page like /refund-policy
// lands here. A missing/unpublished page (or an unreachable API) falls back to notFound().
function toPath(segments: string[]): string {
  return "/" + segments.join("/");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const { path } = await params;
  const page = await fetchApiPageByPath(toPath(path));
  if (!page) return {};
  return {
    title: page.metaTitle ?? `${page.title} — SANMISH`,
    description: page.metaDescription ?? undefined,
  };
}

export default async function CmsPage({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const page = await fetchApiPageByPath(toPath(path));
  if (!page) notFound();

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
            <span className="cur">{page.title}</span>
          </div>
          <h1 className="reveal d1" style={{ marginTop: 14, maxWidth: 760 }}>{page.title}</h1>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="legal-content reveal d1" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
        </div>
      </section>
    </>
  );
}
