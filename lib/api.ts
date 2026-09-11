// Thin client for the auth backend. Base URL is overridable via
// NEXT_PUBLIC_API_URL for staging/prod; defaults to the local dev backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || "Something went wrong. Please try again.", res.status);
  }
  return data as T;
}

export type ApiUser = { id: string; name: string; email: string };

export const auth = {
  signupStart: (name: string, email: string) => request<{ ok: true }>("/auth/signup/start", { name, email }),
  signupVerify: (email: string, otp: string) => request<{ user: ApiUser }>("/auth/signup/verify", { email, otp }),
  loginStart: (email: string) => request<{ ok: true }>("/auth/login/start", { email }),
  loginVerify: (email: string, otp: string) => request<{ user: ApiUser }>("/auth/login/verify", { email, otp }),
  logout: () => request<{ ok: true }>("/auth/logout"),
  me: async (): Promise<ApiUser | null> => {
    const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data?.user ?? null;
  },
};

// "Become a Seller" public application (docs/public-api.md: POST /public/vendors/apply).
// No auth — creates a pending vendor row an admin reviews in /admin/vendors;
// approving it emails the applicant automatically.
export type VendorBusinessType = "manufacturer" | "wholesaler" | "distributor" | "trader" | "service_provider";

export type ApplyVendorPayload = {
  businessName: string;
  vendorName: string;
  email: string;
  mobileNumber: string;
  companyAddress: string;
  businessType: VendorBusinessType;
  gstin?: string;
  pan?: string;
  cin?: string;
  city?: string;
  state?: string;
  fuelTypes?: string[];
};

export type ApplyVendorResult = { id: string; businessName: string; verificationStatus: string };

export type EnquiryType = "QUOTE_REQUEST" | "BECOME_SELLER" | "SERVICE" | "SUPPORT" | "GENERAL";

export type CreateEnquiryPayload = {
  type: EnquiryType;
  name: string;
  email: string;
  message: string;
  company?: string;
  phone?: string;
  city?: string;
  subject?: string;
  quantity?: number;
  deliveryPincode?: string;
  productSlug?: string;
  serviceSlug?: string;
};

export type CreateEnquiryResult = { id: string; reference: string; status: string };

// Public contact form / "Request Quote for Bulk" submission (docs/public-api.md:
// POST /public/enquiries). No auth — creates an Enquiry row an admin triages
// in /admin/enquiries; productSlug (if present) links it to that product and
// the backend derives `source` (PRODUCT_PAGE vs CONTACT_PAGE) from it itself.
export const enquiries = {
  create: (payload: CreateEnquiryPayload) => request<CreateEnquiryResult>("/public/enquiries", payload),
};

export const vendors = {
  apply: (payload: ApplyVendorPayload) => request<ApplyVendorResult>("/public/vendors/apply", payload),
};

export type CheckoutItemPayload = { productSlug: string; quantity: number };

export type CreateCheckoutPayload = {
  items: CheckoutItemPayload[];
  company?: string;
  contact?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type CreateCheckoutResult = {
  order: { id: string; orderNumber: string } | null;
  rfqs: { id: string; rfqNumber: string; productName: string }[];
};

// Logged-in checkout (docs/public-api.md: POST /public/checkout). Requires
// the buyer session cookie. Priced catalogue items become a real Order
// (order.orderNumber); quote-only items each become an Rfq (rfqs[]) since
// there's no fixed price to lock in until a vendor quotes one — a cart can
// contain both. A guest cart has no userId to attach, so it goes through
// enquiries.create instead.
export const checkout = {
  submit: (payload: CreateCheckoutPayload) => request<CreateCheckoutResult>("/public/checkout", payload),
};

export type MyOrderItem = {
  id: string;
  quantity: number;
  unitPrice: string | number;
  basePrice: string | number;
  gstAmount: string | number;
  lineTotal: string | number;
  product: { title: string; slug: string; images: { url: string }[] };
};

export type MyOrder = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string | number;
  gstAmount: string | number;
  totalAmount: string | number;
  shippingAddress: { line1?: string; city?: string; state?: string; pincode?: string } | null;
  createdAt: string;
  items: MyOrderItem[];
};

async function getRequest<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || "Something went wrong. Please try again.", res.status);
  }
  return data as T;
}

// Buyer's own real orders (docs/public-api.md: GET /public/account/orders).
// Requires the buyer session cookie — this is what checkout's created Order
// actually looks like, so account pages show the same orderNumber the admin
// panel does instead of a separate client-only id.
export const myOrders = {
  list: () => getRequest<MyOrder[]>("/public/account/orders"),
  get: (orderNumber: string) => getRequest<MyOrder>(`/public/account/orders/${encodeURIComponent(orderNumber)}`),
};
