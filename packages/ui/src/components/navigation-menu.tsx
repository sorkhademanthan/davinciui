"use client";

import * as React from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@workspace/ui/lib/utils";

// ─────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────

export type NavigationMenuVariant = "default" | "pill";

export interface NavigationMenuProps extends React.ComponentProps<typeof NavigationMenuPrimitive.Root> {
  /** Bar treatment. Pill renders a floating frosted bar. @default "default" */
  variant?: NavigationMenuVariant;
}

function NavigationMenu({
  variant = "default",
  className,
  children,
  ...props
}: NavigationMenuProps) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-variant={variant}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        variant === "pill" &&
          "rounded-full border border-input bg-background/80 px-1.5 py-1 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-input/40",
        className
      )}
      {...props}
    >
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  );
}
NavigationMenu.displayName = "NavigationMenu";

// ─────────────────────────────────────────────────────────────
// List
// ─────────────────────────────────────────────────────────────

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Item
// ─────────────────────────────────────────────────────────────

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Trigger
// ─────────────────────────────────────────────────────────────

export type NavigationMenuTriggerVariant = "default" | "solid" | "underline";
export type NavigationMenuTriggerSize = "sm" | "default";

const navigationMenuTriggerStyle = cva(
  "group inline-flex w-max items-center justify-center gap-1.5 rounded-md text-sm font-medium outline-none select-none transition-all duration-150 ease-out motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/40 [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        // Quiet ghost — hover and open share the accent wash.
        default:
          "h-9 px-4 hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground data-[popup-open]:bg-accent/60 data-[popup-open]:text-accent-foreground",
        // Inverted pill — the open trigger flips to foreground.
        solid:
          "h-9 rounded-full px-4 hover:bg-muted hover:text-foreground focus-visible:bg-muted data-[popup-open]:bg-foreground data-[popup-open]:text-background data-[popup-open]:hover:bg-foreground/90",
        // Stripe-style line — state reads from the underline bar.
        underline:
          "relative h-9 rounded-none px-3 text-muted-foreground after:absolute after:inset-x-2.5 after:bottom-0.5 after:h-[2px] after:origin-center after:scale-x-0 after:rounded-full after:bg-current after:transition-transform after:duration-200 after:motion-reduce:transition-none hover:bg-transparent hover:text-foreground focus-visible:text-foreground hover:after:scale-x-100 focus-visible:after:scale-x-100 data-[popup-open]:text-foreground data-[popup-open]:after:scale-x-100",
      },
      size: {
        default: "",
        sm: "h-8 px-3 text-[13px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface NavigationMenuTriggerProps
  extends React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>,
    VariantProps<typeof navigationMenuTriggerStyle> {}

function NavigationMenuTrigger({
  variant,
  size,
  className,
  children,
  ...props
}: NavigationMenuTriggerProps) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      data-variant={variant ?? "default"}
      className={cn(navigationMenuTriggerStyle({ variant, size }), className)}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Icon className="relative">
        <ChevronDown className="size-3 shrink-0 opacity-60 transition-transform duration-200 group-data-[popup-open]:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  );
}

// ─────────────────────────────────────────────────────────────
// Content
// ─────────────────────────────────────────────────────────────

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-2 md:w-auto",
        "data-[open]:animate-in data-[closed]:animate-out data-[open]:fade-in-0 data-[closed]:fade-out-0 data-[open]:zoom-in-95 data-[closed]:zoom-out-95 data-[open]:slide-in-from-top-1 data-[closed]:slide-out-to-top-1 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 duration-200 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Viewport — portal + positioner + popup
// ─────────────────────────────────────────────────────────────

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        data-slot="navigation-menu-positioner"
        className="z-50 flex justify-center"
        sideOffset={8}
        collisionPadding={{ top: 8, bottom: 8, left: 16, right: 16 }}
      >
        <NavigationMenuPrimitive.Popup
          data-slot="navigation-menu-popup"
          className={cn(
            "relative mt-1.5 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl ring-1 ring-black/5 dark:ring-white/10",
            "origin-top-center data-[open]:animate-in data-[closed]:animate-out data-[open]:fade-in-0 data-[closed]:fade-out-0 data-[open]:zoom-in-95 data-[closed]:zoom-out-95",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 duration-200 motion-reduce:animate-none",
            className,
          )}
        >
          <NavigationMenuPrimitive.Viewport
            data-slot="navigation-menu-viewport"
            className={cn(
              "relative h-[var(--positioner-height)] w-full origin-[var(--transform-origin)] overflow-hidden md:w-[var(--positioner-width)]",
              "transition-[width,height] duration-200 motion-reduce:transition-none",
              className,
            )}
            {...props}
          />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

// ─────────────────────────────────────────────────────────────
// Link
// ─────────────────────────────────────────────────────────────

export interface NavigationMenuLinkProps extends React.ComponentProps<typeof NavigationMenuPrimitive.Link> {
  /** Current-page state with aria-current. @default false */
  active?: boolean;
}

function NavigationMenuLink({
  active = false,
  className,
  ...props
}: NavigationMenuLinkProps) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      data-active={active || undefined}
      aria-current={active ? "page" : props["aria-current"]}
      className={cn(
        "block rounded-md p-3 leading-none no-underline outline-none select-none transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transition-none",
        "data-[active]:bg-accent/60 data-[active]:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Indicator (arrow) — optional visual cue
// ─────────────────────────────────────────────────────────────

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navigation-menu-indicator"
      className={cn("top-full z-[1] hidden", className)}
      {...props}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
  NavigationMenuIndicator,
  navigationMenuTriggerStyle,
};
