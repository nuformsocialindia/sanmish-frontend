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
