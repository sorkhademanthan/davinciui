"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { X } from "lucide-react";

type ToastType = "default" | "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const ToastContext = React.createContext<{
  toasts: ToastItem[];
  add: (t: Omit<ToastItem, "id">) => void;
  remove: (id: number) => void;
} | null>(null);

let nextId = 1;

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const add = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = nextId++;
    setToasts((s) => [...s, { ...t, id }]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 3000);
  }, []);
  const remove = React.useCallback((id: number) => setToasts((s) => s.filter((x) => x.id !== id)), []);
  return (
    <ToastContext.Provider value={{ toasts, add, remove }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            data-slot="toast"
            data-type={t.type}
            className={cn(
              "w-80 rounded-lg border bg-card p-4 shadow-lg",
              t.type === "success" && "border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950",
              t.type === "error" && "border-destructive/50 bg-destructive/10",
              t.type === "info" && "border-blue-500/20 bg-blue-50 dark:bg-blue-950"
            )}
          >
            <div className="flex justify-between gap-4">
              <div className="space-y-1">
                {t.title && <p className="text-sm font-medium">{t.title}</p>}
                {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                {t.action && <div className="mt-2">{t.action}</div>}
              </div>
              <button onClick={() => remove(t.id)} className="shrink-0 opacity-50 hover:opacity-100">
                <X className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be within ToastProvider");
  return ctx;
}

function toast(message: string, opts?: { description?: string; type?: ToastType; action?: React.ReactNode }) {
  // This will be replaced by hook usage; for docs we use component directly via provider's add via global event
  if (typeof window !== "undefined") {
    const event = new CustomEvent("davinci-toast", { detail: { title: message, ...opts } });
    window.dispatchEvent(event);
  }
}

function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Omit<ToastItem, "id">;
      const id = nextId++;
      setToasts((s) => [...s, { ...detail, id }]);
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 3000);
    };
    window.addEventListener("davinci-toast" as any, handler);
    return () => window.removeEventListener("davinci-toast" as any, handler);
  }, []);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto w-80 rounded-lg border bg-card p-4 shadow-lg",
            t.type === "success" && "border-emerald-500/20 bg-emerald-50",
            t.type === "error" && "border-destructive/50 bg-destructive/10"
          )}
        >
          <p className="text-sm font-medium">{t.title}</p>
          {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
          {t.action && <div className="mt-2">{t.action}</div>}
        </div>
      ))}
    </div>
  );
}

// Helper for promise toasts
function toastPromise<T>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) {
  toast(msgs.loading, { type: "info" });
  promise.then(
    () => toast(msgs.success, { type: "success" }),
    () => toast(msgs.error, { type: "error" })
  );
  return promise;
}

export { ToastProvider, Toaster, useToast, toast, toastPromise };
export type { ToastType };
