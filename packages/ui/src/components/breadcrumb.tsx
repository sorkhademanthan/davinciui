"use client";

import * as React from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@workspace/ui/lib/utils";

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

export interface BreadcrumbListProps extends React.ComponentProps<"ol"> {
  /** Separator rendered between items. Null disables. @default chevron */
  separator?: React.ReactNode;
  /** Collapse to first + last (maxItems - 1) rows behind an expander. */
  maxItems?: number;
}

function DefaultSeparator() {
  return <ChevronRight className="size-3.5 rtl:rotate-180" />;
}

function BreadcrumbList({ separator, maxItems, className, children, ...props }: BreadcrumbListProps) {
  const [expanded, setExpanded] = React.useState(false);

  const nodes = React.Children.toArray(children).filter((child) => React.isValidElement(child));
  const manual = nodes.some((child) => (child as React.ReactElement).type === BreadcrumbSeparator);

  let visible: React.ReactNode[] = nodes;
  let hiddenCount = 0;
  if (!manual && maxItems != null && nodes.length > maxItems && !expanded) {
    const tail = Math.max(maxItems - 1, 1);
    visible = [nodes[0], ...nodes.slice(nodes.length - tail)];
    hiddenCount = nodes.length - visible.length;
  }

  const renderSeparator = (key: React.Key) => (
    <BreadcrumbSeparator key={key}>{separator === undefined ? <DefaultSeparator /> : separator}</BreadcrumbSeparator>
  );

  // Legacy mode: explicit separators render untouched.
  if (manual || separator === null) {
    return (
      <ol data-slot="breadcrumb-list" className={cn("flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground", className)} {...props}>
        {manual ? children : nodes.flatMap((child, i) => (i === 0 ? [child] : [renderSeparator(`sep-${i}`), child]))}
      </ol>
    );
  }

  const rows: React.ReactNode[] = [];
  visible.forEach((child, i) => {
    if (i > 0) rows.push(renderSeparator(`sep-${i}`));
    // Collapsed middle becomes an expander button.
    if (hiddenCount > 0 && i === 1) {
      rows.push(
        <li key="ellipsis">
          <button
            type="button"
            aria-expanded={false}
            aria-label={`Show ${hiddenCount} more breadcrumbs`}
            title={`Show ${hiddenCount} more`}
            onClick={() => setExpanded(true)}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </li>
      );
      rows.push(renderSeparator("sep-ellipsis"));
    }
    rows.push(React.isValidElement(child) ? React.cloneElement(child, { key: (child as React.ReactElement).key ?? `item-${i}` } as object) : child);
  });

  return (
    <ol data-slot="breadcrumb-list" className={cn("flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground", className)} {...props}>
      {rows}
    </ol>
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

function BreadcrumbLink({ asChild, className, ...props }: React.ComponentProps<"a"> & { asChild?: boolean }) {
  if (asChild) {
    const { children, ...rest } = props as React.ComponentProps<"a"> & { children?: React.ReactNode };
    return (
      <Slot data-slot="breadcrumb-link" className={cn("rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40", className)} {...rest}>
        {children}
      </Slot>
    );
  }
  return <a data-slot="breadcrumb-link" className={cn("rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40", className)} {...props} />;
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" className={cn("font-normal text-foreground", className)} {...props} />;
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
      {children ?? <ChevronRight className="rtl:rotate-180" />}
    </li>
  );
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="breadcrumb-ellipsis" role="presentation" aria-hidden="true" className={cn("flex size-9 items-center justify-center", className)} {...props}>
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis };
