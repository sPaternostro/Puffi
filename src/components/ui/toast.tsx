"use client";

import { Check, CircleAlert, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ToastKind = "success" | "error" | "info";

type Toast = {
  id: number;
  kind: ToastKind;
  title: string;
  detail?: string;
};

type ToastContextValue = {
  push: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: Check,
  error: CircleAlert,
  info: Info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((current) => {
      const duplicate = current.some(
        (item) => item.title === toast.title && item.detail === toast.detail && item.kind === toast.kind,
      );
      if (duplicate) return current;
      return [...current, { ...toast, id }];
    });
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3800);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-50 flex justify-center px-4 md:top-20">
        <div className="flex w-full max-w-sm flex-col gap-2">
          {toasts.map((toast) => {
            const Icon = ICONS[toast.kind];
            return (
              <div
                key={toast.id}
                className="toast-enter pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-card/95 px-4 py-3.5 shadow-[0_12px_40px_-18px_rgba(74,64,58,0.45)] backdrop-blur"
                role="status"
              >
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    toast.kind === "success"
                      ? "bg-success/15 text-success"
                      : toast.kind === "error"
                        ? "bg-danger/15 text-danger"
                        : "bg-accent text-primary-strong"
                  }`}
                >
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{toast.title}</p>
                  {toast.detail ? (
                    <p className="mt-0.5 text-sm leading-5 text-foreground/65">{toast.detail}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="mt-0.5 rounded-full p-1 text-foreground/40 hover:text-foreground"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Cerrar"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
