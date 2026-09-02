"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

function Select({ className, invalid, ...props }: SelectProps) {
  return (
    <select
      data-slot="select"
      aria-invalid={invalid}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs/5 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/32",
        className
      )}
      {...props}
    />
  );
}

function SelectGroup({ className, ...props }: React.OptgroupHTMLAttributes<HTMLOptGroupElement>) {
  return <optgroup data-slot="select-group" className={cn(className)} {...(props as any)} />;
}

function SelectItem({ className, ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option data-slot="select-item" className={cn(className)} {...props} />;
}

function SelectLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="select-label" className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)} {...props} />;
}

function SelectTrigger({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="select-trigger" className={cn("flex h-9 w-full items-center rounded-lg border bg-background px-3 text-sm", className)} {...props}>
      {children}
    </div>
  );
}

function SelectContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="select-content" className={cn("rounded-md border bg-popover p-1 shadow-md", className)} {...props}>
      {children}
    </div>
  );
}

function SelectValue({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span data-slot="select-value" className={cn(className)} {...props} />;
}

export { Select, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectContent, SelectValue };
