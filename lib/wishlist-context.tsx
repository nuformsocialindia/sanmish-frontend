"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { ProductDetail } from "@/lib/productLookup";

export type WishlistItem = {
  slug: string;
  title: string;
  category: string;
  seller: string;
  priceLabel: string;
  priceValue: number | null;
  icon: string;
  badge: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  isWishlisted: (slug: string) => boolean;
  toggleItem: (product: ProductDetail) => void;
  removeItem: (slug: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "sanmish-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const isWishlisted = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);

  const toggleItem = useCallback((product: ProductDetail) => {
    setItems((prev) => {
      if (prev.some((i) => i.slug === product.slug)) {
        return prev.filter((i) => i.slug !== product.slug);
      }
      return [
        ...prev,
        {
          slug: product.slug,
          title: product.title,
          category: product.category,
          seller: product.seller,
          priceLabel: product.priceLabel,
          priceValue: product.priceValue,
          icon: product.icon,
          badge: product.badge,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const value = useMemo(
    () => ({ items, count: items.length, isWishlisted, toggleItem, removeItem }),
    [items, isWishlisted, toggleItem, removeItem]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
