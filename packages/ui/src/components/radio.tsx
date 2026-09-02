"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  invalid?: boolean;
}

function RadioGroup({ className, invalid, ...props }: RadioGroupProps) {
  return <div data-slot="radio-group" role="radiogroup" aria-invalid={invalid} className={cn("grid gap-2", className)} {...props} />;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  invalid?: boolean;
}

function Radio({ className, invalid, ...props }: RadioProps) {
  return (
    <label
      data-slot="radio"
      className={cn(
        "flex items-center gap-2 text-sm font-medium has-[input:disabled]:opacity-50 aria-invalid:text-destructive",
        invalid && "text-destructive",
        className
      )}
      aria-invalid={invalid}
    >
      <span className={cn("relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input shadow-xs/5 has-[input:checked]:border-primary has-[input:checked]:bg-primary has-[input:disabled]:opacity-50", invalid && "border-destructive")}>
        <input type="radio" className="peer sr-only" {...props} />
        <span className="size-2 rounded-full bg-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
      </span>
      <span>{props.value as string}</span>
      {props.children}
    </label>
  );
}

function RadioItem({ className, children, ...props }: RadioProps) {
  // Alias for Radio for API compat with docs expecting RadioGroup + RadioItem
  return <Radio className={className} {...props}>{children}</Radio>;
}

export { RadioGroup, Radio, RadioItem };
