"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

// ─────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

// ─────────────────────────────────────────────────────────────
// Trigger
// ─────────────────────────────────────────────────────────────

export interface SelectTriggerProps extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
  /** Height density. @default "default" */
  size?: "sm" | "default";
  /** Error state with destructive ring. @default false */
  invalid?: boolean;
}

function SelectTrigger({ className, size = "default", invalid = false, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      className={cn(
        // Same frame system as Input: hairline border, paper background,
        // inner top-light in light mode / top-glow in dark, soft focus halo.
        "group/select-trigger relative inline-flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-background bg-clip-padding text-sm shadow-xs/5 ring-ring/24",
        "transition-[border-color,box-shadow,background-color] duration-150 ease-out outline-none motion-reduce:transition-none",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)]",
        "hover:border-foreground/25",
        "focus-visible:border-ring focus-visible:shadow-none focus-visible:ring-[3px]",
        "data-[popup-open]:border-ring data-[popup-open]:shadow-none data-[popup-open]:ring-[3px]",
        "data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted/60 data-[disabled]:opacity-60 data-[disabled]:shadow-none data-[disabled]:hover:border-input",
        "data-[invalid]:border-destructive/50 data-[invalid]:bg-destructive/[0.04] data-[invalid]:hover:border-destructive/60",
        "dark:bg-input/40",
        "dark:not-data-[disabled]:not-focus-visible:not-data-[popup-open]:not-data-[invalid]:before:shadow-[0_-1px_--theme(--color-white/6%)]",
        "not-data-[disabled]:not-focus-visible:not-data-[popup-open]:not-data-[invalid]:before:shadow-[0_1px_--theme(--color-black/4%)]",
        size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-9 px-3",
        "[&>span]:line-clamp-1 [&>span]:truncate",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        data-slot="select-icon"
        className="pointer-events-none shrink-0 text-muted-foreground transition-all duration-150 ease-out group-focus-visible/select-trigger:text-foreground group-data-[popup-open]/select-trigger:rotate-180 group-data-[popup-open]/select-trigger:text-foreground motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4"
      >
        <ChevronsUpDown aria-hidden />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

// ─────────────────────────────────────────────────────────────
// Value
// ─────────────────────────────────────────────────────────────

function SelectValue({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("min-w-0 flex-1 truncate text-left data-[placeholder]:text-muted-foreground/70", className)}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Content
// ─────────────────────────────────────────────────────────────

export interface SelectContentProps extends React.ComponentProps<typeof SelectPrimitive.Popup> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
}

function SelectContent({
  className,
  children,
  align = "center",
  sideOffset = 4,
  alignOffset,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        data-slot="select-positioner"
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
        collisionPadding={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "relative z-50 max-h-72 min-w-[var(--positioner-width)] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl ring-1 ring-black/5 dark:ring-white/10",
            "origin-[var(--transform-origin)] data-[open]:animate-in data-[closed]:animate-out data-[open]:fade-in-0 data-[closed]:fade-out-0 data-[open]:zoom-in-95 data-[closed]:zoom-out-95",
            "data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 duration-150 motion-reduce:animate-none",
            className
          )}
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow
            data-slot="select-scroll-up"
            className="flex cursor-default items-center justify-center bg-popover py-1 text-muted-foreground"
          >
            <ChevronUp className="size-4" aria-hidden />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List
            data-slot="select-list"
            className="max-h-64 overflow-y-auto overscroll-contain p-1.5 outline-none" data-lenis-prevent
          >
            {children}
          </SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow
            data-slot="select-scroll-down"
            className="flex cursor-default items-center justify-center bg-popover py-1 text-muted-foreground"
          >
            <ChevronDown className="size-4" aria-hidden />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

// ─────────────────────────────────────────────────────────────
// Item
// ─────────────────────────────────────────────────────────────

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pe-2 ps-8 text-sm outline-none select-none",
        "transition-colors duration-100 ease-out motion-reduce:transition-none",
        "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute start-2 flex size-4 items-center justify-center" aria-hidden>
        <SelectPrimitive.ItemIndicator
          data-slot="select-item-indicator"
          className="[&_svg:not([class*='size-'])]:size-4"
        >
          <Check />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText data-slot="select-item-text" className="min-w-0 flex-1 truncate">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

// ─────────────────────────────────────────────────────────────
// Group / Label / Separator
// ─────────────────────────────────────────────────────────────

function SelectGroup({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn(className)} {...props} />;
}

function SelectGroupLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.GroupLabel>) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-group-label"
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground select-none", className)}
      {...props}
    />
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.GroupLabel>) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground select-none", className)}
      {...props}
    />
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1 my-1.5 h-px bg-border", className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
  SelectLabel,
  SelectSeparator,
};
