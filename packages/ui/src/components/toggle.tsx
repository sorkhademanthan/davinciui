"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@workspace/ui/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium border transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-zinc-900 data-[state=on]:text-white data-[state=on]:border-zinc-900 dark:data-[state=on]:bg-white dark:data-[state=on]:text-zinc-900",
  {
    variants: {
      variant: {
        default: "bg-white border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800",
        outline: "bg-transparent border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50 shadow-sm",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-8 px-2 text-xs",
        lg: "h-10 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

function Toggle({ className, variant, size, pressed: controlledPressed, defaultPressed = false, onPressedChange, onClick, ...props }: ToggleProps) {
  const [internalPressed, setInternalPressed] = React.useState(defaultPressed);
  const pressed = controlledPressed !== undefined ? controlledPressed : internalPressed;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !pressed;
    if (controlledPressed === undefined) setInternalPressed(next);
    onPressedChange?.(next);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      data-slot="toggle"
      data-state={pressed ? "on" : "off"}
      aria-pressed={pressed}
      className={cn(toggleVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
