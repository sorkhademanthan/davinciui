"use client";

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Plus } from "lucide-react";
import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface CinematicCardItem {
  id: string;
  src: string;
  type?: "image" | "video";
  title: string;
  description?: string;
  alt?: string;
}

export interface CinematicCardCarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onDrag"> {
  items: CinematicCardItem[];
  initialIndex?: number;
  loop?: boolean;
  onIndexChange?: (index: number) => void;
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * Shortest signed distance from a card to the (possibly fractional) deck
 * position. Keeps looping continuous — no visible array resets.
 */
function signedDistance(
  index: number,
  position: number,
  count: number,
  loop: boolean,
) {
  if (!loop) return index - position;
  const raw = mod(index - position, count);
  return raw > count / 2 ? raw - count : raw;
}

interface DepthStop {
  d: number;
  x: number;
  scale: number;
  opacity: number;
  blur: number;
  brightness: number;
}

/**
 * Custom depth curve — deliberately NOT a linear coverflow.
 * Spacing compresses as cards recede so the deck reads as stacked
 * photographs rather than a spaced-out row.
 */
const DEPTH_STOPS: DepthStop[] = [
  { d: 0, x: 0, scale: 1, opacity: 1, blur: 0, brightness: 1 },
  { d: 1, x: 190, scale: 0.88, opacity: 0.82, blur: 2, brightness: 0.92 },
  { d: 2, x: 310, scale: 0.76, opacity: 0.62, blur: 5, brightness: 0.88 },
  { d: 3, x: 400, scale: 0.66, opacity: 0.38, blur: 8, brightness: 0.85 },
  { d: 4, x: 452, scale: 0.58, opacity: 0, blur: 12, brightness: 0.8 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function sampleDepth(absRel: number): DepthStop {
  const clamped = Math.min(Math.max(absRel, 0), 4);
  for (let i = 0; i < DEPTH_STOPS.length - 1; i++) {
    const a = DEPTH_STOPS[i]!;
    const b = DEPTH_STOPS[i + 1]!;
    if (clamped >= a.d && clamped <= b.d) {
      const t = clamped - a.d;
      return {
        d: clamped,
        x: lerp(a.x, b.x, t),
        scale: lerp(a.scale, b.scale, t),
        opacity: lerp(a.opacity, b.opacity, t),
        blur: lerp(a.blur, b.blur, t),
        brightness: lerp(a.brightness, b.brightness, t),
      };
    }
  }
  return DEPTH_STOPS[DEPTH_STOPS.length - 1]!;
}

const SPRING = { type: "spring", stiffness: 170, damping: 26, mass: 0.9 } as const;
const VELOCITY_THRESHOLD = 550;

/**
 * Deck metrics driven by the *container* width, not the viewport.
 * The gallery is often embedded in narrow preview columns, so
 * window-based breakpoints would push every neighbor out of view.
 */
function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

interface DeckCardProps {
  item: CinematicCardItem;
  index: number;
  count: number;
  loop: boolean;
  position: MotionValue<number>;
  spreadScale: number;
  cardWidth: number;
  reduceMotion: boolean;
  active: boolean;
  onSelect: (index: number) => void;
}

function DeckCard({
  item,
  index,
  count,
  loop,
  position,
  spreadScale,
  cardWidth,
  reduceMotion,
  active,
  onSelect,
}: DeckCardProps) {
  const rel = useTransform(position, (v) =>
    signedDistance(index, v, count, loop),
  );
  const absRel = useTransform(rel, (v) => Math.min(Math.abs(v), 4));

  const x = useTransform(rel, (v) => {
    const s = sampleDepth(Math.min(Math.abs(v), 4));
    return Math.sign(v) * s.x * spreadScale;
  });
  const scale = useTransform(absRel, (v) => sampleDepth(v).scale);
  const opacity = useTransform(absRel, (v) => sampleDepth(v).opacity);
  const blur = useTransform(absRel, (v) =>
    reduceMotion ? 0 : sampleDepth(v).blur,
  );
  const brightness = useTransform(absRel, (v) =>
    reduceMotion ? 1 : sampleDepth(v).brightness,
  );
  const filter = useMotionTemplate`blur(${blur}px) brightness(${brightness})`;
  const zIndex = useTransform(rel, (v) => {
    const d = Math.min(Math.abs(v), 4);
    return 100 - Math.round(d) * 20 + (d < 0.5 ? 10 : 0);
  });
  const contentOpacity = useTransform(absRel, (v) =>
    Math.max(0, Math.min(1, 1 - v * 1.7)),
  );
  const contentY = useTransform(absRel, (v) => Math.min(v * 10, 18));

  return (
    <motion.article
      aria-hidden={!active}
      data-active={active}
      onClick={() => {
        if (!active) onSelect(index);
      }}
      onKeyDown={(event) => {
        if (!active && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSelect(index);
        }
      }}
      tabIndex={active ? 0 : -1}
      style={{ x, scale, opacity, filter, zIndex, width: cardWidth }}
      className={cn(
        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        "aspect-[320/490] will-change-[transform,opacity,filter]",
        active ? "cursor-default" : "cursor-pointer",
      )}
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-[18px] bg-zinc-200 transition-colors duration-300 dark:bg-zinc-900",
          active
            ? "shadow-[0_25px_70px_rgba(0,0,0,0.14),0_8px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.5),0_8px_25px_rgba(0,0,0,0.35)]"
            : "shadow-[0_14px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.4)]",
        )}
      >
        {item.type === "video" ? (
          <video
            src={item.src}
            aria-label={item.alt ?? item.title}
            autoPlay
            muted
            loop
            playsInline
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <img
            src={item.src}
            alt={item.alt ?? item.title}
            draggable={false}
            loading={index > 3 ? "lazy" : "eager"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Cinematic lower gradient */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.15) 72%, transparent 100%)",
          }}
        />

        {/* Editorial content — only legible on the hero card */}
        <motion.div
          aria-hidden={!active}
          style={{ opacity: contentOpacity, y: contentY }}
          className="absolute inset-x-0 bottom-0 p-6 text-left"
        >
          <span
            aria-hidden
            className="mb-3 block h-px w-7 bg-white/70"
          />
          <h3 className="max-w-[85%] text-[26px] font-medium leading-[1.08] tracking-[-0.01em] text-white">
            {item.title}
          </h3>
          {item.description && (
            <p className="mt-2 max-w-[90%] text-[11px] font-normal leading-relaxed text-white/65">
              {item.description}
            </p>
          )}
        </motion.div>

        {/* Subtle top-right control, hero card only */}
        {active && (
          <motion.span
            aria-hidden
            style={{ opacity: contentOpacity }}
            className="absolute right-4 top-4 grid size-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md"
          >
            <Plus className="size-3.5" strokeWidth={1.75} />
          </motion.span>
        )}
      </div>
    </motion.article>
  );
}

export function CinematicCardCarousel({
  items,
  initialIndex = 0,
  loop = true,
  onIndexChange,
  className,
  ...props
}: CinematicCardCarouselProps) {
  const count = items.length;
  const reduceMotion = useReducedMotion() ?? false;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);

  // Deck geometry follows the measured container so the layered stack
  // stays visible in narrow embeds (docs preview columns) as well as
  // full-bleed pages and small handsets.
  const spreadScale =
    containerWidth === 0 || containerWidth >= 1200
      ? 1
      : containerWidth >= 860
        ? 0.8
        : containerWidth >= 560
          ? 0.62
          : 0.42;
  const cardWidth =
    containerWidth === 0
      ? 300
      : Math.min(320, Math.max(190, Math.round(containerWidth * 0.72)));
  const cardHeight = Math.round((cardWidth * 490) / 320);

  const clampedInitial = React.useMemo(() => {
    if (count === 0) return 0;
    return loop ? mod(initialIndex, count) : Math.min(Math.max(initialIndex, 0), count - 1);
  }, [initialIndex, count, loop]);

  const position = useMotionValue(clampedInitial);
  const [activeIndex, setActiveIndex] = React.useState(clampedInitial);
  const [dragging, setDragging] = React.useState(false);
  const activeRef = React.useRef(clampedInitial);
  const dragState = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPos: number;
    lastX: number;
    lastT: number;
    velocity: number;
    moved: boolean;
    horizontal: boolean | null;
  } | null>(null);
  const suppressClick = React.useRef(false);

  // Keep motion value in sync if items/initial change.
  React.useEffect(() => {
    position.set(clampedInitial);
    activeRef.current = clampedInitial;
    setActiveIndex(clampedInitial);
  }, [clampedInitial, position]);

  const goTo = React.useCallback(
    (index: number) => {
      if (count === 0) return;
      const current = Math.round(position.get());
      let target: number;
      if (loop) {
        const m = mod(index, count);
        const curM = mod(current, count);
        let d = mod(m - curM, count);
        if (d > count / 2) d -= count;
        target = current + d;
      } else {
        target = Math.min(Math.max(index, 0), count - 1);
      }
      const normalized = loop ? mod(target, count) : target;
      activeRef.current = target;
      setActiveIndex(normalized);
      onIndexChange?.(normalized);
      if (reduceMotion) {
        animate(position, target, { duration: 0.2 });
      } else {
        animate(position, target, SPRING);
      }
    },
    [count, loop, onIndexChange, position, reduceMotion],
  );

  const step = React.useCallback(
    (dir: 1 | -1) => {
      if (count === 0) return;
      if (loop) {
        goTo(mod(Math.round(position.get()) + dir, count));
      } else {
        goTo(Math.round(position.get()) + dir);
      }
    },
    [count, goTo, loop, position],
  );

  const dragDistance = Math.max(110, 190 * spreadScale);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (count < 2 || event.button !== 0) return;
    // Let interactive children (buttons/links) behave normally.
    if ((event.target as HTMLElement).closest("button, a")) return;
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPos: position.get(),
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
      moved: false,
      horizontal: null,
    };
    suppressClick.current = false;
    // NOTE: pointer capture is deferred until a horizontal drag is
    // confirmed (see below). Capturing on pointerdown would retarget the
    // subsequent click to the container and break click-to-promote.
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s || event.pointerId !== s.pointerId) return;
    const dx = event.clientX - s.startX;
    const dy = event.clientY - s.startY;

    if (s.horizontal === null && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
      s.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!s.horizontal) {
        // Vertical scroll — release capture if held so the page can scroll.
        try {
          if (containerRef.current?.hasPointerCapture(s.pointerId)) {
            containerRef.current.releasePointerCapture(s.pointerId);
          }
        } catch {
          /* noop */
        }
        dragState.current = null;
        return;
      }
    }
    if (s.horizontal === false) return;

    if (Math.abs(dx) > 6 && !s.moved) {
      s.moved = true;
      setDragging(true);
      // Lock the gesture to the deck now that it is a real drag —
      // taps still click through to the card underneath.
      try {
        containerRef.current?.setPointerCapture(s.pointerId);
      } catch {
        /* noop */
      }
    }
    if (!s.moved && Math.abs(dx) <= 6) return;

    const now = performance.now();
    const dt = Math.max(1, now - s.lastT);
    const instantV = ((event.clientX - s.lastX) / dt) * 1000;
    s.velocity = s.velocity * 0.7 + instantV * 0.3;
    s.lastX = event.clientX;
    s.lastT = now;

    position.set(s.startPos - dx / dragDistance);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s || event.pointerId !== s.pointerId) return;
    dragState.current = null;
    if (!s.moved) {
      setDragging(false);
      return;
    }
    setDragging(false);
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);

    const dx = s.lastX - s.startX;
    const progress = -dx / dragDistance;
    const current = Math.round(s.startPos);
    let target = current;
    if (progress > 0.22 || (progress > 0.05 && s.velocity < -VELOCITY_THRESHOLD)) {
      target = current + 1;
    } else if (progress < -0.22 || (progress < -0.05 && s.velocity > VELOCITY_THRESHOLD)) {
      target = current - 1;
    }

    if (!loop) target = Math.min(Math.max(target, 0), count - 1);
    const normalized = loop ? mod(target, count) : target;
    activeRef.current = target;
    setActiveIndex(normalized);
    onIndexChange?.(normalized);
    if (reduceMotion) {
      animate(position, target, { duration: 0.2 });
    } else {
      animate(position, target, SPRING);
    }
  };

  const handleClickCapture = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
    }
  };

  if (count === 0) return null;

  // Only mount cards near the hero — far cards are invisible (opacity 0).
  const rounded = mod(Math.round(activeRef.current), count);
  const visible = items
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => {
      if (loop) {
        const d = Math.abs(signedDistance(index, rounded, count, true));
        return d <= 4;
      }
      return Math.abs(index - activeIndex) <= 4;
    });

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Cinematic card carousel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          step(1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          step(-1);
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={(event) => {
        if (suppressClick.current) {
          event.stopPropagation();
          event.preventDefault();
          handleClickCapture();
        }
      }}
      style={{
        touchAction: "pan-y",
        cursor: dragging ? "grabbing" : "grab",
        userSelect: dragging ? "none" : undefined,
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative flex min-h-[540px] w-full items-center justify-center overflow-hidden bg-[#fafaf8] outline-none transition-colors duration-300 sm:min-h-[600px] lg:min-h-[650px] dark:bg-[#0a0a0b]",
        "focus-visible:ring-2 focus-visible:ring-zinc-950/20 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fafaf8] dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-[#0a0a0b]",
        className,
      )}
      {...props}
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        Card {activeIndex + 1} of {count}: {items[activeIndex]?.title}
      </span>

      {/* Screen-reader / keyboard controls — intentionally minimal visually */}
      <button
        type="button"
        aria-label="Previous card"
        onClick={() => step(-1)}
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-1/2 focus-visible:z-[200] focus-visible:-translate-y-1/2 focus-visible:rounded-full focus-visible:bg-zinc-950 focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:text-white"
      >
        Previous
      </button>
      <button
        type="button"
        aria-label="Next card"
        onClick={() => step(1)}
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:right-4 focus-visible:top-1/2 focus-visible:z-[200] focus-visible:-translate-y-1/2 focus-visible:rounded-full focus-visible:bg-zinc-950 focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:text-white"
      >
        Next
      </button>

      <div
        className="relative w-full"
        style={{ height: cardHeight + 48 }}
        aria-hidden={false}
      >
        {visible.map(({ item, index }) => (
          <DeckCard
            key={item.id}
            item={item}
            index={index}
            count={count}
            loop={loop}
            position={position}
            spreadScale={spreadScale}
            cardWidth={cardWidth}
            reduceMotion={reduceMotion}
            active={index === activeIndex}
            onSelect={goTo}
          />
        ))}
      </div>
    </div>
  );
}

export default CinematicCardCarousel;
