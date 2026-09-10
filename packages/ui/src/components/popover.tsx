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

export type PopoverContentVariant = "default" | "compact" | "wide";

interface PopoverContentProps extends React.ComponentProps<typeof PopoverPrimitive.Popup> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  showArrow?: boolean;
  /** Panel density. Compact for hints, wide for rich panels. @default "default" */
  variant?: PopoverContentVariant;
}

const popoverContentVariants: Record<PopoverContentVariant, string> = {
  default: "w-72 p-4 text-sm",
  compact: "w-auto max-w-60 p-2.5 text-xs",
  wide: "w-96 max-w-[calc(100vw-2rem)] p-5 text-sm",
};

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  alignOffset,
  showArrow = false,
  variant = "default",
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
          data-variant={variant}
          className={cn(
            "z-50 rounded-xl border bg-popover text-popover-foreground shadow-xl ring-1 ring-black/5 outline-none dark:ring-white/10",
            "origin-[var(--transform-origin)] transition-all duration-150 ease-out motion-reduce:transition-none",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
            "data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
            popoverContentVariants[variant],
            className,
          )}
          {...props}
        >
          {children}
          {showArrow ? (
            <PopoverPrimitive.Arrow
              data-slot="popover-arrow"
              className="size-2.5 fill-popover stroke-border"
            />
          ) : null}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

// ─────────────────────────────────────────────────────────────
// Header / Title / Description
// ─────────────────────────────────────────────────────────────

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4
      data-slot="popover-title"
      className={cn("text-sm leading-none font-medium", className)}
      {...props}
    />
  );
}

function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-[13px] leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Helper: Close
// ─────────────────────────────────────────────────────────────

function PopoverClose({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose, PopoverHeader, PopoverTitle, PopoverDescription };
