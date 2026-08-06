"use client";
// Vendor auth is deliberately independent from both the customer-facing
// AuthProvider and the admin AdminAuthProvider — own session cookie
// (sanmish_vendor_session), own profile shape, own login flow.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { vendorAuthApi, type Vendor } from "@/lib/vendor/api";

type VendorAuthContextValue = {
  vendor: Vendor | null;
  hydrated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const VendorAuthContext = createContext<VendorAuthContextValue | null>(null);

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const profile = await vendorAuthApi.me();
      setVendor(profile);
    } catch {
      setVendor(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setHydrated(true));
  }, [refresh]);

  const logout = useCallback(async () => {
    setVendor(null);
    try {
      await vendorAuthApi.logout();
    } catch {
      // best-effort — local state already cleared
    }
  }, []);

  const value = useMemo(() => ({ vendor, hydrated, refresh, logout }), [vendor, hydrated, refresh, logout]);

  return <VendorAuthContext.Provider value={value}>{children}</VendorAuthContext.Provider>;
}

export function useVendorAuth(): VendorAuthContextValue {
  const ctx = useContext(VendorAuthContext);
  if (!ctx) throw new Error("useVendorAuth must be used within a VendorAuthProvider");
  return ctx;
}
