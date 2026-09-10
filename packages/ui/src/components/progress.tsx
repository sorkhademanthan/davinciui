"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "@workspace/ui/lib/utils";

export type ProgressVariant = "primary" | "default" | "success" | "warning" | "destructive";
export type ProgressSize = "xs" | "sm" | "default" | "lg";

const progressIndicatorVariants: Record<ProgressVariant, string> = {
  primary: "bg-primary",
  default: "bg-foreground",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-destructive",
};

const progressTrackSizes: Record<ProgressSize, string> = {
  xs: "h-1",
  sm: "h-1.5",
  default: "h-2",
  lg: "h-3",
};

export interface ProgressProps extends Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "render" | "value"> {
  /** Current value. Null sweeps an indeterminate bar. @default 0 */
  value?: number | null;
  /** Indicator treatment. @default "primary" */
  variant?: ProgressVariant;
  /** Track height. @default "default" */
  size?: ProgressSize;
}

function Progress({
  className,
  children,
  value = 0,
  min = 0,
  max = 100,
  variant = "primary",
  size = "default",
  ...props
}: ProgressProps) {
  const pct = value == null ? null : Math.min(100, Math.max(0, ((value - min) / Math.max(1, max - min)) * 100));
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-variant={variant}
      data-size={size}
      value={value}
      min={min}
      max={max}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
      <ProgressPrimitive.Track
        data-slot="progress-track"
        className={cn("relative w-full overflow-hidden rounded-full bg-muted", progressTrackSizes[size])}
      >
        {pct == null ? (
          <>
            <style>{`@keyframes dcp-progress-sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }`}</style>
            <ProgressPrimitive.Indicator
              data-slot="progress-indicator"
              className={cn(
                "absolute inset-y-0 left-0 w-2/5 rounded-full motion-reduce:animate-none",
                progressIndicatorVariants[variant],
                "animate-[dcp-progress-sweep_1.2s_ease-in-out_infinite]"
              )}
            />
          </>
        ) : (
          <ProgressPrimitive.Indicator
            data-slot="progress-indicator"
            className={cn(
              "h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none",
              progressIndicatorVariants[variant]
            )}
            style={{ width: `${pct}%` }}
          />
        )}
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  );
}

function ProgressLabel({ className, ...props }: React.ComponentProps<typeof ProgressPrimitive.Label>) {
  return (
    <ProgressPrimitive.Label
      data-slot="progress-label"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: React.ComponentProps<typeof ProgressPrimitive.Value>) {
  return (
    <ProgressPrimitive.Value
      data-slot="progress-value"
      className={cn("text-sm tabular-nums text-muted-foreground", className)}
      {...props}
    />
  );
}

function ProgressTrack({ className, ...props }: React.ComponentProps<typeof ProgressPrimitive.Track>) {
  return (
    <ProgressPrimitive.Track
      data-slot="progress-track"
      className={cn("relative w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    />
  );
}

function ProgressIndicator({ className, style, ...props }: React.ComponentProps<typeof ProgressPrimitive.Indicator>) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none", className)}
      style={style}
      {...props}
    />
  );
}

export { Progress, ProgressLabel, ProgressValue, ProgressTrack, ProgressIndicator };
