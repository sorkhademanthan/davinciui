"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Check, ChevronRight, Dot } from "lucide-react";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  dir: "ltr" | "rtl";
}

const MenuContext = React.createContext<MenuContextValue>({ open: false, setOpen: () => {}, dir: "ltr" });

function useMenu() {
  return React.useContext(MenuContext);
}

export interface ContextMenuProps {
  children: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Text direction — mirrors submenu sides. @default "ltr" */
  dir?: "ltr" | "rtl";
  /** Extra classes for the root. */
  className?: string;
}

function ContextMenu({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  dir = "ltr",
  className,
}: ContextMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const rootRef = React.useRef<HTMLDivElement>(null);

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  // Close on outside pointer or Escape.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  return (
    <MenuContext.Provider value={{ open, setOpen, dir }}>
      <div ref={rootRef} data-slot="context-menu" dir={dir} className={cn("relative", className)}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

function ContextMenuTrigger({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { setOpen } = useMenu();
  return (
    <div
      data-slot="context-menu-trigger"
      onContextMenu={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).dataset.anchor = `${e.clientX},${e.clientY}`;
        setOpen(true);
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

function readAnchor(trigger: HTMLElement | null): { x: number; y: number } {
  const raw = trigger?.dataset.anchor;
  if (!raw) return { x: 0, y: 0 };
  const [x = 0, y = 0] = raw.split(",").map(Number);
  return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 };
}

const itemClasses =
  "relative flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-40";

function ContextMenuContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useMenu();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    const trigger =
      panelRef.current.parentElement?.querySelector<HTMLElement>('[data-slot="context-menu-trigger"]') ?? null;
    const anchor = readAnchor(trigger);
    const r = panelRef.current.getBoundingClientRect();
    const pad = 8;
    setPos({
      x: Math.max(pad, Math.min(anchor.x, window.innerWidth - r.width - pad)),
      y: Math.max(pad, Math.min(anchor.y, window.innerHeight - r.height - pad)),
    });
  }, [open ]);

  // Focus only once positioned — hidden panels refuse focus.
  React.useLayoutEffect(() => {
    if (!open || !pos || !panelRef.current) return;
    const first = panelRef.current.querySelector<HTMLButtonElement>('button:not([disabled])');
    first?.focus();
  }, [open, pos ]);

  if (!open) return null;

  const moveFocus = (e: React.KeyboardEvent) => {
    // Keystrokes from inside an open submenu are handled by the submenu itself.
    if ((e.target as HTMLElement).closest?.('[data-slot="context-menu-sub-content"]')) return;
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>(':scope > button:not([disabled]), :scope > div > button:not([disabled])') ?? [],
    );
    const current = document.activeElement as HTMLElement | null;
    const idx = items.findIndex((el) => el === current);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      (items[(idx + 1 + items.length) % items.length] ?? items[0])?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      (items[(idx - 1 + items.length) % items.length] ?? items[items.length - 1])?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  return (
    <div
      ref={panelRef}
      data-slot="context-menu-content"
      role="menu"
      onKeyDown={moveFocus}
      style={{
        position: "fixed",
        left: pos ? pos.x : -9999,
        top: pos ? pos.y : -9999,
        visibility: pos ? "visible" : "hidden",
      }}
      className={cn("z-50 min-w-56 overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-md", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ContextMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Right-aligned shortcut hint. */
  shortcut?: string;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Destructive styling. @default false */
  destructive?: boolean;
  /** Called on select (click or Enter); closes the menu. */
  onSelect?: () => void;
}

function ContextMenuItem({ shortcut, icon, destructive = false, onSelect, className, children, onClick, ...props }: ContextMenuItemProps) {
  const { setOpen } = useMenu();
  return (
    <button
      data-slot="context-menu-item"
      role="menuitem"
      type="button"
      onClick={(e) => {
        onClick?.(e);
        onSelect?.();
        setOpen(false);
      }}
      className={cn(itemClasses, destructive && "text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10", className)}
      {...props}
    >
      {icon && (
        <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span className="flex-1 text-start">{children}</span>
      {shortcut && (
        <kbd className="font-mono text-[11px] tracking-widest text-muted-foreground">{shortcut}</kbd>
      )}
    </button>
  );
}

function ContextMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="context-menu-label"
      className={cn("px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", className)}
      {...props}
    />
  );
}

function ContextMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="context-menu-separator"
      role="separator"
      aria-orientation="horizontal"
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  );
}

export interface ContextMenuCheckboxItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "checked" | "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function ContextMenuCheckboxItem({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  className,
  children,
  onClick,
  ...props
}: ContextMenuCheckboxItemProps) {
  const [internal, setInternal] = React.useState(defaultChecked);
  const checked = controlledChecked !== undefined ? controlledChecked : internal;
  return (
    <button
      data-slot="context-menu-checkbox-item"
      role="menuitemcheckbox"
      aria-checked={checked}
      type="button"
      onClick={(e) => {
        onClick?.(e);
        const next = !checked;
        if (controlledChecked === undefined) setInternal(next);
        onCheckedChange?.(next);
      }}
      className={cn(itemClasses, className)}
      {...props}
    >
      <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">
        {checked && <Check className="size-4" />}
      </span>
      <span className="flex-1 text-start">{children}</span>
    </button>
  );
}

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

export interface ContextMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function ContextMenuRadioGroup({
  value: controlledValue,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: ContextMenuRadioGroupProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internal;
  return (
    <RadioGroupContext.Provider
      value={{
        value,
        onValueChange: (next) => {
          if (controlledValue === undefined) setInternal(next);
          onValueChange?.(next);
        },
      }}
    >
      <div data-slot="context-menu-radio-group" role="group" className={cn(className)} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface ContextMenuRadioItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function ContextMenuRadioItem({ value, className, children, onClick, ...props }: ContextMenuRadioItemProps) {
  const group = React.useContext(RadioGroupContext);
  const selected = group.value === value;
  const { setOpen } = useMenu();
  return (
    <button
      data-slot="context-menu-radio-item"
      role="menuitemradio"
      aria-checked={selected}
      type="button"
      onClick={(e) => {
        onClick?.(e);
        group.onValueChange?.(value);
        setOpen(false);
      }}
      className={cn(itemClasses, className)}
      {...props}
    >
      <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">
        {selected ? <Dot className="size-5" /> : null}
      </span>
      <span className="flex-1 text-start">{children}</span>
    </button>
  );
}

export interface ContextMenuSubProps {
  /** Submenu trigger label. */
  label: React.ReactNode;
  /** Leading icon on the trigger. */
  icon?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
}

function ContextMenuSub({ label, icon, disabled = false, children }: ContextMenuSubProps) {
  const { dir } = useMenu();
  const [subOpen, setSubOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const closeTimer = React.useRef<number | null>(null);

  const openSub = () => {
    if (disabled) return;
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setSubOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setSubOpen(false), 120);
  };

  React.useLayoutEffect(() => {
    if (!subOpen || !triggerRef.current || !panelRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const p = panelRef.current.getBoundingClientRect();
    const pad = 8;
    const openLeft = dir === "rtl";
    let x = openLeft ? r.left - p.width : r.right;
    if (!openLeft && x + p.width > window.innerWidth - pad) x = r.left - p.width;
    if (openLeft && x < pad) x = r.right;
    let y = r.top - 6;
    y = Math.max(pad, Math.min(y, window.innerHeight - p.height - pad));
    setPos({ x, y });
  }, [subOpen, dir ]);

  React.useLayoutEffect(() => {
    if (!subOpen || !pos) return;
    panelRef.current?.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus();
  }, [subOpen, pos ]);

  React.useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div data-slot="context-menu-sub" onMouseLeave={scheduleClose}>
      <button
        ref={triggerRef}
        data-slot="context-menu-sub-trigger"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={subOpen}
        type="button"
        disabled={disabled}
        onMouseEnter={openSub}
        onClick={openSub}
        onKeyDown={(e) => {
          const fwd = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
          const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
          if (e.key === fwd) {
            e.preventDefault();
            openSub();
          } else if (e.key === back || e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            setSubOpen(false);
            triggerRef.current?.focus();
          }
        }}
        className={cn(itemClasses, subOpen && "bg-accent text-accent-foreground")}
      >
        {icon && (
          <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">
            {icon}
          </span>
        )}
        <span className="flex-1 text-start">{label}</span>
        <ChevronRight aria-hidden className={cn("size-4 shrink-0 text-muted-foreground", dir === "rtl" && "rotate-180")} />
      </button>
      {subOpen && (
        <div
          ref={panelRef}
          data-slot="context-menu-sub-content"
          role="menu"
          onMouseEnter={openSub}
          onKeyDown={(e) => {
            const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
            if (e.key === back || e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              setSubOpen(false);
              triggerRef.current?.focus();
              return;
            }
            // Local navigation inside the submenu.
            const items = Array.from(
              panelRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? [],
            );
            if (items.length === 0) return;
            const current = document.activeElement as HTMLElement | null;
            const idx = items.findIndex((el) => el === current);
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              e.stopPropagation();
              const next = e.key === "ArrowDown" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
              items[next]?.focus();
            } else if (e.key === "Home" || e.key === "End") {
              e.preventDefault();
              e.stopPropagation();
              (e.key === "Home" ? items[0] : items[items.length - 1])?.focus();
            }
          }}
          style={{
            position: "fixed",
            left: pos ? pos.x : -9999,
            top: pos ? pos.y : -9999,
            visibility: pos ? "visible" : "hidden",
          }}
          className="z-50 min-w-48 overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-md"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
};

export default ContextMenu;
