"use client";

import { cn } from "@workspace/ui/lib/utils";
import { ChevronDown } from "lucide-react";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Error state with destructive ring. Also honors `aria-invalid`. @default false */
  invalid?: boolean;
}

function NativeSelect({ className, invalid, children, ...props }: NativeSelectProps) {
  const ariaInvalid = invalid || props["aria-invalid"] ? true : undefined;
  return (
    <span
      data-slot="native-select"
      data-invalid={ariaInvalid || undefined}
      className={cn(
        // Same frame system as Input: hairline border, paper background,
        // inner top-light in light mode / top-glow in dark, soft focus halo.
        "group/native-select relative inline-flex w-full items-center rounded-lg border border-input bg-background bg-clip-padding text-sm shadow-xs/5 ring-ring/24",
        "transition-[border-color,box-shadow,background-color] duration-150 ease-out motion-reduce:transition-none",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)]",
        "hover:border-foreground/25",
        // The popup opens on mouse too, so ring on any focus-within —
        // opening the picker is the interaction worth marking.
        "focus-within:border-ring focus-within:shadow-none focus-within:ring-[3px]",
        "has-[select:disabled]:cursor-not-allowed has-[select:disabled]:bg-muted/60 has-[select:disabled]:opacity-60 has-[select:disabled]:shadow-none has-[select:disabled]:hover:border-input",
        "has-[select:disabled]:before:shadow-none",
        "has-aria-invalid:border-destructive/50 has-aria-invalid:bg-destructive/[0.04] has-aria-invalid:hover:border-destructive/60 focus-within:has-aria-invalid:border-destructive/60 focus-within:has-aria-invalid:ring-destructive/15",
        "dark:bg-input/40 dark:[color-scheme:dark]",
        "dark:not-has-[select:disabled]:not-focus-within:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
        "not-has-[select:disabled]:not-focus-within:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)]",
        // Listbox mode needs no picker chevron.
        "has-[[multiple]]:[&_svg]:hidden",
        className,
      )}
    >
      <select
        {...props}
        aria-invalid={ariaInvalid}
        className="h-9 w-full cursor-pointer appearance-none bg-transparent pe-9 ps-3 text-sm text-foreground outline-none invalid:text-muted-foreground/70 disabled:cursor-not-allowed [&>option]:bg-background [&[multiple]]:h-auto [&[multiple]]:pe-3 [&[multiple]]:py-2"
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute end-2.5 size-4 shrink-0 text-muted-foreground transition-colors duration-150 ease-out group-focus-within/native-select:text-foreground group-hover/native-select:text-foreground motion-reduce:transition-none"
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
