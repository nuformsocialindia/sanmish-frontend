// Mock "buy more, save more" tier ladder — same curve for every product for now.
// Once the pricing API is live, swap BULK_TIERS for a per-product fetch keyed by
// slug (different unit sizes / discount curves per seller) without touching the
// call sites below.
export type PriceTier = {
  label: string;
  min: number;
  max: number | null;
  discountPct: number | null; // null = no listed price, must Request Quote for Bulk
};

export const MIN_ORDER_QTY = 2;

export const BULK_TIERS: PriceTier[] = [
  { label: "2 - 5", min: 2, max: 5, discountPct: 1.5 },
  { label: "6 - 10", min: 6, max: 10, discountPct: 3 },
  { label: "11 - 20", min: 11, max: 20, discountPct: 5.5 },
  { label: "21+", min: 21, max: null, discountPct: null },
];

export function tierForQty(qty: number): PriceTier {
  for (const tier of BULK_TIERS) {
    if (qty >= tier.min && (tier.max === null || qty <= tier.max)) return tier;
  }
  return BULK_TIERS[0];
}

export function unitPriceForQty(basePrice: number, qty: number): number | null {
  const tier = tierForQty(qty);
  if (tier.discountPct === null) return null;
  return Math.round(basePrice * (1 - tier.discountPct / 100) * 100) / 100;
}

// Deterministic pseudo-rating (3.5–4.8) so the same product always shows the
// same "Trusted" score without a real reviews backend yet.
export function mockRating(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return Math.round((3.5 + (hash % 131) / 100) * 10) / 10;
}
