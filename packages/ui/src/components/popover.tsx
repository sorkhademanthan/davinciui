"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@workspace/ui/lib/utils";

// ─────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

// ─────────────────────────────────────────────────────────────
// Trigger
// ─────────────────────────────────────────────────────────────

function PopoverTrigger({
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return (
      <PopoverPrimitive.Trigger
        data-slot="popover-trigger"
        render={children as React.ReactElement}
        {...props}
      />
    );
  }
  return (
    <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props}>
      {children}
    </PopoverPrimitive.Trigger>
  );
}

// ─────────────────────────────────────────────────────────────
// Anchor (optional)
// ─────────────────────────────────────────────────────────────

function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  // Base UI Popover uses Trigger as anchor; expose Anchor for completeness
  return <span data-slot="popover-anchor" {...(props as unknown as React.HTMLAttributes<HTMLSpanElement>)} />;
}

// ─────────────────────────────────────────────────────────────
// Content
// ─────────────────────────────────────────────────────────────

interface PopoverContentProps extends React.ComponentProps<typeof PopoverPrimitive.Popup> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  showArrow?: boolean;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  alignOffset,
  showArrow = false,
  children,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        data-slot="popover-positioner"
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "z-50 w-72 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md outline-none",
            "origin-[var(--transform-origin)] transition-all duration-150",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
            "data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2",
            className,
          )}
          {...props}
        >
          {children}
          {showArrow ? (
            <PopoverPrimitive.Arrow
              data-slot="popover-arrow"
              className="fill-popover stroke-border"
            />
          ) : null}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

// ─────────────────────────────────────────────────────────────
// Helper: Close
// ─────────────────────────────────────────────────────────────

function PopoverClose({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose };
