"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/slug";
import { useWishlist } from "@/lib/wishlist-context";
import { publicFileUrl, type ApiProductSummary, type ApiCategory, type ApiBrand } from "@/lib/publicApi";

// Real vendor business types (docs/public-api.md) — the only "supplier type"
// data that actually exists, replacing the old fictional verified/oem/turnkey guess.
const BUSINESS_TYPE_LABELS: Record<string, string> = {
  manufacturer: "Manufacturer",
  wholesaler: "Wholesaler",
  distributor: "Distributor",
  trader: "Trader",
  service_provider: "Service Provider",
};

const FALLBACK_PRODUCT_ICON = `<svg viewBox="0 0 120 120" fill="none" stroke="#3E79BD" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="30" width="60" height="60" rx="10"/><path d="M30 30 60 46 90 30M60 46v44"/></svg>`;

type CatalogueItem = {
  t: string;
  c: string;
  s: string;
  brand: string;
  type: string;
  p: number;
  b: string;
  ic: string;
  slug?: string;
};

function normalizeApiProducts(apiProducts: ApiProductSummary[]): CatalogueItem[] {
  return apiProducts.map((p) => ({
    t: p.title,
    c: p.category?.name ?? p.fuelType,
    s: p.vendor?.businessName ?? "Verified Seller",
    brand: p.brand?.name ?? "",
    type: p.vendor?.businessType ?? "",
    p: p.sellingPrice ?? 0,
    b: p.isFeatured ? "Featured" : p.isTrending ? "Trending" : "New",
    ic: publicFileUrl(p.images?.[0]?.url)
      ? `<img src="${publicFileUrl(p.images?.[0]?.url)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />`
      : FALLBACK_PRODUCT_ICON,
    slug: p.slug,
  }));
}

const PER_PAGE = 9;
const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

type SortKey = "relevance" | "low" | "high" | "name";
const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Sort: Relevance",
  low: "Sort: Price Low to High",
  high: "Sort: Price High to Low",
  name: "Sort: Name A–Z",
};
const SORT_ORDER: SortKey[] = ["relevance", "low", "high", "name"];

export default function ProductListing({
  apiProducts = [],
  apiCategories = [],
  apiBrands = [],
  searchTerm = "",
  searchCategory = null,
  onSearchTermChange,
  onSearchCategoryChange,
}: {
  apiProducts?: ApiProductSummary[];
  apiCategories?: ApiCategory[];
  apiBrands?: ApiBrand[];
  searchTerm?: string;
  searchCategory?: string | null;
  onSearchTermChange?: (v: string) => void;
  onSearchCategoryChange?: (v: string | null) => void;
}) {
  const { isWishlisted, toggleItem } = useWishlist();
  const catalogue: CatalogueItem[] = useMemo(() => normalizeApiProducts(apiProducts), [apiProducts]);

  // Every facet below is derived from real data — categories/brands come
  // from their own API lists (accurate counts, not limited to whatever's on
  // this page); supplier type is derived from vendor.businessType values
  // actually present among the loaded products, so an option never appears
  // unless at least one product matches it.
  const categoryOptions = useMemo(
    () =>
      apiCategories
        .filter((c) => c.productCount > 0)
        .map((c) => ({ value: c.name, label: c.name, count: c.productCount }))
        .sort((a, b) => b.count - a.count),
    [apiCategories]
  );
  const brandOptions = useMemo(
    () => apiBrands.map((b) => b.name).sort((a, b) => a.localeCompare(b)),
    [apiBrands]
  );
  const supplierTypeOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of catalogue) {
      if (!p.type) continue;
      counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, label: BUSINESS_TYPE_LABELS[value] ?? value, count }))
      .sort((a, b) => b.count - a.count);
  }, [catalogue]);
  const priceCeiling = useMemo(() => {
    const max = catalogue.reduce((m, p) => Math.max(m, p.p), 0);
    return max > 0 ? Math.ceil(max / 100000) * 100000 : 2000000;
  }, [catalogue]);

  const [cats, setCats] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const [priceTouched, setPriceTouched] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  // searchTerm/searchCategory are driven by the search band above the
  // sidebar, so reset pagination whenever they change from outside.
  useEffect(() => setPage(1), [searchTerm, searchCategory]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let items = catalogue.filter((p) => {
      const catOk = cats.length === 0 || cats.includes(p.c);
      const typeOk = types.length === 0 || types.includes(p.type);
      const brandOk = brands.length === 0 || brands.some((b) => p.brand.includes(b));
      const priceOk = p.p <= maxPrice;
      const searchCategoryOk = !searchCategory || p.c === searchCategory;
      const searchTermOk = !term || p.t.toLowerCase().includes(term);
      return catOk && typeOk && brandOk && priceOk && searchCategoryOk && searchTermOk;
    });
    if (sort === "low") items = [...items].sort((a, b) => a.p - b.p);
    else if (sort === "high") items = [...items].sort((a, b) => b.p - a.p);
    else if (sort === "name") items = [...items].sort((a, b) => a.t.localeCompare(b.t));
    return items;
  }, [catalogue, cats, types, brands, maxPrice, sort, searchTerm, searchCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const clearAll = () => {
    setCats([]);
    setTypes([]);
    setBrands([]);
    setMaxPrice(priceCeiling);
    setPriceTouched(false);
    setPage(1);
    onSearchTermChange?.("");
    onSearchCategoryChange?.(null);
  };

  const chips = [
    ...cats.map((v) => ({ label: v, remove: () => toggle(cats, setCats, v) })),
    ...types.map((v) => ({ label: BUSINESS_TYPE_LABELS[v] ?? v, remove: () => toggle(types, setTypes, v) })),
    ...brands.map((v) => ({ label: v, remove: () => toggle(brands, setBrands, v) })),
    ...(searchCategory ? [{ label: searchCategory, remove: () => onSearchCategoryChange?.(null) }] : []),
    ...(searchTerm.trim() ? [{ label: `“${searchTerm.trim()}”`, remove: () => onSearchTermChange?.("") }] : []),
  ];

  const goToPage = (i: number) => {
    setPage(i);
    document.querySelector(".listing-toolbar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="listing-grid">
      {/* ---- Filter sidebar ---- */}
      <aside className="filters reveal">
        <div className="filters-head">
          <h3>Filters</h3>
          <button className="filters-clear" onClick={clearAll}>Clear all</button>
        </div>

        {categoryOptions.length > 0 && (
          <div className="f-group">
            <h4>Category</h4>
            <div className="f-cat-list">
              {categoryOptions.map((c) => (
                <label key={c.value} className="f-row">
                  <span className="f-check">
                    <input
                      type="checkbox"
                      checked={cats.includes(c.value)}
                      onChange={() => toggle(cats, setCats, c.value)}
                    />
                    <span>{c.label}</span>
                  </span>
                  <span className="f-count">{c.count}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="f-group">
          <h4>Price Range</h4>
          <div className="f-price-inputs">
            <input type="text" placeholder="Min ₹" inputMode="numeric" />
            <span>–</span>
            <input type="text" placeholder="Max ₹" inputMode="numeric" readOnly value={priceTouched ? inr(maxPrice) : ""} />
          </div>
          <input
            type="range"
            className="f-slider"
            min={0}
            max={priceCeiling}
            step={10000}
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(Number(e.target.value));
              setPriceTouched(true);
              setPage(1);
            }}
          />
        </div>

        {supplierTypeOptions.length > 0 && (
          <div className="f-group">
            <h4>Supplier Type</h4>
            {supplierTypeOptions.map((t) => (
              <label key={t.value} className="f-row">
                <span className="f-check">
                  <input
                    type="checkbox"
                    checked={types.includes(t.value)}
                    onChange={() => toggle(types, setTypes, t.value)}
                  />
                  <span>{t.label}</span>
                </span>
                <span className="f-count">{t.count}</span>
              </label>
            ))}
          </div>
        )}

        {brandOptions.length > 0 && (
          <div className="f-group">
            <h4>Brand</h4>
            <div className="f-brand-list">
              {brandOptions.map((b) => (
                <label key={b} className="f-row">
                  <span className="f-check">
                    <input
                      type="checkbox"
                      checked={brands.includes(b)}
                      onChange={() => toggle(brands, setBrands, b)}
                    />
                    <span>{b}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-primary f-apply" onClick={() => setPage(1)}>Apply Filters</button>

        <div className="f-banner reveal">
          <b>Need help choosing?</b>
          <p>Talk to a category specialist for tailored recommendations.</p>
          <Link href="/contact" className="btn btn-white" style={{ width: "100%" }}>Request Callback</Link>
        </div>
      </aside>

      {/* ---- Results ---- */}
      <div>
        <div className="active-chips">
          {chips.map((c, i) => (
            <span key={`${c.label}-${i}`} className="active-chip">
              {c.label}
              <button onClick={c.remove} aria-label="Remove filter">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>

        <div className="listing-toolbar reveal">
          <div className="toolbar-count"><b>{filtered.length}</b> products found</div>
          <div className="toolbar-right">
            <button
              className="sort-select"
              onClick={() => setSort(SORT_ORDER[(SORT_ORDER.indexOf(sort) + 1) % SORT_ORDER.length])}
            >
              {SORT_LABELS[sort]}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div className="view-toggle">
              <button className={view === "grid" ? "active" : ""} aria-label="Grid view" onClick={() => setView("grid")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </button>
              <button className={view === "list" ? "active" : ""} aria-label="List view" onClick={() => setView("list")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <h3>No matching products</h3>
            <p>Try adjusting your filters or search terms to see more results.</p>
          </div>
        ) : (
          <div className="listing-grid-products">
            {pageItems.map((p, i) => {
              const slug = p.slug ?? slugify(p.t);
              const wishlisted = isWishlisted(slug);
              return (
              <div key={`${p.t}-${i}`} className={`prod${view === "list" ? " list-row" : ""}`}>
                <Link href={`/products/${slug}`} className="prod-card-link" aria-hidden="true" tabIndex={-1} />
                <div className="prod-img">
                  <span dangerouslySetInnerHTML={{ __html: p.ic }} />
                  <span className="prod-badge">{p.b}</span>
                  <button
                    type="button"
                    className={`prod-wishlist${wishlisted ? " active" : ""}`}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    data-tooltip={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={wishlisted}
                    onClick={() =>
                      toggleItem({
                        slug,
                        title: p.t,
                        category: p.c,
                        seller: p.s,
                        priceLabel: inr(p.p),
                        priceValue: p.p,
                        badge: p.b,
                        icon: p.ic,
                      })
                    }
                  >
                    <svg viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "#fff"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
                <div className="prod-body">
                  <h3>{p.t}</h3>
                  <div className="prod-cat">{p.c}</div>
                  <div className="prod-seller">
                    <span className="sd">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                    </span>
                    {p.s}
                  </div>
                  <div className="prod-foot">
                    <div className="prod-price">
                      <small>Starting from</small>
                      <b>{inr(p.p)}</b>
                    </div>
                    <div className="prod-actions">
                      <Link href={`/products/${slug}`} className="mini-btn o">Details</Link>
                      <Link href={`/contact?productSlug=${encodeURIComponent(slug)}&productName=${encodeURIComponent(p.t)}`} className="mini-btn g">Get Quote</Link>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        <div className="pagination reveal">
          <button className="page-btn" disabled={safePage === 1} onClick={() => goToPage(safePage - 1)} aria-label="Previous page">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((i) => (
            <button key={i} className={`page-btn${i === safePage ? " active" : ""}`} onClick={() => goToPage(i)}>
              {i}
            </button>
          ))}
          <button className="page-btn" disabled={safePage === totalPages} onClick={() => goToPage(safePage + 1)} aria-label="Next page">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
