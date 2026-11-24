"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@workspace/ui/lib/utils";

// ─────────────────────────────────────────────────────────────
// Design notes — same premium system as Dialog / Menus, wrapped
// around the vaul gesture engine (swipe-to-dismiss, snap points,
// background scaling). The engine owns motion physics; this file
// owns surfaces, rhythm, safe-area, and type:
//  - Overlay fades only (opacity), subtler in light, deeper dark.
//  - Directional radii + layered shadows per side.
//  - iOS-style grabber, safe-area insets, left-aligned type.
//  - Header/body/footer rhythm with a dedicated scroll region.
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────

function Drawer({ shouldScaleBackground = true, ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" shouldScaleBackground={shouldScaleBackground} {...props} />;
}
Drawer.displayName = "Drawer";

// ─────────────────────────────────────────────────────────────
// Trigger / Close / Portal
// ─────────────────────────────────────────────────────────────

function DrawerTrigger({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return (
    <DrawerPrimitive.Trigger
      data-slot="drawer-trigger"
      className={cn(
        "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  );
}
DrawerTrigger.displayName = "DrawerTrigger";

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}
DrawerPortal.displayName = "DrawerPortal";

function DrawerClose({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return (
    <DrawerPrimitive.Close
      data-slot="drawer-close"
      className={cn(
        "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  );
}
DrawerClose.displayName = "DrawerClose";

// ─────────────────────────────────────────────────────────────
// Overlay
// ─────────────────────────────────────────────────────────────

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 dark:bg-black/65",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}
DrawerOverlay.displayName = "DrawerOverlay";

// ─────────────────────────────────────────────────────────────
// Handle — iOS-style grabber, draggable affordance.
// ─────────────────────────────────────────────────────────────

function DrawerHandle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="drawer-handle"
      aria-hidden
      className={cn(
        "mx-auto mt-3 hidden h-[5px] w-10 shrink-0 cursor-grab rounded-full bg-foreground/20 transition-colors active:cursor-grabbing",
        "group-data-[vaul-drawer-direction=bottom]/drawer-content:block group-data-[vaul-drawer-direction=top]/drawer-content:block",
        className,
      )}
      {...props}
    />
  );
}
DrawerHandle.displayName = "DrawerHandle";

// ─────────────────────────────────────────────────────────────
// Content — directional premium surfaces with safe-area.
// ─────────────────────────────────────────────────────────────

interface DrawerContentProps extends React.ComponentProps<typeof DrawerPrimitive.Content> {
  /** Show the grabber for top/bottom sheets. @default true */
  showHandle?: boolean;
}

function DrawerContent({ className, children, showHandle = true, ...props }: DrawerContentProps) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col bg-background bg-clip-padding outline-none",
          // bottom (default) — floating sheet with top radius + home-indicator clearance
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[88dvh] data-[vaul-drawer-direction=bottom]:rounded-t-[20px] data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=bottom]:border-border/70 data-[vaul-drawer-direction=bottom]:pb-[env(safe-area-inset-bottom)] data-[vaul-drawer-direction=bottom]:shadow-[0_-16px_48px_-16px_rgb(0_0_0/0.3)]",
          // top
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[88dvh] data-[vaul-drawer-direction=top]:rounded-b-[20px] data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=top]:border-border/70 data-[vaul-drawer-direction=top]:shadow-[0_16px_48px_-16px_rgb(0_0_0/0.3)]",
          // right — full-height panel with notch clearance
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-[86%] data-[vaul-drawer-direction=right]:max-w-sm data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:border-border/70 data-[vaul-drawer-direction=right]:pe-[env(safe-area-inset-right)] data-[vaul-drawer-direction=right]:shadow-[-16px_0_48px_-16px_rgb(0_0_0/0.3)]",
          // left
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-[86%] data-[vaul-drawer-direction=left]:max-w-sm data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:border-border/70 data-[vaul-drawer-direction=left]:ps-[env(safe-area-inset-left)] data-[vaul-drawer-direction=left]:shadow-[16px_0_48px_-16px_rgb(0_0_0/0.3)]",
          "dark:data-[vaul-drawer-direction=bottom]:shadow-[0_-24px_64px_-16px_rgb(0_0_0/0.7)]",
          className,
        )}
        {...props}
      >
        {showHandle && <DrawerHandle />}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}
DrawerContent.displayName = "DrawerContent";

// ─────────────────────────────────────────────────────────────
// Header / Body / Footer / Title / Description
// ─────────────────────────────────────────────────────────────

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 px-6 pt-5 text-start", className)}
      {...props}
    />
  );
}
DrawerHeader.displayName = "DrawerHeader";

/** Scrollable body region — sticky header/footer stay pinned while this scrolls. */
function DrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-body"
      data-lenis-prevent
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4",
        "[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
        className,
      )}
      {...props}
    />
  );
}
DrawerBody.displayName = "DrawerBody";

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "mt-auto flex flex-col gap-2 px-6 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
        "sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
DrawerFooter.displayName = "DrawerFooter";

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-[17px] font-semibold tracking-tight text-balance", className)}
      {...props}
    />
  );
}
DrawerTitle.displayName = "DrawerTitle";

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm leading-6 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}
DrawerDescription.displayName = "DrawerDescription";

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHandle,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
