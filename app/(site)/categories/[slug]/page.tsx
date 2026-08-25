import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchApiCategoryBySlug, fetchApiCategories, fetchApiProducts, publicFileUrl } from "@/lib/publicApi";
import { getAllProducts } from "@/lib/productLookup";
import CategorySidebar from "@/components/CategorySidebar";
import CategoryProductGrid from "@/components/CategoryProductGrid";

const DEFAULT_CATEGORY_ICON = `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchApiCategoryBySlug(slug);
  if (!category) return { title: "Category not found — SANMISH" };
  return {
    title: `${category.name} — SANMISH`,
    description: category.description ?? `Browse ${category.name} equipment on SANMISH — India's B2B marketplace for clean energy infrastructure.`,
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, allCategories] = await Promise.all([
    fetchApiCategoryBySlug(slug),
    fetchApiCategories(),
  ]);
  if (!category) notFound();

  const apiProducts = await fetchApiProducts({ categorySlug: slug, limit: 100 });
  const products = getAllProducts(apiProducts);
  const children = category.children ?? [];

  return (
    <section className="section" style={{ paddingTop: 32 }}>
      <div className="wrap">
        <div className="crumbs" style={{ marginBottom: 24 }}>
          <Link href="/">Home</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <Link href="/categories">Categories</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="cur">{category.name}</span>
        </div>

        <div className="listing-grid">
          <CategorySidebar allCategories={allCategories} activeSlug={category.slug} activeParentId={category.parentId} />

          {/* ---- Main ---- */}
          <div>
            {category.description && (
              <p style={{ color: "var(--ink-soft)", maxWidth: 720, marginBottom: 24 }}>{category.description}</p>
            )}

            {children.length > 0 && (
              <div className="cat-grid" style={{ marginBottom: products.length > 0 ? 44 : 0 }}>
                {children.map((child) => (
                  <Link key={child.id} href={`/categories/${child.slug}`} className="cat">
                    <div className="cat-circle">
                      {child.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={publicFileUrl(child.imageUrl)} alt={child.name} />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: DEFAULT_CATEGORY_ICON }} />
                      )}
                    </div>
                    <span>{child.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {products.length > 0 ? (
              <CategoryProductGrid products={products} />
            ) : (
              children.length === 0 && (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  <h3>No products yet</h3>
                  <p>Check back soon for {category.name} listings.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
