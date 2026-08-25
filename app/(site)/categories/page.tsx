import type { Metadata } from "next";
import Link from "next/link";
import { fetchApiCategories, publicFileUrl } from "@/lib/publicApi";

const DEFAULT_CATEGORY_ICON = `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>`;

export const metadata: Metadata = {
  title: "All Categories — SANMISH",
  description: "Browse every equipment category on SANMISH — India's B2B marketplace for clean energy infrastructure.",
};

export default async function CategoriesPage() {
  const categories = await fetchApiCategories();

  return (
    <section className="pg-banner" style={{ paddingBottom: 40 }}>
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">Home</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="cur">Categories</span>
        </div>

        <div className="pg-head">
          <h1>All <span className="grad-text">Categories</span></h1>
          <p>Browse every equipment category listed on SANMISH.</p>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state" style={{ maxWidth: 560, marginTop: 32 }}>
            <h3 style={{ fontSize: "1.2rem" }}>No categories yet</h3>
            <p>Check back soon — categories are added by our team as new equipment is onboarded.</p>
          </div>
        ) : (
          <div className="cat-grid" style={{ marginTop: 32 }}>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`} className="cat">
                <div className="cat-circle">
                  {cat.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={publicFileUrl(cat.imageUrl)} alt={cat.name} />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: DEFAULT_CATEGORY_ICON }} />
                  )}
                </div>
                <span>{cat.name}</span>
                {cat.children && cat.children.length > 0 && (
                  <small>{cat.children.length} subcategories</small>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
