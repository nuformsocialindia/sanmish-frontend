"use client";
import { useState } from "react";
import Link from "next/link";
import type { ApiCategory } from "@/lib/publicApi";

export function PageBanner() {
  return (
    <section className="pg-banner">
      <div className="hero-bg">
        <div className="blob g" />
        <div className="blob b" />
        <div className="grid-fade" />
      </div>
      <div className="wrap">
        <div className="crumbs reveal">
          <Link href="/">Home</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="cur">Products</span>
        </div>
        <div className="pg-head">
          <span className="eyebrow reveal"><span className="dot" />2,400+ Verified Listings</span>
          <h1 className="reveal d1">Browse <span className="grad-text">Clean Energy</span> Equipment</h1>
          <p className="reveal d2">
            Compare CNG, CBG and Bio Gas equipment from verified manufacturers and industrial suppliers across India — filter by category, brand and budget to find the right fit.
          </p>
        </div>
      </div>
    </section>
  );
}

export function ListingSearchBand({
  categories,
  searchTerm,
  onSearchTermChange,
  selectedCategory,
  onCategoryChange,
  onSubmit,
}: {
  categories: ApiCategory[];
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (v: string | null) => void;
  onSubmit: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="searchband listing-searchband">
      <div className="wrap">
        <form
          className="search-card reveal d3"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            onSubmit();
          }}
        >
          <div className="search-cat-wrap">
            <button type="button" className="search-cat" onClick={() => setOpen((v) => !v)}>
              {selectedCategory ?? "All Categories"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {open && (
              <div className="search-cat-menu">
                <button
                  type="button"
                  className={selectedCategory === null ? "active" : ""}
                  onClick={() => {
                    onCategoryChange(null);
                    setOpen(false);
                  }}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={selectedCategory === c.name ? "active" : ""}
                    onClick={() => {
                      onCategoryChange(c.name);
                      setOpen(false);
                    }}
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
              type="text"
              placeholder="Search equipment — compressors, dispensers, cascade systems…"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            Search
          </button>
        </form>
      </div>
    </section>
  );
}

export function ListingCTASection() {
  return (
    <section className="cta">
      <div className="wrap">
        <div className="cta-box reveal">
          <div className="rings a" /><div className="rings b" />
          <h2>Can&rsquo;t find what you&rsquo;re looking for?</h2>
          <p>Post a requirement and get quotations from verified manufacturers within 24 hours.</p>
          <div className="cta-btns">
            <Link href="/contact" className="btn btn-white">Post Requirement</Link>
            <Link href="/#categories" className="btn btn-light">Browse Categories</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
