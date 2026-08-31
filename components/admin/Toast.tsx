"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import Icon from "@/components/admin/Icon";

type Toast = { id: number; kind: "success" | "error"; message: string };
type ToastContextValue = { push: (kind: Toast["kind"], message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((kind: Toast["kind"], message: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="adm-toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast ${t.kind}`}>
            <span className="adm-toast-icon">
              <Icon name={t.kind === "success" ? "check-circle" : "alert-circle"} size={14} />
            </span>
            <span className="adm-toast-message">{t.message}</span>
            <button type="button" className="adm-toast-close" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
              <Icon name="x" size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useAdminToast must be used within AdminToastProvider");
  return {
    success: (message: string) => ctx.push("success", message),
    error: (message: string) => ctx.push("error", message),
  };
}
