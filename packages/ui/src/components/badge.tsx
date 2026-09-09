"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit items-center justify-center gap-1.5 rounded-full border font-medium whitespace-nowrap tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-xs",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white shadow-xs dark:bg-destructive/60",
        outline: "border-border bg-background text-foreground shadow-xs",
        ghost: "border-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
        info: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
        success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
      },
      size: {
        sm: "px-2 py-px text-[11px]",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-[13px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  /** Render a dismiss button. Label it for assistive tech. Ignored with asChild. */
  onRemove?: () => void;
  removeLabel?: string;
}

function Badge({ className, variant, size, asChild = false, onRemove, removeLabel = "Remove", children, ...props }: BadgeProps) {
  // NOTE: asChild renders Slot with exactly one child — the dismiss button
  // only exists on the default path, and onRemove is ignored with asChild.
  if (asChild) {
    return (
      <Slot data-slot="badge" data-variant={variant ?? "default"} data-size={size ?? "default"} className={cn(badgeVariants({ variant, size }), className)} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <span data-slot="badge" data-variant={variant ?? "default"} data-size={size ?? "default"} className={cn(badgeVariants({ variant, size }), onRemove && "pe-1", className)} {...props}>
      {children}
      {onRemove ? (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-colors hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-ring/40 dark:hover:bg-white/15 [&_svg]:size-2.5"
        >
          <X />
        </button>
      ) : null}
    </span>
  );
}

export interface BadgeDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Ping behind the dot for live states. @default false */
  pulse?: boolean;
}

function BadgeDot({ pulse = false, className, ...props }: BadgeDotProps) {
  return (
    <span data-slot="badge-dot" className={cn("relative flex size-1.5 shrink-0", className)} {...props}>
      {pulse ? <span aria-hidden className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" /> : null}
      <span aria-hidden className="relative inline-flex size-1.5 rounded-full bg-current" />
    </span>
  );
}

export { Badge, BadgeDot, badgeVariants };

export default Badge;
