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
