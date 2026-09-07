"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Separator } from "./separator";

const itemVariants = cva("group/item flex flex-wrap items-center rounded-md border border-transparent text-sm transition-colors", {
  variants: {
    variant: {
      default: "bg-transparent",
      outline: "border-border",
      muted: "bg-muted/50",
    },
    size: {
      default: "gap-4 p-4",
      sm: "gap-2.5 px-4 py-3",
      xs: "gap-2 px-3 py-2",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ItemVariant = NonNullable<VariantProps<typeof itemVariants>["variant"]>;
export type ItemSize = NonNullable<VariantProps<typeof itemVariants>["size"]>;

export interface ItemProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof itemVariants> {
  /** Render the item as a different element, e.g. a link. Hover/focus states follow. */
  render?: React.ReactElement;
}

function Item({ variant, size, render, className, children, ...props }: ItemProps) {
  const itemProps = {
    "data-slot": "item",
    "data-variant": variant ?? "default",
    "data-size": size ?? "default",
    className: cn(itemVariants({ variant, size }), "[a&]:hover:bg-accent/50 [a&]:hover:text-accent-foreground", className),
    ...props,
  } as React.HTMLAttributes<HTMLDivElement> & { "data-slot": string };
  if (render && React.isValidElement(render)) {
    const element = render as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
    return React.cloneElement(element, {
      ...itemProps,
      ...element.props,
      className: cn(itemProps.className, element.props.className),
      children: children ?? element.props.children,
    });
  }
  return <div {...itemProps}>{children}</div>;
}

function ItemGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="item-group" className={cn("flex w-full flex-col gap-2", className)} {...props} />
  );
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="item-separator" orientation="horizontal" className={cn("my-0", className)} {...props} />;
}

export type ItemMediaVariant = "default" | "icon" | "image";

export interface ItemMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Media treatment. @default "default" */
  variant?: ItemMediaVariant;
}

function ItemMedia({ variant = "default", className, ...props }: ItemMediaProps) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(
        "flex shrink-0 items-center justify-center gap-2",
        variant === "icon" && "bg-muted size-8 rounded-sm [&_svg:not([class*='size-'])]:size-4",
        variant === "image" && "size-10 shrink-0 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover",
        className
      )}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="item-content" className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)} {...props} />
  );
}

function ItemTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="item-title" className={cn("flex w-fit items-center gap-2 text-sm leading-snug font-medium", className)} {...props} />
  );
}

function ItemDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="item-description"
      className={cn("text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance", className)}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="item-actions" className={cn("flex shrink-0 items-center gap-2", className)} {...props} />
  );
}

function ItemHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="item-header"
      className={cn("basis-full overflow-hidden rounded-sm [&_img]:aspect-video [&_img]:w-full [&_img]:object-cover", className)}
      {...props}
    />
  );
}

function ItemFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="item-footer" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />
  );
}

export {
  Item,
  ItemGroup,
  ItemSeparator,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemHeader,
  ItemFooter,
  itemVariants,
};

export default Item;
