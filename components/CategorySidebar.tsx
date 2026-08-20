"use client";
import { useState } from "react";
import Link from "next/link";
import type { ApiCategory } from "@/lib/publicApi";

const ROOT_INITIAL_COUNT = 10;
const CHILD_INITIAL_COUNT = 8;

// Caps a list so it doesn't grow unbounded — but if `activeSlug` sits beyond
// the cap, pulls it to the front so it's always visible without forcing
// "show all" (matches how many category sidebars, e.g. Amazon's, behave).
function visibleWithActivePinned<T extends { slug: string }>(
  items: T[],
  activeSlug: string | null,
  limit: number,
  showAll: boolean
): T[] {
  if (showAll) return items;
  const activeIndex = activeSlug ? items.findIndex((i) => i.slug === activeSlug) : -1;
  if (activeIndex === -1 || activeIndex < limit) return items.slice(0, limit);
  return [items[activeIndex], ...items.slice(0, limit - 1)];
}

// Caps the root list so 30+ categories doesn't turn the sidebar into an
// endless scroll — but the active category (and its parent, if it's a
// child) is always shown even if it'd otherwise fall outside the cap, so
// you never lose track of where you are. The expanded branch's own
// children list is capped the same way.
export default function CategorySidebar({
  allCategories,
  activeSlug,
  activeParentId,
}: {
  allCategories: ApiCategory[];
  activeSlug: string;
  activeParentId: string | null;
}) {
  const [showAllRoots, setShowAllRoots] = useState(false);
  const [showAllChildren, setShowAllChildren] = useState(false);

  const activeAsRootSlug = allCategories.find((r) => r.id === activeParentId)?.slug ?? activeSlug;
  const hasMoreRoots = allCategories.length > ROOT_INITIAL_COUNT;
  const visibleRoots = visibleWithActivePinned(allCategories, activeAsRootSlug, ROOT_INITIAL_COUNT, showAllRoots);

  return (
    <aside className="filters">
      <div className="filters-head">
        <h3>Categories</h3>
      </div>
      <div className="f-group" style={{ maxHeight: 480, overflowY: "auto" }}>
        {visibleRoots.map((root) => {
          const isActiveRoot = root.slug === activeSlug;
          const isParentOfActive = activeParentId === root.id;
          const expanded = isActiveRoot || isParentOfActive;
          const children = root.children ?? [];
          const hasMoreChildren = children.length > CHILD_INITIAL_COUNT;
          const visibleChildren = visibleWithActivePinned(children, activeSlug, CHILD_INITIAL_COUNT, showAllChildren);

          return (
            <div key={root.id} style={{ marginBottom: 4 }}>
              {isActiveRoot ? (
                <div style={{ fontWeight: 700, color: "var(--ink)", padding: "8px 0" }}>{root.name}</div>
              ) : (
                <Link
                  href={`/categories/${root.slug}`}
                  className="f-row"
                  style={{
                    display: "block",
                    padding: "8px 0",
                    fontWeight: isParentOfActive ? 700 : 500,
                    color: isParentOfActive ? "var(--ink)" : "var(--blue)",
                  }}
                >
                  {root.name}
                </Link>
              )}
              {expanded && children.length > 0 && (
                <div style={{ paddingLeft: 16 }}>
                  {visibleChildren.map((child) =>
                    child.slug === activeSlug ? (
                      <div key={child.id} style={{ fontWeight: 700, color: "var(--ink)", padding: "6px 0" }}>
                        {child.name}
                      </div>
                    ) : (
                      <Link
                        key={child.id}
                        href={`/categories/${child.slug}`}
                        className="f-row"
                        style={{ display: "block", padding: "6px 0", color: "var(--blue)" }}
                      >
                        {child.name}
                      </Link>
                    )
                  )}
                  {hasMoreChildren && (
                    <button
                      type="button"
                      className="auth-linkbtn"
                      style={{ padding: "6px 0" }}
                      onClick={() => setShowAllChildren((v) => !v)}
                    >
                      {showAllChildren ? "Show less" : `Show all ${children.length} subcategories`}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {hasMoreRoots && (
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: "100%", marginTop: 12 }}
          onClick={() => setShowAllRoots((v) => !v)}
        >
          {showAllRoots ? "Show less" : `Show all ${allCategories.length} categories`}
        </button>
      )}
    </aside>
  );
}
