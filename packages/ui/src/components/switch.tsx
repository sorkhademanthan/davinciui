"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  invalid?: boolean;
  size?: "default" | "sm" | "lg";
}

function Switch({ className, checked: controlledChecked, defaultChecked = false, onCheckedChange, invalid, size = "default", disabled, onClick, ...props }: SwitchProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const checked = controlledChecked !== undefined ? controlledChecked : internalChecked;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const next = !checked;
    if (controlledChecked === undefined) setInternalChecked(next);
    onCheckedChange?.(next);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-invalid={invalid}
      data-state={checked ? "checked" : "unchecked"}
      data-slot="switch"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 data-[state=checked]:bg-primary",
        size === "default" && "h-6 w-11",
        size === "sm" && "h-5 w-9",
        size === "lg" && "h-7 w-14",
        invalid && "border-destructive ring-1 ring-destructive/20",
        className
      )}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-sm ring-0 transition-transform",
          size === "default" && "size-5 data-[state=checked]:translate-x-5",
          size === "sm" && "size-4 data-[state=checked]:translate-x-4",
          size === "lg" && "size-6 data-[state=checked]:translate-x-7",
          checked ? "translate-x-5" : "translate-x-0",
          size === "sm" && checked && "translate-x-4",
          size === "lg" && checked && "translate-x-7"
        )}
        data-state={checked ? "checked" : "unchecked"}
      />
    </button>
  );
}

export { Switch };
