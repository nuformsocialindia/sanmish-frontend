// Typed client for the SANMISH Vendor Portal API. Deliberately self-contained
// under lib/vendor/ + app/vendor/ so this module can be lifted into its own
// app/service later without touching the customer-facing site or the admin
// panel — it does not import anything from lib/api.ts or lib/admin/.
const VENDOR_API_URL =
  process.env.NEXT_PUBLIC_VENDOR_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class VendorApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

function qs(params?: Query): string {
  if (!params) return "";
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}

async function req<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  const res = await fetch(`${VENDOR_API_URL}${path}${qs(query)}`, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return {} as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new VendorApiError(data.error || `Request failed (${res.status})`, res.status, data.code);
  return data as T;
}

async function upload<T>(method: string, path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${VENDOR_API_URL}${path}`, { method, credentials: "include", body: formData });
  if (res.status === 204) return {} as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new VendorApiError(data.error || `Upload failed (${res.status})`, res.status, data.code);
  return data as T;
}

const get = <T>(path: string, query?: Query) => req<T>("GET", path, undefined, query);
const post = <T>(path: string, body?: unknown) => req<T>("POST", path, body);
const patch = <T>(path: string, body?: unknown) => req<T>("PATCH", path, body);
const del = <T>(path: string) => req<T>("DELETE", path);

export function fileUrl(path: string): string {
  return `${VENDOR_API_URL}/vendor/files/${path}`;
}

export type VendorPortalPermissions = {
  products: boolean;
  categories: boolean;
  orders: boolean;
  rfqs: boolean;
  settlements: boolean;
  payments: boolean;
  taxGst: boolean;
  reviews: boolean;
  notifications: boolean;
};

export type Vendor = {
  id: string;
  businessName: string;
  vendorName: string;
  email: string;
  mobileNumber?: string;
  city?: string | null;
  state?: string | null;
  verificationStatus?: string;
  isVerifiedBadge?: boolean;
  ratingAverage?: number;
  ratingCount?: number;
  portalPermissions?: VendorPortalPermissions;
};

export const vendorAuthApi = {
  login: (email: string, password: string) => post<{ vendor: Vendor }>("/vendor/auth/login", { email, password }),
  logout: () => post<void>("/vendor/auth/logout"),
  me: () => get<Vendor>("/vendor/auth/me"),
};

export const vendorDashboardApi = {
  summary: () =>
    get<{
      productCount: number;
      activeProductCount: number;
      pendingOrders: number;
      pendingSettlement: number;
      unreadNotifications: number;
      ratingAverage: number;
      ratingCount: number;
    }>("/vendor/dashboard"),
};

export type VendorProduct = Record<string, unknown> & {
  id: string;
  title: string;
  sku: string;
  mrp?: number | null;
  sellingPrice?: number | null;
  stockQty: number;
  status: string;
  isActive: boolean;
  quoteOnly: boolean;
  category?: { id: string; name: string };
  images?: { id: string; url: string }[];
};

export type VendorPriceSlab = { minQty: number; maxQty?: number | null; pricePerUnit?: number | null; requiresQuote?: boolean };

export const vendorProductsApi = {
  list: (search?: string) => get<VendorProduct[]>("/vendor/products", { search }),
  get: (id: string) => get<VendorProduct>(`/vendor/products/${id}`),
  create: (body: Record<string, unknown>) => post<VendorProduct>("/vendor/products", body),
  update: (id: string, body: Record<string, unknown>) => patch<VendorProduct>(`/vendor/products/${id}`, body),
  remove: (id: string) => del<{ ok: true }>(`/vendor/products/${id}`),
  setSlabs: (id: string, priceSlabs: VendorPriceSlab[], slabTailRequiresQuote?: boolean) =>
    patch<VendorProduct>(`/vendor/products/${id}/slabs`, { priceSlabs, slabTailRequiresQuote }),
  uploadImages: (id: string, files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    return upload<{ id: string; url: string }[]>("POST", `/vendor/products/${id}/images`, fd);
  },
  removeImage: (id: string, imageId: string) => del<{ ok: true }>(`/vendor/products/${id}/images/${imageId}`),
};

export const vendorCategoriesApi = {
  list: () => get<{ id: string; name: string; slug: string; imageUrl?: string | null; _count: { products: number } }[]>("/vendor/categories"),
  options: () => get<{ id: string; name: string }[]>("/vendor/categories/options"),
  create: (body: { name: string; fuelType?: string; description?: string; priority?: number }) =>
    post<{ id: string; name: string }>("/vendor/categories", body),
};

export const vendorBrandsApi = {
  options: () => get<{ id: string; name: string }[]>("/vendor/brands/options"),
};

export const vendorOrdersApi = {
  list: () => get<Record<string, unknown>[]>("/vendor/orders"),
};

export const vendorRfqsApi = {
  list: () => get<Record<string, unknown>[]>("/vendor/rfqs"),
};

export const vendorSettlementsApi = {
  list: () => get<Record<string, unknown>[]>("/vendor/settlements"),
  earnings: () =>
    get<{ totalGross: number; totalCommission: number; totalNet: number; pendingSettlement: number; settlementCount: number }>(
      "/vendor/earnings"
    ),
};

export const vendorReviewsApi = {
  list: () => get<Record<string, unknown>[]>("/vendor/reviews"),
};

export const vendorPaymentsApi = {
  list: () => get<Record<string, unknown>[]>("/vendor/payments"),
};

export type VendorTaxSummary = {
  totalTaxable: number;
  totalGst: number;
  totalWithTax: number;
  byRate: { gstRate: number; taxable: number; gst: number }[];
  lineItems: { orderNumber: string; date: string; quantity: number; basePrice: number; gstPercent: number; gstAmount: number; lineTotal: number }[];
};

export const vendorTaxApi = {
  summary: () => get<VendorTaxSummary>("/vendor/tax-summary"),
};

export const vendorNotificationsApi = {
  list: () => get<Record<string, unknown>[]>("/vendor/notifications"),
  markRead: (id: string) => patch<{ ok: true }>(`/vendor/notifications/${id}/read`),
  markAllRead: () => patch<{ ok: true }>("/vendor/notifications/read-all"),
};
