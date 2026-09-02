"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@workspace/ui/lib/utils";

const spinnerVariants = cva("animate-spin text-muted-foreground", {
  variants: {
    size: {
      sm: "size-4",
      default: "size-6",
      lg: "size-8",
    },
  },
  defaultVariants: { size: "default" },
});

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, ...props }: SpinnerProps) {
  return (
    <div data-slot="spinner" role="status" aria-label="Loading" className={cn(spinnerVariants({ size }), className)} {...props}>
      <Loader2 className="size-full animate-spin" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export { Spinner, spinnerVariants };
