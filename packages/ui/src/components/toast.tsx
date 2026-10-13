"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@workspace/ui/lib/utils";
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";

export type ToastType = "default" | "success" | "error" | "warning" | "info" | "loading";
export type ToastPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-center";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastInput {
  title: string;
  description?: string;
  type?: ToastType;
  /** ms until auto-dismiss. Infinity stays. Defaults by type (errors linger, success flashes). */
  duration?: number;
  /** Inline action button. Extends life to 8s for keyboard users unless duration is set. */
  action?: ToastAction | React.ReactNode;
  /** Re-uses the matching toast instead of stacking (dedup + updates). */
  id?: string | number;
}

interface ToastItem extends Required<Pick<ToastInput, "title" | "type">>, Omit<ToastInput, "title" | "type"> {
  id: string | number;
  leaving?: boolean;
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  default: 4000,
  success: 3000,
  error: 6000,
  warning: 5000,
  info: 4000,
  loading: Number.POSITIVE_INFINITY,
};

const MAX_TOASTS = 5;
const EXIT_MS = 200;

let seq = 0;
const listeners = new Set<() => void>();
let items: ToastItem[] = [];
const removeTimers = new Map<string | number, ReturnType<typeof setTimeout>>();

// Single-flight: every Toaster on the page shares one store, but only the
// first mounted instance renders — otherwise docs-style pages with a Toaster
// per example would stamp every toast into every corner.
let toasterSeq = 0;
let mountedToasters: number[] = [];

function emit() {
  listeners.forEach((l) => l());
}

function clearRemoveTimer(id: string | number) {
  const t = removeTimers.get(id);
  if (t) clearTimeout(t);
  removeTimers.delete(id);
}

function dismissToast(id: string | number) {
  clearRemoveTimer(id);
  const target = items.find((t) => t.id === id);
  if (!target || target.leaving) return;
  items = items.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  emit();
  const timer = setTimeout(() => {
    removeTimers.delete(id);
    items = items.filter((t) => t.id !== id);
    emit();
  }, EXIT_MS);
  removeTimers.set(id, timer);
}

function upsertToast(input: ToastInput): string | number {
  const id = input.id ?? `toast-${Date.now()}-${(seq += 1)}`;
  clearRemoveTimer(id);
  const type = input.type ?? "default";
  const duration =
    input.duration ?? (input.action ? Math.max(8000, DEFAULT_DURATIONS[type]) : DEFAULT_DURATIONS[type]);
  const next: ToastItem = {
    ...input,
    id,
    title: input.title,
    type,
    duration: duration === Number.POSITIVE_INFINITY ? undefined : duration,
    leaving: false,
  };
  const existing = items.findIndex((t) => t.id === id);
  if (existing >= 0) {
    items = items.map((t, i) => (i === existing ? next : t));
  } else {
    items = [...items.slice(-(MAX_TOASTS - 1)), next];
  }
  emit();
  return id;
}

function toast(title: string, opts?: Omit<ToastInput, "title">): string | number;
function toast(input: ToastInput): string | number;
function toast(titleOrInput: string | ToastInput, opts?: Omit<ToastInput, "title">): string | number {
  const input = typeof titleOrInput === "string" ? { ...opts, title: titleOrInput } : titleOrInput;
  return upsertToast(input);
}

toast.success = (title: string, opts?: Omit<ToastInput, "title" | "type">) => upsertToast({ ...opts, title, type: "success" });
toast.error = (title: string, opts?: Omit<ToastInput, "title" | "type">) => upsertToast({ ...opts, title, type: "error" });
toast.warning = (title: string, opts?: Omit<ToastInput, "title" | "type">) => upsertToast({ ...opts, title, type: "warning" });
toast.info = (title: string, opts?: Omit<ToastInput, "title" | "type">) => upsertToast({ ...opts, title, type: "info" });
toast.loading = (title: string, opts?: Omit<ToastInput, "title" | "type">) =>
  upsertToast({ ...opts, title, type: "loading", duration: opts?.duration ?? Number.POSITIVE_INFINITY });
toast.dismiss = (id?: string | number) => {
  if (id === undefined) {
    [...items].forEach((t) => dismissToast(t.id));
    return;
  }
  dismissToast(id);
};

function resolveMessage<T>(msg: string | ((data: T) => string), data: T): string {
  return typeof msg === "function" ? msg(data) : msg;
}

function toastPromise<T>(
  promise: Promise<T>,
  msgs: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) }
): Promise<T> {
  const id = toast.loading(msgs.loading);
  promise.then(
    (data) => {
      upsertToast({ id, title: resolveMessage(msgs.success, data), type: "success" });
    },
    (err) => {
      upsertToast({ id, title: resolveMessage(msgs.error, err), type: "error" });
    }
  );
  return promise;
}

// ─────────────────────────────────────────────────────────────
// Rendering
// ─────────────────────────────────────────────────────────────

const toastIcons: Record<ToastType, React.ReactNode> = {
  default: null,
  success: <CheckCircle2 className="size-4 text-emerald-500" aria-hidden />,
  error: <XCircle className="size-4 text-destructive" aria-hidden />,
  warning: <AlertTriangle className="size-4 text-amber-500" aria-hidden />,
  info: <Info className="size-4 text-sky-500" aria-hidden />,
  loading: <Loader2 className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden />,
};

const positionClasses: Record<ToastPosition, { root: string; enter: string }> = {
  "bottom-right": { root: "bottom-4 right-4 items-end", enter: "slide-in-from-bottom-4" },
  "bottom-left": { root: "bottom-4 left-4 items-start", enter: "slide-in-from-bottom-4" },
  "top-right": { root: "top-4 right-4 items-end", enter: "slide-in-from-top-4" },
  "top-left": { root: "top-4 left-4 items-start", enter: "slide-in-from-top-4" },
  "top-center": { root: "top-4 inset-x-0 items-center", enter: "slide-in-from-top-4" },
  "bottom-center": { root: "bottom-4 inset-x-0 items-center", enter: "slide-in-from-bottom-4" },
};

function ToastCard({ item }: { item: ToastItem }) {
  const remaining = React.useRef<number | null>(null);
  const deadline = React.useRef<number>(0);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const duration = item.duration ?? Number.POSITIVE_INFINITY;

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  React.useEffect(() => {
    if (!Number.isFinite(duration)) return;
    deadline.current = Date.now() + duration;
    timer.current = setTimeout(() => dismissToast(item.id), duration);
    return clear;
  }, [duration, item.id, item.title, item.description, item.type]);

  const pause = () => {
    if (!Number.isFinite(duration) || !timer.current) return;
    clear();
    remaining.current = Math.max(0, deadline.current - Date.now());
  };
  const resume = () => {
    if (!Number.isFinite(duration) || remaining.current == null || item.leaving) return;
    const wait = remaining.current;
    remaining.current = null;
    deadline.current = Date.now() + wait;
    timer.current = setTimeout(() => dismissToast(item.id), wait);
  };

  const icon = toastIcons[item.type];
  const action = item.action;
  return (
    <div
      data-slot="toast"
      data-type={item.type}
      data-leaving={item.leaving || undefined}
      role={item.type === "error" ? "alert" : "status"}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className={cn(
        "pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border bg-background p-4 shadow-xl ring-1 ring-black/5 dark:ring-white/10",
        "transition-all duration-200 ease-out motion-reduce:transition-none",
        "data-[leaving]:translate-y-1 data-[leaving]:opacity-0",
        item.type === "success" && "border-emerald-500/25",
        item.type === "error" && "border-destructive/40",
        item.type === "warning" && "border-amber-500/30",
        item.type === "info" && "border-sky-500/25"
      )}
    >
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm leading-snug font-medium break-words">{item.title}</p>
        {item.description ? <p className="text-[13px] leading-relaxed text-muted-foreground break-words">{item.description}</p> : null}
        {action
          ? React.isValidElement(action)
            ? <div className="pt-1">{action}</div>
            : (
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    (action as ToastAction).onClick();
                    dismissToast(item.id);
                  }}
                  className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium shadow-xs transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  {(action as ToastAction).label}
                </button>
              </div>
            )
          : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismissToast(item.id)}
        className="shrink-0 rounded-md p-1 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

export interface ToasterProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: ToastPosition;
}

function Toaster({ position = "bottom-right", className, ...props }: ToasterProps) {
  const idRef = React.useRef(0);
  if (!idRef.current) idRef.current = ++toasterSeq;
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const id = idRef.current;
    mountedToasters.push(id);
    setMounted(true);
    emit();
    return () => {
      mountedToasters = mountedToasters.filter((t) => t !== id);
      emit();
    };
  }, []);
  const snapshot = React.useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => items,
    () => items
  );
  // Only the claiming instance renders; the rest stand by and take over
  // if it unmounts. SSR renders nothing, so hydration always matches.
  if (!mounted || mountedToasters[0] !== idRef.current) return null;
  const pos = positionClasses[position];
  // Portal out of the call site: nested stacking contexts (docs columns,
  // transformed panes, overflow traps) must never bury the stack.
  return createPortal(
    <div
      data-slot="toaster"
      data-position={position}
      aria-label="Notifications"
      className={cn("pointer-events-none fixed z-[100] flex w-fit max-w-full flex-col gap-2", pos.root, className)}
      {...props}
    >
      {snapshot.map((t) => (
        <div key={t.id} className={cn("animate-in fade-in-0 duration-200 motion-reduce:animate-none", pos.enter)}>
          <ToastCard item={t} />
        </div>
      ))}
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────
// Compat — context API kept working over the same engine
// ─────────────────────────────────────────────────────────────

const ToastContext = React.createContext<{
  toast: typeof toast;
  dismiss: (id?: string | number) => void;
} | null>(null);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ toast, dismiss: toast.dismiss }), []);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

function useToast() {
  const ctx = React.useContext(ToastContext);
  if (ctx) return { ...ctx, promise: toastPromise };
  return { toast, dismiss: toast.dismiss, promise: toastPromise };
}

export { ToastProvider, Toaster, useToast, toast, toastPromise };
