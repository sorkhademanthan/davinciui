"use client";

import { cn } from "@workspace/ui/lib/utils";
import { ChevronDown } from "lucide-react";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Error state with destructive ring. @default false */
  invalid?: boolean;
}

function NativeSelect({ className, invalid, children, ...props }: NativeSelectProps) {
  return (
    <span
      data-slot="native-select"
      className={cn(
        "relative inline-flex w-72 items-center rounded-lg border border-input bg-background text-sm shadow-xs transition-colors",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring",
        "has-[select:disabled]:opacity-50",
        invalid && "border-destructive ring-1 ring-destructive/20 focus-within:ring-destructive/40",
        className,
      )}
    >
      <select
        aria-invalid={invalid || undefined}
        className="h-10 w-full cursor-pointer appearance-none bg-transparent pe-9 ps-3 outline-none disabled:cursor-not-allowed [&>option]:bg-background"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute end-2.5 size-4 shrink-0 text-muted-foreground"
      />
    </span>
  );
}

function NativeSelectGroup({ className, ...props }: React.OptgroupHTMLAttributes<HTMLOptGroupElement>) {
  return <optgroup data-slot="native-select-group" className={cn(className)} {...props} />;
}

function NativeSelectOption({ className, ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option data-slot="native-select-option" className={cn(className)} {...props} />;
}

export { NativeSelect, NativeSelectGroup, NativeSelectOption };

export default NativeSelect;
