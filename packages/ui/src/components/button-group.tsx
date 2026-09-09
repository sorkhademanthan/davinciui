import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

/* ------------------------------------------------------------------ */
/*  Radius surgery uses LOGICAL props (rounded-s / rounded-e, -ms-px)  */
/*  so connected corners stay correct in RTL — stock shadcn uses       */
/*  physical rounded-l/r + border-l-0 and breaks under dir="rtl".      */
/*  Adjoining edges overlap by 1px (-ms-px / -mt-px) instead of        */
/*  deleting borders, so ring-1 solid Buttons collapse cleanly too     */
/*  (border-l-0 does nothing for ring shadows). Hovered / focused      */
/*  children raise above the seam via z-10.                            */
/* ------------------------------------------------------------------ */

const surgeryHorizontal =
  "[&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none [&>*+*]:-ms-px"

const surgeryVertical =
  "[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*+*]:-mt-px"

const buttonGroupVariants = cva(
  cn(
    "group/btngroup inline-flex w-fit items-stretch",
    // hovered / focused / active child paints over the 1px seam
    "[&>*]:relative [&>*:hover]:z-10 [&>*:focus-visible]:z-10 [&>*:active]:z-10",
    "[&>*:focus-visible]:outline-none",
    // composition: inputs breathe, selects don't stretch
    "[&>input]:min-w-0 [&>input]:flex-1 [&>select]:min-w-0",
  ),
  {
    variants: {
      variant: {
        /* One connected instrument — shared edges, outer corners kept. */
        connected: cn(
          "isolate",
          "drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
        ),
        /* Toolbar tray — frosted surface holding distinct controls
           (Linear / Vercel / Raycast command-bar look). Children keep
           their own radius + depth; the tray supplies elevation. */
        segmented: cn(
          "gap-1 rounded-[14px] border border-border/70 bg-muted/50 p-1 backdrop-blur-md",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_-16px_rgba(0,0,0,0.25)]",
          "dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.3),0_12px_32px_-16px_rgba(0,0,0,0.6)]",
          "focus-within:ring-2 focus-within:ring-ring/40 focus-within:ring-offset-1 focus-within:ring-offset-background",
          "motion-reduce:transition-none",
        ),
      },
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col",
      },
    },
    compoundVariants: [
      {
        variant: "connected",
        orientation: "horizontal",
        className: surgeryHorizontal,
      },
      {
        variant: "connected",
        orientation: "vertical",
        className: surgeryVertical,
      },
    ],
    defaultVariants: {
      variant: "connected",
      orientation: "horizontal",
    },
  },
)

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

function ButtonGroup({
  className,
  variant,
  orientation = "horizontal",
  role = "group",
  ...props
}: ButtonGroupProps) {
  return (
    <div
      data-slot="button-group"
      data-variant={variant ?? "connected"}
      data-orientation={orientation}
      role={role}
      aria-orientation={orientation === "vertical" ? "vertical" : undefined}
      className={cn(buttonGroupVariants({ variant, orientation }), className)}
      {...props}
    />
  )
}

/* Inset divider — deliberately NOT full-height (iOS / Linear style).
   Full-bleed hairlines look like table borders; a 4px inset reads as
   a control divider. */
function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <div
      data-slot="button-group-separator"
      data-orientation={orientation}
      aria-hidden="true"
      className={cn(
        "shrink-0 self-stretch bg-border",
        orientation === "vertical" ? "my-2 w-px" : "mx-2 h-px",
        className,
      )}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="button-group-text"
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border border-border/60 bg-muted/70 px-3 text-[13px] font-medium whitespace-nowrap text-muted-foreground",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
