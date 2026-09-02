"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

function ButtonGroup({ className, orientation = "horizontal", ...props }: ButtonGroupProps) {
  return (
    <div
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(
        "inline-flex w-fit items-stretch [&>*]:flex-1 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:border-l-0",
        orientation === "vertical" && "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:border-l [&>*:not(:first-child)]:border-t-0",
        className
      )}
      {...props}
    />
  );
}

function ButtonGroupSeparator({ className, orientation = "vertical", ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      data-slot="button-group-separator"
      data-orientation={orientation}
      className={cn(
        "bg-border shrink-0",
        orientation === "vertical" ? "w-px" : "h-px w-full",
        className
      )}
      {...props}
    />
  );
}

function ButtonGroupText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="button-group-text"
      className={cn("inline-flex items-center justify-center gap-2 rounded-md border bg-muted px-3 text-sm font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText };
