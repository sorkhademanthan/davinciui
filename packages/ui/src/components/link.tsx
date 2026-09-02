"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "default" | "muted" | "underline";
  size?: "default" | "sm" | "lg";
}

function Link({ className, variant = "default", size = "default", ...props }: LinkProps) {
  return (
    <a
      data-slot="link"
      className={cn(
        "inline-flex items-center gap-1 font-medium underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        variant === "default" && "text-primary",
        variant === "muted" && "text-muted-foreground hover:text-foreground",
        variant === "underline" && "underline text-foreground",
        size === "sm" && "text-xs",
        size === "lg" && "text-base",
        className
      )}
      {...props}
    />
  );
}

export { Link };
