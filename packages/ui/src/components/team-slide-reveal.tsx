"use client";

import { ArrowLeft, ArrowUpRight, Quote } from "lucide-react";
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
  /** Called when the profile and story swap. */
  onOpenChange?: (open: boolean) => void;
  /** Corner radius in px. @default 14 */
  radius?: number;
  /** Sheet transition duration in ms. @default 480 */
  duration?: number;
  /** Use the denser layout intended for compact catalog previews. @default false */
  compact?: boolean;
}

const DEFAULT_IMAGE = "/images/spiral-3d-slider/dark-glitch.jpg";

/** A portrait card whose story rises into the same frame as the image. */
export function TeamSlideReveal({
  image = DEFAULT_IMAGE,
  imageAlt = "Editorial portrait crossed by horizontal light trails",
  name = "Takahashi Aya",
  role = "CEO, Pentaclay",
  testimonial = "The strongest work starts with curiosity. We listen closely, make room for ideas to evolve, and build things that feel unmistakably human.",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  radius = 14,
  duration = 480,
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
  const storyId = React.useId();

  const setOpen = React.useCallback((next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [controlledOpen, onOpenChange]);

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (open) backRef.current?.focus({ preventScroll: true });
    else profileRef.current?.focus({ preventScroll: true });
  }, [open]);

  const handleRootKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === "Escape" && open) {
      event.stopPropagation();
      setOpen(false);
    }
  }, [onKeyDown, open, setOpen]);

  return (
    <div
      data-slot="team-slide-reveal"
      data-state={open ? "summary" : "profile"}
      className={cn("relative isolate h-full w-full touch-manipulation overflow-hidden bg-zinc-950", className)}
      style={{ borderRadius: radius, containerType: "inline-size", "--team-slide-duration": `${duration}ms`, ...style } as React.CSSProperties}
      onKeyDown={handleRootKeyDown}
      {...props}
    >
      <img
        src={image}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
        className={cn(
          "absolute inset-0 h-full w-full select-none object-cover transition-transform duration-[var(--team-slide-duration)] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          open ? "scale-[1.055]" : "scale-100",
        )}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/15" />

      <article
        ref={profileRef}
        role="button"
        tabIndex={open ? -1 : 0}
        aria-hidden={open}
        aria-label={`Read ${name}'s story. ${imageAlt}`}
        aria-controls={storyId}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "absolute inset-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white",
          open && "pointer-events-none",
        )}
      >
        <span className={cn(
          "absolute right-[clamp(0.75rem,4cqi,1.4rem)] top-[clamp(0.75rem,4cqi,1.4rem)] inline-flex items-center gap-2 rounded-full border border-white/35 bg-black/25 text-white backdrop-blur-sm transition-[color,background-color,opacity] duration-200 hover:bg-white hover:text-zinc-950",
          open && "opacity-0",
          compact ? "size-8 justify-center" : "px-3.5 py-2 text-[clamp(0.65rem,2.7cqi,0.8rem)] font-medium",
        )}>
          {!compact && <span>Read story</span>}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </span>
        <div className={cn(
          "absolute inset-x-0 bottom-0 text-white transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100",
          compact ? "p-3" : "p-[clamp(1rem,5cqi,2rem)]",
        )}>
          <p className={cn("font-serif leading-[0.98] tracking-[-0.045em]", compact ? "text-[clamp(1.15rem,7cqi,1.55rem)]" : "text-[clamp(2rem,9cqi,3.1rem)]")}>{name}</p>
          <p className={cn("mt-2 font-medium text-white/80", compact ? "text-[9px]" : "text-[clamp(0.72rem,2.7cqi,0.88rem)]")}>{role}</p>
        </div>
      </article>

      <article
        id={storyId}
        aria-hidden={!open}
        className={cn(
          "absolute inset-x-0 bottom-0 flex h-[84%] flex-col rounded-t-[clamp(1rem,5cqi,1.6rem)] bg-[#f6f4ef] text-zinc-900 shadow-[0_-16px_48px_rgba(0,0,0,0.18)] transition-transform duration-[var(--team-slide-duration)] ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-[#202124] dark:text-white motion-reduce:transition-none",
          compact ? "h-[89%] p-3" : "p-[clamp(1.25rem,5cqi,2rem)]",
          open ? "translate-y-0" : "pointer-events-none translate-y-[101%]",
        )}
      >
        <div className="flex shrink-0 items-center justify-between">
          <button
            ref={backRef}
            type="button"
            tabIndex={open ? 0 : -1}
            aria-label={`Back to ${name}'s profile`}
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); setOpen(false); }}
            className={cn(
              "grid place-items-center rounded-full border border-zinc-300 text-zinc-800 transition-colors hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-white/25 dark:text-white dark:hover:bg-white dark:hover:text-zinc-950 dark:focus-visible:ring-white",
              compact ? "size-8" : "size-[clamp(2.4rem,11cqi,2.9rem)]",
            )}
          >
            <ArrowLeft aria-hidden="true" className="size-[clamp(1rem,4.5cqi,1.25rem)]" />
          </button>
          <span className={cn("font-medium text-zinc-500 dark:text-zinc-400", compact ? "text-[9px]" : "text-[clamp(0.68rem,2.6cqi,0.8rem)]")}>In their words</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto py-[clamp(0.5rem,3cqi,1.5rem)]">
          <Quote aria-hidden="true" className={cn("mb-[clamp(0.4rem,2cqi,1rem)] text-zinc-400 dark:text-zinc-500", compact ? "size-4" : "size-[clamp(1.5rem,7cqi,2.3rem)]")} />
          <p className={cn(
            "max-w-[31ch] font-serif leading-[1.28] tracking-[-0.025em]",
            compact ? "line-clamp-4 text-[clamp(0.8rem,4cqi,1rem)]" : "text-[clamp(1.15rem,5cqi,1.8rem)]",
          )}>{testimonial}</p>
        </div>

        <div className="shrink-0 border-t border-zinc-900/15 pt-[clamp(0.6rem,3cqi,1.15rem)] dark:border-white/20">
          <p className={cn("font-semibold tracking-[-0.02em]", compact ? "text-[10px]" : "text-[clamp(0.86rem,3.5cqi,1.1rem)]")}>{name}</p>
          <p className={cn("mt-0.5 text-zinc-500 dark:text-zinc-400", compact ? "text-[9px]" : "text-[clamp(0.7rem,2.6cqi,0.82rem)]")}>{role}</p>
        </div>
      </article>
    </div>
  );
}

export default TeamSlideReveal;
