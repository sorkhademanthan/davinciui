"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Design notes — quiet surface, confident rhythm:
//  - role="status" announces the state to screen readers when it
//    appears after a filter, search, or list update.
//  - Mount entrance is a short fade + 8px rise (~200ms); exits
//    are instant. Fully reduced-motion safe.
//  - Media tiles carry the visual weight: a gradient icon tile,
//    a dashed drop-zone tile, or a blank host for custom media.
//  - Type is balanced/pretty-wrapped; actions get one clear row.
// ─────────────────────────────────────────────────────────────

function Empty({ className, role = "status", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty"
      role={role}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-5 rounded-xl p-6 text-center text-balance sm:p-8",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-200",
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="empty-header" className={cn("flex max-w-sm flex-col items-center gap-2.5 text-center", className)} {...props} />
  );
}

export type EmptyMediaVariant = "default" | "icon" | "dashed";

export interface EmptyMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * - "default": blank host for custom media (avatars, illustrations).
   * - "icon": gradient tile for a single lucide icon.
   * - "dashed": drop-zone tile for first-run / upload states.
   * @default "default"
   */
  variant?: EmptyMediaVariant;
}

function EmptyMedia({ variant = "default", className, ...props }: EmptyMediaProps) {
  const decorative = variant !== "default";
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      aria-hidden={decorative || undefined}
      className={cn(
        "mb-1 flex shrink-0 items-center justify-center",
        variant === "icon" &&
          "size-12 rounded-2xl border border-border/60 bg-gradient-to-b from-muted/80 to-muted/30 text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_4px_12px_-4px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_12px_-4px_rgba(0,0,0,0.5)] [&_svg:not([class*='size-'])]:size-6 [&_svg]:shrink-0",
        variant === "dashed" &&
          "size-12 rounded-2xl border border-dashed border-foreground/25 bg-muted/30 text-muted-foreground [&_svg:not([class*='size-'])]:size-6 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="empty-title" className={cn("text-[17px] font-semibold tracking-tight text-balance", className)} {...props} />
  );
}

function EmptyDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty-description"
      className={cn("text-sm/relaxed text-pretty text-muted-foreground [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4", className)}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="empty-content" className={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-3 text-sm text-balance", className)} {...props} />
  );
}

export { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent };

export default Empty;
