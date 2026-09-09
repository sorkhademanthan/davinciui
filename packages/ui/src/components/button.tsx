import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

/* ------------------------------------------------------------------ */
/*  Sheen + spotlight — pure CSS pseudo-elements so they also work     */
/*  through `asChild` (no extra DOM, no Slot breakage).                */
/*                                                                     */
/*  --bx / --by are set on mousemove (see Button below) and drive a    */
/*  cursor-tracked radial highlight. The diagonal sweep runs on hover.  */
/* ------------------------------------------------------------------ */
const sheen =
  "after:content-[''] after:absolute after:inset-0 after:-translate-x-[160%] after:skew-x-[-20deg] after:bg-gradient-to-r after:from-transparent after:via-white/25 after:to-transparent hover:after:translate-x-[160%] after:transition-transform after:duration-700 after:ease-[cubic-bezier(0.23,1,0.32,1)] after:pointer-events-none"

const spotlight =
  "before:content-[''] before:absolute before:inset-0 before:opacity-0 hover:before:opacity-100 focus-visible:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none before:bg-[radial-gradient(140px_circle_at_var(--bx,50%)_var(--by,50%),rgba(255,255,255,0.28),transparent_70%)]"

const buttonVariants = cva(
  cn(
    "group/button relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-[10px] text-sm font-medium tracking-[-0.01em] select-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    // spring-like press physics — compress, don't sink (no layout shift)
    "transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-150 ease-[cubic-bezier(0.34,1.4,0.64,1)]",
    "active:scale-[0.97] active:duration-75",
    // refined focus ring (2px + offset, not shadcn's 3px blur)
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:before:hidden disabled:after:hidden",
    "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    // loading state driven by data-loading
    "data-[loading=true]:pointer-events-none data-[loading=true]:cursor-wait",
    "motion-reduce:transition-none motion-reduce:before:hidden motion-reduce:after:hidden motion-reduce:active:scale-100",
  ),
  {
    variants: {
      variant: {
        /* Primary — layered depth: top inner highlight, bottom inner
           shade, hairline ring, soft drop shadow + hover lift. */
        default: cn(
          "bg-primary bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0)_45%)] text-primary-foreground",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),inset_0_-1px_0_0_rgba(0,0,0,0.16),0_1px_2px_rgba(0,0,0,0.18),0_6px_16px_-6px_rgba(0,0,0,0.35)]",
          "ring-1 ring-inset ring-black/10 dark:ring-white/15",
          "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),inset_0_-1px_0_0_rgba(0,0,0,0.16),0_1px_2px_rgba(0,0,0,0.2),0_10px_24px_-8px_rgba(0,0,0,0.45)] hover:-translate-y-px hover:brightness-[1.06]",
          "active:translate-y-0 active:brightness-95 active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.28)]",
          sheen,
          spotlight,
        ),
        destructive: cn(
          "bg-destructive bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_45%)] text-white",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.2),0_6px_16px_-6px_oklch(0.577_0.245_27.325/0.6)]",
          "ring-1 ring-inset ring-black/10 dark:ring-white/10",
          "hover:-translate-y-px hover:brightness-[1.07] focus-visible:ring-destructive/40",
          "active:translate-y-0 active:brightness-95 active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.3)]",
          "dark:bg-destructive/80",
          sheen,
          spotlight,
        ),
        /* Secondary — soft tonal surface with hairline ring. */
        secondary: cn(
          "bg-secondary text-secondary-foreground",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]",
          "ring-1 ring-inset ring-black/[0.06] dark:ring-white/[0.08]",
          "hover:bg-secondary/70 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_4px_12px_-4px_rgba(0,0,0,0.15)]",
          "active:bg-secondary/90 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]",
        ),
        /* Outline — frosted surface, border brightens on hover. */
        outline: cn(
          "border border-border bg-background/80 text-foreground backdrop-blur-sm",
          "shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:bg-input/20",
          "hover:bg-accent hover:text-accent-foreground hover:border-foreground/20 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15)]",
          "active:bg-accent/80 active:shadow-none dark:hover:bg-input/40",
        ),
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/70 dark:hover:bg-accent/40",
        link: "rounded-none text-primary underline-offset-4 decoration-primary/30 hover:underline hover:decoration-primary active:text-primary/80 overflow-visible",
        /* Success — emerald solid with depth + sheen. */
        success: cn(
          "bg-emerald-600 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_45%)] text-white",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.2),0_6px_16px_-6px_rgba(16,185,129,0.6)]",
          "ring-1 ring-inset ring-black/10",
          "hover:-translate-y-px hover:brightness-[1.06]",
          "active:translate-y-0 active:brightness-95",
          "dark:bg-emerald-500 dark:text-emerald-950",
          sheen,
          spotlight,
        ),
        /* Gradient — signature premium CTA (violet → blue). */
        gradient: cn(
          "bg-[linear-gradient(135deg,#7c3aed,#4f46e5_45%,#2563eb)] text-white",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.25),0_8px_24px_-8px_rgba(99,102,241,0.8)]",
          "ring-1 ring-inset ring-white/20",
          "hover:-translate-y-px hover:brightness-[1.08] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_12px_32px_-8px_rgba(99,102,241,0.9)]",
          "active:translate-y-0 active:brightness-95",
          sheen,
          spotlight,
        ),
        /* Glass — frosted translucent, for overlays / heroes. */
        glass: cn(
          "border border-white/25 bg-white/10 text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_24px_-12px_rgba(0,0,0,0.4)] backdrop-blur-xl",
          "hover:bg-white/20 hover:border-white/40",
          "active:bg-white/15",
          "dark:border-white/15 dark:bg-white/[0.08] dark:hover:bg-white/[0.14]",
        ),
      },
      size: {
        // NOTE: h-/px- values for sm/default/lg/icon are intentionally
        // identical to stock shadcn so internal consumers (Calendar, …)
        // keep their layout. Only radius + typography were refined.
        xs: "h-7 gap-1.5 rounded-[8px] px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-[9px] px-3 text-[13px] has-[>svg]:px-2.5",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-10 gap-2 rounded-[11px] px-6 text-[15px] has-[>svg]:px-4",
        xl: "h-12 gap-2.5 rounded-[12px] px-8 text-base has-[>svg]:px-6 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-9",
        "icon-xs": "size-7 rounded-[8px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 rounded-[9px]",
        "icon-lg": "size-10 rounded-[11px] [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Async state — shows a spinner, announces via aria-busy, blocks re-clicks. */
  loading?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  onMouseMove,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled ?? loading

  // Cursor-tracked spotlight: write --bx/--by directly on the element
  // (no re-render per pixel, rAF-throttled by the browser paint cycle).
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()
      el.style.setProperty(
        "--bx",
        `${((e.clientX - rect.left) / rect.width) * 100}%`,
      )
      el.style.setProperty(
        "--by",
        `${((e.clientY - rect.top) / rect.height) * 100}%`,
      )
      onMouseMove?.(e as React.MouseEvent<HTMLButtonElement>)
    },
    [onMouseMove],
  )

  const classes = cn(buttonVariants({ variant, size, className }))

  // NOTE: Radix Slot calls React.Children.only, so the asChild branch must
  // pass exactly ONE child — no spinner fragment, no null + element pair.
  // (That pair was crashing SSR: "React.Children.only expected to receive
  // a single React element child".) Anchors can't take `disabled` either,
  // so expose disabled state via aria-disabled instead.
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        aria-disabled={isDisabled || undefined}
        className={classes}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      data-slot="button"
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      className={classes}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {loading ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          className="size-4 animate-spin"
        >
          <circle
            cx="8"
            cy="8"
            r="6.5"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
          <path
            d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : null}
      {children}
    </button>
  )
}

export { Button, buttonVariants }
