"use client";

import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

export interface TeamSlideRevealProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Portrait shown on the resting profile card. */
  image?: string;
  /** Accessible description for the portrait. */
  imageAlt?: string;
  name?: string;
  role?: string;
  testimonial?: string;
  /** Controlled expanded state. */
  open?: boolean;
  /** Initial expanded state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the profile and summary swap. */
  onOpenChange?: (open: boolean) => void;
  /** Corner radius in px. @default 14 */
  radius?: number;
  /** Transition duration in ms. @default 560 */
  duration?: number;
  /** Use the denser layout intended for compact catalog previews. @default false */
  compact?: boolean;
}

const DEFAULT_IMAGE = "/images/spiral-3d-slider/dark-glitch.jpg";

/* Compositor-only motion, staged like a scene change: the outgoing panel
   accelerates away (ease-in, slightly farther) while the incoming panel
   glides in on an expo-out curve and its content rises in a short cascade.
   Opacity + transform only — never layout, paint, or filters. */
const EXIT_TRANSITION =
  "transition-[opacity,transform] duration-[var(--team-slide-duration)] ease-[cubic-bezier(0.55,0.06,0.68,0.19)] motion-reduce:transition-none";
const ENTER_TRANSITION =
  "transition-[opacity,transform] duration-[var(--team-slide-duration)] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

/**
 * A click-to-reveal portrait card that trades profile imagery for a readable
 * testimonial. The two panels remain in one fixed footprint so the swap feels
 * spatially continuous in a gallery card, side preview, or fullscreen demo.
 *
 * Performance notes: the swap animates opacity + transform only (no blur or
 * filter keyframes), images are async-decoded, and sizing is driven by the
 * component's own inline-size container — it works in any plain wrapper.
 */
export function TeamSlideReveal({
  image = DEFAULT_IMAGE,
  imageAlt = "Editorial portrait crossed by horizontal light trails",
  name = "Takahashi Aya",
  role = "CEO, Pentaclay",
  testimonial = "I’m focused on growing my brand, improving my products, and finding smarter ways to market and package my work. I’m driven, curious, and committed to turning my design skills into something bigger.",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  radius = 14,
  duration = 560,
  compact = false,
  className,
  style,
  onKeyDown,
  ...props
}: TeamSlideRevealProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const profileRef = React.useRef<HTMLElement>(null);
  const backRef = React.useRef<HTMLButtonElement>(null);
  const firstRender = React.useRef(true);

  const setOpen = React.useCallback((next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [controlledOpen, onOpenChange]);

  /* Keep keyboard and screen-reader users oriented: move focus to the back
     control when the summary opens, and return it to the profile on close.
     Skipped on mount so the card never steals initial focus. */
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (open) backRef.current?.focus({ preventScroll: true });
    else profileRef.current?.focus({ preventScroll: true });
  }, [open ]);

  const handleRootKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      setOpen(false);
    }
  }, [onKeyDown, open, setOpen]);

  /* Summary content rises in a short cascade behind the panel glide.
     Delays apply on entry only — exits collapse immediately. */
  const rise = () =>
    cn(
      "transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:transform-none",
      open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
    );
  const riseStyle = (delayMs: number): React.CSSProperties =>
    ({ transitionDelay: open ? `${delayMs}ms` : "0ms" });

  return (
    <div
      data-slot="team-slide-reveal"
      data-state={open ? "summary" : "profile"}
      className={cn("relative isolate h-full w-full touch-manipulation select-none overflow-hidden", className)}
      style={{
        borderRadius: radius,
        containerType: "inline-size",
        "--team-slide-duration": `${duration}ms`,
        ...style,
      } as React.CSSProperties}
      onKeyDown={handleRootKeyDown}
      {...props}
    >
      <article
        ref={profileRef}
        aria-hidden={open}
        aria-label={`Read ${name}'s testimonial`}
        aria-expanded={open}
        role="button"
        tabIndex={open ? -1 : 0}
        onClick={(event) => {
          /* The arrow badge toggles in place — keep it from activating an
             outer link (gallery cards): stop propagation AND prevent the
             anchor's native default navigation. */
          if ((event.target as HTMLElement).closest?.("[data-tsr-cta]")) {
            event.preventDefault();
            event.stopPropagation();
          }
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "absolute inset-0 cursor-pointer overflow-hidden bg-zinc-950 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
          EXIT_TRANSITION,
          open
            ? "pointer-events-none -translate-x-[12%] scale-[0.96] opacity-0"
            : "translate-x-0 scale-100 opacity-100",
        )}
      >
        <img
          src={image}
          alt={imageAlt}
          draggable={false}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
        <div className={cn("absolute inset-x-0 bottom-0", compact ? "p-3" : "p-[clamp(0.85rem,4cqi,1.65rem)]")}>
          <p className={cn("font-sans font-black uppercase leading-[0.9] tracking-[-0.06em] text-white", compact ? "text-sm" : "text-[clamp(1rem,5.5cqi,2rem)]")}>
            {name}
          </p>
          <p className={cn("mt-1 font-medium text-white/85", compact ? "text-[9px]" : "text-[clamp(0.62rem,2.5cqi,0.9rem)]")}>({role})</p>
        </div>
        <span
          aria-hidden="true"
          data-tsr-cta
          className={cn(
            "absolute right-[clamp(0.7rem,3cqi,1.25rem)] top-[clamp(0.7rem,3cqi,1.25rem)] grid place-items-center rounded-full bg-white text-zinc-950 shadow-lg transition-transform duration-200 motion-reduce:transition-none",
            compact ? "size-9" : "size-[clamp(2.25rem,11cqi,2.75rem)]",
          )}
        >
          <ArrowRight className={cn(compact ? "size-5" : "size-[clamp(1.1rem,5cqi,1.35rem)]")} aria-hidden="true" />
        </span>
      </article>

      <article
        aria-hidden={!open}
        className={cn(
          "absolute inset-0 flex flex-col bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50",
          compact ? "p-3" : "p-[clamp(1rem,5cqi,2rem)]",
          ENTER_TRANSITION,
          open
            ? "translate-x-0 scale-100 opacity-100"
            : "pointer-events-none translate-x-[10%] scale-[0.985] opacity-0",
        )}
      >
        <div className={cn("flex items-start justify-between gap-3", rise())} style={riseStyle(60)}>
          <button
            ref={backRef}
            type="button"
            tabIndex={open ? 0 : -1}
            aria-label={`Back to ${name}'s profile`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
            }}
            className={cn("grid shrink-0 place-items-center rounded-full bg-zinc-950 text-white shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:bg-white dark:text-zinc-950 dark:focus-visible:ring-white dark:focus-visible:ring-offset-zinc-900 motion-reduce:transition-none", compact ? "size-9" : "size-[clamp(2.25rem,11cqi,2.75rem)]")}
          >
            <ArrowLeft className={cn(compact ? "size-5" : "size-[clamp(1.1rem,5cqi,1.35rem)]")} aria-hidden="true" />
          </button>
          <Quote className="size-[clamp(2rem,9cqi,4rem)] fill-zinc-200 text-zinc-200 dark:fill-white/10 dark:text-white/10" aria-hidden="true" />
        </div>
        <p className={cn(rise(), "max-w-[33ch] text-pretty text-zinc-600 dark:text-zinc-300", compact ? "my-2 line-clamp-4 text-[10px] leading-[1.4]" : "my-auto text-[clamp(0.78rem,3.2cqi,1.05rem)] leading-[1.55]")} style={riseStyle(140)}>
          {testimonial}
        </p>
        {compact ? (
          <div className={rise()} style={riseStyle(220)}>
            <p className="font-sans text-[10px] font-black uppercase leading-none tracking-[-0.055em]">{name}</p>
            <p className="mt-1 text-[8px] font-medium text-zinc-600 dark:text-zinc-300">({role})</p>
          </div>
        ) : (
          <div className={cn(rise(), "flex items-center gap-[clamp(0.65rem,3cqi,1rem)]")} style={riseStyle(220)}>
            <img
              src={image}
              alt=""
              aria-hidden="true"
              draggable={false}
              loading="lazy"
              decoding="async"
              className="size-[clamp(3rem,15cqi,5.5rem)] select-none rounded-[0.6rem] object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-sans text-[clamp(0.82rem,4cqi,1.35rem)] font-black uppercase leading-none tracking-[-0.055em]">{name}</p>
              <p className="mt-1 truncate text-[clamp(0.62rem,2.5cqi,0.9rem)] font-medium text-zinc-600 dark:text-zinc-300">({role})</p>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

export default TeamSlideReveal;
