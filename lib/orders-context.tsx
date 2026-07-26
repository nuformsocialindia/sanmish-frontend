"use client";
// Temporary local order history standing in for a real orders/RFQ backend.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { CartItem } from "@/lib/cart-context";

export type OrderStatus = "Pending Review" | "Quote Sent" | "Confirmed" | "Delivered";

export type Order = {
  id: string;
  placedAt: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  company: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
};

type OrdersContextValue = {
  orders: Order[];
  addOrder: (order: Omit<Order, "placedAt" | "status">) => void;
  getOrder: (id: string) => Order | undefined;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);
const STORAGE_KEY = "sanmish-orders";

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setOrders(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  const addOrder = useCallback((order: Omit<Order, "placedAt" | "status">) => {
    setOrders((prev) => [
      { ...order, placedAt: new Date().toISOString(), status: "Pending Review" as OrderStatus },
      ...prev,
    ]);
  }, []);

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const value = useMemo(() => ({ orders, addOrder, getOrder }), [orders, addOrder, getOrder]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider");
  return ctx;
}
