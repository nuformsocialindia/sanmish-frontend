"use client";
// Real session-backed auth: identity comes from the backend (httpOnly
// session cookie), not localStorage. On mount we ask the server who's
// logged in via GET /auth/me; login()/logout() just sync local state to
// match what the server has already done.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { auth as authApi } from "@/lib/api";

export type AuthUser = { id: string; name: string; email: string; mobile?: string };

type AuthContextValue = {
  user: AuthUser | null;
  hydrated: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setHydrated(true));
  }, []);

  const login = useCallback((u: AuthUser) => setUser(u), []);

  const logout = useCallback(async () => {
    setUser(null);
    try {
      await authApi.logout();
    } catch {
      // best-effort — local state is already cleared
    }
  }, []);

  const value = useMemo(() => ({ user, hydrated, login, logout }), [user, hydrated, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
