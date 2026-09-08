"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

function Empty({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg p-6 text-center text-balance",
        className
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="empty-header" className={cn("flex max-w-sm flex-col items-center gap-2 text-center", className)} {...props} />
  );
}

export type EmptyMediaVariant = "default" | "icon";

export interface EmptyMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon treatment with muted tile. @default "default" */
  variant?: EmptyMediaVariant;
}

function EmptyMedia({ variant = "default", className, ...props }: EmptyMediaProps) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      className={cn(
        "mb-2 flex shrink-0 items-center justify-center",
        variant === "icon" && "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="empty-title" className={cn("text-lg font-medium tracking-tight", className)} {...props} />
  );
}

function EmptyDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty-description"
      className={cn("text-muted-foreground text-sm/relaxed [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4", className)}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="empty-content" className={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance", className)} {...props} />
  );
}

export { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent };

export default Empty;
