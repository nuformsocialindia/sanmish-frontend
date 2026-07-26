"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pin: string;
  isDefault: boolean;
};

type AddressContextValue = {
  addresses: Address[];
  addAddress: (address: Omit<Address, "id" | "isDefault">) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
};

const AddressContext = createContext<AddressContextValue | null>(null);
const STORAGE_KEY = "sanmish-addresses";

export function AddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setAddresses(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses, hydrated]);

  const addAddress = useCallback((address: Omit<Address, "id" | "isDefault">) => {
    setAddresses((prev) => [
      ...prev,
      { ...address, id: `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`, isDefault: prev.length === 0 },
    ]);
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length > 0 && !next.some((a) => a.isDefault)) next[0].isDefault = true;
      return next;
    });
  }, []);

  const setDefault = useCallback((id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }, []);

  const value = useMemo(
    () => ({ addresses, addAddress, removeAddress, setDefault }),
    [addresses, addAddress, removeAddress, setDefault]
  );

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export function useAddresses(): AddressContextValue {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddresses must be used within an AddressProvider");
  return ctx;
}
