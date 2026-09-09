import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@workspace/ui/lib/utils";

/* ------------------------------------------------------------------ */
/*  Spotlight + border glow — one memorable moment, zero re-renders.    */
/*  --bx/--by are written directly on the element per mousemove; two    */
/*  compositor-only pseudo-elements do the rest: ::before washes the    */
/*  surface, ::after traces the border (padding-box mask so only a 1px  */
/*  ring catches the light). Dark earns the light; light gets a whisper */
/*  of shade so the effect never turns into a grey smudge. Opt-in per   */
/*  card — one treatment per view keeps the compositing bill (and the   */
/*  hierarchy) intact. Respects prefers-reduced-motion.                 */
/* ------------------------------------------------------------------ */
const spotlightLayer = cn(
  "before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 focus-visible:before:opacity-100",
  "before:bg-[radial-gradient(260px_circle_at_var(--bx,50%)_var(--by,50%),rgba(0,0,0,0.06),transparent_70%)]",
  "dark:before:bg-[radial-gradient(260px_circle_at_var(--bx,50%)_var(--by,50%),rgba(255,255,255,0.12),transparent_70%)]",
  "after:content-[''] after:absolute after:inset-0 after:rounded-2xl after:p-px after:pointer-events-none after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100 focus-visible:after:opacity-100",
  "after:bg-[radial-gradient(180px_circle_at_var(--bx,50%)_var(--by,50%),rgba(0,0,0,0.28),transparent_70%)]",
  "dark:after:bg-[radial-gradient(180px_circle_at_var(--bx,50%)_var(--by,50%),rgba(255,255,255,0.4),transparent_70%)]",
  "after:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] after:[mask-composite:exclude]",
  "motion-reduce:before:hidden motion-reduce:after:hidden",
);

/* Clickable affordance — lift on hover, compress on press, ring on      */
/* keyboard focus. Pair with `asChild` + <a>/<button>/<Link> so the     */
/* card keeps real semantics instead of a div-with-onClick.              */
const interactiveLayer = cn(
  "cursor-pointer touch-manipulation",
  "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "hover:-translate-y-0.5 hover:border-foreground/25",
  "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_2px_4px_rgba(0,0,0,0.06),0_32px_64px_-16px_rgba(0,0,0,0.28)]",
  "dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.35),0_32px_64px_-16px_rgba(0,0,0,0.75)]",
  "active:translate-y-0 active:scale-[0.995] active:duration-100",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:scale-100",
);

/* Status accent — a 2px gradient bar along the top edge painted as a    */
/* background layer (above the surface color, below content, clipped by  */
/* the card radius). No extra DOM, so `asChild` + Slot keeps its single  */
/* child and never trips React.Children.only.                            */
const statusAccent: Record<NonNullable<CardStatus>, string> = {
  success:
    "[background-image:linear-gradient(to_right,var(--color-emerald-500),color-mix(in_srgb,var(--color-emerald-500)_55%,transparent),transparent)]",
  info: "[background-image:linear-gradient(to_right,var(--color-blue-500),color-mix(in_srgb,var(--color-blue-500)_55%,transparent),transparent)]",
  warning:
    "[background-image:linear-gradient(to_right,var(--color-amber-500),color-mix(in_srgb,var(--color-amber-500)_55%,transparent),transparent)]",
  destructive:
    "[background-image:linear-gradient(to_right,var(--color-destructive),color-mix(in_srgb,var(--color-destructive)_55%,transparent),transparent)]",
};
const statusAccentSize = "[background-size:100%_2px] [background-repeat:no-repeat]";

type CardStatus = "success" | "info" | "warning" | "destructive";

const cardVariants = cva(
  "group/card relative isolate flex flex-col gap-(--card-spacing) overflow-hidden rounded-2xl py-(--card-spacing) text-sm text-card-foreground [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 has-[>[data-slot=card-media]:first-child]:pt-0 *:[img:first-child]:rounded-t-2xl *:[img:last-child]:rounded-b-2xl focus-within:ring-2 focus-within:ring-ring/30 motion-reduce:transition-none data-[selected=true]:border-foreground/30 data-[selected=true]:ring-1 data-[selected=true]:ring-foreground/25",
  {
    variants: {
      variant: {
        /* Quiet surface with a specular top edge + soft ambient shadow. */
        default: cn(
          "border border-border/70 bg-card",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_-16px_rgba(0,0,0,0.15)]",
          "dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_1px_2px_rgba(0,0,0,0.3),0_12px_32px_-16px_rgba(0,0,0,0.5)]",
        ),
        /* Feature / pricing surface — depth that deepens + lifts on hover. */
        elevated: cn(
          "border border-border/70 bg-card",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.06),0_24px_48px_-16px_rgba(0,0,0,0.22)]",
          "dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.35),0_24px_48px_-16px_rgba(0,0,0,0.65)]",
          "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:border-foreground/20",
          "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_2px_4px_rgba(0,0,0,0.06),0_32px_64px_-16px_rgba(0,0,0,0.28)]",
          "dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.35),0_32px_64px_-16px_rgba(0,0,0,0.75)]",
        ),
        /* Dense-dashboard surface — hairline only, no shadow. */
        outline: "border border-border/70 bg-card shadow-none",
        /* Frosted overlay surface — heroes, dialogs-on-media, floating panels. */
        glass: cn(
          "border border-white/25 bg-white/70 backdrop-blur-xl saturate-150",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_16px_40px_-16px_rgba(0,0,0,0.25)]",
          "dark:border-white/12 dark:bg-white/[0.06]",
          "dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_16px_40px_-16px_rgba(0,0,0,0.6)]",
        ),
      },
      size: {
        sm: "[--card-spacing:--spacing(3)]",
        default: "[--card-spacing:--spacing(4)]",
        lg: "[--card-spacing:--spacing(6)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  /**
   * Render the card on a semantic child (`<a>`, `<button>`, `<Link>`)
   * instead of a plain div. Required for clickable cards — a div with
   * onClick is invisible to keyboards and screen readers.
   */
  asChild?: boolean;
  /**
   * Clickable affordance: pointer cursor, hover lift + deepening shadow,
   * press compression, visible keyboard focus. Combine with `asChild`.
   */
  interactive?: boolean;
  /** Selected state for pickers and dashboard grids. Sets `data-selected`. */
  selected?: boolean;
  /**
   * 2px gradient accent along the top edge — status at a glance without
   * a badge competing with the title. Renders `data-status`.
   */
  status?: "default" | CardStatus;
  /** Cursor-tracked surface wash + border glow. One featured card per view. */
  spotlight?: boolean;
}

function Card({
  className,
  variant,
  size,
  asChild = false,
  interactive = false,
  selected = false,
  status = "default",
  spotlight = false,
  onMouseMove,
  children,
  ...props
}: CardProps) {
  const Comp = asChild ? Slot : "div";
  const trackPointer = spotlight || interactive;

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      el.style.setProperty(
        "--bx",
        `${((e.clientX - rect.left) / rect.width) * 100}%`,
      );
      el.style.setProperty(
        "--by",
        `${((e.clientY - rect.top) / rect.height) * 100}%`,
      );
      onMouseMove?.(e);
    },
    [onMouseMove],
  );

  return (
    <Comp
      data-slot="card"
      data-size={size ?? "default"}
      data-variant={variant ?? "default"}
      data-status={status}
      data-selected={selected || undefined}
      className={cn(
        cardVariants({ variant, size }),
        interactive && interactiveLayer,
        spotlight && spotlightLayer,
        status !== "default" && statusAccentSize,
        status !== "default" && statusAccent[status as CardStatus],
        className,
      )}
      onMouseMove={trackPointer ? handleMouseMove : onMouseMove}
      {...props}
    >
      {children}
    </Comp>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-2xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing) [&>*]:min-w-0",
        className,
      )}
      {...props}
    />
  );
}

/* h3 by default — a page's h1 → section h2 → card h3 in almost every    */
/* layout. Override the level with `asChild` + your own heading.         */
function CardTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"h3"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "h3";
  return (
    <Comp
      data-slot="card-title"
      className={cn(
        "min-w-0 text-base leading-6 font-semibold tracking-tight text-balance break-words",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        "min-w-0 text-sm text-pretty text-muted-foreground break-words",
        className,
      )}
      {...props}
    />
  );
}

/* Kicker above the title — sentence case, quiet weight. ALL-CAPS       */
/* eyebrows are a template tell; reach for uppercase only with intent.   */
function CardEyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-eyebrow"
      className={cn(
        "min-w-0 truncate text-[13px] leading-5 font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

/* Cover media — CLS-safe aspect box; the image eases to a slow zoom on  */
/* card hover. Give <img> explicit width/height + loading="lazy".        */
function CardMedia({
  className,
  ratio = "video",
  ...props
}: React.ComponentProps<"div"> & {
  ratio?: "video" | "wide" | "square";
}) {
  return (
    <div
      data-slot="card-media"
      data-ratio={ratio}
      className={cn(
        "relative overflow-hidden",
        "mx-(--card-spacing) rounded-xl",
        ratio === "video" && "aspect-video",
        ratio === "wide" && "aspect-[2/1]",
        ratio === "square" && "aspect-square",
        "[&_img]:h-full [&_img]:w-full [&_img]:object-cover",
        "[&_img]:transition-transform [&_img]:duration-500 [&_img]:ease-[cubic-bezier(0.23,1,0.32,1)]",
        "group-hover/card:[&_img]:scale-[1.03]",
        "motion-reduce:[&_img]:transition-none motion-reduce:group-hover/card:[&_img]:scale-100",
        className,
      )}
      {...props}
    />
  );
}

/* KPI figure — tabular numerals so dashboards don't jitter as values   */
/* update. Pair with a delta in CardAction or beside the value.          */
function CardMetric({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-metric"
      className={cn(
        "text-3xl leading-9 font-semibold tracking-tight text-balance tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("min-w-0 px-(--card-spacing)", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2 rounded-b-2xl border-t border-border/60 bg-muted/40 p-(--card-spacing) [&>*]:min-w-0",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardEyebrow,
  CardMedia,
  CardMetric,
  cardVariants,
};
