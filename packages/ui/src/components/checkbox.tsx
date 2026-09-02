"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  invalid?: boolean;
}

function Checkbox({ className, invalid, ...props }: CheckboxProps) {
  return (
    <label
      data-slot="checkbox"
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-input bg-background size-5 shadow-xs/5 transition-colors has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground has-[input:checked]:border-primary has-[input:disabled]:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        invalid && "border-destructive ring-1 ring-destructive/20",
        className
      )}
      aria-invalid={invalid}
    >
      <input type="checkbox" className="peer sr-only" {...props} />
      <Check className="size-3.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
    </label>
  );
}

function CheckboxGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="checkbox-group" className={cn("flex flex-col gap-2", className)} {...props} />;
}

export { Checkbox, CheckboxGroup };
