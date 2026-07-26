"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { FILTER_CATEGORIES, SUPPLIER_TYPES, BRAND_FILTERS, PRODUCT_CATALOGUE } from "@/lib/data";
import { slugify } from "@/lib/slug";
import { useWishlist } from "@/lib/wishlist-context";

const PER_PAGE = 9;
const inr = (n: number) => "₹ " + n.toLocaleString("en-IN");

type SortKey = "relevance" | "low" | "high" | "name";
const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Sort: Relevance",
  low: "Sort: Price Low to High",
  high: "Sort: Price High to Low",
  name: "Sort: Name A–Z",
};
const SORT_ORDER: SortKey[] = ["relevance", "low", "high", "name"];

const TYPE_LABELS: Record<string, string> = {
  verified: "Verified Manufacturer",
  oem: "Authorized OEM",
  turnkey: "Turnkey / EPC",
};

export default function ProductListing() {
  const { isWishlisted, toggleItem } = useWishlist();
  const [cats, setCats] = useState<string[]>(
    FILTER_CATEGORIES.filter((c) => c.defaultChecked).map((c) => c.value)
  );
  const [types, setTypes] = useState<string[]>(
    SUPPLIER_TYPES.filter((t) => t.defaultChecked).map((t) => t.value)
  );
  const [brands, setBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [priceTouched, setPriceTouched] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let items = PRODUCT_CATALOGUE.filter((p) => {
      const catOk = cats.length === 0 || cats.includes(p.c);
      const typeOk = types.length === 0 || types.includes(p.type);
      const brandOk = brands.length === 0 || brands.some((b) => p.brand.includes(b));
      const priceOk = p.p <= maxPrice;
      return catOk && typeOk && brandOk && priceOk;
    });
    if (sort === "low") items = [...items].sort((a, b) => a.p - b.p);
    else if (sort === "high") items = [...items].sort((a, b) => b.p - a.p);
    else if (sort === "name") items = [...items].sort((a, b) => a.t.localeCompare(b.t));
    return items;
  }, [cats, types, brands, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const clearAll = () => {
    setCats([]);
    setTypes([]);
    setBrands([]);
    setMaxPrice(2000000);
    setPriceTouched(false);
    setPage(1);
  };

  const chips = [
    ...cats.map((v) => ({ label: v, remove: () => toggle(cats, setCats, v) })),
    ...types.map((v) => ({ label: TYPE_LABELS[v], remove: () => toggle(types, setTypes, v) })),
    ...brands.map((v) => ({ label: v, remove: () => toggle(brands, setBrands, v) })),
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

        <div className="f-group">
          <h4>Category</h4>
          {FILTER_CATEGORIES.map((c) => (
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
            max={2000000}
            step={10000}
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(Number(e.target.value));
              setPriceTouched(true);
              setPage(1);
            }}
          />
        </div>

        <div className="f-group">
          <h4>Supplier Type</h4>
          {SUPPLIER_TYPES.map((t) => (
            <label key={t.value} className="f-row">
              <span className="f-check">
                <input
                  type="checkbox"
                  checked={types.includes(t.value)}
                  onChange={() => toggle(types, setTypes, t.value)}
                />
                <span>{t.label}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="f-group">
          <h4>Brand</h4>
          <div className="f-brand-list">
            {BRAND_FILTERS.map((b) => (
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
              const slug = slugify(p.t);
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
                    <svg viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      <button className="mini-btn g">Get Quote</button>
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
