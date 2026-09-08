"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const markerVariants = cva("group/marker flex w-full items-center gap-2 text-[13px] leading-6 text-muted-foreground", {
  variants: {
    variant: {
      default: "justify-center text-center",
      border: "justify-center border-b pb-3 text-center",
      separator: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type MarkerVariant = NonNullable<VariantProps<typeof markerVariants>["variant"]>;

export interface MarkerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof markerVariants> {
  /** Render as a different element, e.g. a link or button. */
  render?: React.ReactElement | ((props: React.HTMLAttributes<HTMLDivElement>) => React.ReactElement);
}

function Marker({ variant, render, className, children, ...props }: MarkerProps) {
  if (variant === "separator") {
    const content = (
      <>
        <span aria-hidden className="h-px flex-1 bg-border" />
        <span className="shrink-0">{children}</span>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </>
    );
    const separatorProps = {
      "data-slot": "marker",
      "data-variant": variant,
      className: cn(markerVariants({ variant }), "gap-3", className),
      ...props,
    } as React.HTMLAttributes<HTMLDivElement> & { "data-slot": string };
    if (render && React.isValidElement(render)) {
      const element = render as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
      return React.cloneElement(element, {
        ...separatorProps,
        ...element.props,
        className: cn(separatorProps.className, element.props.className),
        children: content,
      });
    }
    if (typeof render === "function") {
      return render(separatorProps);
    }
    return <div {...separatorProps}>{content}</div>;
  }

  const markerProps = {
    "data-slot": "marker",
    "data-variant": variant ?? "default",
    className: cn(markerVariants({ variant }), "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background", className),
    ...props,
  } as React.HTMLAttributes<HTMLDivElement> & { "data-slot": string };
  if (render && React.isValidElement(render)) {
    const element = render as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
    return React.cloneElement(element, {
      ...markerProps,
      ...element.props,
      className: cn(markerProps.className, element.props.className),
      children: children ?? element.props.children,
    });
  }
  if (typeof render === "function") {
    return render(markerProps);
  }
  return <div {...markerProps}>{children}</div>;
}

function MarkerIcon({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="marker-icon"
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}
    />
  );
}

function MarkerContent({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span data-slot="marker-content" className={cn("min-w-0 truncate", className)} {...props} />
  );
}

export { Marker, MarkerIcon, MarkerContent, markerVariants };

export default Marker;
