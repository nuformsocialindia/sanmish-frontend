"use client";
// Keeps search/tab/page/showDeleted in the URL query string so list views are
// linkable and the dashboard's alert deep-links work (README: "Search / tabs
// / pagination — all live in the URL query string").
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useQueryState(defaults: { tab?: string } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || "1") || 1;
  const search = searchParams.get("search") || "";
  const tab = searchParams.get("tab") || defaults.tab || "";
  const showDeleted = searchParams.get("showDeleted") === "1";
  const statusFilter = searchParams.get("status") || "";

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => setSearchInput(search), [search]);

  const setParams = useCallback(
    (next: Record<string, string | number | boolean | undefined>) => {
      const usp = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v === undefined || v === "" || v === false) usp.delete(k);
        else usp.set(k, String(v));
      }
      router.replace(`${pathname}?${usp.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearchInput = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setParams({ search: value || undefined, page: undefined });
      }, 300);
    },
    [setParams]
  );

  const setTab = useCallback((value: string) => setParams({ tab: value || undefined, page: undefined, status: undefined }), [setParams]);
  const setStatus = useCallback((value: string) => setParams({ status: value || undefined, page: undefined }), [setParams]);
  const setPage = useCallback((value: number) => setParams({ page: value === 1 ? undefined : value }), [setParams]);
  const setShowDeleted = useCallback((value: boolean) => setParams({ showDeleted: value ? "1" : undefined, page: undefined }), [setParams]);
  const clearFilters = useCallback(() => router.replace(pathname), [router, pathname]);

  return useMemo(
    () => ({ page, search, searchInput, tab, showDeleted, statusFilter, onSearchInput, setTab, setStatus, setPage, setShowDeleted, clearFilters, setParams }),
    [page, search, searchInput, tab, showDeleted, statusFilter, onSearchInput, setTab, setStatus, setPage, setShowDeleted, clearFilters, setParams]
  );
}
