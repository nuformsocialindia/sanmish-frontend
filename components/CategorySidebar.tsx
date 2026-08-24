import Link from "next/link";
import type { ApiCategory } from "@/lib/publicApi";

export default function CategorySidebar({
  allCategories,
  activeSlug,
  activeParentId,
}: {
  allCategories: ApiCategory[];
  activeSlug: string;
  activeParentId: string | null;
}) {
  return (
    <aside className="filters">
      <div className="filters-head">
        <h3>Categories</h3>
      </div>
      <div className="f-group" style={{ maxHeight: 480, overflowY: "auto" }}>
        {allCategories.map((root) => {
          const isActiveRoot = root.slug === activeSlug;
          const isParentOfActive = activeParentId === root.id;
          const expanded = isActiveRoot || isParentOfActive;
          const children = root.children ?? [];

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
                  {children.map((child) =>
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
