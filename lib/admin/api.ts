// Typed client for the SANMISH Admin API. Deliberately self-contained under
// lib/admin/ + app/admin/ so the whole admin module can be lifted into its
// own app/service later without touching the customer-facing site — it does
// not import anything from lib/api.ts or the customer contexts.
const ADMIN_API_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class AdminApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

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
  const res = await fetch(`${ADMIN_API_URL}${path}${qs(query)}`, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return {} as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AdminApiError(data.error || `Request failed (${res.status})`, res.status, data.code);
  return data as T;
}

async function upload<T>(method: string, path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${ADMIN_API_URL}${path}`, { method, credentials: "include", body: formData });
  if (res.status === 204) return {} as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AdminApiError(data.error || `Upload failed (${res.status})`, res.status, data.code);
  return data as T;
}

const get = <T>(path: string, query?: Query) => req<T>("GET", path, undefined, query);
const post = <T>(path: string, body?: unknown, query?: Query) => req<T>("POST", path, body, query);
const patch = <T>(path: string, body?: unknown) => req<T>("PATCH", path, body);
const put = <T>(path: string, body?: unknown) => req<T>("PUT", path, body);
const del = <T>(path: string, body?: unknown) => req<T>("DELETE", path, body);

// A single `sort=field:asc|desc` param replaces the old sortBy/sortDir pair
// across every list endpoint (v2 pagination convention).
export type ListQuery = Query & { page?: number; limit?: number; search?: string; sort?: string };

export type AdminRole =
  | "SUPER_ADMIN"
  | "OPERATIONS_ADMIN"
  | "FINANCE_ADMIN"
  | "PRODUCT_ADMIN"
  | "LOGISTICS_ADMIN"
  | "VENDOR_MANAGER";

export type AdminProfile = {
  id: string; name: string; email: string; role: AdminRole;
  twoFactorEnabled?: boolean; lastLoginAt?: string | null;
};

// ---------------------------------------------------------------- Auth
export const authApi = {
  login: (email: string, password: string) =>
    post<{ requires2fa?: true; tempToken?: string; admin?: AdminProfile }>("/admin/auth/login", { email, password }),
  verify2fa: (tempToken: string, code: string) =>
    post<{ admin: AdminProfile }>("/admin/auth/2fa/verify", { tempToken, code }),
  setup2fa: () => post<{ secret: string; qrCodeDataUrl: string }>("/admin/auth/2fa/setup"),
  enable2fa: (code: string) => post<{ enabled: true }>("/admin/auth/2fa/enable", { code }),
  disable2fa: (code: string) => post<{ enabled: false }>("/admin/auth/2fa/disable", { code }),
  changePassword: (currentPassword: string, newPassword: string) =>
    post<{ ok: true }>("/admin/auth/change-password", { currentPassword, newPassword }),
  logout: () => post<void>("/admin/auth/logout"),
  me: () => get<AdminProfile>("/admin/auth/me"),
  loginHistory: () => get<Record<string, unknown>[]>("/admin/auth/login-history"),
};

// ---------------------------------------------------------------- Admins
export const adminsApi = {
  list: (query?: ListQuery) => get<Paginated<AdminProfile>>("/admin/admins", query),
  auditLogs: (query?: Query) => get<Paginated<Record<string, unknown>>>("/admin/admins/audit-logs", query),
  get: (id: string) => get<AdminProfile>(`/admin/admins/${id}`),
  create: (body: { name: string; email: string; password: string; role: AdminRole }) =>
    post<AdminProfile>("/admin/admins", body),
  update: (id: string, body: { name?: string; role?: AdminRole; status?: string }) =>
    patch<AdminProfile>(`/admin/admins/${id}`, body),
  deactivate: (id: string) => del<{ ok: true }>(`/admin/admins/${id}`),
  loginHistory: (id: string) => get<Record<string, unknown>[]>(`/admin/admins/${id}/login-history`),
};

// ---------------------------------------------------------------- Users
export const usersApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/users", query),
  export: () => "/admin/users/export",
  bulkActivate: (userIds: string[]) => post<{ ok: true }>("/admin/users/bulk/activate", { userIds }),
  bulkDeactivate: (userIds: string[]) => post<{ ok: true }>("/admin/users/bulk/deactivate", { userIds }),
  get: (id: string) => get<Record<string, unknown>>(`/admin/users/${id}`),
  update: (id: string, body: Record<string, unknown>) => patch<Record<string, unknown>>(`/admin/users/${id}`, body),
  activate: (id: string) => post<{ ok: true }>(`/admin/users/${id}/activate`),
  deactivate: (id: string) => post<{ ok: true }>(`/admin/users/${id}/deactivate`),
  remove: (id: string) => del<{ ok: true }>(`/admin/users/${id}`),
  restore: (id: string) => post<{ ok: true }>(`/admin/users/${id}/restore`),
  invalidateSession: (id: string) => post<{ ok: true }>(`/admin/users/${id}/invalidate-session`),
  // These sub-resource endpoints return plain arrays, not the {data,meta} envelope.
  orders: (id: string) => get<Record<string, unknown>[]>(`/admin/users/${id}/orders`),
  rfqs: (id: string) => get<Record<string, unknown>[]>(`/admin/users/${id}/rfqs`),
  payments: (id: string) => get<Record<string, unknown>[]>(`/admin/users/${id}/payments`),
  addNote: (id: string, note: string) => post<{ ok: true }>(`/admin/users/${id}/notes`, { note }),
  verifyEmail: (id: string) => post<{ ok: true }>(`/admin/users/${id}/verify-email`),
  sendMobileOtp: (id: string) => post<{ ok: true }>(`/admin/users/${id}/mobile/send-otp`),
  verifyMobileOtp: (id: string, otp: string) => post<{ ok: true }>(`/admin/users/${id}/mobile/verify-otp`, { otp }),
};

// ---------------------------------------------------------------- Vendors
export const vendorsApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/vendors", query),
  export: () => "/admin/vendors/export",
  get: (id: string) => get<Record<string, unknown>>(`/admin/vendors/${id}`),
  create: (body: Record<string, unknown>) => post<Record<string, unknown>>("/admin/vendors", body),
  update: (id: string, body: Record<string, unknown>) => patch<Record<string, unknown>>(`/admin/vendors/${id}`, body),
  approve: (id: string) => post<{ ok: true }>(`/admin/vendors/${id}/approve`),
  reject: (id: string) => post<{ ok: true }>(`/admin/vendors/${id}/reject`),
  hold: (id: string) => post<{ ok: true }>(`/admin/vendors/${id}/hold`),
  suspend: (id: string) => post<{ ok: true }>(`/admin/vendors/${id}/suspend`),
  activate: (id: string) => post<{ ok: true }>(`/admin/vendors/${id}/activate`),
  remove: (id: string) => del<{ ok: true }>(`/admin/vendors/${id}`),
  restore: (id: string) => post<{ ok: true }>(`/admin/vendors/${id}/restore`),
  hardDelete: (id: string) => del<{ ok: true }>(`/admin/vendors/${id}/hard`),
  uploadDocument: (id: string, file: File, docType: string) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("docType", docType);
    return upload<Record<string, unknown>>("POST", `/admin/vendors/${id}/documents`, fd);
  },
  documents: (id: string) => get<Record<string, unknown>[]>(`/admin/vendors/${id}/documents`),
  removeDocument: (id: string, docId: string) => del<{ ok: true }>(`/admin/vendors/${id}/documents/${docId}`),
  verifyGst: (id: string) => post<{ ok: true }>(`/admin/vendors/${id}/verify-gst`),
  verifyPan: (id: string) => post<{ ok: true }>(`/admin/vendors/${id}/verify-pan`),
  updatePermissions: (id: string, permissions: Record<string, boolean>) =>
    patch<{ portalPermissions: Record<string, boolean> }>(`/admin/vendors/${id}/permissions`, permissions),
  // Plain arrays, not the {data,meta} envelope.
  products: (id: string) => get<Record<string, unknown>[]>(`/admin/vendors/${id}/products`),
  orders: (id: string) => get<Record<string, unknown>[]>(`/admin/vendors/${id}/orders`),
  settlements: (id: string) => get<Record<string, unknown>[]>(`/admin/vendors/${id}/settlements`),
  reviews: (id: string) => get<Record<string, unknown>[]>(`/admin/vendors/${id}/reviews`),
  // Each row is an RfqVendorAssignment: { rfq: {...}, quotation: {...} | null }, not a flat Rfq.
  rfqs: (id: string) => get<{ rfq: Record<string, unknown>; quotation: Record<string, unknown> | null }[]>(`/admin/vendors/${id}/rfqs`),
  earnings: (id: string) =>
    get<{ totalGross: number; totalCommission: number; totalNet: number; settlementCount: number }>(
      `/admin/vendors/${id}/earnings`
    ),
  notify: (id: string, body: { channel: "email" | "in_app"; title: string; body: string }) =>
    post<{ ok: true }>(`/admin/vendors/${id}/notify`, body),
  addNote: (id: string, note: string) => post<{ ok: true }>(`/admin/vendors/${id}/notes`, { note }),
};

// ---------------------------------------------------------------- Categories
export const categoriesApi = {
  // GET /admin/categories (no ?flat) returns { data: roots } with no meta —
  // unwrap here so callers get a plain array, matching the flat/paginated shape.
  tree: async (query?: Query) => (await get<{ data: Record<string, unknown>[] }>("/admin/categories", query)).data,
  flat: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/categories", { ...query, flat: true }),
  export: () => "/admin/categories/export",
  get: (id: string) => get<Record<string, unknown>>(`/admin/categories/${id}`),
  create: (formData: FormData) => upload<Record<string, unknown>>("POST", "/admin/categories", formData),
  update: (id: string, formData: FormData) => upload<Record<string, unknown>>("PATCH", `/admin/categories/${id}`, formData),
  reorder: (items: { id: string; priority: number }[]) => patch<{ ok: true }>("/admin/categories/reorder", { items }),
  activate: (id: string) => post<{ ok: true }>(`/admin/categories/${id}/activate`),
  deactivate: (id: string) => post<{ ok: true }>(`/admin/categories/${id}/deactivate`),
  remove: (id: string) => del<{ ok: true }>(`/admin/categories/${id}`),
  restore: (id: string) => post<{ ok: true }>(`/admin/categories/${id}/restore`),
  hardDelete: (id: string) => del<{ ok: true }>(`/admin/categories/${id}/hard`),
  addNote: (id: string, note: string) => post<{ ok: true }>(`/admin/categories/${id}/notes`, { note }),
};

// ---------------------------------------------------------------- Brands
export const brandsApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/brands", query),
  export: () => "/admin/brands/export",
  get: (id: string) => get<Record<string, unknown>>(`/admin/brands/${id}`),
  create: (body: Record<string, unknown>) => post<Record<string, unknown>>("/admin/brands", body),
  update: (id: string, body: Record<string, unknown>) => patch<Record<string, unknown>>(`/admin/brands/${id}`, body),
  uploadLogo: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("logo", file);
    return upload<Record<string, unknown>>("POST", `/admin/brands/${id}/logo`, fd);
  },
  reorder: (items: { id: string; marqueePosition: number }[]) => patch<{ ok: true }>("/admin/brands/reorder", { items }),
  remove: (id: string) => del<{ ok: true }>(`/admin/brands/${id}`),
  restore: (id: string) => post<{ ok: true }>(`/admin/brands/${id}/restore`),
};

// ---------------------------------------------------------------- Tax & GST
export const taxApi = {
  // Plain array, not the {data,meta} envelope — verified live.
  hsnList: (query?: ListQuery) => get<Record<string, unknown>[]>("/admin/tax/hsn", query),
  hsnCreate: (body: { code: string; description: string; gstRate: number; cessRate?: number; applicability?: string; isActive?: boolean }) =>
    post<Record<string, unknown>>("/admin/tax/hsn", body),
  hsnLookup: (code: string) => get<Record<string, unknown>>("/admin/tax/hsn/lookup", { code }),
  hsnUpdate: (id: string, body: Record<string, unknown>) => patch<Record<string, unknown>>(`/admin/tax/hsn/${id}`, body),
  hsnRemove: (id: string) => del<{ ok: true }>(`/admin/tax/hsn/${id}`),
  settings: () => get<Record<string, unknown>>("/admin/tax/settings"),
  updateSettings: (body: Record<string, unknown>) => patch<Record<string, unknown>>("/admin/tax/settings", body),
  gstReport: () => get<Record<string, unknown>>("/admin/tax/reports/gst"),
};

// ---------------------------------------------------------------- Products
export const productsApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/products", query),
  export: () => "/admin/products/export",
  importTemplate: () => "/admin/products/import-template",
  bulkPrice: (ids: string[], mode: "PERCENT" | "ABSOLUTE", value: number, applyTo: "MRP" | "SELLING") =>
    patch<{ ok: true }>("/admin/products/bulk-price", { ids, mode, value, applyTo }),
  bulkStatus: (ids: string[], status: string) => patch<{ ok: true }>("/admin/products/bulk-status", { ids, status }),
  bulkDelete: (ids: string[]) => del<{ ok: true }>("/admin/products/bulk", { productIds: ids }),
  bulkImport: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return upload<{ created: number; failed: number; errors: { row: number; error: string }[] }>(
      "POST",
      "/admin/products/bulk-import",
      fd
    );
  },
  get: (id: string) => get<Record<string, unknown>>(`/admin/products/${id}`),
  create: (body: Record<string, unknown>) => post<Record<string, unknown>>("/admin/products", body),
  update: (id: string, body: Record<string, unknown>) => patch<Record<string, unknown>>(`/admin/products/${id}`, body),
  setPrice: (id: string, body: { mrp?: number; sellingPrice?: number }) =>
    patch<Record<string, unknown>>(`/admin/products/${id}/price`, body),
  setSlabs: (id: string, priceSlabs: Record<string, unknown>[], slabTailRequiresQuote?: boolean) =>
    put<Record<string, unknown>>(`/admin/products/${id}/slabs`, { priceSlabs, slabTailRequiresQuote }),
  setStock: (id: string, stockQty: number) => patch<{ ok: true }>(`/admin/products/${id}/stock`, { stockQty }),
  setFlags: (id: string, flags: { isFeatured?: boolean; isTrending?: boolean }) =>
    patch<{ ok: true }>(`/admin/products/${id}/flags`, flags),
  setStatus: (id: string, status: string) => patch<{ ok: true }>(`/admin/products/${id}/status`, { status }),
  approve: (id: string) => post<{ ok: true }>(`/admin/products/${id}/approve`),
  reject: (id: string, reason: string) => post<{ ok: true }>(`/admin/products/${id}/reject`, { reason }),
  activate: (id: string) => post<{ ok: true }>(`/admin/products/${id}/activate`),
  deactivate: (id: string) => post<{ ok: true }>(`/admin/products/${id}/deactivate`),
  remove: (id: string) => del<{ ok: true }>(`/admin/products/${id}`),
  restore: (id: string) => post<{ ok: true }>(`/admin/products/${id}/restore`),
  setCategory: (id: string, categoryId: string) => patch<{ ok: true }>(`/admin/products/${id}/category`, { categoryId }),
  uploadImages: (id: string, files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    return upload<Record<string, unknown>>("POST", `/admin/products/${id}/images`, fd);
  },
  reorderImages: (id: string, order: string[]) => patch<{ ok: true }>(`/admin/products/${id}/images/reorder`, { order }),
  removeImage: (id: string, imageId: string) => del<{ ok: true }>(`/admin/products/${id}/images/${imageId}`),
  uploadDocument: (id: string, file: File, label: string, type: "DATASHEET" | "CERTIFICATE" | "TEST_REPORT") => {
    const fd = new FormData();
    fd.append("documents", file);
    fd.append("label", label);
    fd.append("type", type);
    return upload<Record<string, unknown>>("POST", `/admin/products/${id}/documents`, fd);
  },
  removeDocument: (id: string, docId: string) => del<{ ok: true }>(`/admin/products/${id}/documents/${docId}`),
};

// ---------------------------------------------------------------- Merchandising
export const merchandisingApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/merchandising", query),
  get: (id: string) => get<Record<string, unknown>>(`/admin/merchandising/${id}`),
  create: (body: Record<string, unknown>) => post<Record<string, unknown>>("/admin/merchandising", body),
  update: (id: string, body: Record<string, unknown>) => patch<Record<string, unknown>>(`/admin/merchandising/${id}`, body),
  uploadImage: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return upload<Record<string, unknown>>("POST", `/admin/merchandising/${id}/image`, fd);
  },
  setStatus: (id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") =>
    patch<{ ok: true }>(`/admin/merchandising/${id}/status`, { status }),
  reorder: (items: { id: string; position: number }[]) => patch<{ ok: true }>("/admin/merchandising/reorder", { items }),
  remove: (id: string) => del<{ ok: true }>(`/admin/merchandising/${id}`),
  restore: (id: string) => post<{ ok: true }>(`/admin/merchandising/${id}/restore`),
};

// ---------------------------------------------------------------- Coupons
export const couponsApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/coupons", query),
  export: () => "/admin/coupons/export",
  get: (id: string) => get<Record<string, unknown>>(`/admin/coupons/${id}`),
  create: (body: Record<string, unknown>) => post<Record<string, unknown>>("/admin/coupons", body),
  update: (id: string, body: Record<string, unknown>) => patch<Record<string, unknown>>(`/admin/coupons/${id}`, body),
  setDisabled: (id: string, disabled: boolean) => patch<{ ok: true }>(`/admin/coupons/${id}/status`, { disabled }),
  usage: (id: string) => get<Record<string, unknown>[]>(`/admin/coupons/${id}/usage`),
  remove: (id: string) => del<{ ok: true }>(`/admin/coupons/${id}`),
  restore: (id: string) => post<{ ok: true }>(`/admin/coupons/${id}/restore`),
};

// ---------------------------------------------------------------- Reviews
export const reviewsApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/reviews", query),
  export: () => "/admin/reviews/export",
  get: (id: string) => get<Record<string, unknown>>(`/admin/reviews/${id}`),
  approve: (id: string) => post<{ ok: true }>(`/admin/reviews/${id}/approve`),
  reject: (id: string, reason: string) => post<{ ok: true }>(`/admin/reviews/${id}/reject`, { reason }),
  reply: (id: string, body: string) => post<{ ok: true }>(`/admin/reviews/${id}/reply`, { body }),
  bulkStatus: (ids: string[], status: string) => patch<{ ok: true }>("/admin/reviews/bulk-status", { ids, status }),
  remove: (id: string) => del<{ ok: true }>(`/admin/reviews/${id}`),
  restore: (id: string) => post<{ ok: true }>(`/admin/reviews/${id}/restore`),
};

// ---------------------------------------------------------------- Services
export const servicesApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/services", query),
  get: (id: string) => get<Record<string, unknown>>(`/admin/services/${id}`),
  create: (body: Record<string, unknown>) => post<Record<string, unknown>>("/admin/services", body),
  update: (id: string, body: Record<string, unknown>) => patch<Record<string, unknown>>(`/admin/services/${id}`, body),
  setStatus: (id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") =>
    patch<{ ok: true }>(`/admin/services/${id}/status`, { status }),
  reorder: (items: { id: string; position: number }[]) => patch<{ ok: true }>("/admin/services/reorder", { items }),
  remove: (id: string) => del<{ ok: true }>(`/admin/services/${id}`),
  restore: (id: string) => post<{ ok: true }>(`/admin/services/${id}/restore`),
};

// ---------------------------------------------------------------- Pages & Policies
export const pagesApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/pages", query),
  get: (id: string) => get<Record<string, unknown>>(`/admin/pages/${id}`),
  create: (body: Record<string, unknown>) => post<Record<string, unknown>>("/admin/pages", body),
  update: (id: string, body: Record<string, unknown>) => patch<Record<string, unknown>>(`/admin/pages/${id}`, body),
  versions: (id: string) => get<Record<string, unknown>[]>(`/admin/pages/${id}/versions`),
  revert: (id: string, version: number) => post<Record<string, unknown>>(`/admin/pages/${id}/revert`, { version }),
  setStatus: (id: string, status: string) => patch<{ ok: true }>(`/admin/pages/${id}/status`, { status }),
  remove: (id: string) => del<{ ok: true }>(`/admin/pages/${id}`),
};

// ---------------------------------------------------------------- Contact Enquiries
export const enquiriesApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/enquiries", query),
  export: () => "/admin/enquiries/export",
  get: (id: string) => get<Record<string, unknown>>(`/admin/enquiries/${id}`),
  update: (id: string, body: { status?: string; assignedToAdminId?: string }) =>
    patch<Record<string, unknown>>(`/admin/enquiries/${id}`, body),
  reply: (id: string, subject: string, body: string) =>
    post<{ ok: true }>(`/admin/enquiries/${id}/reply`, { channel: "EMAIL", subject, body }),
  addNote: (id: string, note: string) => post<{ ok: true }>(`/admin/enquiries/${id}/notes`, { note }),
  convertToRfq: (id: string) => post<Record<string, unknown>>(`/admin/enquiries/${id}/convert-to-rfq`),
  bulkStatus: (ids: string[], status: string) => patch<{ ok: true }>("/admin/enquiries/bulk-status", { ids, status }),
  remove: (id: string) => del<{ ok: true }>(`/admin/enquiries/${id}`),
  restore: (id: string) => post<{ ok: true }>(`/admin/enquiries/${id}/restore`),
};

// ---------------------------------------------------------------- Shipping & Delivery
export const shippingApi = {
  // Both list endpoints below return plain arrays, not the {data,meta} envelope — verified live.
  rules: (query?: ListQuery) => get<Record<string, unknown>[]>("/admin/shipping/rules", query),
  createRule: (body: Record<string, unknown>) => post<Record<string, unknown>>("/admin/shipping/rules", body),
  updateRule: (id: string, body: Record<string, unknown>) => patch<Record<string, unknown>>(`/admin/shipping/rules/${id}`, body),
  setRuleActive: (id: string, isActive: boolean) => patch<{ ok: true }>(`/admin/shipping/rules/${id}/status`, { isActive }),
  reorderRules: (items: { id: string; priority: number }[]) => patch<{ ok: true }>("/admin/shipping/rules/reorder", { items }),
  removeRule: (id: string) => del<{ ok: true }>(`/admin/shipping/rules/${id}`),
  cities: (query?: ListQuery) => get<Record<string, unknown>[]>("/admin/shipping/cities", query),
  createCity: (body: { name: string; state: string; pincodes: string[]; expressDelivery?: boolean }) =>
    post<Record<string, unknown>>("/admin/shipping/cities", body),
  updateCity: (id: string, body: Record<string, unknown>) => patch<Record<string, unknown>>(`/admin/shipping/cities/${id}`, body),
  removeCity: (id: string) => del<{ ok: true }>(`/admin/shipping/cities/${id}`),
  serviceability: (pincode: string, productId?: string) =>
    get<{ serviceable: boolean; etaMinDays: number; etaMaxDays: number; freeShipping: boolean; charges: number }>(
      "/admin/shipping/serviceability",
      { pincode, productId }
    ),
};

// ---------------------------------------------------------------- Orders
export const ordersApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/orders", query),
  export: () => "/admin/orders/export",
  bulkStatus: (orderIds: string[], status: string) => post<{ ok: true }>("/admin/orders/bulk/status", { orderIds, status }),
  get: (id: string) => get<Record<string, unknown>>(`/admin/orders/${id}`),
  timeline: (id: string) => get<Record<string, unknown>[]>(`/admin/orders/${id}/timeline`),
  setStatus: (id: string, status: string, note?: string) =>
    patch<{ ok: true }>(`/admin/orders/${id}/status`, { status, note }),
  cancel: (id: string) => post<{ ok: true }>(`/admin/orders/${id}/cancel`),
  approve: (id: string) => post<{ ok: true }>(`/admin/orders/${id}/approve`),
  reject: (id: string, reason?: string) => post<{ ok: true }>(`/admin/orders/${id}/reject`, { reason }),
  assignVendor: (id: string, vendorId: string) => patch<{ ok: true }>(`/admin/orders/${id}/assign-vendor`, { vendorId }),
  invoice: (id: string) => get<{ path: string }>(`/admin/orders/${id}/invoice`),
  packingSlip: (id: string) => get<{ path: string }>(`/admin/orders/${id}/packing-slip`),
  addNote: (id: string, note: string) => post<{ ok: true }>(`/admin/orders/${id}/notes`, { note }),
};

// ---------------------------------------------------------------- Return / exchange requests
export const returnsApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/returns", query),
  get: (id: string) => get<Record<string, unknown>>(`/admin/returns/${id}`),
  approve: (id: string, adminNote?: string) => post<Record<string, unknown>>(`/admin/returns/${id}/approve`, { adminNote }),
  reject: (id: string, adminNote?: string) => post<Record<string, unknown>>(`/admin/returns/${id}/reject`, { adminNote }),
  complete: (id: string) => post<Record<string, unknown>>(`/admin/returns/${id}/complete`),
};

// ---------------------------------------------------------------- Payments
export const paymentsApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/payments", query),
  export: () => "/admin/payments/export",
  recordOffline: (orderId: string, amount: number) => post<Record<string, unknown>>("/admin/payments/offline", { orderId, amount }),
  refunds: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/payments/refunds", query),
  approveRefund: (refundId: string) => post<{ ok: true }>(`/admin/payments/refunds/${refundId}/approve`),
  rejectRefund: (refundId: string) => post<{ ok: true }>(`/admin/payments/refunds/${refundId}/reject`),
  settlements: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/payments/settlements", query),
  markSettlementPaid: (id: string) => post<{ ok: true }>(`/admin/payments/settlements/${id}/mark-paid`),
  commissionRules: () => get<Record<string, unknown>[]>("/admin/payments/commission-rules"),
  createCommissionRule: (body: {
    scope: string; targetId?: string; ratePercent: number; minFee?: number; maxFee?: number;
    effectiveFrom: string; isActive?: boolean;
  }) => post<Record<string, unknown>>("/admin/payments/commission-rules", body),
  gstReport: () => get<{ totalGstCollected: number; lineItemCount: number }>("/admin/payments/reports/gst"),
  revenueReport: () => get<{ totalRevenue: number; orderCount: number }>("/admin/payments/reports/revenue"),
  get: (id: string) => get<Record<string, unknown>>(`/admin/payments/${id}`),
  gatewayLogs: (id: string) => get<Record<string, unknown>[]>(`/admin/payments/${id}/gateway-logs`),
  verify: (id: string) => post<{ ok: true }>(`/admin/payments/${id}/verify`),
  refund: (id: string, amount: number, isPartial?: boolean, reason?: string) =>
    post<Record<string, unknown>>(`/admin/payments/${id}/refund`, { amount, isPartial, reason }),
};

// ---------------------------------------------------------------- Logistics
export const logisticsApi = {
  partners: () => get<Record<string, unknown>[]>("/admin/logistics/partners"),
  createPartner: (body: { name: string; code: string }) => post<Record<string, unknown>>("/admin/logistics/partners", body),
  updatePartner: (id: string, body: Record<string, unknown>) =>
    patch<Record<string, unknown>>(`/admin/logistics/partners/${id}`, body),
  removePartner: (id: string) => del<{ ok: true }>(`/admin/logistics/partners/${id}`),
  zones: () => get<Record<string, unknown>[]>("/admin/logistics/zones"),
  createZone: (body: Record<string, unknown>) => post<Record<string, unknown>>("/admin/logistics/zones", body),
  export: () => "/admin/logistics/export",
  shipments: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/logistics/shipments", query),
  createShipment: (body: { orderId: string; partnerId: string; vendorId?: string; weightKg?: number }) =>
    post<Record<string, unknown>>("/admin/logistics/shipments", body),
  bulkCreateShipments: (shipments: Record<string, unknown>[]) =>
    post<{ ok: true }>("/admin/logistics/shipments/bulk", { shipments }),
  reports: () => get<{ total: number; byStatus: Record<string, number> }>("/admin/logistics/reports"),
  getShipment: (id: string) => get<Record<string, unknown>>(`/admin/logistics/shipments/${id}`),
  setShipmentStatus: (id: string, status: string) =>
    patch<{ ok: true }>(`/admin/logistics/shipments/${id}/status`, { status }),
  returnShipment: (id: string) => post<{ ok: true }>(`/admin/logistics/shipments/${id}/return`),
  failShipment: (id: string, reason: string) => post<{ ok: true }>(`/admin/logistics/shipments/${id}/failed`, { reason }),
  proofOfDelivery: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return upload<{ ok: true }>("POST", `/admin/logistics/shipments/${id}/proof-of-delivery`, fd);
  },
};

// ---------------------------------------------------------------- RFQ
export const rfqApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/rfq", query),
  analytics: () => get<Record<string, number>>("/admin/rfq/analytics"),
  export: () => "/admin/rfq/export",
  create: (body: Record<string, unknown>) => post<Record<string, unknown>>("/admin/rfq", body),
  get: (id: string) => get<Record<string, unknown>>(`/admin/rfq/${id}`),
  update: (id: string, body: Record<string, unknown>) => patch<Record<string, unknown>>(`/admin/rfq/${id}`, body),
  assignVendors: (id: string, vendorIds: string[]) => post<{ ok: true }>(`/admin/rfq/${id}/assign-vendors`, { vendorIds }),
  addQuotation: (id: string, body: { vendorId: string; price: number; leadTimeDays: number; notes?: string }) =>
    post<Record<string, unknown>>(`/admin/rfq/${id}/quotations`, body),
  quotations: (id: string) => get<Record<string, unknown>[]>(`/admin/rfq/${id}/quotations`),
  approveQuotation: (id: string, qId: string) => post<{ ok: true }>(`/admin/rfq/${id}/quotations/${qId}/approve`),
  rejectQuotation: (id: string, qId: string) => post<{ ok: true }>(`/admin/rfq/${id}/quotations/${qId}/reject`),
  convertToOrder: (id: string) => post<{ orderId: string }>(`/admin/rfq/${id}/convert-to-order`),
  escalate: (id: string) => post<{ ok: true }>(`/admin/rfq/${id}/escalate`),
  uploadAttachment: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return upload<Record<string, unknown>>("POST", `/admin/rfq/${id}/attachments`, fd);
  },
  attachment: (id: string, attId: string) => get<Record<string, unknown>>(`/admin/rfq/${id}/attachments/${attId}`),
  addNote: (id: string, note: string) => post<{ ok: true }>(`/admin/rfq/${id}/notes`, { note }),
  timeline: (id: string) => get<Record<string, unknown>[]>(`/admin/rfq/${id}/timeline`),
  notify: (id: string, body: { recipientType: "user" | "vendor"; recipientId: string; title: string; body: string }) =>
    post<{ ok: true }>(`/admin/rfq/${id}/notify`, body),
};

// ---------------------------------------------------------------- Dashboard
export const dashboardApi = {
  summary: () => get<Record<string, number>>("/admin/dashboard/summary"),
  logisticsOverview: () => get<Record<string, number>>("/admin/dashboard/logistics-overview"),
  topSelling: () => get<{ products: Record<string, unknown>[]; categories: Record<string, unknown>[] }>(
    "/admin/dashboard/top-selling"
  ),
  recentActivity: () => get<Record<string, unknown>>("/admin/dashboard/recent-activity"),
  salesGraph: (range: "daily" | "weekly" | "monthly") =>
    get<Record<string, unknown>[]>("/admin/dashboard/sales-graph", { range }),
  revenueAnalytics: () => get<{ totalRevenue: number; byCategory: Record<string, unknown>[] }>(
    "/admin/dashboard/revenue-analytics"
  ),
  alerts: () =>
    get<{ refundRequests: number; failedShipments: number; escalatedRfqs: number; pendingVendors: number }>(
      "/admin/dashboard/alerts"
    ),
};

// ---------------------------------------------------------------- Reports
export type ReportKey =
  | "sales"
  | "revenue"
  | "products"
  | "vendors"
  | "customers"
  | "orders"
  | "rfq"
  | "payments"
  | "logistics"
  | "refunds"
  | "categories"
  | "monthly-business";

export const reportsApi = {
  run: (key: ReportKey, format?: "pdf" | "excel") =>
    get<{ title: string; columns: string[]; rows: (string | number)[][] } | { path: string }>(
      `/admin/reports/${key}`,
      format ? { format } : undefined
    ),
};

// ---------------------------------------------------------------- Notifications
export const notificationsApi = {
  list: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/notifications", query),
  send: (body: {
    recipientType: "user" | "vendor" | "admin";
    recipientId: string;
    channel: "email" | "in_app" | "sms" | "push";
    title: string;
    body: string;
  }) => post<Record<string, unknown>>("/admin/notifications", body),
  announcements: () => get<Record<string, unknown>[]>("/admin/notifications/announcements"),
  createAnnouncement: (body: { title: string; body: string; audience: "user" | "vendor" }) =>
    post<Record<string, unknown>>("/admin/notifications/announcements", body),
  setAnnouncementPublished: (id: string, published: boolean) =>
    patch<{ ok: true }>(`/admin/notifications/announcements/${id}`, { published }),
  subscribers: (query?: ListQuery) => get<Paginated<Record<string, unknown>>>("/admin/notifications/subscribers", query),
  removeSubscriber: (id: string) => del<{ ok: true }>(`/admin/notifications/subscribers/${id}`),
  subscribersExport: () => "/admin/notifications/subscribers/export",
};

// ---------------------------------------------------------------- Files
export function fileUrl(path: string): string {
  return `${ADMIN_API_URL}/admin/files/${path}`;
}

// Resolves an image field (e.g. a category imageUrl) to a loadable URL.
// The admin API returns these as a bare storage key with no leading slash
// (e.g. "category-images/xxx.jpg") — confirmed served at /public/files/{key},
// the same route the public storefront uses, unlike `fileUrl` below, which
// is specifically for the auth-gated /admin/files report-download route.
export function assetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/public/files/${path}`;
  return `${ADMIN_API_URL}${normalized}`;
}

// Generated files ({path} responses — invoices, packing slips, PDF/Excel
// reports) are fetched as a blob and downloaded, per API-CONTRACT.md.
export async function downloadGenerated(path: string, filename?: string): Promise<void> {
  const res = await fetch(fileUrl(path), { credentials: "include" });
  if (!res.ok) throw new AdminApiError(`Could not download file (${res.status})`, res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || path.split("/").pop() || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// CSV export endpoints return raw CSV directly (no {path} wrapper) — trigger
// a direct download of the export URL, no JSON parsing.
export function downloadCsv(path: string): void {
  const a = document.createElement("a");
  a.href = `${ADMIN_API_URL}${path}`;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
