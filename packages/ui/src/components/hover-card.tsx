"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type HoverCardSide = "top" | "right" | "bottom" | "left";
export type HoverCardAlign = "start" | "center" | "end";

export interface HoverCardProps {
  children: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires when the card opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Hover intent delay before opening, in ms. @default 500 */
  openDelay?: number;
  /** Grace delay before closing, in ms. @default 250 */
  closeDelay?: number;
  /** Panel side relative to the trigger. @default "top" */
  side?: HoverCardSide;
  /** Panel alignment along the side. @default "center" */
  align?: HoverCardAlign;
  /** Gap between trigger and panel in px. @default 8 */
  sideOffset?: number;
  /** Text direction. @default "ltr" */
  dir?: "ltr" | "rtl";
  /** Extra classes for the wrapper. */
  className?: string;
}

interface HoverCardContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  side: HoverCardSide;
  align: HoverCardAlign;
  sideOffset: number;
  openDelay: number;
  closeDelay: number;
}

const HoverCardContext = React.createContext<HoverCardContextValue>({
  open: false,
  setOpen: () => {},
  side: "top",
  align: "center",
  sideOffset: 8,
  openDelay: 500,
  closeDelay: 250,
});

function useHoverCard() {
  return React.useContext(HoverCardContext);
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

function HoverCard({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  openDelay = 500,
  closeDelay = 250,
  side = "top",
  align = "center",
  sideOffset = 8,
  dir = "ltr",
  className,
}: HoverCardProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const openTimer = React.useRef<number | null>(null);
  const closeTimer = React.useRef<number | null>(null);

  const clearTimers = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };

  React.useEffect(() => clearTimers, []);

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const scheduleOpen = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (open) return;
    if (openTimer.current) return;
    openTimer.current = window.setTimeout(
      () => {
        openTimer.current = null;
        setOpen(true);
      },
      Math.max(0, openDelay),
    );
  };

  const scheduleClose = () => {
    if (openTimer.current) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (!open) return;
    if (closeTimer.current) return;
    closeTimer.current = window.setTimeout(
      () => {
        closeTimer.current = null;
        setOpen(false);
      },
      Math.max(0, closeDelay),
    );
  };

  const value = React.useMemo(
    () => ({ open, setOpen, side, align, sideOffset, openDelay, closeDelay }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, side, align, sideOffset, openDelay, closeDelay],
  );

  return (
    <HoverCardContext.Provider value={value}>
      <div
        data-slot="hover-card"
        dir={dir}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        className={cn("relative inline-block", className)}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
}

function HoverCardTrigger({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { setOpen } = useHoverCard();
  return (
    <div
      data-slot="hover-card-trigger"
      tabIndex={0}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen(true)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
      className={cn("inline-block cursor-default outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function sideStyle(
  side: HoverCardSide,
  align: HoverCardAlign,
  offset: number,
): React.CSSProperties {
  const px = `${offset}px`;
  const base: React.CSSProperties = { position: "absolute", zIndex: 50 };
  const alignX = align === "start" ? { left: 0 } : align === "end" ? { right: 0 } : { left: "50%", transform: "translateX(-50%)" };
  const alignY = align === "start" ? { top: 0 } : align === "end" ? { bottom: 0 } : { top: "50%", transform: "translateY(-50%)" };
  if (side === "top") return { ...base, bottom: `100%`, marginBottom: px, ...alignX };
  if (side === "bottom") return { ...base, top: `100%`, marginTop: px, ...alignX };
  if (side === "left") return { ...base, right: `100%`, marginRight: px, ...alignY };
  return { ...base, left: `100%`, marginLeft: px, ...alignY };
}

function HoverCardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, side, align, sideOffset } = useHoverCard();
  if (!open) return null;
  return (
    <div
      data-slot="hover-card-content"
      role="dialog"
      aria-label="Preview"
      style={sideStyle(side, align, sideOffset)}
      className={cn(
        "w-64 rounded-xl border bg-popover p-4 text-popover-foreground shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };

export default HoverCard;
