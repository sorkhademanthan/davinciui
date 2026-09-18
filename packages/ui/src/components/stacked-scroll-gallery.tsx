"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ---------------------------------- types --------------------------------- */

export type StackedScrollMediaType = "image" | "video" | "auto";

export interface StackedScrollGalleryItem {
  /** Image or video URL. Videos detected by extension unless `type` is set. */
  src: string;
  type?: StackedScrollMediaType;
  /** Accessible label for the media. */
  alt?: string;
  /** Poster frame for video items. */
  poster?: string;
}

export type StackedScrollEasing =
  | "linear"
  | "easeInOut"
  | ((t: number) => number);

export interface StackedScrollGalleryProps {
  /** Media panels in stack order. First item starts on top. */
  items?: StackedScrollGalleryItem[];
  /** Height of the pinned viewport (any CSS length). */
  viewportHeight?: string;
  /** Scroll distance devoted to each transition, in vh units. */
  scrollDistancePerItem?: number;
  /** Height (px) of the incoming card's preview strip at rest. Scales down on small screens. */
  previewHeight?: number;
  /** Corner radius (px) applied to every card independently. */
  radius?: number;
  /** How media fills its card. */
  fit?: "cover" | "contain" | "fill";
  /** Media focal point (CSS object-position). */
  position?: string;
  /** Scroll-follow smoothing, 0 (direct) to 1. Keep low so scrubbing stays responsive. */
  smoothing?: number;
  /** Easing applied to each transition's local progress. */
  easing?: StackedScrollEasing;
  /** Dim outgoing cards as the next panel travels over them. */
  dimming?: boolean;
  /** Max dim overlay opacity (0–1) when a card is fully covered. */
  dimStrength?: number;
  /** When false, renders a static accessible list instead of the pinned scroll effect. */
  enabled?: boolean;
  /** Pause videos that are not the active (or adjacent) panel. */
  pauseOffscreenVideos?: boolean;
  /**
   * Surrounding background color. When omitted, the gallery follows the
   * theme (light zinc in light mode, near-black in dark mode).
   */
  background?: string;
  /** Inset (px) between the viewport edge and the cards on every side. */
  gutter?: number;
  className?: string;
  style?: React.CSSProperties;
}

/* --------------------------------- helpers -------------------------------- */

const UNSPLASH = "?q=80&w=1800&auto=format&fit=crop";

const DEFAULT_ITEMS: StackedScrollGalleryItem[] = [
  {
    src: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4${UNSPLASH}`,
    alt: "Matterhorn peak rising above a sea of clouds at dawn",
  },
  {
    src: `https://images.unsplash.com/photo-1469474968028-56623f02e42e${UNSPLASH}`,
    alt: "Sunlight breaking through a mountain forest valley",
  },
  {
    src: `https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05${UNSPLASH}`,
    alt: "Morning fog rolling over layered green hills",
  },
  {
    src: `https://images.unsplash.com/photo-1447752875215-b2761acb3c5d${UNSPLASH}`,
    alt: "Tall pines catching golden light in a dense forest",
  },
  {
    src: `https://images.unsplash.com/photo-1433086966358-54859d0ed716${UNSPLASH}`,
    alt: "Waterfall plunging into a misty gorge",
  },
];

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function easeInOut(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function resolveEasing(easing: StackedScrollEasing): (t: number) => number {
  if (typeof easing === "function") return easing;
  return easing === "easeInOut" ? easeInOut : (t: number) => clamp(t, 0, 1);
}

function isVideoItem(item: StackedScrollGalleryItem): boolean {
  if (item.type === "video") return true;
  if (item.type === "image") return false;
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(item.src);
}

/* -------------------------------- component ------------------------------- */

export function StackedScrollGallery({
  items = DEFAULT_ITEMS,
  viewportHeight = "100vh",
  scrollDistancePerItem = 100,
  previewHeight = 44,
  radius = 20,
  fit = "cover",
  position = "50% 50%",
  smoothing = 0.14,
  easing = "linear",
  dimming = true,
  dimStrength = 0.3,
  enabled = true,
  pauseOffscreenVideos = true,
  background,
  gutter = 22,
  className,
  style,
}: StackedScrollGalleryProps) {
  const count = items.length;

  const trackRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dimRefs = useRef<Array<HTMLDivElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  // Imperative animation state — never stored in React state so scrolling
  // never triggers rerenders.
  const targetRef = useRef(0);
  const renderedRef = useRef(0);
  const metricsRef = useRef({ cardHeight: 0, preview: previewHeight });
  const firstFrameRef = useRef(true);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef(0);

  const transitions = Math.max(1, Math.max(0, count) - 1);
  const safePreviewHeight = Math.max(0, previewHeight);
  const safeScrollDistance = Math.max(0, scrollDistancePerItem);
  const safeGutter = Math.max(0, gutter);
  const clampDim = clamp(dimStrength, 0, 1);
  const smoothFactor = reducedMotion ? 0 : clamp(smoothing, 0, 1);

  // Live config for the rAF loop. Assigned during render so prop changes
  // (easing, dimming, items) take effect without re-subscribing the loop.
  const configRef = useRef({
    easeFn: resolveEasing(easing),
    dimming,
    dimStrength: clampDim,
    pauseOffscreenVideos,
    count,
    transitions,
  });
  configRef.current = {
    easeFn: resolveEasing(easing),
    dimming,
    dimStrength: clampDim,
    pauseOffscreenVideos,
    count,
    transitions,
  };

  /* Reduced-motion: follow scroll directly, no interpolation drift. */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* Imperative render: derive every card's transform from progress. */
  function renderFrame(progress: number) {
    const { easeFn, dimming: dimOn, dimStrength: dimMax, count: n, transitions: t } =
      configRef.current;
    const { cardHeight, preview } = metricsRef.current;
    if (cardHeight <= 0 || n === 0) return false;
    const startY = Math.max(0, cardHeight - preview);
    // Active transition index. Cards before it have settled (y = 0), the
    // next card is rising over the current one, and all later cards stay
    // parked fully below the viewport — otherwise the highest z-index card
    // would cover every preview strip with its own.
    const seg = clamp(progress * t, 0, t);
    const k = Math.min(Math.floor(seg + 1e-6), Math.max(0, t - 1));

    for (let i = 0; i < n; i++) {
      const card = cardRefs.current[i];
      if (card) {
        let y = 0;
        if (i > 0) {
          const ti = i - 1;
          if (ti < k) {
            y = 0;
          } else if (ti === k) {
            const local = clamp(seg - k, 0, 1);
            y = (1 - easeFn(local)) * startY;
          } else {
            y = cardHeight;
          }
        }
        card.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      }
      const dim = dimRefs.current[i];
      if (dim) {
        let opacity = 0;
        if (dimOn && i < n - 1) {
          const nextStart = i / t;
          const nextLocal = clamp((progress - nextStart) * t, 0, 1);
          opacity = easeFn(nextLocal) * dimMax;
        }
        dim.style.opacity = opacity.toFixed(3);
      }
    }

    const nextActive = clamp(Math.round(progress * t), 0, Math.max(0, n - 1));
    if (nextActive !== activeRef.current) {
      activeRef.current = nextActive;
      setActiveIndex(nextActive);
      syncVideos(nextActive);
    }

    if (firstFrameRef.current) {
      firstFrameRef.current = false;
      const stack = stackRef.current;
      if (stack) stack.style.opacity = "";
    }
    return true;
  }

  function syncVideos(active: number) {
    const { pauseOffscreenVideos: pauseOff, count: n } = configRef.current;
    if (!pauseOff) return;
    for (let i = 0; i < n; i++) {
      const video = videoRefs.current[i];
      if (!video) continue;
      if (Math.abs(i - active) <= 1) {
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }
  }

  /* Measure card geometry; recalculate on resize, never per frame. */
  useEffect(() => {
    if (!enabled) return;
    const stack = stackRef.current;
    if (!stack) return;

    const measure = () => {
      const cardHeight = stack.clientHeight;
      const small =
        typeof window !== "undefined" ? window.innerWidth < 640 : false;
      const scaled = small
        ? Math.max(20, Math.round(safePreviewHeight * 0.625))
        : safePreviewHeight;
      metricsRef.current = {
        cardHeight,
        preview: clamp(scaled, 0, Math.max(0, cardHeight * 0.5)),
      };
      // Re-sync immediately so resize never causes a layout jump.
      renderFrame(targetRef.current);
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(stack);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, safePreviewHeight, viewportHeight, safeGutter, count]);

  /* Read normalized scroll progress from the track position. */
  useEffect(() => {
    if (!enabled || count <= 1) return;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const updateTarget = () => {
      const scrollable = track.offsetHeight - viewport.offsetHeight;
      if (scrollable <= 0) {
        targetRef.current = 0;
        return;
      }
      const y = -track.getBoundingClientRect().top;
      targetRef.current = clamp(y / scrollable, 0, 1);
    };

    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);
    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
    };
  }, [enabled, count]);

  /* rAF loop with light smoothing; reverses automatically since all state
     derives from progress. */
  useEffect(() => {
    if (!enabled || count === 0) return;
    firstFrameRef.current = true;
    // Paint the resting state synchronously so the first visible frame is
    // already correct (and reveals the stack even if rAF is throttled).
    renderFrame(targetRef.current);
    let raf = 0;

    const tick = () => {
      const target = targetRef.current;
      let rendered = renderedRef.current;
      if (smoothFactor <= 0) {
        rendered = target;
      } else {
        rendered += (target - rendered) * smoothFactor;
        if (Math.abs(target - rendered) < 0.0004) rendered = target;
      }
      renderedRef.current = rendered;
      renderFrame(rendered);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, count, smoothFactor]);

  /* ------------------------- fallbacks / edge cases ------------------------ */

  if (count === 0) return null;

  // Theme-aware chrome: an explicit `background` prop always wins via
  // inline style; otherwise light/dark classes follow the theme toggle.
  const hasCustomBackground = background !== undefined;
  const themeChromeClass = hasCustomBackground
    ? undefined
    : "bg-zinc-100 dark:bg-[#0a0a0b]";
  const backgroundStyle = hasCustomBackground ? { background } : undefined;

  if (!enabled) {
    return (
      <section
        aria-label="Media gallery"
        className={cn("w-full", themeChromeClass, className)}
        style={{ ...backgroundStyle, ...style }}
      >
        <div
          className="mx-auto flex w-full max-w-6xl flex-col"
          style={{ gap: safeGutter, padding: safeGutter }}
        >
          {items.map((item, i) => (
            <MediaCard
              key={`${item.src}-${i}`}
              item={item}
              fit={fit}
              position={position}
              radius={radius}
              priority={i < 2}
            />
          ))}
        </div>
      </section>
    );
  }

  const trackHeight =
    count > 1
      ? `calc(${viewportHeight} + ${safeScrollDistance * (count - 1)}vh)`
      : viewportHeight;

  return (
    <section
      ref={trackRef}
      aria-label="Stacked scroll media gallery"
      data-testid="stacked-scroll-gallery-track"
      className={cn("relative w-full", themeChromeClass, className)}
      style={{ height: trackHeight, ...backgroundStyle, ...style }}
    >
      <div
        ref={viewportRef}
        data-testid="stacked-scroll-gallery-viewport"
        className={cn("sticky top-0 w-full overflow-hidden", themeChromeClass)}
        style={{ height: viewportHeight, ...backgroundStyle }}
      >
        <div className="h-full w-full" style={{ padding: safeGutter }}>
          {/* Hidden until the first imperative frame paints so cards never
              flash in the wrong position. */}
          <div ref={stackRef} className="relative h-full w-full" style={{ opacity: 0 }}>
            {items.map((item, i) => {
              const video = isVideoItem(item);
              return (
                <div
                  key={`${item.src}-${i}`}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  data-testid={`stacked-scroll-gallery-card-${i}`}
                  aria-hidden={i === 0 ? undefined : i !== activeIndex}
                  className="absolute inset-0 overflow-hidden bg-zinc-200 dark:bg-[#17171a]"
                  style={{
                    zIndex: i + 1,
                    borderRadius: radius,
                    // Resting transform: incoming cards wait below the
                    // viewport with only their preview strip showing.
                    transform:
                      i === 0 ? "translate3d(0, 0, 0)" : "translate3d(0, 100%, 0)",
                    willChange: i === 0 ? undefined : "transform",
                  }}
                >
                  {video ? (
                    <video
                      ref={(el) => {
                        videoRefs.current[i] = el;
                      }}
                      src={item.src}
                      poster={item.poster}
                      muted
                      loop
                      playsInline
                      autoPlay={!reducedMotion}
                      preload={Math.abs(i - activeRef.current) <= 1 ? "auto" : "metadata"}
                      aria-label={item.alt ?? `Gallery media ${i + 1}`}
                      className="block h-full w-full"
                      style={{ objectFit: fit, objectPosition: position }}
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={item.alt ?? `Gallery media ${i + 1}`}
                      draggable={false}
                      loading={i < 2 ? "eager" : "lazy"}
                      decoding="async"
                      className="block h-full w-full select-none"
                      style={{ objectFit: fit, objectPosition: position }}
                    />
                  )}
                  {/* Outgoing-card depth dimming. */}
                  <div
                    ref={(el) => {
                      dimRefs.current[i] = el;
                    }}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-black"
                    style={{ opacity: 0 }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <span className="sr-only" aria-live="polite">
          {items[activeIndex]?.alt ?? `Item ${activeIndex + 1} of ${count}`}
        </span>
      </div>
    </section>
  );
}

/* Static (non-animated) media card used when the scroll effect is disabled. */
function MediaCard({
  item,
  fit,
  position,
  radius,
  priority,
}: {
  item: StackedScrollGalleryItem;
  fit: "cover" | "contain" | "fill";
  position: string;
  radius: number;
  priority: boolean;
}) {
  if (isVideoItem(item)) {
    return (
      <video
        src={item.src}
        poster={item.poster}
        muted
        loop
        playsInline
        controls
        preload="metadata"
        aria-label={item.alt}
        className="block aspect-video w-full"
        style={{ objectFit: fit, objectPosition: position, borderRadius: radius }}
      />
    );
  }
  return (
    <img
      src={item.src}
      alt={item.alt ?? "Gallery media"}
      draggable={false}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className="block aspect-video w-full"
      style={{ objectFit: fit, objectPosition: position, borderRadius: radius }}
    />
  );
}

export default StackedScrollGallery;

/* Registry / Framer property-controls bridge. */
export const StackedScrollGalleryPropertyControls = {
  items: { type: "array", title: "Media Items" },
  viewportHeight: { type: "string", title: "Viewport Height", defaultValue: "100vh" },
  scrollDistancePerItem: {
    type: "number",
    title: "Scroll Distance Per Item (vh)",
    defaultValue: 100,
    min: 0,
    max: 300,
  },
  previewHeight: {
    type: "number",
    title: "Next-Card Preview Height",
    defaultValue: 44,
    min: 0,
    max: 160,
  },
  radius: {
    type: "number",
    title: "Card Radius",
    defaultValue: 20,
    min: 0,
    max: 64,
  },
  fit: {
    type: "enum",
    title: "Media Fit",
    options: ["cover", "contain", "fill"],
    defaultValue: "cover",
  },
  gutter: {
    type: "number",
    title: "Card Inset",
    defaultValue: 22,
    min: 0,
    max: 96,
  },
  smoothing: {
    type: "number",
    title: "Scroll Smoothing",
    defaultValue: 0.14,
    min: 0,
    max: 1,
  },
  dimming: { type: "boolean", title: "Background Dimming", defaultValue: true },
  dimStrength: {
    type: "number",
    title: "Dim Strength",
    defaultValue: 0.3,
    min: 0,
    max: 1,
  },
  enabled: { type: "boolean", title: "Enable Scroll Animation", defaultValue: true },
};
