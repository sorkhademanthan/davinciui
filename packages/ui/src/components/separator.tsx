"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout direction. @default "horizontal" */
  orientation?: SeparatorOrientation;
  /** Purely visual divider. False exposes role="separator" with aria-orientation. @default true */
  decorative?: boolean;
  /** Ref to the underlying divider element. */
  ref?: React.Ref<HTMLDivElement>;
}

function Separator({
  orientation = "horizontal",
  decorative = true,
  className,
  ref,
  ...props
}: SeparatorProps) {
  return (
    <div
      ref={ref}
      data-slot="separator"
      data-orientation={orientation}
      role={decorative ? "presentation" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      aria-hidden={decorative || undefined}
      className={cn(
        "bg-border shrink-0",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        // Vertical dividers must survive row layouts that center their
        // children (items-center) or have an indefinite height: self-stretch
        // keeps the line spanning the row even when h-full cannot resolve.
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className
      )}
      {...props}
    />
  );
}

export { Separator };

export default Separator;
