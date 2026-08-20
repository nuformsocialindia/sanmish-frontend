// Client for the SANMISH public storefront API (see docs/public-api.md in the
// backend repo — sanmish-auth-backend). No auth, plain GETs, prefixed /public.
//
// Every fetch here is best-effort: a network failure or a 404 on a detail
// lookup resolves to [] / null rather than throwing, so the storefront's
// hardcoded content always renders even when the API is unreachable or a
// given slug/path isn't published.
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Image/logo URLs returned by the API are host-relative paths (e.g.
// "/public/files/product-images/xxx.png") — prefix with the API origin to
// get something an <img>/<link> tag can actually load.
export function publicFileUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${PUBLIC_API_URL}${path}`;
}

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  fuelType: string | null;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  priority: number;
  parentId: string | null;
  productCount: number;
  children?: ApiCategory[];
};

export type ApiBrand = {
  id: string;
  name: string;
  slug: string;
  relationship: string;
  logoUrl: string | null;
  description: string | null;
  ranges: string[] | null;
  showInMarquee: boolean;
  marqueePosition: number | null;
  listingCount: number;
};

export type ApiProductImage = { id: string; url: string; position: number };

export type VendorBusinessType = "manufacturer" | "wholesaler" | "distributor" | "trader" | "service_provider";

export type ApiProductVendor = {
  id: string;
  businessName: string;
  slug: string;
  ratingAverage: string | number;
  ratingCount: number;
  isVerifiedBadge: boolean;
  businessType: VendorBusinessType;
};

export type ApiProductSummary = {
  id: string;
  title: string;
  slug: string;
  sku: string;
  fuelType: string;
  shortDescription: string | null;
  description: string | null;
  specifications: { key: string; value: string }[] | null;
  quoteOnly: boolean;
  mrp: number | null;
  sellingPrice: number | null;
  gstApplicable: boolean;
  gstRate: number;
  priceIncludesGst: boolean;
  minOrderQty: number;
  badges: string[] | null;
  trustBadges: { label: string; icon: string }[] | null;
  ribbonTextOverride: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string } | null;
  vendor: ApiProductVendor;
  images: ApiProductImage[];
  basePrice: number | null;
  gstAmount: number | null;
  grandTotal: number | null;
  discountPercent: number | null;
};

export type ApiPriceSlab = {
  id: string;
  minQty: number;
  maxQty: number | null;
  pricePerUnit: number | null;
  requiresQuote: boolean;
};

export type ApiReview = {
  rating: number;
  title: string | null;
  body: string;
  buyerName: string | null;
  verifiedPurchase: boolean;
  adminReply: string | null;
  createdAt: string;
};

export type ApiProductDetail = ApiProductSummary & {
  priceSlabs: ApiPriceSlab[];
  reviews: ApiReview[];
};

export type ApiService = {
  id: string;
  name: string;
  slug: string;
  group: string;
  summary: string;
  body: string;
  iconName: string | null;
  imageUrl: string | null;
  position: number;
  enquiryFormEnabled: boolean;
};

export type ApiPage = {
  id: string;
  title: string;
  path: string;
  group: string;
  bodyHtml: string;
  metaTitle: string | null;
  metaDescription: string | null;
  version: number;
};

type Paginated<T> = {
  data: T[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${PUBLIC_API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export async function fetchApiProducts(
  params: {
    categorySlug?: string;
    brandSlug?: string;
    fuelType?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<ApiProductSummary[]> {
  const res = await getJson<Paginated<ApiProductSummary>>(`/public/products${qs(params)}`);
  return res?.data ?? [];
}

export async function fetchApiProductBySlug(slug: string): Promise<ApiProductDetail | null> {
  return getJson<ApiProductDetail>(`/public/products/${encodeURIComponent(slug)}`);
}

export async function fetchApiCategories(
  params: { flat?: boolean; search?: string; fuelType?: string; page?: number; limit?: number } = {}
): Promise<ApiCategory[]> {
  const res = await getJson<Paginated<ApiCategory>>(`/public/categories${qs(params)}`);
  return res?.data ?? [];
}

export async function fetchApiCategoryBySlug(slug: string): Promise<ApiCategory | null> {
  return getJson<ApiCategory>(`/public/categories/${encodeURIComponent(slug)}`);
}

export async function fetchApiBrands(
  params: { marquee?: boolean; search?: string; page?: number; limit?: number } = {}
): Promise<ApiBrand[]> {
  const res = await getJson<Paginated<ApiBrand>>(`/public/brands${qs(params)}`);
  return res?.data ?? [];
}

export async function fetchApiBrandBySlug(slug: string): Promise<ApiBrand | null> {
  return getJson<ApiBrand>(`/public/brands/${encodeURIComponent(slug)}`);
}

export async function fetchApiServices(params: { group?: string } = {}): Promise<ApiService[]> {
  const res = await getJson<{ data: ApiService[] }>(`/public/services${qs(params)}`);
  return res?.data ?? [];
}

export async function fetchApiServiceBySlug(slug: string): Promise<ApiService | null> {
  return getJson<ApiService>(`/public/services/${encodeURIComponent(slug)}`);
}

export async function fetchApiPageByPath(path: string): Promise<ApiPage | null> {
  return getJson<ApiPage>(`/public/pages/by-path${qs({ path })}`);
}
