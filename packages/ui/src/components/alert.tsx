"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@workspace/ui/lib/utils";

export type AlertVariant = "default" | "info" | "success" | "warning" | "destructive";

const AlertContext = React.createContext<AlertVariant>("default");

const alertVariants = cva(
  "relative flex w-full items-start gap-3 overflow-hidden rounded-xl border px-4 py-3.5 text-sm shadow-xs",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        info: "border-blue-500/25 bg-blue-500/[0.07] dark:bg-blue-400/[0.08]",
        success: "border-emerald-500/25 bg-emerald-500/[0.07] dark:bg-emerald-400/[0.08]",
        warning: "border-amber-500/30 bg-amber-500/[0.08] dark:bg-amber-400/[0.09]",
        destructive: "border-destructive/30 bg-destructive/[0.06] dark:bg-destructive/[0.08]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

function Alert({ className, variant = "default", role = "alert", ...props }: AlertProps) {
  const resolved = variant ?? "default";
  return (
    <AlertContext.Provider value={resolved}>
      <div data-slot="alert" data-variant={resolved} role={role} className={cn(alertVariants({ variant: resolved }), className)} {...props} />
    </AlertContext.Provider>
  );
}

const alertIconTones: Record<AlertVariant, string> = {
  default: "border-border bg-muted text-foreground",
  info: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  destructive: "border-destructive/25 bg-destructive/10 text-destructive",
};

function AlertIcon({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const variant = React.useContext(AlertContext);
  return (
    <span
      data-slot="alert-icon"
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border [&_svg:not([class*='size-'])]:size-4",
        alertIconTones[variant],
        className
      )}
      {...props}
    />
  );
}

function AlertBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="alert-body" className={cn("flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5", className)} {...props} />
  );
}

const alertTitleTones: Record<AlertVariant, string> = {
  default: "text-foreground",
  info: "text-foreground",
  success: "text-foreground",
  warning: "text-foreground",
  destructive: "text-destructive",
};

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const variant = React.useContext(AlertContext);
  return (
    <h5
      data-slot="alert-title"
      className={cn("text-sm font-medium tracking-tight", alertTitleTones[variant], className)}
      {...props}
    />
  );
}

const alertDescriptionTones: Record<AlertVariant, string> = {
  default: "text-muted-foreground",
  info: "text-blue-900/75 dark:text-blue-100/70",
  success: "text-emerald-900/75 dark:text-emerald-100/70",
  warning: "text-amber-900/80 dark:text-amber-100/70",
  destructive: "text-destructive/90",
};

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const variant = React.useContext(AlertContext);
  return (
    <div
      data-slot="alert-description"
      className={cn("text-[13px] leading-5 [&_p]:leading-6", alertDescriptionTones[variant], className)}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-action"
      className={cn("flex shrink-0 items-center gap-2 self-center ms-auto ps-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertIcon, AlertBody, AlertTitle, AlertDescription, AlertAction, alertVariants };

export default Alert;
