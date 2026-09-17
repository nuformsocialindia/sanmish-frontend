"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FEATURE_HIGHLIGHTS } from "@/lib/data";
import { useWishlist } from "@/lib/wishlist-context";
import { publicFileUrl, type ApiCategory, type ApiProductSummary } from "@/lib/publicApi";

const DEFAULT_CATEGORY_ICON = `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>`;
const FALLBACK_PRODUCT_ICON = `<svg viewBox="0 0 120 120" fill="none" stroke="#3E79BD" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="30" width="60" height="60" rx="10"/><path d="M30 30 60 46 90 30M60 46v44"/></svg>`;

function normalizeApiCategories(apiCategories: ApiCategory[]) {
  return apiCategories.map((c) => ({
    slug: c.slug,
    icon: DEFAULT_CATEGORY_ICON,
    imageUrl: c.imageUrl ? publicFileUrl(c.imageUrl) : null,
    label: c.name,
    sub: `${c.productCount} product${c.productCount === 1 ? "" : "s"}`,
  }));
}

export type DisplayProduct = {
  key: string;
  slug: string;
  title: string;
  category: string;
  seller: string;
  priceLabel: string;
  priceValue: number | null;
  mrp: number | null;
  discountPercent: number | null;
  badge: string;
  icon: string;
};

export function normalizeApiProducts(apiProducts: ApiProductSummary[]): DisplayProduct[] {
  return apiProducts.map((p) => ({
    key: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category?.name ?? p.fuelType,
    seller: p.vendor?.businessName ?? "Verified Seller",
    priceLabel: p.quoteOnly || p.sellingPrice == null ? "On Request" : "₹ " + p.sellingPrice.toLocaleString("en-IN"),
    priceValue: p.sellingPrice,
    mrp: p.mrp,
    discountPercent: p.discountPercent,
    badge: p.isFeatured ? "Featured" : p.isTrending ? "Trending" : "New",
    icon: publicFileUrl(p.images?.[0]?.url)
      ? `<img src="${publicFileUrl(p.images?.[0]?.url)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />`
      : FALLBACK_PRODUCT_ICON,
  }));
}

export function SearchBand({ apiCategories }: { apiCategories: ApiCategory[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const goToProducts = (overrideTerm?: string) => {
    const params = new URLSearchParams();
    const q = overrideTerm ?? term;
    if (q.trim()) params.set("search", q.trim());
    if (category) params.set("category", category);
    router.push(`/products${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="searchband">
      <div className="wrap">
        <form
          className="search-card reveal"
          onSubmit={(e) => {
            e.preventDefault();
            goToProducts();
          }}
        >
          <div className="search-cat-wrap">
            <button type="button" className="search-cat" onClick={() => setOpen((v) => !v)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
              {category ?? "All Categories"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {open && (
              <div className="search-cat-menu">
                <button type="button" className={category === null ? "active" : ""} onClick={() => { setCategory(null); setOpen(false); }}>
                  All Categories
                </button>
                {apiCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={category === c.name ? "active" : ""}
                    onClick={() => { setCategory(c.name); setOpen(false); }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="search-sep" />
          <div className="search-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              id="mainsearch"
              type="text"
              placeholder="Search equipment — compressors, dispensers, cascade systems…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            Search
          </button>
        </form>
        <div className="quick-tags reveal d1">
          <span className="lbl">Popular:</span>
          {["Compressors", "Dispensers", "Cascade", "CBG", "Biogas", "Valves"].map((t) => (
            <span key={t} className="tag" onClick={() => { setTerm(t); goToProducts(t); }}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeatureHighlights() {
  return (
    <section className="section" style={{ paddingTop: 80 }}>
      <div className="wrap">
        <div className="feat-grid">
          {FEATURE_HIGHLIGHTS.map((f, i) => (
            <div key={f.title} className={`feat-card reveal${i > 0 ? ` d${i}` : ""}`}>
              <div className="feat-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: f.icon }} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const CATEGORY_INITIAL_COUNT = 12;

export function CategoryGrid({ apiCategories = [] }: { apiCategories?: ApiCategory[] }) {
  const delays = ["", " d1", " d2", " d3", " d4", " d5", "", " d1", " d2", " d3", " d4", " d5"];
  const categories = useMemo(() => normalizeApiCategories(apiCategories), [apiCategories]);
  const hasMore = categories.length > CATEGORY_INITIAL_COUNT;
  const visible = categories.slice(0, CATEGORY_INITIAL_COUNT);

  if (categories.length === 0) return null;

  return (
    <section className="section" id="categories" style={{ paddingTop: 20 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />Browse the Marketplace</span>
          <h2 className="reveal d1">Shop by <span className="grad-text">Category</span></h2>
          <p className="reveal d2">Everything you need to build, run and maintain alternative fuel infrastructure — organised for fast B2B procurement.</p>
        </div>
        <div className="cat-grid">
          {visible.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className={`cat reveal${delays[i % delays.length] || ""}`}
            >
              <div className="cat-circle">
                {cat.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.imageUrl} alt={cat.label} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: cat.icon }} />
                )}
              </div>
              <span>{cat.label}</span>
              <small>{cat.sub}</small>
            </Link>
          ))}
        </div>
        {hasMore && (
          <div style={{ textAlign: "center", marginTop: 32 }} className="reveal">
            <Link href="/categories" className="btn btn-ghost">
              View All Categories
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export function FeaturedProducts({
  apiFeaturedProducts = [],
}: {
  apiFeaturedProducts?: ApiProductSummary[];
}) {
  const delays = ["", " d1", " d2", " d3", "", " d1", " d2", " d3"];
  const { isWishlisted, toggleItem } = useWishlist();
  // Strictly admin-flag-driven (Product.isFeatured, "Show in Featured rail"
  // in the admin form) — no fallback to "whatever's newest" when nothing's
  // flagged. A silent fallback made unchecking a product's flag look like
  // it did nothing, since the section kept showing unrelated products.
  // Section just doesn't render until an admin actually flags something.
  const products = useMemo(() => normalizeApiProducts(apiFeaturedProducts).slice(0, 8), [apiFeaturedProducts]);

  if (products.length === 0) return null;

  return (
    <section className="section" id="products" style={{ background: "linear-gradient(180deg,var(--bg),#fff)" }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow reveal"><span className="dot" />Handpicked Listings</span>
          <h2 className="reveal d1">Featured <span className="grad-text">Equipment</span></h2>
          <p className="reveal d2">Live listings from verified manufacturers, ready for quotation and bulk order.</p>
        </div>
        <div className="prod-grid">
          {products.map((p, i) => {
            const wishlisted = isWishlisted(p.slug);
            return (
            <div key={p.key} className={`prod reveal${delays[i % delays.length] || ""}`}>
              <Link href={`/products/${p.slug}`} className="prod-card-link" aria-hidden="true" tabIndex={-1} />
              <div className="prod-img">
                <span dangerouslySetInnerHTML={{ __html: p.icon }} />
                <span className="prod-badge">{p.badge}</span>
                <button
                  type="button"
                  className={`prod-wishlist${wishlisted ? " active" : ""}`}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  data-tooltip={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={wishlisted}
                  onClick={() =>
                    toggleItem({
                      slug: p.slug,
                      title: p.title,
                      category: p.category,
                      seller: p.seller,
                      priceLabel: p.priceLabel,
                      priceValue: p.priceValue,
                      badge: p.badge,
                      icon: p.icon,
                    })
                  }
                >
                  <svg viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "#fff"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
              <div className="prod-body">
                <h3>{p.title}</h3>
                <div className="prod-cat">{p.category}</div>
                <div className="prod-seller">
                  <span className="sd">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </span>
                  {p.seller}
                </div>
                <div className="prod-foot">
                  <div className="prod-price">
                    <small>Starting from</small>
                    <b>{p.priceLabel}</b>
                  </div>
                  <div className="prod-actions">
                    <Link href={`/products/${p.slug}`} className="mini-btn o">Details</Link>
                    <Link href={`/contact?productSlug=${encodeURIComponent(p.slug)}&productName=${encodeURIComponent(p.title)}`} className="mini-btn g">Get Quote</Link>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 44 }} className="reveal">
          <Link href="/products" className="btn btn-ghost">
            View all products
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
