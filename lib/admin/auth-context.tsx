"use client";
// Admin auth is deliberately independent from the customer-facing
// AuthProvider (lib/auth-context.tsx) — own session cookie
// (sanmish_admin_session), own profile shape, own login/2FA flow. Nothing
// here imports from the customer contexts, so app/admin + lib/admin can be
// lifted into a separate app/service later without touching the site.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { authApi, AdminApiError, type AdminProfile } from "@/lib/admin/api";

type AdminAuthContextValue = {
  admin: AdminProfile | null;
  hydrated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const profile = await authApi.me();
      setAdmin(profile);
    } catch {
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setHydrated(true));
  }, [refresh]);

  const logout = useCallback(async () => {
    setAdmin(null);
    try {
      await authApi.logout();
    } catch {
      // best-effort — local state already cleared
    }
  }, []);

  const value = useMemo(() => ({ admin, hydrated, refresh, logout }), [admin, hydrated, refresh, logout]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}

export { AdminApiError };
