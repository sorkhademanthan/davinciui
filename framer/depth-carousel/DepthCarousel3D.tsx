/**
 * DepthCarousel3D
 * -----------------------------------------------------------------------------
 * An infinite 3D image carousel in plain DOM + CSS 3D transforms (no canvas,
 * no WebGL). The active card sits centre, larger and flat to the viewer;
 * neighbours fan out smaller, rotated toward the viewer and pushed back in Z,
 * swinging edge-on and disappearing at 90 degrees. The outer 25% on both
 * sides is a frosted-glass blur that fades toward the centre.
 *
 * Usage
 *   Drop the component on the canvas and add items (or leave the empty
 *   default to preview the built-in gradient placeholders). Drag, swipe,
 *   wheel, arrow keys, or click a card to focus it.
 *
 * Rendering model
 *   `progress` is a MotionValue slot position. Every change runs one
 *   applyLayout() pass that writes style directly to the item refs; React is
 *   never re-rendered per frame. Motion uses Framer Motion springs; under
 *   reduced motion a short tween replaces springs and autoplay is disabled.
 *
 * Where the spec is silent
 *   - Initial position seeds the first card centred (spec does not define it).
 *   - Wheel in "both" mode takes the dominant axis; Shift+wheel prefers the
 *     vertical delta, so trackpads on macOS (which emit deltaX for shift)
 *     and Windows both work. Plain vertical scroll is never hijacked.
 *   - deltaMode: line wheels are scaled x16px.
 *
 * @framerIntrinsicWidth 1000
 * @framerIntrinsicHeight 560
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

import * as React from "react";
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  type AnimationPlaybackControls,
} from "framer-motion";
import { addPropertyControls, ControlType } from "framer";

/* =============================================================================
 * 1. TYPES
 * ===========================================================================*/

export interface DepthCarousel3DItem {
  image?: unknown;
  link?: unknown;
  newTab?: boolean;
  alt?: string;
}

export interface DepthCarousel3DProps {
  items?: DepthCarousel3DItem[];
  ariaLabel?: string;
  itemWidth?: number;
  itemHeight?: number;
  activeWidthScale?: number;
  activeHeightScale?: number;
  gap?: number;
  spacingOverlap?: number;
  radius?: number;
  responsiveScale?: boolean;
  perspective?: number;
  rotation?: number;
  maxRotation?: number;
  depth?: number;
  edgeBlur?: boolean;
  blurAmount?: number;
  blurWidth?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  dragPxPerSlot?: number;
  wheel?: boolean;
  wheelAxis?: "horizontal" | "both";
  keyboard?: boolean;
  clickToFocus?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  minLoopCount?: number;
}

/** A slide after URL resolution, before the browser has decoded it. */
interface ResolvedItem {
  src: string | null;
  link: string | null;
  newTab: boolean;
  alt: string;
  hue: number;
}

export interface DepthLayoutParams {
  itemWidth: number;
  itemHeight: number;
  activeWidthScale: number;
  activeHeightScale: number;
  gap: number;
  spacingOverlap: number;
  rotation: number;
  maxRotation: number;
  depth: number;
}

export interface DepthLayoutResult {
  width: number;
  height: number;
  x: number;
  z: number;
  rotateY: number;
  zIndex: number;
  marginLeft: number;
  marginTop: number;
}

/* =============================================================================
 * 2. CONSTANTS
 * ===========================================================================*/

const MAX_ITEMS_DOM = 200; // safety cap, far above any real use
const PLACEHOLDER_COUNT = 5;
const DRAG_SLOP_PX = 4;
const RELEASE_VELOCITY_MS = 100;
const AUTOPLAY_PAUSE_MS = 2000;
const WHEEL_SNAP_MS = 120;
const MIN_LOOP_MIN = 6;

export const DEFAULT_LAYOUT: DepthLayoutParams = {
  itemWidth: 300,
  itemHeight: 250,
  activeWidthScale: 1.5,
  activeHeightScale: 1.2,
  gap: 40,
  spacingOverlap: 0.85,
  rotation: 35,
  maxRotation: 90,
  depth: 200,
};

/* =============================================================================
 * 3. MATH (exported for the golden verification test)
 * ===========================================================================*/

export function wrapSignedDistance(value: number, period: number): number {
  if (!Number.isFinite(value) || period <= 0) return 0;
  let wrapped = ((value % period) + period) % period;
  if (wrapped >= period / 2) wrapped -= period;
  return wrapped;
}

/** Layout for one item at signed slot delta `d` (d > 0 fans to the right). */
export function computeDepthLayout(
  d: number,
  p: DepthLayoutParams,
): DepthLayoutResult {
  const a = Math.abs(d);
  const s = d < 0 ? -1 : 1;
  const t = Math.min(a, 1);
  const width = p.itemWidth * (1 + (p.activeWidthScale - 1) * (1 - t));
  const height = p.itemHeight * (1 + (p.activeHeightScale - 1) * (1 - t));
  const activeW = p.itemWidth * p.activeWidthScale;
  const x1 = activeW / 2 + p.itemWidth / 2 + p.gap;
  const step = (p.itemWidth + p.gap) * p.spacingOverlap;
  const x = s * (a < 1 ? a * x1 : x1 + (a - 1) * step);
  const z = -p.depth * a;
  const rotateY = s * Math.min(p.maxRotation, p.rotation * a);
  const zIndex = 1000 - Math.round(10 * a);
  return {
    width,
    height,
    x,
    z,
    rotateY,
    zIndex,
    marginLeft: -width / 2,
    marginTop: -height / 2,
  };
}

/* =============================================================================
 * 4. MEDIA HELPERS
 * ===========================================================================*/

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const numberOr = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Best-effort URL out of a String, ResponsiveImage or Link-like value. */
const resolveUrl = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  for (const key of ["src", "url", "href"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim())
      return candidate.trim();
  }
  const srcSet = record["srcSet"];
  if (typeof srcSet === "string" && srcSet.trim()) {
    const first = srcSet.split(",")[0]?.trim().split(/\s+/)[0];
    if (first) return first;
  }
  return "";
};

const resolveItems = (
  items: DepthCarousel3DItem[] | undefined,
): ResolvedItem[] => {
  const resolveOne = (item: DepthCarousel3DItem, index: number): ResolvedItem => {
    const src = resolveUrl(item.image) || null;
    const link = resolveUrl(item.link) || null;
    return {
      src,
      link,
      newTab: item.newTab !== false,
      alt:
        typeof item.alt === "string" && item.alt.trim()
          ? item.alt.trim()
          : "",
      hue: (index * 47 + 210) % 360,
    };
  };
  if (!items || items.length === 0) {
    return Array.from({ length: PLACEHOLDER_COUNT }, (_, index) =>
      resolveOne({}, index),
    );
  }
  return items.map(resolveOne);
};

const itemsKey = (items: DepthCarousel3DItem[] | undefined): string =>
  (items ?? [])
    .map(
      (item) =>
        `${resolveUrl(item.image)}:${resolveUrl(item.link)}:${item.newTab !== false ? 1 : 0}:${item.alt ?? ""}`,
    )
    .join("|");

/** Diagonal gradient used when an item has no source. */
const placeholderGradient = (hue: number): string =>
  `linear-gradient(135deg, hsl(${hue} 45% 62%), hsl(${(hue + 40) % 360} 50% 30%))`;

function usePrefersReducedMotion(): boolean {
  // Read matchMedia synchronously so frame 1 honours the preference.
  const [reduced, setReduced] = React.useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (): void => setReduced(query.matches);
    apply();
    query.addEventListener?.("change", apply);
    return () => query.removeEventListener?.("change", apply);
  }, []);

  return reduced;
}

/* =============================================================================
 * 5. COMPONENT
 * ===========================================================================*/

const DepthCarousel3D: React.FC<DepthCarousel3DProps> = (rawProps) => {
  const props = { ...DEFAULT_PROPS, ...rawProps };
  const propsRef = React.useRef(props);
  React.useEffect(() => {
    propsRef.current = props;
  });

  const reducedMotion = usePrefersReducedMotion();
  const reduceMotionRef = React.useRef(reducedMotion);
  React.useEffect(() => {
    reduceMotionRef.current = reducedMotion;
  });

  const key = React.useMemo(() => itemsKey(props.items), [props.items]);
  // Keyed on the resolved source string rather than the array identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resolved = React.useMemo(() => resolveItems(props.items), [key]);
  const uniqueCount = resolved.length;
  const minLoop = clamp(
    Math.round(numberOr(props.minLoopCount, 20)),
    MIN_LOOP_MIN,
    40,
  );
  const N = Math.min(
    MAX_ITEMS_DOM,
    uniqueCount * Math.ceil(minLoop / uniqueCount),
  );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const dragLayerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const scaleRef = React.useRef(1);

  const progress = useMotionValue(0);
  const animationRef = React.useRef<AnimationPlaybackControls | null>(null);
  const interactionUntilRef = React.useRef(0);
  const wheelSnapRef = React.useRef<number | null>(null);
  const autoplayRef = React.useRef<number | null>(null);
  const draggingRef = React.useRef(false);
  const hoveredRef = React.useRef(false);
  const dragState = React.useRef<{
    pointerId: number;
    downX: number;
    downY: number;
    lastX: number;
    lastTime: number;
    moved: number;
    samples: Array<{ t: number; x: number }>;
  } | null>(null);

  const noteInteraction = (): void => {
    interactionUntilRef.current = performance.now() + AUTOPLAY_PAUSE_MS;
  };

  const stopAnimation = (): void => {
    animationRef.current?.stop();
  };

  const applyLayout = React.useCallback(
    (value: number): void => {
      const cfg = propsRef.current;
      const scale = scaleRef.current;
      const params: DepthLayoutParams = {
        itemWidth: numberOr(cfg.itemWidth, DEFAULT_LAYOUT.itemWidth) * scale,
        itemHeight: numberOr(cfg.itemHeight, DEFAULT_LAYOUT.itemHeight) * scale,
        activeWidthScale: numberOr(
          cfg.activeWidthScale,
          DEFAULT_LAYOUT.activeWidthScale,
        ),
        activeHeightScale: numberOr(
          cfg.activeHeightScale,
          DEFAULT_LAYOUT.activeHeightScale,
        ),
        gap: numberOr(cfg.gap, DEFAULT_LAYOUT.gap) * scale,
        spacingOverlap: numberOr(
          cfg.spacingOverlap,
          DEFAULT_LAYOUT.spacingOverlap,
        ),
        rotation: numberOr(cfg.rotation, DEFAULT_LAYOUT.rotation),
        maxRotation: numberOr(cfg.maxRotation, DEFAULT_LAYOUT.maxRotation),
        depth: numberOr(cfg.depth, DEFAULT_LAYOUT.depth) * scale,
      };
      const count = itemRefs.current.length;
      for (let i = 0; i < count; i += 1) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const d = wrapSignedDistance(i - value, count);
        const layout = computeDepthLayout(d, params);
        el.style.width = `${layout.width.toFixed(3)}px`;
        el.style.height = `${layout.height.toFixed(3)}px`;
        el.style.marginLeft = `${layout.marginLeft.toFixed(3)}px`;
        el.style.marginTop = `${layout.marginTop.toFixed(3)}px`;
        el.style.zIndex = String(layout.zIndex);
        el.style.transform = `translateX(${layout.x.toFixed(3)}px) translateZ(${layout.z.toFixed(3)}px) rotateY(${layout.rotateY.toFixed(3)}deg)`;
        const active = Math.abs(d) <= 0.5;
        if (active) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", "true");
      }
    },
    [],
  );

  useMotionValueEvent(progress, "change", applyLayout);

  const springTo = React.useCallback(
    (target: number): void => {
      const cfg = propsRef.current;
      stopAnimation();
      if (reduceMotionRef.current) {
        animationRef.current = animate(progress, target, {
          type: "tween",
          duration: 0.2,
          ease: "easeOut",
        });
        return;
      }
      animationRef.current = animate(progress, target, {
        type: "spring",
        stiffness: numberOr(cfg.stiffness, 170),
        damping: numberOr(cfg.damping, 26),
        mass: numberOr(cfg.mass, 1),
      });
    },
    [progress],
  );

  // Apply on mount and whenever any prop changes (no remount needed).
  React.useEffect(() => {
    applyLayout(progress.get());
  });

  // Preload media so cards do not flash empty on first paint.
  React.useEffect(() => {
    for (const item of resolved) {
      if (!item.src) continue;
      const image = new Image();
      image.src = item.src;
      void image.decode?.().catch(() => {
        // Decode failures surface as the light-grey placeholder beneath.
      });
    }
  }, [resolved]);

  // Responsive scale: clamp(containerWidth / 1000, 0.55, 1).
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const apply = (): void => {
      const width = root.getBoundingClientRect().width;
      scaleRef.current =
        propsRef.current.responsiveScale === false
          ? 1
          : clamp(width / 1000, 0.55, 1);
      applyLayout(progress.get());
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(root);
    return () => observer.disconnect();
  }, [applyLayout, progress]);

  /* ------------------------------------------------------------------
   * Input: pointer drag / swipe, wheel, keyboard, click hit-testing
   * ---------------------------------------------------------------- */

  const pxPerSlot = (): number =>
    Math.max(1, numberOr(propsRef.current.dragPxPerSlot, 300));

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const layer = dragLayerRef.current;
    if (!layer) return;
    try {
      layer.setPointerCapture(event.pointerId);
    } catch {
      // Capture can fail for synthetic events; dragging still works.
    }
    stopAnimation();
    const now = performance.now();
    draggingRef.current = true;
    dragState.current = {
      pointerId: event.pointerId,
      downX: event.clientX,
      downY: event.clientY,
      lastX: event.clientX,
      lastTime: now,
      moved: 0,
      samples: [{ t: now, x: event.clientX }],
    };
    noteInteraction();
    layer.style.cursor = "grabbing";
  };

  const onPointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    const drag = dragState.current;
    if (!draggingRef.current || !drag || event.pointerId !== drag.pointerId)
      return;
    const now = performance.now();
    const dx = event.clientX - drag.lastX;
    progress.set(progress.get() - dx / pxPerSlot());
    drag.moved += Math.abs(dx);
    drag.samples.push({ t: now, x: event.clientX });
    while (
      drag.samples.length > 2 &&
      drag.samples[0]!.t < now - RELEASE_VELOCITY_MS
    ) {
      drag.samples.shift();
    }
    drag.lastX = event.clientX;
    drag.lastTime = now;
    noteInteraction();
  };

  const finishDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    cancelled: boolean,
  ): void => {
    const drag = dragState.current;
    if (!draggingRef.current || !drag || event.pointerId !== drag.pointerId)
      return;
    const layer = dragLayerRef.current;
    try {
      if (layer?.hasPointerCapture(event.pointerId))
        layer.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore capture edge cases.
    }
    draggingRef.current = false;
    dragState.current = null;
    if (layer) layer.style.cursor = "grab";
    noteInteraction();

    const wasTap =
      !cancelled &&
      Math.hypot(event.clientX - drag.downX, event.clientY - drag.downY) <
        DRAG_SLOP_PX;
    if (wasTap) {
      handleTap(event);
      return;
    }

    // Flick velocity in slots/second over the last ~100ms (pointer space).
    const samples = drag.samples;
    let velocitySlots = 0;
    if (samples.length >= 2) {
      const first = samples[0]!;
      const last = samples[samples.length - 1]!;
      const elapsed = Math.max(0.001, (last.t - first.t) / 1000);
      velocitySlots = (last.x - first.x) / elapsed / pxPerSlot();
    }
    if (performance.now() - drag.lastTime > RELEASE_VELOCITY_MS)
      velocitySlots = 0;
    const current = progress.get();
    // Clamp the throw to at most 6 slots either way.
    const target = clamp(
      Math.round(current - velocitySlots * 0.18),
      current - 6,
      current + 6,
    );
    springTo(Math.round(target));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>): void =>
    finishDrag(event, false);

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>): void => {
    finishDrag(event, true);
  };

  const onPointerEnter = (): void => {
    hoveredRef.current = true;
  };

  const onPointerLeave = (): void => {
    hoveredRef.current = false;
  };

  const handleTap = (event: React.PointerEvent<HTMLDivElement>): void => {
    const root = rootRef.current;
    if (!root) return;
    const cfg = propsRef.current;
    const rect = root.getBoundingClientRect();
    const pointerX = event.clientX - (rect.left + rect.width / 2);
    const current = progress.get();
    const n = itemRefs.current.length;
    if (n === 0) return;

    const scale = scaleRef.current;
    const params: DepthLayoutParams = {
      itemWidth: numberOr(cfg.itemWidth, DEFAULT_LAYOUT.itemWidth) * scale,
      itemHeight: numberOr(cfg.itemHeight, DEFAULT_LAYOUT.itemHeight) * scale,
      activeWidthScale: numberOr(cfg.activeWidthScale, DEFAULT_LAYOUT.activeWidthScale),
      activeHeightScale: numberOr(cfg.activeHeightScale, DEFAULT_LAYOUT.activeHeightScale),
      gap: numberOr(cfg.gap, DEFAULT_LAYOUT.gap) * scale,
      spacingOverlap: numberOr(cfg.spacingOverlap, DEFAULT_LAYOUT.spacingOverlap),
      rotation: numberOr(cfg.rotation, DEFAULT_LAYOUT.rotation),
      maxRotation: numberOr(cfg.maxRotation, DEFAULT_LAYOUT.maxRotation),
      depth: numberOr(cfg.depth, DEFAULT_LAYOUT.depth) * scale,
    };

    let bestIndex = -1;
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestD = 0;
    for (let i = 0; i < n; i += 1) {
      const d = wrapSignedDistance(i - current, n);
      const { x } = computeDepthLayout(d, params);
      const distance = Math.abs(pointerX - x);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
        bestD = d;
      }
    }
    if (bestIndex < 0) return;
    const media = resolved[bestIndex % uniqueCount];
    noteInteraction();
    const active = Math.abs(bestD) <= 0.5;
    if (active) {
      if (media?.link) {
        if (media.newTab) window.open(media.link, "_blank", "noopener");
        else window.location.assign(media.link);
      }
      return;
    }
    if (cfg.clickToFocus !== false) {
      springTo(current + wrapSignedDistance(bestIndex - current, n));
    }
  };

  const onWheel = React.useCallback(
    (event: WheelEvent): void => {
      const cfg = propsRef.current;
      if (cfg.wheel === false) return;
      // Horizontal delta, vertical only when Shift is held or wheelAxis is
      // "both". Plain vertical scroll is never consumed.
      let delta = 0;
      if (cfg.wheelAxis === "both") {
        delta =
          Math.abs(event.deltaX) >= Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY;
      } else if (event.shiftKey) {
        delta =
          Math.abs(event.deltaY) > Math.abs(event.deltaX)
            ? event.deltaY
            : event.deltaX;
      } else {
        delta = event.deltaX;
      }
      if (event.deltaMode === 1) delta *= 16; // lines -> px
      if (!delta) return; // nothing to consume; page scrolls normally
      event.preventDefault();
      stopAnimation();
      progress.set(progress.get() + delta / pxPerSlot());
      noteInteraction();
      if (wheelSnapRef.current !== null)
        window.clearTimeout(wheelSnapRef.current);
      wheelSnapRef.current = window.setTimeout(() => {
        wheelSnapRef.current = null;
        springTo(Math.round(progress.get()));
      }, WHEEL_SNAP_MS);
    },
    [progress, springTo],
  );

  React.useEffect(() => {
    const layer = dragLayerRef.current;
    if (!layer) return;
    layer.addEventListener("wheel", onWheel, { passive: false });
    return () => layer.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ): void => {
    const cfg = propsRef.current;
    if (cfg.keyboard === false) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      springTo(Math.round(progress.get()) + direction);
      noteInteraction();
      return;
    }
    // Home/End are optional conveniences, not required behaviour.
    if (event.key === "Home") {
      event.preventDefault();
      springTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      springTo(Math.max(0, N - 1));
    }
  };

  // Optional autoplay: one slot per interval, paused on hover, while
  // dragging, and for 2s after any interaction. Disabled by reduced motion.
  React.useEffect(() => {
    if (reduceMotionRef.current) return;
    if (!props.autoplay) return;
    const intervalMs =
      clamp(numberOr(props.autoplayInterval, 3), 1, 10) * 1000;
    autoplayRef.current = window.setInterval(() => {
      if (draggingRef.current || hoveredRef.current) return;
      if (performance.now() < interactionUntilRef.current) return;
      springTo(Math.round(progress.get()) + 1);
    }, intervalMs);
    return () => {
      if (autoplayRef.current !== null) {
        window.clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [props.autoplay, props.autoplayInterval, progress, springTo]);

  // Stop springs and pending timers on unmount.
  React.useEffect(
    () => () => {
      animationRef.current?.stop();
      if (wheelSnapRef.current !== null)
        window.clearTimeout(wheelSnapRef.current);
    },
    [],
  );

  const radius = clamp(numberOr(props.radius, 18), 0, 80);
  const perspective = clamp(numberOr(props.perspective, 550), 200, 2000);
  const edgeBlur = props.edgeBlur !== false;
  const blurAmount = clamp(numberOr(props.blurAmount, 25), 0, 60);
  const blurWidth = clamp(numberOr(props.blurWidth, 25), 0, 50);

  const initialLayoutParams: DepthLayoutParams = {
    itemWidth: numberOr(props.itemWidth, DEFAULT_LAYOUT.itemWidth),
    itemHeight: numberOr(props.itemHeight, DEFAULT_LAYOUT.itemHeight),
    activeWidthScale: numberOr(props.activeWidthScale, DEFAULT_LAYOUT.activeWidthScale),
    activeHeightScale: numberOr(props.activeHeightScale, DEFAULT_LAYOUT.activeHeightScale),
    gap: numberOr(props.gap, DEFAULT_LAYOUT.gap),
    spacingOverlap: numberOr(props.spacingOverlap, DEFAULT_LAYOUT.spacingOverlap),
    rotation: numberOr(props.rotation, DEFAULT_LAYOUT.rotation),
    maxRotation: numberOr(props.maxRotation, DEFAULT_LAYOUT.maxRotation),
    depth: numberOr(props.depth, DEFAULT_LAYOUT.depth),
  };

  const blurMask = (direction: "right" | "left"): string =>
    `linear-gradient(to ${direction}, black 0%, transparent 100%)`;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={props.ariaLabel ?? "3D image carousel"}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 600,
        minHeight: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: `${perspective}px`,
        overflow: "hidden",
      }}
    >
      <div
        ref={dragLayerRef}
        data-depth-drag
        tabIndex={0}
        aria-label="Drag, swipe, or use arrow keys to browse"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 9999,
          cursor: "grab",
          touchAction: "pan-y",
          background: "transparent",
        }}
      />
      <div
        style={{
          position: "relative",
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
        }}
      >
        {Array.from({ length: N }, (_, index) => {
          const media = resolved[index % uniqueCount]!;
          const d = wrapSignedDistance(index, N);
          const layout = computeDepthLayout(d, initialLayoutParams);
          const backgroundImage = media.src
            ? `url(${media.src})`
            : placeholderGradient(media.hue);
          return (
            <div
              key={`${index}-${media.hue}-${media.src ?? "placeholder"}`}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              data-depth-index={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${(index % uniqueCount) + 1} of ${uniqueCount}`}
              aria-hidden={Math.abs(d) <= 0.5 ? undefined : true}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transformStyle: "preserve-3d",
                willChange: "transform",
                width: `${layout.width.toFixed(3)}px`,
                height: `${layout.height.toFixed(3)}px`,
                marginLeft: `${layout.marginLeft.toFixed(3)}px`,
                marginTop: `${layout.marginTop.toFixed(3)}px`,
                zIndex: layout.zIndex,
                transform: `translateX(${layout.x.toFixed(3)}px) translateZ(${layout.z.toFixed(3)}px) rotateY(${layout.rotateY.toFixed(3)}deg)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: `${radius}px`,
                  opacity: 1,
                  backgroundColor: "#e5e5e5",
                }}
              />
            </div>
          );
        })}
      </div>
      {edgeBlur ? (
        <>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${blurWidth}%`,
              zIndex: 5000,
              pointerEvents: "none",
              backdropFilter: `blur(${blurAmount}px)`,
              WebkitBackdropFilter: `blur(${blurAmount}px)`,
              maskImage: blurMask("right"),
              WebkitMaskImage: blurMask("right"),
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: `${blurWidth}%`,
              zIndex: 5000,
              pointerEvents: "none",
              backdropFilter: `blur(${blurAmount}px)`,
              WebkitBackdropFilter: `blur(${blurAmount}px)`,
              maskImage: blurMask("left"),
              WebkitMaskImage: blurMask("left"),
            }}
          />
        </>
      ) : null}
    </div>
  );
};

/* =============================================================================
 * 6. DEFAULTS, PROPERTY CONTROLS, EXPORT
 * ===========================================================================*/

const DEFAULT_PROPS = {
  items: [] as DepthCarousel3DItem[],
  ariaLabel: "3D image carousel",
  itemWidth: 300,
  itemHeight: 250,
  activeWidthScale: 1.5,
  activeHeightScale: 1.2,
  gap: 40,
  spacingOverlap: 0.85,
  radius: 18,
  responsiveScale: true,
  perspective: 550,
  rotation: 35,
  maxRotation: 90,
  depth: 200,
  edgeBlur: true,
  blurAmount: 25,
  blurWidth: 25,
  stiffness: 170,
  damping: 26,
  mass: 1,
  dragPxPerSlot: 300,
  wheel: true,
  wheelAxis: "horizontal" as const,
  keyboard: true,
  clickToFocus: true,
  autoplay: false,
  autoplayInterval: 3,
  minLoopCount: 20,
};

// @types/react 19 dropped defaultProps from FunctionComponent, and React 19
// ignores it at runtime (props merge DEFAULT_PROPS manually, so behaviour is
// unchanged). Set it anyway for older runtimes that still read it.
const DepthCarousel3DWithDefaults =
  DepthCarousel3D as React.FC<DepthCarousel3DProps> & {
    defaultProps?: Partial<DepthCarousel3DProps>;
  };
DepthCarousel3DWithDefaults.defaultProps = DEFAULT_PROPS;

addPropertyControls(DepthCarousel3D, {
  items: {
    type: ControlType.Array,
    title: "Items",
    defaultValue: [],
    control: {
      type: ControlType.Object,
      controls: {
        image: {
          type: ControlType.ResponsiveImage,
          title: "Image",
        },
        link: {
          type: ControlType.Link,
          title: "Link",
        },
        newTab: {
          type: ControlType.Boolean,
          title: "New Tab",
          defaultValue: true,
          hidden: (item: { link?: unknown }) => !item.link,
        },
        alt: {
          type: ControlType.String,
          title: "Alt",
        },
      },
    },
  },
  ariaLabel: {
    type: ControlType.String,
    title: "Aria Label",
    defaultValue: "3D image carousel",
  },
  itemWidth: {
    type: ControlType.Number,
    title: "Item Width",
    min: 80,
    max: 800,
    step: 1,
    unit: "px",
    defaultValue: 300,
  },
  itemHeight: {
    type: ControlType.Number,
    title: "Item Height",
    min: 80,
    max: 800,
    step: 1,
    unit: "px",
    defaultValue: 250,
  },
  activeWidthScale: {
    type: ControlType.Number,
    title: "Active Width",
    min: 1,
    max: 3,
    step: 0.05,
    defaultValue: 1.5,
  },
  activeHeightScale: {
    type: ControlType.Number,
    title: "Active Height",
    min: 1,
    max: 3,
    step: 0.05,
    defaultValue: 1.2,
  },
  gap: {
    type: ControlType.Number,
    title: "Gap",
    min: 0,
    max: 200,
    step: 1,
    unit: "px",
    defaultValue: 40,
  },
  spacingOverlap: {
    type: ControlType.Number,
    title: "Spacing Overlap",
    min: 0.4,
    max: 1.2,
    step: 0.01,
    defaultValue: 0.85,
  },
  radius: {
    type: ControlType.Number,
    title: "Radius",
    min: 0,
    max: 80,
    step: 1,
    unit: "px",
    defaultValue: 18,
  },
  responsiveScale: {
    type: ControlType.Boolean,
    title: "Responsive Scale",
    defaultValue: true,
  },
  perspective: {
    type: ControlType.Number,
    title: "Perspective",
    min: 200,
    max: 2000,
    step: 1,
    unit: "px",
    defaultValue: 550,
  },
  rotation: {
    type: ControlType.Number,
    title: "Rotation",
    min: 0,
    max: 60,
    step: 1,
    unit: "°/slot",
    defaultValue: 35,
  },
  maxRotation: {
    type: ControlType.Number,
    title: "Max Rotation",
    min: 0,
    max: 90,
    step: 1,
    unit: "°",
    defaultValue: 90,
  },
  depth: {
    type: ControlType.Number,
    title: "Depth",
    min: 0,
    max: 600,
    step: 1,
    unit: "px/slot",
    defaultValue: 200,
  },
  edgeBlur: {
    type: ControlType.Boolean,
    title: "Edge Blur",
    defaultValue: true,
  },
  blurAmount: {
    type: ControlType.Number,
    title: "Blur Amount",
    min: 0,
    max: 60,
    step: 1,
    unit: "px",
    defaultValue: 25,
    hidden: (props: DepthCarousel3DProps) => props.edgeBlur === false,
  },
  blurWidth: {
    type: ControlType.Number,
    title: "Blur Width",
    min: 0,
    max: 50,
    step: 1,
    unit: "%",
    defaultValue: 25,
    hidden: (props: DepthCarousel3DProps) => props.edgeBlur === false,
  },
  stiffness: {
    type: ControlType.Number,
    title: "Stiffness",
    min: 40,
    max: 500,
    step: 1,
    defaultValue: 170,
  },
  damping: {
    type: ControlType.Number,
    title: "Scroll damping",
    min: 5,
    max: 80,
    step: 1,
    defaultValue: 26,
  },
  mass: {
    type: ControlType.Number,
    title: "Mass",
    min: 0.3,
    max: 3,
    step: 0.1,
    defaultValue: 1,
  },
  dragPxPerSlot: {
    type: ControlType.Number,
    title: "Drag Distance",
    min: 100,
    max: 800,
    step: 1,
    unit: "px",
    defaultValue: 300,
  },
  wheel: {
    type: ControlType.Boolean,
    title: "Wheel",
    defaultValue: true,
  },
  wheelAxis: {
    type: ControlType.Enum,
    title: "Wheel Axis",
    options: ["horizontal", "both"],
    optionTitles: ["Horizontal", "Both"],
    defaultValue: "horizontal",
    hidden: (props: DepthCarousel3DProps) => props.wheel === false,
  },
  keyboard: {
    type: ControlType.Boolean,
    title: "Keyboard",
    defaultValue: true,
  },
  clickToFocus: {
    type: ControlType.Boolean,
    title: "Click To Focus",
    defaultValue: true,
  },
  autoplay: {
    type: ControlType.Boolean,
    title: "Autoplay",
    defaultValue: false,
  },
  autoplayInterval: {
    type: ControlType.Number,
    title: "Autoplay Interval",
    min: 1,
    max: 10,
    step: 0.5,
    unit: "s",
    defaultValue: 3,
    hidden: (props: DepthCarousel3DProps) => props.autoplay !== true,
  },
  minLoopCount: {
    type: ControlType.Number,
    title: "Min Loop Count",
    min: 6,
    max: 40,
    step: 1,
    defaultValue: 20,
  },
});

export default DepthCarousel3D;
