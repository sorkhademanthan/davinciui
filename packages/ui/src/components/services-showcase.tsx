"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */

export interface ServiceImage {
  src: string;
  alt: string;
}

export interface ServicesShowcaseProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** The three images that form the single card stack. */
  images?: ServiceImage[];
  /** "comfortable" for full pages, "compact" for small card previews. */
  density?: "comfortable" | "compact";
  /** When false, the stack is display-only. */
  interactive?: boolean;
  /** Runs the compact-to-open loop without requiring pointer input. */
  autoPlay?: boolean;
}

/* ------------------------------------------------------------------ */
/* data                                                                */
/* ------------------------------------------------------------------ */

const DEFAULT_IMAGES: ServiceImage[] = [
  {
    src: "/images/spiral-3d-slider/orange-haze.jpg",
    alt: "Portrait wrapped in warm orange haze",
  },
  {
    src: "/images/spiral-3d-slider/dark-glitch.jpg",
    alt: "Dark graphic texture study",
  },
  {
    src: "/images/spiral-3d-slider/crimson-profile.jpg",
    alt: "Profile rendered in deep crimson",
  },
];

/* Stack geometry. Cards are laid out in their open position, then collapsed
   into one wide, central pile with transforms. Slot 0 = front, slot 2 = rear. */
interface CardGeometry {
  w: number;
  h: number;
  x: number;
  y: number;
  openRotation: number;
  closedX: number;
  closedY: number;
  closedRotation: number;
  depth: number;
}

const STACK_GEOMETRY: CardGeometry[] = [
  {
    w: 44,
    h: 76,
    x: 4,
    y: 15,
    openRotation: -8,
    closedX: 54.55,
    closedY: 0,
    closedRotation: 0,
    depth: 1,
  },
  {
    w: 44,
    h: 76,
    x: 28,
    y: 7,
    openRotation: 1,
    closedX: 13.64,
    closedY: 7.89,
    closedRotation: 0,
    depth: 0.82,
  },
  {
    w: 44,
    h: 76,
    x: 52,
    y: 13,
    openRotation: 7,
    closedX: -27.27,
    closedY: -2.63,
    closedRotation: 0,
    depth: 0.68,
  },
];

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/* ------------------------------------------------------------------ */
/* visual — transforms compose without overwriting one another:        */
/*   .svc-s    → compact/open stack geometry                            */
/*   .svc-card → pointer perspective response                           */
/*   .svc-rest → clipping and image surface                             */
/* ------------------------------------------------------------------ */

function ServiceVisual({
  images,
  geometry,
  interactive,
  autoPlay,
  tiltRef,
}: {
  images: ServiceImage[];
  geometry: CardGeometry[];
  interactive: boolean;
  autoPlay: boolean;
  tiltRef: (el: HTMLElement | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const VisualTag = interactive ? "button" : "div";

  return (
    <VisualTag
      ref={tiltRef}
      data-svc-tilt={interactive ? "true" : undefined}
      data-svc-autoplay={autoPlay && !interactive ? "true" : undefined}
      data-svc-open={open ? "true" : undefined}
      type={interactive ? "button" : undefined}
      aria-label={interactive ? "Service image stack" : undefined}
      aria-expanded={interactive ? open : undefined}
      onPointerEnter={interactive ? (event) => {
        if (event.pointerType === "mouse" || event.pointerType === "pen") {
          setOpen(true);
        }
      } : undefined}
      onPointerLeave={interactive ? (event) => {
        if (event.pointerType === "mouse" || event.pointerType === "pen") {
          setOpen(false);
        }
      } : undefined}
      onClick={interactive ? (event) => {
        if (
          event.detail === 0 ||
          window.matchMedia("(hover: none), (pointer: coarse)").matches
        ) {
          setOpen((value) => !value);
        }
      } : undefined}
      onKeyDown={interactive ? (event) => {
        if (event.key === "Escape") setOpen(false);
      } : undefined}
      className="svc-visual relative w-full overflow-visible"
      style={{ aspectRatio: "4 / 3.4" }}
    >
      {[0, 1, 2].map((slot) => {
        const image =
          images.length > 0
            ? images[slot % images.length]!
            : DEFAULT_IMAGES[slot]!;
        const geo = geometry[slot]!;
        return (
          <div
            key={slot}
            className="svc-s absolute left-0 top-0"
            style={{
              width: `${geo.w}%`,
              height: `${geo.h}%`,
              left: `${geo.x}%`,
              top: `${geo.y}%`,
              zIndex: 3 - slot,
              ["--closed-x" as string]: `${geo.closedX}%`,
              ["--closed-y" as string]: `${geo.closedY}%`,
              ["--closed-r" as string]: `${geo.closedRotation}deg`,
              ["--open-r" as string]: `${geo.openRotation}deg`,
              ["--depth" as string]: geo.depth,
              ["--i" as string]: slot,
            }}
          >
            <div className="svc-card h-full w-full">
              <div className="svc-rest h-full w-full overflow-hidden rounded-[clamp(12px,4.5cqi,22px)] bg-muted">
                <img
                  src={image.src}
                  alt={image.alt}
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  className="svc-img block h-full w-full select-none object-cover"
                />
              </div>
            </div>
          </div>
        );
      })}
    </VisualTag>
  );
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

export function ServicesShowcase({
  images = DEFAULT_IMAGES,
  density = "comfortable",
  interactive = true,
  autoPlay = false,
  className,
  style,
  ...props
}: ServicesShowcaseProps) {
  const tiltRefs = React.useRef<Array<HTMLElement | null>>([]);

  /* ---- pointer perspective: fine pointers only, CSS vars on each card ---- */
  React.useEffect(() => {
    if (!interactive) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cleanups: Array<() => void> = [];
    for (const visual of tiltRefs.current) {
      if (!visual || visual.dataset.svcTilt !== "true") continue;
      let raf = 0;
      let targetX = 0;
      let targetY = 0;
      let targetRotateX = 0;
      let targetRotateY = 0;
      let currentX = 0;
      let currentY = 0;
      let currentRotateX = 0;
      let currentRotateY = 0;
      const render = () => {
        const smoothing = 0.14;
        currentX += (targetX - currentX) * smoothing;
        currentY += (targetY - currentY) * smoothing;
        currentRotateX += (targetRotateX - currentRotateX) * smoothing;
        currentRotateY += (targetRotateY - currentRotateY) * smoothing;
        visual.style.setProperty("--tx", `${currentX.toFixed(2)}px`);
        visual.style.setProperty("--ty", `${currentY.toFixed(2)}px`);
        visual.style.setProperty("--rx", `${currentRotateX.toFixed(3)}deg`);
        visual.style.setProperty("--ry", `${currentRotateY.toFixed(3)}deg`);
        if (
          Math.abs(targetX - currentX) > 0.01 ||
          Math.abs(targetY - currentY) > 0.01 ||
          Math.abs(targetRotateX - currentRotateX) > 0.01 ||
          Math.abs(targetRotateY - currentRotateY) > 0.01
        ) {
          raf = requestAnimationFrame(render);
        } else {
          raf = 0;
        }
      };
      const schedule = () => {
        if (!raf) raf = requestAnimationFrame(render);
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
        const rect = visual.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
        const ny = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
        targetX = nx * 5;
        targetY = ny * 4;
        targetRotateY = nx * 7;
        targetRotateX = -ny * 5.5;
        schedule();
      };
      const onLeave = () => {
        targetX = 0;
        targetY = 0;
        targetRotateX = 0;
        targetRotateY = 0;
        schedule();
      };
      visual.addEventListener("pointermove", onMove, { passive: true });
      visual.addEventListener("pointerleave", onLeave, { passive: true });
      cleanups.push(() => {
        visual.removeEventListener("pointermove", onMove);
        visual.removeEventListener("pointerleave", onLeave);
        cancelAnimationFrame(raf);
      });
    }
    return () => {
      for (const fn of cleanups) fn();
    };
  }, [interactive]);

  return (
    <section
      data-slot="services-showcase"
      data-density={density}
      className={cn(
        "svc-root relative h-full w-full overflow-hidden bg-background text-foreground",
        className,
      )}
      style={{ containerType: "inline-size", containerName: "svc", ...style }}
      {...props}
    >
      <style>{SVC_CSS}</style>

      <div className="svc-stage mx-auto flex h-full min-h-[300px] w-full max-w-[560px] items-center justify-center overflow-visible px-6 py-10 sm:min-h-[400px] sm:px-10 sm:py-14">
        <ServiceVisual
          images={images}
          geometry={STACK_GEOMETRY}
          interactive={interactive}
          autoPlay={autoPlay}
          tiltRef={(el) => {
            tiltRefs.current[0] = el;
          }}
        />
      </div>
    </section>
  );
}

const SVC_CSS = `
.svc-root {
  --svc-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --closed-scale-x: 1;
  --closed-scale-y: 0.9;
}
/* The gallery keeps the same stack, but gives its miniature more breathing room. */
.svc-root[data-density="compact"] {
  --closed-scale-x: 0.96;
  --closed-scale-y: 0.88;
}
.svc-root[data-density="compact"] .svc-stage { min-height: 100%; padding: 0.75rem; }
/* Gallery cards are short (h-48) — the visual is sized to fit the height
   instead of the width so the stack is never cropped. */
.svc-root[data-density="compact"] .svc-visual {
  width: 68%;
}

.svc-visual {
  display: block;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}
button.svc-visual { cursor: pointer; touch-action: manipulation; }
button.svc-visual:focus-visible { outline: none; }
button.svc-visual:focus-visible .svc-s:first-child .svc-rest {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}

/* The three visible layers spread into portraits without fading in and out. */
.svc-s {
  transform: translate3d(var(--closed-x), var(--closed-y), 0) scaleX(var(--closed-scale-x)) scaleY(var(--closed-scale-y)) rotate(var(--closed-r));
  transform-origin: center center;
  transition: transform 680ms var(--svc-ease);
}
.svc-s:not(:first-child) { opacity: 1; }

/* Gallery cards remain display-only, but demonstrate the same unfold on a loop. */
@keyframes svc-autoplay-stack {
  0%, 24% {
    transform: translate3d(var(--closed-x), var(--closed-y), 0) scaleX(var(--closed-scale-x)) scaleY(var(--closed-scale-y)) rotate(var(--closed-r));
  }
  48%, 72% {
    transform: translate3d(0, 0, 0) scaleX(1) scaleY(1) rotate(var(--open-r));
  }
  100% {
    transform: translate3d(var(--closed-x), var(--closed-y), 0) scaleX(var(--closed-scale-x)) scaleY(var(--closed-scale-y)) rotate(var(--closed-r));
  }
}
.svc-visual[data-svc-autoplay="true"] .svc-s {
  animation: svc-autoplay-stack 5.8s var(--svc-ease) infinite;
}
.svc-visual[data-svc-autoplay="true"] .svc-s,
.svc-visual[data-svc-open="true"] .svc-s { will-change: transform; }
.svc-visual[data-svc-open="true"] .svc-s {
  transform: translate3d(0, 0, 0) scaleX(1) scaleY(1) rotate(var(--open-r));
  transition-delay: calc(var(--i, 0) * 55ms);
}
@media (hover: hover) and (pointer: fine) {
  /* Unfold cascades front-to-back; refold cascades back-to-front. */
  .svc-visual[data-svc-tilt="true"] .svc-s {
    transition-delay: calc((2 - var(--i, 0)) * 55ms);
  }
  .svc-visual[data-svc-tilt="true"][data-svc-open="true"] .svc-s {
    transition-delay: calc(var(--i, 0) * 55ms);
  }
}

/* Cursor movement tilts the complete card, matching the reference's depth. */
.svc-visual[data-svc-tilt="true"] .svc-card {
  transform: perspective(900px)
    rotateX(calc(var(--rx, 0deg) * var(--depth)))
    rotateY(calc(var(--ry, 0deg) * var(--depth)))
    translate3d(
      calc(var(--tx, 0px) * var(--depth)),
      calc(var(--ty, 0px) * var(--depth)),
      0
    );
  transform-origin: center center;
}
.svc-visual[data-svc-open="true"] .svc-card { will-change: transform; }

.svc-img { transform: scale(1.025); }
.svc-rest {
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  box-shadow: 0 14px 28px rgb(0 0 0 / 0.16);
}

@media (prefers-reduced-motion: reduce) {
  .svc-s { animation: none !important; transition: none !important; }
}
`;

export default ServicesShowcase;
