// Products come solely from the admin-managed API now — the ProductDetail
// shape below is the contract every consumer (cart, wishlist,
// ProductDetailView, listing pages) renders against.
import { publicFileUrl, type ApiProductSummary, type ApiPriceSlab } from "@/lib/publicApi";

export type ProductDetail = {
  slug: string;
  title: string;
  category: string;
  categorySlug?: string;
  seller: string;
  brand?: string;
  type?: string;
  priceLabel: string;
  priceValue: number | null;
  badge: string;
  icon: string;
  // Full gallery for API-sourced products (resolved, ready-to-use URLs, in
  // admin-set order). Absent for hardcoded products, which only have `icon`.
  images?: string[];
  description?: string;
  specifications?: { key: string; value: string }[];
  trustBadges?: { label: string; icon: string }[] | null;
  // Present only for API-sourced products — the same server-computed GST
  // pricing the admin panel shows, so the detail page never has to guess.
  mrp?: number | null;
  gstRate?: number;
  gstApplicable?: boolean;
  priceIncludesGst?: boolean;
  minOrderQty?: number;
  basePrice?: number | null;
  gstAmount?: number | null;
  grandTotal?: number | null;
  discountPercent?: number | null;
  priceSlabs?: ApiPriceSlab[];
  gstInvoiceAvailable?: boolean;
  leadTimeText?: string | null;
  freeShippingEligible?: boolean;
  freeShippingNote?: string | null;
  codAvailable?: boolean;
  installationOffered?: boolean;
  amcAvailable?: boolean;
  shippedBy?: string | null;
  returnWindowDays?: number | null;
  grossWeightKg?: number | null;
  dimensionsCm?: { l: number; w: number; h: number } | null;
  warrantyText?: string | null;
};

const inr = (n: number) => "₹ " + n.toLocaleString("en-IN");

// Generic placeholder used when an API product has no images yet.
const FALLBACK_ICON = `<svg viewBox="0 0 120 120" fill="none" stroke="#3E79BD" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="30" width="60" height="60" rx="10"/><path d="M30 30 60 46 90 30M60 46v44"/></svg>`;

function productImageMarkup(url?: string | null): string {
  const resolved = publicFileUrl(url);
  if (!resolved) return FALLBACK_ICON;
  return `<img src="${resolved}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />`;
}

function fromApi(apiProducts: ApiProductSummary[]): ProductDetail[] {
  return apiProducts.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category?.name ?? p.fuelType,
    categorySlug: p.category?.slug,
    seller: p.vendor?.businessName ?? "Verified Seller",
    brand: p.brand?.name,
    priceLabel: p.quoteOnly || p.sellingPrice == null ? "On Request" : inr(p.sellingPrice),
    priceValue: p.sellingPrice,
    badge: p.isFeatured ? "Featured" : p.isTrending ? "Trending" : "New",
    icon: productImageMarkup(p.images?.[0]?.url),
    images: p.images?.map((img) => publicFileUrl(img.url)).filter((u): u is string => Boolean(u)),
    description: p.description ?? p.shortDescription ?? undefined,
    specifications: p.specifications ?? undefined,
    trustBadges: p.trustBadges,
    mrp: p.mrp,
    gstRate: p.gstRate,
    gstApplicable: p.gstApplicable,
    priceIncludesGst: p.priceIncludesGst,
    minOrderQty: p.minOrderQty,
    basePrice: p.basePrice,
    gstAmount: p.gstAmount,
    grandTotal: p.grandTotal,
    discountPercent: p.discountPercent,
    gstInvoiceAvailable: p.gstInvoiceAvailable,
    leadTimeText: p.leadTimeText,
    freeShippingEligible: p.freeShippingEligible,
    freeShippingNote: p.freeShippingNote,
    codAvailable: p.codAvailable,
    installationOffered: p.installationOffered,
    amcAvailable: p.amcAvailable,
    shippedBy: p.shippedBy,
    returnWindowDays: p.returnWindowDays,
    grossWeightKg: p.grossWeightKg,
    dimensionsCm: p.dimensionsCm,
    warrantyText: p.warrantyText,
  }));
}

export function getAllProducts(apiProducts: ApiProductSummary[] = []): ProductDetail[] {
  // Dedupe defensively in case the API ever returns the same slug twice.
  const seen = new Set<string>();
  const combined: ProductDetail[] = [];
  for (const p of fromApi(apiProducts)) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    combined.push(p);
  }
  return combined;
}

export function findProductBySlug(slug: string, apiProducts: ApiProductSummary[] = []): ProductDetail | undefined {
  return getAllProducts(apiProducts).find((p) => p.slug === slug);
}
