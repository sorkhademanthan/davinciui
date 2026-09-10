"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types + context — size, variant, and invalid cascade from the
// group so the field, icons, and buttons agree without the caller
// threading props through every child.
// ─────────────────────────────────────────────────────────────

export type InputGroupAddonAlign = "inline-start" | "inline-end" | "block-start" | "block-end";

export type InputGroupSize = "sm" | "default" | "lg";
export type InputGroupVariant = "default" | "filled" | "ghost" | "underline";

interface InputGroupContextValue {
  size: InputGroupSize;
  variant: InputGroupVariant;
  invalid: boolean;
}

const InputGroupContext = React.createContext<InputGroupContextValue>({
  size: "default",
  variant: "default",
  invalid: false,
});

function useInputGroup(): InputGroupContextValue {
  return React.useContext(InputGroupContext);
}

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Height / density, inherited by the field, icons, and buttons. @default "default" */
  size?: InputGroupSize;
  /** Visual treatment, inherited by the frame. @default "default" */
  variant?: InputGroupVariant;
  /** Shorthand for an invalid group — paints the error ring and marks the inner field. @default false */
  invalid?: boolean;
}

function isAddon(child: React.ReactNode): child is React.ReactElement<InputGroupAddonProps> {
  return React.isValidElement(child) && child.type === InputGroupAddon;
}

const groupVariantStyles: Record<InputGroupVariant, string> = {
  default: "",
  filled:
    "border-transparent bg-muted/70 shadow-none before:hidden hover:bg-muted dark:bg-white/[0.06] dark:hover:bg-white/[0.09] has-focus-visible:border-ring has-focus-visible:bg-background dark:has-focus-visible:bg-input/40",
  ghost:
    "border-transparent bg-transparent shadow-none before:hidden hover:bg-muted/70 dark:hover:bg-white/[0.06] has-focus-visible:border-ring has-focus-visible:bg-background dark:has-focus-visible:bg-input/40",
  underline:
    "rounded-none border-0 border-b border-input bg-transparent px-0 shadow-none before:hidden hover:border-foreground/30 has-focus-visible:border-primary has-focus-visible:shadow-[0_1px_0_0_var(--primary)] has-focus-visible:ring-0",
};

function InputGroup({ size = "default", variant = "default", invalid = false, className, children, ...props }: InputGroupProps) {
  const kids = React.Children.toArray(children);
  // Block addons stack above/below; everything else shares one middle row
  // in JSX order, so callers never think about wrappers — and unlike
  // grid-based groups, block + inline addons compose freely.
  const top = kids.filter((c) => isAddon(c) && (c.props.align ?? "inline-start") === "block-start");
  const bottom = kids.filter((c) => isAddon(c) && (c.props.align ?? "inline-start") === "block-end");
  const middle = kids.filter((c) => !isAddon(c) || !["block-start", "block-end"].includes(c.props.align ?? "inline-start"));
  const context = React.useMemo<InputGroupContextValue>(() => ({ size, variant, invalid }), [size, variant, invalid]);
  return (
    <InputGroupContext.Provider value={context}>
      <div
        data-slot="input-group"
        data-size={size}
        data-variant={variant}
        data-invalid={invalid || undefined}
        className={cn(
          // Frame — same system as Input: hairline border, paper background,
          // inner top-light in light mode / top-glow in dark, soft focus halo.
          "relative flex w-full flex-col rounded-lg border border-input bg-background bg-clip-padding text-base shadow-xs/5 ring-ring/24",
          "transition-[border-color,box-shadow,background-color] duration-150 ease-out motion-reduce:transition-none",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)]",
          "hover:border-foreground/25",
          "has-focus-visible:border-ring has-focus-visible:shadow-none has-focus-visible:ring-[3px]",
          "has-disabled:cursor-not-allowed has-disabled:bg-muted/60 has-disabled:opacity-60 has-disabled:shadow-none has-disabled:hover:border-input",
          "has-autofill:bg-foreground/[0.04] dark:has-autofill:bg-foreground/[0.08]",
          // Invalid via group prop (data) or inner field state (aria).
          "data-[invalid=true]:border-destructive/50 data-[invalid=true]:bg-destructive/[0.04] data-[invalid=true]:hover:border-destructive/60 data-[invalid=true]:has-focus-visible:border-destructive/60 data-[invalid=true]:has-focus-visible:ring-destructive/15",
          "has-aria-invalid:border-destructive/50 has-aria-invalid:bg-destructive/[0.04] has-aria-invalid:hover:border-destructive/60 has-focus-visible:has-aria-invalid:border-destructive/60 has-focus-visible:has-aria-invalid:ring-destructive/15",
          "dark:bg-input/40",
          "dark:not-has-disabled:not-has-focus-visible:not-data-[invalid=true]:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
          "not-has-disabled:not-has-focus-visible:not-data-[invalid=true]:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)]",
          "has-disabled:has-focus-visible:has-aria-invalid:before:shadow-none has-focus-visible:before:shadow-none data-[invalid=true]:before:shadow-none",
          "sm:text-sm dark:[color-scheme:dark]",
          size === "lg" && "rounded-xl before:rounded-[calc(var(--radius-xl)-1px)]",
          groupVariantStyles[variant],
          className,
        )}
        {...props}
      >
        {top}
        {middle.length > 0 && (
          <div className="flex min-w-0 flex-1 flex-row items-center has-[textarea]:items-start has-[textarea]:py-1">{middle}</div>
        )}
        {bottom}
      </div>
    </InputGroupContext.Provider>
  );
}

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Addon placement around the field. @default "inline-start" */
  align?: InputGroupAddonAlign;
}

const ADDON_ALIGN_CLASSES: Record<InputGroupAddonAlign, string> = {
  "inline-start": "flex-row items-center py-0 ps-2.5",
  "inline-end": "flex-row items-center py-0 pe-2.5",
  "block-start": "flex-col items-stretch gap-0.5 border-b border-border/70 bg-muted/40 px-3 py-2",
  "block-end": "flex-col items-stretch gap-0.5 border-t border-border/70 bg-muted/40 px-3 py-2",
};

function InputGroupAddon({ align = "inline-start", className, ...props }: InputGroupAddonProps) {
  const { size } = useInputGroup();
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex shrink-0 gap-1.5 text-sm text-muted-foreground select-none",
        "[&_svg]:shrink-0",
        size === "sm" ? "[&_svg]:size-3.5" : "[&_svg]:size-4",
        ADDON_ALIGN_CLASSES[align],
        // Docked buttons sit tight against the frame edge.
        "has-[[data-slot=input-group-button]]:gap-1 has-[[data-slot=input-group-button]]:py-1",
        align === "inline-end" && "has-[[data-slot=input-group-button]]:pe-1",
        align === "inline-start" && "has-[[data-slot=input-group-button]]:ps-1",
        (align === "block-start" || align === "block-end") &&
          "has-[[data-slot=input-group-button]]:flex-row has-[[data-slot=input-group-button]]:items-center",
        className,
      )}
      {...props}
    />
  );
}

export interface InputGroupTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

function InputGroupText({ className, ...props }: InputGroupTextProps) {
  return (
    <span
      data-slot="input-group-text"
      className={cn("shrink-0 text-sm whitespace-nowrap text-muted-foreground select-none", className)}
      {...props}
    />
  );
}

export type InputGroupButtonSize = "xs" | "sm" | "icon-xs" | "icon-sm";
export type InputGroupButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";

export interface InputGroupButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** @default "xs" */
  size?: InputGroupButtonSize;
  /** @default "default" */
  variant?: InputGroupButtonVariant;
}

const inputGroupButtonSizes: Record<InputGroupButtonSize, string> = {
  xs: "h-6 gap-1 rounded-md px-2 text-xs",
  sm: "h-7 gap-1.5 rounded-md px-2.5 text-xs",
  "icon-xs": "size-6 rounded-md [&_svg]:size-3.5",
  "icon-sm": "size-7 rounded-md [&_svg]:size-4",
};

const inputGroupButtonVariants: Record<InputGroupButtonVariant, string> = {
  default: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/70",
  secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/70",
  outline: "border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
};

function InputGroupButton({ size = "xs", variant = "default", className, type = "button", ...props }: InputGroupButtonProps) {
  return (
    <button
      data-slot="input-group-button"
      data-size={size}
      data-variant={variant}
      type={type}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 font-medium whitespace-nowrap transition-colors duration-150 ease-out outline-none select-none motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-ring/40",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        inputGroupButtonSizes[size],
        inputGroupButtonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export interface InputGroupInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Shorthand for `aria-invalid` — also painted by the group when `invalid` is set there. @default false */
  invalid?: boolean;
}

const groupInputSizes: Record<InputGroupSize, string> = {
  sm: "h-8 text-[13px] sm:h-7",
  default: "h-9 text-sm sm:h-8",
  lg: "h-10 text-[15px] sm:h-9",
};

function inputInnerPolish(type: React.InputHTMLAttributes<HTMLInputElement>["type"]): string {
  return cn(
    type === "search" &&
      "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
    type === "number" &&
      "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&[type=number]]:[appearance:textfield]",
    type === "password" && "[&::-ms-reveal]:hidden",
    (type === "date" || type === "time" || type === "datetime-local" || type === "month" || type === "week") &&
      "dark:[color-scheme:dark]",
  );
}

function InputGroupInput({ invalid = false, className, ...props }: InputGroupInputProps) {
  const { size, invalid: groupInvalid } = useInputGroup();
  const ariaInvalid = invalid || groupInvalid || props["aria-invalid"] ? true : undefined;
  return (
    <input
      {...props}
      data-slot="input-group-input"
      data-size={size}
      data-invalid={ariaInvalid || undefined}
      aria-invalid={ariaInvalid}
      className={cn(
        "min-w-0 flex-1 bg-transparent px-2.5 text-foreground caret-foreground outline-none",
        "placeholder:text-muted-foreground/60 placeholder:transition-colors focus:placeholder:text-muted-foreground/40",
        "selection:bg-primary/15 selection:text-foreground",
        "disabled:cursor-not-allowed",
        "[transition:background-color_5000000s_ease-in-out_0s] autofill:[-webkit-text-fill-color:var(--foreground)]",
        groupInputSizes[size],
        inputInnerPolish(props.type),
        className,
      )}
    />
  );
}

export interface InputGroupTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Shorthand for `aria-invalid` — also painted by the group when `invalid` is set there. @default false */
  invalid?: boolean;
}

const groupTextareaSizes: Record<InputGroupSize, string> = {
  sm: "min-h-16 text-[13px]",
  default: "min-h-20 text-sm",
  lg: "min-h-24 text-[15px]",
};

function InputGroupTextarea({ invalid = false, className, ...props }: InputGroupTextareaProps) {
  const { size, invalid: groupInvalid } = useInputGroup();
  const ariaInvalid = invalid || groupInvalid || props["aria-invalid"] ? true : undefined;
  return (
    <textarea
      {...props}
      data-slot="input-group-textarea"
      data-size={size}
      data-invalid={ariaInvalid || undefined}
      aria-invalid={ariaInvalid}
      className={cn(
        "min-w-0 flex-1 resize-y bg-transparent px-2.5 py-2 text-foreground caret-foreground outline-none",
        "placeholder:text-muted-foreground/60 placeholder:transition-colors focus:placeholder:text-muted-foreground/40",
        "selection:bg-primary/15 selection:text-foreground",
        "disabled:cursor-not-allowed",
        groupTextareaSizes[size],
        className,
      )}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  useInputGroup,
};

export default InputGroup;
