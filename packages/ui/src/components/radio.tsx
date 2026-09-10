"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  invalid?: boolean;
}

function RadioGroup({ className, invalid, ...props }: RadioGroupProps) {
  return (
    <div
      data-slot="radio-group"
      role="radiogroup"
      aria-invalid={invalid || undefined}
      data-invalid={invalid || undefined}
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  invalid?: boolean;
}

function Radio({ className, invalid, children, ...props }: RadioProps) {
  return (
    <label
      data-slot="radio"
      data-invalid={invalid || undefined}
      className={cn(
        "flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors duration-150 ease-out select-none motion-reduce:transition-none",
        "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
        "has-[input:focus-visible]:outline-none",
        "has-[input:not(:checked)]:hover:text-foreground",
        invalid ? "text-destructive" : "has-[input:checked]:text-foreground",
        className
      )}
      aria-invalid={invalid || undefined}
    >
      <span
        data-slot="radio-dot"
        className={cn(
          "relative flex size-4 shrink-0 items-center justify-center rounded-full border shadow-xs/5",
          "bg-background transition-[border-color,box-shadow,background-color] duration-150 ease-out motion-reduce:transition-none",
          invalid
            ? "border-destructive/60"
            : "border-input has-[input:checked]:border-primary has-[input:checked]:bg-primary",
          // Keyboard focus halo — the sr-only input can't show one itself.
          "has-[input:focus-visible]:border-ring has-[input:focus-visible:ring-[3px] has-[input:focus-visible]:ring-ring/30",
          invalid &&
            "has-[input:focus-visible]:border-destructive has-[input:focus-visible]:ring-destructive/20",
          "has-[input:disabled]:shadow-none"
        )}
      >
        <input type="radio" className="peer sr-only" {...props} />
        <span
          aria-hidden
          className="size-2 scale-50 rounded-full bg-primary-foreground opacity-0 transition-all duration-150 ease-out peer-checked:scale-100 peer-checked:opacity-100 motion-reduce:transition-none"
        />
      </span>
      <span>{props.value as string}</span>
      {children}
    </label>
  );
}

function RadioItem({ className, children, ...props }: RadioProps) {
  // Alias for Radio for API compat with docs expecting RadioGroup + RadioItem
  return <Radio className={className} {...props}>{children}</Radio>;
}

export { RadioGroup, Radio, RadioItem };
