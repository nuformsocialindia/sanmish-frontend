"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type PaymentMethod = {
  id: string;
  type: "card" | "upi";
  label: string; // "Visa ending 4242" or "dev@upi"
  isDefault: boolean;
};

type PaymentContextValue = {
  methods: PaymentMethod[];
  addMethod: (method: Omit<PaymentMethod, "id" | "isDefault">) => void;
  removeMethod: (id: string) => void;
  setDefault: (id: string) => void;
};

const PaymentContext = createContext<PaymentContextValue | null>(null);
const STORAGE_KEY = "sanmish-payment-methods";

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setMethods(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
  }, [methods, hydrated]);

  const addMethod = useCallback((method: Omit<PaymentMethod, "id" | "isDefault">) => {
    setMethods((prev) => [
      ...prev,
      { ...method, id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`, isDefault: prev.length === 0 },
    ]);
  }, []);

  const removeMethod = useCallback((id: string) => {
    setMethods((prev) => {
      const next = prev.filter((m) => m.id !== id);
      if (next.length > 0 && !next.some((m) => m.isDefault)) next[0].isDefault = true;
      return next;
    });
  }, []);

  const setDefault = useCallback((id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  }, []);

  const value = useMemo(
    () => ({ methods, addMethod, removeMethod, setDefault }),
    [methods, addMethod, removeMethod, setDefault]
  );

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePayments(): PaymentContextValue {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error("usePayments must be used within a PaymentProvider");
  return ctx;
}
