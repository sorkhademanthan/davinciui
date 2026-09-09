"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

// ─────────────────────────────────────────────────────────────
// Design notes — same premium motion system as the Context Menu
// and Dropdown Menu, tuned for larger travel:
//  - Enter decelerates: rises 16px + unscales over ~220ms.
//  - Exit accelerates and is FASTER (~120ms): users shouldn't
//    watch things leave, they need to get back to work.
//  - Only transform/opacity composite — never layout props.
//  - Centering uses a grid wrapper, NOT translate utilities,
//    so the popup's transform is free for animation (translate
//    centering fights entering transitions and causes jumps).
//  - Full reduced-motion support.
// ─────────────────────────────────────────────────────────────

const POPUP_SHELL = cn(
  "pointer-events-auto relative z-50 grid w-[calc(100vw-2rem)] gap-4 border bg-background p-6 shadow-[0_2px_8px_rgb(0_0_0/0.08),0_24px_64px_-16px_rgb(0_0_0/0.3)]",
  "rounded-2xl border-border/70 bg-clip-padding",
  "dark:shadow-[0_2px_8px_rgb(0_0_0/0.4),0_32px_80px_-16px_rgb(0_0_0/0.7)]",
  "max-h-[min(40rem,calc(100dvh-3rem))] overflow-hidden outline-none",
  // Enter: rise + settle. Exit: quicker + accelerating.
  "transition-[opacity,scale,translate] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
  "data-[starting-style]:translate-y-4 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
  "data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[ending-style]:duration-120 data-[ending-style]:ease-[cubic-bezier(0.4,0,1,1)]",
  "motion-reduce:transition-none motion-reduce:data-[starting-style]:translate-y-0 motion-reduce:data-[starting-style]:scale-100",
);

const DIALOG_SIZES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
} as const;

export type DialogSize = keyof typeof DIALOG_SIZES;

// ─────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

// ─────────────────────────────────────────────────────────────
// Trigger
// ─────────────────────────────────────────────────────────────

function DialogTrigger({
  children,
  asChild,
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" render={children as React.ReactElement<Record<string, unknown>>} {...props} />;
  }
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      className={cn(
        "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Trigger>
  );
}

// ─────────────────────────────────────────────────────────────
// Portal
// ─────────────────────────────────────────────────────────────

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

// ─────────────────────────────────────────────────────────────
// Overlay / Backdrop — fades only, slightly stronger in dark.
// ─────────────────────────────────────────────────────────────

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 dark:bg-black/65",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        "motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Close
// ─────────────────────────────────────────────────────────────

function DialogClose({
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return (
      <DialogPrimitive.Close
        data-slot="dialog-close"
        render={children as React.ReactElement<Record<string, unknown>>}
        {...props}
      />
    );
  }
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Close>
  );
}

// ─────────────────────────────────────────────────────────────
// Content — centered via grid wrapper; size-matched to content.
// ─────────────────────────────────────────────────────────────

interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Popup> {
  showCloseButton?: boolean;
  /** Width preset matched to content. @default "md" (max-w-lg) */
  size?: DialogSize;
}

function DialogContent({ className, children, showCloseButton = true, size = "md", ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <div
        data-slot="dialog-positioner"
        className="pointer-events-none fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-6"
      >
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(POPUP_SHELL, DIALOG_SIZES[size], className)}
          {...props}
        >
          {children}
          {showCloseButton ? (
            <DialogPrimitive.Close
              data-slot="dialog-close-button"
              aria-label="Close"
              className="absolute top-4 end-4 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground opacity-70 outline-none transition-all duration-150 hover:bg-accent hover:text-accent-foreground hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/70 active:scale-95 disabled:pointer-events-none"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Popup>
      </div>
    </DialogPrimitive.Portal>
  );
}

// ─────────────────────────────────────────────────────────────
// Header / Body / Footer / Title / Description
// ─────────────────────────────────────────────────────────────

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 text-start pe-8", className)}
      {...props}
    />
  );
}

/** Scrollable body region with overlay-style scrollbar and scroll containment. */
function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain",
        "[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:pt-1", className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold tracking-tight text-balance", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
