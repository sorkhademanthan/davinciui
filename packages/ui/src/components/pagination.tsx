"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

export type PaginationVariant = "default" | "pill";

function Pagination({ variant = "default", className, ...props }: React.ComponentProps<"nav"> & { variant?: PaginationVariant }) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      data-variant={variant}
      className={cn(
        "mx-auto flex w-full justify-center",
        variant === "pill" && "w-fit rounded-full border border-input bg-background/80 px-2 py-1 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex flex-row items-center gap-1", className)} {...props} />;
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

export type PaginationLinkVariant = "outline" | "solid" | "ghost";

type PaginationLinkProps = {
  isActive?: boolean;
  /** Active-page treatment. @default "outline" */
  variant?: PaginationLinkVariant;
} & Omit<React.ComponentProps<typeof Button>, "variant">;

const activeButtonVariant = {
  outline: "outline",
  solid: "default",
  ghost: "secondary",
} as const;

function PaginationLink({ className, isActive, variant = "outline", size = "icon", ...props }: PaginationLinkProps) {
  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive || undefined}
      variant={isActive ? activeButtonVariant[variant] : "ghost"}
      size={size}
      className={cn("tabular-nums", className)}
      {...props}
    />
  );
}

interface PaginationEdgeProps extends Omit<React.ComponentProps<typeof PaginationLink>, "children"> {
  /** Visible label, collapsed on small screens. @default "Previous" / "Next" */
  text?: string;
  /** Render the text label. @default true */
  showText?: boolean;
}

function PaginationPrevious({ text = "Previous", showText = true, className, ...props }: PaginationEdgeProps) {
  return (
    <PaginationLink aria-label="Go to previous page" size="default" className={cn("gap-1 px-2.5", className)} {...props}>
      <ChevronLeft className="size-4" aria-hidden />
      {showText ? <span className="hidden sm:block">{text}</span> : null}
    </PaginationLink>
  );
}

function PaginationNext({ text = "Next", showText = true, className, ...props }: PaginationEdgeProps) {
  return (
    <PaginationLink aria-label="Go to next page" size="default" className={cn("gap-1 px-2.5", className)} {...props}>
      {showText ? <span className="hidden sm:block">{text}</span> : null}
      <ChevronRight className="size-4" aria-hidden />
    </PaginationLink>
  );
}

function PaginationFirst({ className, ...props }: Omit<React.ComponentProps<typeof PaginationLink>, "children">) {
  return (
    <PaginationLink aria-label="Go to first page" className={cn(className)} {...props}>
      <ChevronsLeft className="size-4" aria-hidden />
    </PaginationLink>
  );
}

function PaginationLast({ className, ...props }: Omit<React.ComponentProps<typeof PaginationLink>, "children">) {
  return (
    <PaginationLink aria-label="Go to last page" className={cn(className)} {...props}>
      <ChevronsRight className="size-4" aria-hidden />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span aria-hidden data-slot="pagination-ellipsis" className={cn("flex size-9 items-center justify-center text-muted-foreground", className)} {...props}>
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationFirst, PaginationLast, PaginationEllipsis };
