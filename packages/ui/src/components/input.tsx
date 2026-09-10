"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import type * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type InputSize = "sm" | "default" | "lg" | number;
export type InputVariant = "default" | "filled" | "ghost" | "underline";

export type InputProps = Omit<
  InputPrimitive.Props & React.RefAttributes<HTMLInputElement>,
  "size"
> & {
  /** Height / density. Numeric values map to the native `size` attribute. @default "default" */
  size?: InputSize;
  /** Visual treatment. `filled` / `ghost` suit dense toolbars; `underline` suits minimal marketing forms. @default "default" */
  variant?: InputVariant;
  /** Shorthand for `aria-invalid` — paints the error ring and tint. @default false */
  invalid?: boolean;
  /** Strip all chrome (border, ring, background) — for composing custom fields. @default false */
  unstyled?: boolean;
  /** Render a native `<input>` instead of the Base UI primitive. @default false */
  nativeInput?: boolean;
  /** Extra classes for the inner `<input>` (e.g. `pe-9` when overlaying a trailing button). */
  inputClassName?: string;
};

const sizeStyles: Record<Exclude<InputSize, number>, string> = {
  sm: "h-8 px-[calc(--spacing(2.5)-1px)] text-[13px] leading-8 sm:h-7 sm:leading-7",
  default:
    "h-9 px-[calc(--spacing(3)-1px)] text-sm leading-9 sm:h-8 sm:leading-8",
  lg: "h-10 px-[calc(--spacing(3.5)-1px)] text-[15px] leading-10 sm:h-9 sm:leading-9",
};

const variantStyles: Record<InputVariant, string> = {
  default: "",
  filled:
    "border-transparent bg-muted/70 shadow-none before:hidden hover:bg-muted dark:bg-white/[0.06] dark:hover:bg-white/[0.09] has-focus-visible:border-ring has-focus-visible:bg-background dark:has-focus-visible:bg-input/40",
  ghost:
    "border-transparent bg-transparent shadow-none before:hidden hover:bg-muted/70 dark:hover:bg-white/[0.06] has-focus-visible:border-ring has-focus-visible:bg-background dark:has-focus-visible:bg-input/40",
  underline:
    "rounded-none border-0 border-b border-input bg-transparent px-1 shadow-none before:hidden hover:border-foreground/30 has-focus-visible:border-primary has-focus-visible:shadow-[0_1px_0_0_var(--primary)] has-focus-visible:ring-0",
};

export function Input({
  className,
  size = "default",
  variant = "default",
  invalid = false,
  unstyled = false,
  nativeInput = false,
  inputClassName,
  style,
  ...props
}: InputProps): React.ReactElement {
  const ariaInvalid = invalid || props["aria-invalid"] ? true : undefined;

  const innerClassName = cn(
    // Base — neutral luxury: quiet chrome, crisp type, honest caret.
    "w-full min-w-0 flex-1 rounded-[inherit] bg-transparent text-foreground caret-foreground outline-none",
    "placeholder:text-muted-foreground/60 placeholder:transition-colors focus:placeholder:text-muted-foreground/40",
    "selection:bg-primary/15 selection:text-foreground",
    "disabled:cursor-not-allowed",
    "[transition:background-color_5000000s_ease-in-out_0s] autofill:[-webkit-text-fill-color:var(--foreground)]",
    typeof size === "string" && sizeStyles[size],
    variant === "underline" && "px-1",
    props.type === "search" &&
      "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
    props.type === "file" &&
      "py-0 text-muted-foreground file:me-3 file:inline-flex file:h-6 file:items-center file:rounded-md file:border file:border-border file:bg-muted file:px-2 file:text-xs file:font-medium file:text-foreground file:transition-colors hover:file:bg-muted/60 hover:file:text-foreground",
    props.type === "number" &&
      "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&[type=number]]:[appearance:textfield]",
    props.type === "password" && "[&::-ms-reveal]:hidden",
    (props.type === "date" ||
      props.type === "time" ||
      props.type === "datetime-local" ||
      props.type === "month" ||
      props.type === "week") &&
      "dark:[color-scheme:dark]",
    inputClassName,
  );

  if (unstyled) {
    const Component = nativeInput ? "input" : InputPrimitive;
    return (
      <Component
        data-slot="input"
        data-size={size}
        data-variant={variant}
        data-invalid={ariaInvalid || undefined}
        aria-invalid={ariaInvalid}
        size={typeof size === "number" ? size : undefined}
        style={style}
        className={cn(innerClassName, className)}
        {...props}
      />
    );
  }

  const shared = {
    "data-slot": "input",
    "data-size": size,
    "data-variant": variant,
    "data-invalid": ariaInvalid || undefined,
    "aria-invalid": ariaInvalid,
    size: typeof size === "number" ? size : undefined,
    className: innerClassName,
  } as const;

  return (
    <span
      className={
        cn(
          // Frame — the memorable detail: hairline border, paper background,
          // inner top-light in light mode / top-glow in dark, soft focus halo.
          // Everything else stays quiet so focus feels like an event.
          "relative inline-flex w-full items-center rounded-lg border border-input bg-background bg-clip-padding text-base shadow-xs/5 ring-ring/24",
          "transition-[border-color,box-shadow,background-color] duration-150 ease-out motion-reduce:transition-none",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)]",
          "hover:border-foreground/25",
          "has-focus-visible:border-ring has-focus-visible:shadow-none has-focus-visible:ring-[3px]",
          "has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-muted/60 has-[:disabled]:opacity-60 has-[:disabled]:shadow-none has-[:disabled]:hover:border-input",
          "has-autofill:bg-foreground/[0.04] dark:has-autofill:bg-foreground/[0.08]",
          "has-aria-invalid:border-destructive/50 has-aria-invalid:bg-destructive/[0.04] has-aria-invalid:hover:border-destructive/60 has-focus-visible:has-aria-invalid:border-destructive/60 has-focus-visible:has-aria-invalid:ring-destructive/15",
          "has-[:disabled]:has-aria-invalid:bg-destructive/[0.02]",
          "dark:bg-input/40 dark:has-[:disabled]:bg-white/[0.03]",
          "dark:not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
          "not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)]",
          "has-[:disabled,[aria-invalid],:focus-visible]:before:shadow-none",
          "sm:text-sm dark:[color-scheme:dark]",
          size === "lg" && "rounded-xl",
          variantStyles[variant],
          variant === "underline" && "before:hidden",
          className,
        ) || undefined
      }
      data-size={size}
      data-variant={variant}
      data-invalid={ariaInvalid || undefined}
      data-slot="input-control"
    >
      {nativeInput ? (
        <input style={typeof style === "function" ? undefined : style} {...props} {...shared} />
      ) : (
        <InputPrimitive style={style} {...props} {...shared} />
      )}
    </span>
  );
}

export { InputPrimitive };
