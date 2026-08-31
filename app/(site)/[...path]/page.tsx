import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchApiPageByPath } from "@/lib/publicApi";
import CmsPageView from "@/components/CmsPageView";

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

  return <CmsPageView title={page.title} bodyHtml={page.bodyHtml} />;
}
