"use client";

import * as React from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { CircleDot, Home, LayoutGrid, Mail, Settings } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */

export interface GlassScene {
  id: string;
  image: string;
  alt?: string;
}

export interface GlassDockItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
}

export type GlassSceneDockMode = "card" | "preview" | "fullscreen";

export interface GlassSceneDockProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  scenes?: GlassScene[];
  items?: GlassDockItem[];
  defaultIndex?: number;
  mode?: GlassSceneDockMode;
  enableScroll?: boolean;
  enableHover?: boolean;
  transitionDuration?: number;
  onSceneChange?: (index: number) => void;
}

/* ------------------------------------------------------------------ */
/* defaults                                                            */
/* ------------------------------------------------------------------ */

const DEFAULT_SCENES: GlassScene[] = [
  {
    id: "ember",
    image: "/images/spiral-3d-slider/orange-haze.jpg",
    alt: "Portrait wrapped in warm orange haze",
  },
  {
    id: "prism",
    image: "/images/spiral-3d-slider/prism-portrait.jpg",
    alt: "Portrait refracted through a glass prism",
  },
  {
    id: "tide",
    image: "/images/spiral-3d-slider/blue-profile.jpg",
    alt: "Profile drawn in saturated electric blue",
  },
  {
    id: "dune",
    image: "/images/spiral-3d-slider/teal-echo.jpg",
    alt: "Teal echo portrait still",
  },
  {
    id: "mono",
    image: "/images/spiral-3d-slider/silver-motion.jpg",
    alt: "Monochrome editorial portrait in motion",
  },
];

const DEFAULT_ITEMS: GlassDockItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "grid", label: "Overview", icon: LayoutGrid },
  { id: "focus", label: "Focus", icon: CircleDot },
  { id: "mail", label: "Contact", icon: Mail },
  { id: "settings", label: "Settings", icon: Settings },
];

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function easeInOut(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/** Fraction of each scroll segment devoted to the crossfade. */
const SEGMENT_FADE = 0.75;

function segmentVisibility(p: number, index: number, count: number) {
  if (count <= 1) return 1;
  const u = p * count - index;
  if (u < -SEGMENT_FADE) return 0;
  if (u < 0) return easeInOut((u + SEGMENT_FADE) / SEGMENT_FADE);
  if (index === count - 1) return 1;
  if (u >= 1) return 0;
  if (u < 1 - SEGMENT_FADE) return 1;
  return 1 - easeInOut((u - (1 - SEGMENT_FADE)) / SEGMENT_FADE);
}

/* ------------------------------------------------------------------ */
/* background layer — opacity + restrained scale/drift, GPU-friendly   */
/* ------------------------------------------------------------------ */

function SceneLayer({
  scene,
  index,
  count,
  progress,
  active,
  priority,
  reduceMotion,
}: {
  scene: GlassScene;
  index: number;
  count: number;
  progress: MotionValue<number>;
  active: boolean;
  priority: boolean;
  reduceMotion: boolean;
}) {
  const opacity = useTransform(progress, (v: number) =>
    segmentVisibility(v, index, count),
  );
  const scale = useTransform(opacity, (o: number) =>
    reduceMotion ? 1 : 1 + (1 - o) * 0.015,
  );
  const y = useTransform(opacity, (o: number) =>
    reduceMotion ? 0 : (1 - o) * 10,
  );

  return (
    <motion.div
      aria-hidden={!active}
      className="gsd-scene pointer-events-none absolute inset-0 will-change-transform"
      style={{ opacity, scale, y, zIndex: active ? 1 : 0 }}
    >
      <img
        src={scene.image}
        alt={scene.alt ?? ""}
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className="block h-full w-full select-none object-cover"
        style={{ objectPosition: "50% 50%", transform: "translateZ(0)" }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* dock item — one square interaction region, delicate thin icon       */
/* ------------------------------------------------------------------ */

function DockItem({
  item,
  highlighted,
  current,
  dimmed,
  onHoverStart,
  onHoverEnd,
  onFocus,
  onBlur,
  onSelect,
}: {
  item: GlassDockItem;
  highlighted: boolean;
  current: boolean;
  dimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onSelect: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      aria-label={item.label}
      aria-current={current || undefined}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={onSelect}
      className={cn(
        "gsd-btn relative flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none",
        "focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {highlighted && (
        <motion.span
          aria-hidden
          layoutId="gsd-highlight"
          className="gsd-highlight absolute inset-0 rounded-full"
          transition={{ type: "spring", stiffness: 550, damping: 38, mass: 0.7 }}
        />
      )}
      <span
        className={cn(
          "gsd-icon relative z-10 flex items-center justify-center transition-all duration-200",
          highlighted ? "scale-[1.05] text-white" : "text-white/60",
          dimmed && !highlighted && "opacity-70",
        )}
      >
        <Icon className="gsd-icon-svg" strokeWidth={1.5} />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

export function GlassSceneDock({
  scenes = DEFAULT_SCENES,
  items = DEFAULT_ITEMS,
  defaultIndex = 0,
  mode = "preview",
  enableScroll = true,
  enableHover = true,
  transitionDuration = 650,
  onSceneChange,
  className,
  style,
  ...props
}: GlassSceneDockProps) {
  const count = Math.max(1, scenes.slice(0, Math.max(1, items.length)).length);
  const visibleScenes = React.useMemo(() => scenes.slice(0, count), [scenes, count]);
  const visibleItems = React.useMemo(() => items.slice(0, count), [items, count]);

  const rootRef = React.useRef<HTMLElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const [stageH, setStageH] = React.useState(0);
  const [activeIndex, setActiveIndex] = React.useState(() =>
    clamp(defaultIndex, 0, count - 1),
  );
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  /* Pinned highlight position. Hover/focus pins the highlight where the
     user leaves it (it never snaps back on its own); scroll and explicit
     selection re-sync it to the visible scene. Hover never moves the
     background — scenes travel on scroll, tap, click, or keys only. */
  const [pinnedIndex, setPinnedIndex] = React.useState(() =>
    clamp(defaultIndex, 0, count - 1),
  );
  const [firstLoaded, setFirstLoaded] = React.useState(false);
  const activeRef = React.useRef(activeIndex);
  activeRef.current = activeIndex;
  const onSceneChangeRef = React.useRef(onSceneChange);
  onSceneChangeRef.current = onSceneChange;

  React.useEffect(() => {
    setActiveIndex((prev) => clamp(prev, 0, count - 1));
    setPinnedIndex((prev) => clamp(prev, 0, count - 1));
  }, [count]);

  /* ---- preload every scene so transitions never flash empty ---- */
  React.useEffect(() => {
    let cancelled = false;
    const loaders = visibleScenes.map(
      (s) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = s.image;
          if (img.complete) resolve();
        }),
    );
    loaders[0]?.then(() => {
      if (!cancelled) setFirstLoaded(true);
    });
    Promise.all(loaders).then(() => {
      if (!cancelled) setFirstLoaded(true);
    });
    // Safety: never hold the placeholder longer than 2.5s.
    const t = window.setTimeout(() => {
      if (!cancelled) setFirstLoaded(true);
    }, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [visibleScenes]);

  /* ---- measure the stage: the scroller's own viewport, not window ---- */
  React.useEffect(() => {
    const scroller = scrollerRef.current;
    const root = rootRef.current;
    if (!scroller || !root) return;
    const update = () => {
      const h = scroller.clientHeight || root.clientHeight || 0;
      if (h > 0) setStageH(h);
    };
    update();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(update)
        : null;
    if (ro) {
      ro.observe(scroller);
      ro.observe(root);
    }
    window.addEventListener("resize", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  /* ---- container-aware scroll progress (never window.scrollY) ---- */
  const { scrollYProgress } = useScroll({ container: scrollerRef });
  const stiffness = clamp(
    150 * (650 / clamp(transitionDuration, 200, 2000)),
    60,
    320,
  );
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: reduceMotion ? 1000 : stiffness,
    damping: reduceMotion ? 100 : 28,
    mass: 0.9,
    restDelta: 0.0004,
  });

  /* ---- scroll → scene mapping with hysteresis at boundaries ---- */
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (count <= 1) {
      if (activeRef.current !== 0) {
        activeRef.current = 0;
        setActiveIndex(0);
        setPinnedIndex(0);
        onSceneChangeRef.current?.(0);
      }
      return;
    }
    const gp = clamp(v, 0, 0.999999) * count;
    const prev = activeRef.current;
    const next = clamp(Math.floor(gp), 0, count - 1);
    if (next === prev) return;
    // Deadband around the crossed interior boundary: tiny trackpad jitter
    // exactly on a cut must not flicker between the two neighbouring scenes.
    const boundary = next > prev ? next : prev;
    if (
      boundary >= 1 &&
      boundary <= count - 1 &&
      Math.abs(gp - boundary) < 0.04
    )
      return;
    activeRef.current = next;
    setActiveIndex(next);
    setPinnedIndex(next);
    onSceneChangeRef.current?.(next);
  });

  /* ---- jump to the default scene on mount (no animation) ---- */
  React.useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || count <= 1) return;
    const target = clamp(defaultIndex, 0, count - 1);
    const max = scroller.scrollHeight - scroller.clientHeight;
    if (max > 0) scroller.scrollTop = ((target + 0.5) / count) * max;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, stageH > 0 ? 1 : 0]);

  const scrollToIndex = React.useCallback(
    (i: number) => {
      const scroller = scrollerRef.current;
      const target = clamp(i, 0, count - 1);
      if (activeRef.current !== target) {
        activeRef.current = target;
        setActiveIndex(target);
        setPinnedIndex(target);
        onSceneChangeRef.current?.(target);
      }
      if (!scroller || count <= 1 || !enableScroll) return;
      const max = scroller.scrollHeight - scroller.clientHeight;
      if (max <= 0) return;
      scroller.scrollTo({
        top: ((target + 0.5) / count) * max,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [count, enableScroll, reduceMotion],
  );

  /* ---- card previews scrub internally instead of moving the page ---- */
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !enableScroll) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const delta =
        e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      if (delta === 0) return;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) return;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop >= max - 1;
      if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollTop += delta;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [enableScroll]);

  const hoverEnabled = enableHover && !reduceMotion;
  const displayedIndex = hoveredIndex ?? pinnedIndex;
  const trackH = Math.max(1, count) * Math.max(1, stageH);

  return (
    <section
      ref={rootRef}
      data-slot="glass-scene-dock"
      data-mode={mode}
      aria-roledescription="scroll-driven scene gallery"
      className={cn(
        "gsd-root relative h-full w-full overflow-hidden bg-[#0b0b0d] text-white",
        className,
      )}
      style={{ containerType: "inline-size", containerName: "gsd", ...style }}
      {...props}
    >
      <style>{GSD_CSS}</style>

      {/* scroll container — the component's own viewport in every mode */}
      <div
        ref={scrollerRef}
        data-gsd-scroller="true"
        className="gsd-scroll absolute inset-0 overflow-x-hidden overflow-y-auto"
        style={{
          scrollbarWidth: "none",
          overscrollBehaviorY: "contain",
          overflowY: enableScroll ? "auto" : "hidden",
        }}
      >
        <div className="gsd-track relative w-full" style={{ height: trackH }}>
          <div
            className="gsd-stage sticky top-0 w-full overflow-hidden"
            style={{ height: stageH > 0 ? stageH : "100%" }}
          >
            {/* neutral dark placeholder — never white, no layout shift */}
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 bg-[#0b0b0d] transition-opacity duration-500",
                firstLoaded ? "opacity-0" : "opacity-100",
              )}
              style={{ zIndex: 0 }}
            />

            {/* background scene stack */}
            <div className="absolute inset-0" style={{ zIndex: 0 }}>
              {visibleScenes.map((scene, i) => (
                <SceneLayer
                  key={scene.id}
                  scene={scene}
                  index={i}
                  count={count}
                  progress={smoothProgress}
                  active={i === activeIndex}
                  priority={Math.abs(i - activeIndex) <= 1}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>

            {/* soft legibility veil */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                zIndex: 10,
                background:
                  "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.28) 100%)",
              }}
            />

            {/* floating glass dock — pinned to the stage, never to a scene */}
            <nav
              aria-label="Scene navigation"
              className="gsd-dock absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
            >
              <div role="list" className="gsd-pill flex items-center">
                {visibleItems.map((item, i) => (
                  <div key={item.id} role="listitem" className="flex">
                    <DockItem
                      item={item}
                      highlighted={i === displayedIndex}
                      current={i === activeIndex}
                      dimmed={hoveredIndex !== null && i !== displayedIndex}
                      onHoverStart={() =>
                        hoverEnabled && setHoveredIndex(i)
                      }
                      onHoverEnd={() => {
                        if (!hoverEnabled) return;
                        // Pin the highlight where the user leaves it —
                        // visual only, the background does not move.
                        setHoveredIndex((prev) => (prev === i ? null : prev));
                        setPinnedIndex(i);
                      }}
                      onFocus={() => hoverEnabled && setHoveredIndex(i)}
                      onBlur={() => {
                        if (!hoverEnabled) return;
                        setHoveredIndex((prev) => (prev === i ? null : prev));
                        setPinnedIndex(i);
                      }}
                      onSelect={() => scrollToIndex(i)}
                    />
                  </div>
                ))}
              </div>
            </nav>

            {/* screen-reader scene announcer */}
            <span className="sr-only" aria-live="polite">
              {visibleScenes[activeIndex]?.alt ??
                `Scene ${activeIndex + 1} of ${count}`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const GSD_CSS = `
.gsd-scroll { scrollbar-width: none; -ms-overflow-style: none; }
.gsd-scroll::-webkit-scrollbar { display: none; }
.gsd-scene img { background: #0b0b0d; }

/* floating glass pill */
.gsd-pill {
  padding: clamp(4px, 1.6cqi, 8px);
  gap: clamp(2px, 1cqi, 6px);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px) saturate(130%);
  -webkit-backdrop-filter: blur(12px) saturate(130%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -1px 0 rgba(0, 0, 0, 0.12);
}

/* square interaction region — larger than the visible glyph */
.gsd-btn {
  width: clamp(30px, 11cqi, 44px);
  height: clamp(30px, 11cqi, 44px);
}
.gsd-icon-svg {
  width: clamp(13px, 4.6cqi, 18px);
  height: clamp(13px, 4.6cqi, 18px);
}

/* travelling glass highlight — a small glass layer inside the pill */
.gsd-highlight {
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px) saturate(140%);
  -webkit-backdrop-filter: blur(8px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.38);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -1px 0 rgba(0, 0, 0, 0.08),
    0 2px 12px rgba(0, 0, 0, 0.18);
}

/* card mode: tighter rhythm, same recognisable dock */
.gsd-root[data-mode="card"] .gsd-pill {
  padding: clamp(3px, 1.4cqi, 5px);
  gap: clamp(1px, 0.8cqi, 3px);
}
.gsd-root[data-mode="card"] .gsd-btn {
  width: clamp(26px, 10.5cqi, 34px);
  height: clamp(26px, 10.5cqi, 34px);
}
.gsd-root[data-mode="card"] .gsd-icon-svg {
  width: clamp(11px, 4.2cqi, 14px);
  height: clamp(11px, 4.2cqi, 14px);
}

@media (prefers-reduced-motion: reduce) {
  .gsd-icon { transition: none; }
}
`;

export default GlassSceneDock;
