"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

// ─────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

// ─────────────────────────────────────────────────────────────
// Trigger / Close / Portal
// ─────────────────────────────────────────────────────────────

function SheetTrigger({
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <SheetPrimitive.Trigger data-slot="sheet-trigger" render={children as React.ReactElement} {...props} />;
  }
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props}>{children}</SheetPrimitive.Trigger>;
}

function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetClose({
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <SheetPrimitive.Close data-slot="sheet-close" render={children as React.ReactElement} className={className} {...props} />;
  }
  return (
    <SheetPrimitive.Close
      data-slot="sheet-close"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </SheetPrimitive.Close>
  );
}

// ─────────────────────────────────────────────────────────────
// Overlay
// ─────────────────────────────────────────────────────────────

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Backdrop>) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Content — side sheet with directional enter/exit
// ─────────────────────────────────────────────────────────────

export type SheetSide = "top" | "right" | "bottom" | "left";

interface SheetContentProps extends React.ComponentProps<typeof SheetPrimitive.Popup> {
  /** Panel edge. @default "right" */
  side?: SheetSide;
  /** Corner X button. @default true */
  showCloseButton?: boolean;
}

const SIDE_POSITION: Record<SheetSide, string> = {
  right: "inset-y-0 right-0 w-3/4 max-w-sm border-l",
  left: "inset-y-0 left-0 w-3/4 max-w-sm border-r",
  top: "inset-x-0 top-0 max-h-[70vh] border-b",
  bottom: "inset-x-0 bottom-0 max-h-[70vh] border-t",
};

const SIDE_TRANSITION: Record<SheetSide, string> = {
  right:
    "transition-transform duration-300 data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
  left:
    "transition-transform duration-300 data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
  top:
    "transition-transform duration-300 data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full",
  bottom:
    "transition-transform duration-300 data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
};

function SheetContent({ className, children, side = "right", showCloseButton = true, ...props }: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background p-6 shadow-xl",
          SIDE_POSITION[side],
          SIDE_TRANSITION[side],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <SheetPrimitive.Close
            data-slot="sheet-close-button"
            className="absolute end-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Close"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        ) : null}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

// ─────────────────────────────────────────────────────────────
// Header / Footer / Title / Description
// ─────────────────────────────────────────────────────────────

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 text-start", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-base font-semibold leading-none tracking-tight", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-sm leading-5 text-muted-foreground", className)} {...props} />;
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

export default Sheet;
