"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface ArcCarouselItem {
  src: string;
  type?: "image" | "video";
  alt?: string;
}

export interface ArcCarouselProps {
  items: ArcCarouselItem[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  children?: React.ReactNode;
  tileSize?: number | "auto";
  radius?: number | "auto";
  stepAngle?: number;
  friction?: number;
  snap?: boolean;
  autoPlay?: boolean;
  className?: string;
  onActiveChange?: (index: number) => void;
}

interface Dimensions {
  width: number;
  height: number;
}

interface Geometry extends Dimensions {
  size: number;
  radius: number;
  stepRad: number;
  pixelsPerTile: number;
  centerX: number;
  centerY: number;
  textTop: number;
}

interface TileEntry {
  key: string;
  item: ArcCarouselItem;
  index: number;
}

interface DragState {
  pointerId: number;
  lastX: number;
}

interface VelocitySample {
  t: number;
  p: number;
}

interface TweenState {
  from: number;
  to: number;
  start: number;
  duration: number;
}

type EngineMode = "idle" | "drag" | "inertia" | "snap" | "tween" | "drift";

const MIN_TILES = 10;
const MAX_VELOCITY = 72;
const VELOCITY_EPSILON = 0.03;
const WHEEL_GAIN = 6;
const AUTO_PLAY_SPEED = 0.24;
const SPRING_STIFFNESS = 120;
const SPRING_DAMPING = 22;
const CULL_ANGLE_RAD = (75 * Math.PI) / 180;
const SCALE_FALLOFF_RAD = Math.PI * 0.36;
const RAD_TO_DEG = 180 / Math.PI;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const mod = (value: number, modulus: number) =>
  ((value % modulus) + modulus) % modulus;

function computeGeometry(
  width: number,
  height: number,
  tileSize: number | "auto",
  radius: number | "auto",
  stepAngle: number | undefined,
): Geometry {
  if (width <= 0 || height <= 0) {
    return {
      width,
      height,
      size: 0,
      radius: 1,
      stepRad: 0,
      pixelsPerTile: 1,
      centerX: 0,
      centerY: 0,
      textTop: 0,
    };
  }

  const mobile = width < 640;
  const size =
    typeof tileSize === "number"
      ? Math.max(48, tileSize)
      : mobile
        ? clamp(width * 0.42, 140, 300)
        : clamp(width * 0.1788, 120, 340);
  const degrees = stepAngle ?? (mobile ? 20 : 16);
  const stepRad = (Math.max(4, degrees) * Math.PI) / 180;
  const arcRadius =
    typeof radius === "number" && radius > 0
      ? radius
      : mobile
        ? width * 0.9
        : width * 0.5866;

  const edgeTheta = Math.asin(clamp(width / 2 / arcRadius, 0, 1));
  const edgeDrop = arcRadius * (1 - Math.cos(edgeTheta));
  const minTop = Math.max(size / 2 + 16, height * 0.08);
  const maxTop = Math.max(minTop, height * 0.36);
  const topCenterY = clamp(height * 0.7 - edgeDrop, minTop, maxTop);
  const captionGap = Math.max(20, height * 0.035);

  return {
    width,
    height,
    size,
    radius: arcRadius,
    stepRad,
    pixelsPerTile: Math.max(24, arcRadius * stepRad),
    centerX: width / 2,
    centerY: topCenterY + arcRadius,
    textTop: topCenterY + size / 2 + captionGap,
  };
}

export function ArcCarousel({
  items,
  eyebrow = "OUR WORK",
  heading = "The most complete view of the work",
  description = "A living archive of the identities, interfaces, and films we build for people who care about the details.",
  children,
  tileSize = "auto",
  radius = "auto",
  stepAngle,
  friction = 0.94,
  snap = true,
  autoPlay = false,
  className,
  onActiveChange,
}: ArcCarouselProps) {
  const hostRef = React.useRef<HTMLElement | null>(null);
  const tileRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [dimensions, setDimensions] = React.useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const repeat = items.length > 0 ? Math.ceil(MIN_TILES / items.length) : 0;

  const tiles = React.useMemo<TileEntry[]>(() => {
    const next: TileEntry[] = [];
    for (let copy = 0; copy < repeat; copy += 1) {
      items.forEach((item, index) => {
        next.push({ key: `${copy}:${index}`, item, index });
      });
    }
    return next;
  }, [items, repeat]);

  const geometry = React.useMemo(
    () =>
      computeGeometry(
        dimensions.width,
        dimensions.height,
        tileSize,
        radius,
        stepAngle,
      ),
    [dimensions.height, dimensions.width, radius, stepAngle, tileSize],
  );

  const tilesRef = React.useRef(tiles);
  const geometryRef = React.useRef(geometry);
  const configRef = React.useRef({
    friction: 0.94,
    snap: true,
    autoPlay: false,
    reducedMotion: false,
  });
  const progressRef = React.useRef(0);
  const velocityRef = React.useRef(0);
  const modeRef = React.useRef<EngineMode>("idle");
  const rafRef = React.useRef<number | null>(null);
  const lastFrameRef = React.useRef(0);
  const snapTargetRef = React.useRef(0);
  const tweenRef = React.useRef<TweenState | null>(null);
  const dragRef = React.useRef<DragState | null>(null);
  const samplesRef = React.useRef<VelocitySample[]>([]);
  const hoveredRef = React.useRef(false);
  const frameRef = React.useRef<(now: number) => void>(() => {});
  const applyRef = React.useRef<() => void>(() => {});
  const updateActiveRef = React.useRef<() => void>(() => {});
  const onActiveChangeRef = React.useRef(onActiveChange);

  tilesRef.current = tiles;
  geometryRef.current = geometry;
  configRef.current = {
    friction: clamp(friction, 0.8, 0.995),
    snap,
    autoPlay,
    reducedMotion,
  };
  onActiveChangeRef.current = onActiveChange;

  const applyTransforms = React.useCallback(() => {
    const geom = geometryRef.current;
    const currentTiles = tilesRef.current;
    if (geom.width <= 0 || currentTiles.length === 0) return;

    const progress = progressRef.current;
    const count = currentTiles.length;

    for (let index = 0; index < count; index += 1) {
      const node = tileRefs.current[index];
      if (!node) continue;

      const rawOffset = mod(index - progress, count);
      const offset = rawOffset > count / 2 ? rawOffset - count : rawOffset;
      const theta = offset * geom.stepRad;
      const visible = Math.abs(theta) < CULL_ANGLE_RAD;
      const x = geom.centerX + geom.radius * Math.sin(theta);
      const y = geom.centerY - geom.radius * Math.cos(theta);
      const scale =
        1 -
        0.06 *
          Math.min(1, Math.abs(theta) / Math.max(SCALE_FALLOFF_RAD, 0.001));

      node.style.transform = `translate3d(${(x - geom.size / 2).toFixed(2)}px, ${(y - geom.size / 2).toFixed(2)}px, 0) rotate(${(theta * RAD_TO_DEG).toFixed(3)}deg) scale(${scale.toFixed(4)})`;
      node.style.visibility = visible ? "visible" : "hidden";

      const marker = visible ? "1" : "0";
      if (node.dataset.arcVisible !== marker) {
        node.dataset.arcVisible = marker;
        const video = node.querySelector("video");
        if (video) {
          if (visible) void video.play().catch(() => {});
          else video.pause();
        }
      }
    }
  }, []);

  const updateActive = React.useCallback(() => {
    const count = tilesRef.current.length;
    const sourceCount = items.length;
    if (count === 0 || sourceCount === 0) return;
    const next = mod(Math.round(progressRef.current), count) % sourceCount;
    setActiveIndex((previous) => (previous === next ? previous : next));
  }, [items.length]);

  React.useEffect(() => {
    onActiveChangeRef.current?.(activeIndex);
  }, [activeIndex]);

  const schedule = React.useCallback(() => {
    if (rafRef.current !== null) return;
    lastFrameRef.current = 0;
    rafRef.current = requestAnimationFrame((now) => frameRef.current(now));
  }, []);

  applyRef.current = applyTransforms;
  updateActiveRef.current = updateActive;

  React.useEffect(() => {
    frameRef.current = (now) => {
      const config = configRef.current;
      if (lastFrameRef.current === 0) lastFrameRef.current = now;
      const dt = clamp((now - lastFrameRef.current) / 1000, 0, 1 / 30);
      lastFrameRef.current = now;
      let mode = modeRef.current;

      if (mode === "inertia") {
        const velocity = clamp(
          velocityRef.current,
          -MAX_VELOCITY,
          MAX_VELOCITY,
        );
        progressRef.current += velocity * dt;
        const decayed = velocity * Math.pow(config.friction, dt * (1000 / 16));
        velocityRef.current = decayed;

        if (Math.abs(decayed) < VELOCITY_EPSILON) {
          velocityRef.current = 0;
          if (config.snap) {
            modeRef.current = "snap";
            snapTargetRef.current = Math.round(progressRef.current);
          } else {
            modeRef.current =
              config.autoPlay && !config.reducedMotion ? "drift" : "idle";
          }
        }
      } else if (mode === "snap") {
        const target = snapTargetRef.current;
        const displacement = progressRef.current - target;
        let velocity = velocityRef.current;
        velocity +=
          (-SPRING_STIFFNESS * displacement - SPRING_DAMPING * velocity) * dt;
        const nextProgress = progressRef.current + velocity * dt;

        if (
          Math.abs(nextProgress - target) < 0.00025 &&
          Math.abs(velocity) < 0.01
        ) {
          progressRef.current = target;
          velocityRef.current = 0;
          modeRef.current =
            config.autoPlay && !config.reducedMotion ? "drift" : "idle";
        } else {
          progressRef.current = nextProgress;
          velocityRef.current = velocity;
        }
      } else if (mode === "tween") {
        const tween = tweenRef.current;
        if (!tween) {
          modeRef.current = "idle";
        } else {
          const elapsed = Math.min(1, (now - tween.start) / tween.duration);
          const eased = 1 - Math.pow(1 - elapsed, 3);
          progressRef.current = tween.from + (tween.to - tween.from) * eased;
          if (elapsed >= 1) {
            progressRef.current = tween.to;
            tweenRef.current = null;
            modeRef.current =
              config.autoPlay && !config.reducedMotion ? "drift" : "idle";
          }
        }
      } else if (mode === "drift") {
        if (config.autoPlay && !config.reducedMotion) {
          progressRef.current += AUTO_PLAY_SPEED * dt;
        } else {
          modeRef.current = "idle";
        }
      }

      applyRef.current();
      updateActiveRef.current();
      mode = modeRef.current;

      if (
        mode === "drag" ||
        mode === "inertia" ||
        mode === "snap" ||
        mode === "tween" ||
        mode === "drift"
      ) {
        rafRef.current = requestAnimationFrame((frameNow) =>
          frameRef.current(frameNow),
        );
      } else {
        rafRef.current = null;
        lastFrameRef.current = 0;
      }
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const update = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      setDimensions((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : { width, height },
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    applyTransforms();
    updateActive();
  }, [applyTransforms, geometry, updateActive]);

  React.useEffect(() => {
    if (autoPlay && !reducedMotion) {
      if (modeRef.current === "idle") modeRef.current = "drift";
      schedule();
    } else if (modeRef.current === "drift") {
      modeRef.current = "idle";
    }
  }, [autoPlay, reducedMotion, schedule]);

  const startTween = React.useCallback(
    (target: number) => {
      tweenRef.current = {
        from: progressRef.current,
        to: target,
        start: performance.now(),
        duration: 240,
      };
      velocityRef.current = 0;
      modeRef.current = "tween";
      schedule();
    },
    [schedule],
  );

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (tilesRef.current.length < 2) return;
      if ((event.target as HTMLElement).closest("a, button")) return;

      const host = hostRef.current;
      if (!host) return;

      dragRef.current = { pointerId: event.pointerId, lastX: event.clientX };
      samplesRef.current = [{ t: performance.now(), p: progressRef.current }];
      tweenRef.current = null;
      velocityRef.current = 0;
      modeRef.current = "drag";
      setDragging(true);
      host.focus({ preventScroll: true });

      try {
        host.setPointerCapture(event.pointerId);
      } catch {
        /* noop */
      }

      schedule();
    },
    [schedule],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;

      const geom = geometryRef.current;
      if (geom.width <= 0) return;

      const dx = event.clientX - drag.lastX;
      drag.lastX = event.clientX;
      if (dx === 0) return;

      progressRef.current -= dx / geom.pixelsPerTile;

      const now = performance.now();
      const samples = samplesRef.current;
      samples.push({ t: now, p: progressRef.current });
      while (samples.length > 2 && now - samples[0]!.t > 80) {
        samples.shift();
      }

      applyTransforms();
      updateActive();
    },
    [applyTransforms, updateActive],
  );

  const endDrag = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;

      dragRef.current = null;
      setDragging(false);

      const host = hostRef.current;
      if (host) {
        try {
          host.releasePointerCapture(event.pointerId);
        } catch {
          /* noop */
        }
      }

      if (modeRef.current !== "drag") return;

      if (configRef.current.reducedMotion) {
        startTween(Math.round(progressRef.current));
        return;
      }

      const now = performance.now();
      const samples = samplesRef.current.filter(
        (sample) => now - sample.t <= 90,
      );
      const first = samples[0];
      const last = samples[samples.length - 1];
      let velocity = 0;

      if (first && last && last.t - first.t > 8) {
        velocity = ((last.p - first.p) / (last.t - first.t)) * 1000;
      }

      velocityRef.current = clamp(velocity, -MAX_VELOCITY, MAX_VELOCITY);
      modeRef.current = "inertia";
      schedule();
    },
    [schedule, startTween],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const target = Math.round(progressRef.current) + direction;

      if (configRef.current.reducedMotion) {
        startTween(target);
        return;
      }

      dragRef.current = null;
      setDragging(false);
      velocityRef.current = 0;
      snapTargetRef.current = target;
      modeRef.current = "snap";
      schedule();
    },
    [schedule, startTween],
  );

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const onWheel = (event: WheelEvent) => {
      if (modeRef.current === "drag") return;

      const geom = geometryRef.current;
      if (geom.width <= 0) return;

      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const delta = horizontal
        ? event.deltaX
        : event.shiftKey
          ? event.deltaY
          : 0;
      if (delta === 0) return;
      if (!hoveredRef.current && document.activeElement !== host) return;

      event.preventDefault();

      const tileDelta = -delta / geom.pixelsPerTile;
      if (configRef.current.reducedMotion) {
        startTween(Math.round(progressRef.current + tileDelta));
        return;
      }

      velocityRef.current = clamp(
        velocityRef.current + tileDelta * WHEEL_GAIN,
        -MAX_VELOCITY,
        MAX_VELOCITY,
      );
      modeRef.current = "inertia";
      schedule();
    };

    host.addEventListener("wheel", onWheel, { passive: false });
    return () => host.removeEventListener("wheel", onWheel);
  }, [schedule, startTween]);

  if (items.length === 0) return null;

  const currentItem = items[activeIndex];

  return (
    <section
      ref={hostRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={heading}
      tabIndex={0}
      className={cn(
        "relative isolate w-full min-h-screen touch-pan-y select-none overflow-hidden bg-white outline-none dark:bg-[#0a0a0b]",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/20 dark:focus-visible:ring-white/30",
        dragging ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => {
        hoveredRef.current = true;
      }}
      onPointerLeave={() => {
        hoveredRef.current = false;
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {tiles.map((tile, index) => (
          <div
            key={tile.key}
            ref={(node) => {
              tileRefs.current[index] = node;
            }}
            className="absolute left-0 top-0 overflow-hidden bg-neutral-200 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.18)] will-change-transform [backface-visibility:hidden] dark:bg-neutral-800 dark:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)]"
            style={{
              width: Math.max(1, geometry.size),
              height: Math.max(1, geometry.size),
              borderRadius: Math.max(10, geometry.size * 0.1),
              visibility: "hidden",
            }}
          >
            {tile.item.type === "video" ? (
              <video
                src={tile.item.src}
                aria-label={tile.item.alt}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                draggable={false}
                className="pointer-events-none h-full w-full select-none object-cover"
              />
            ) : (
              <img
                src={tile.item.src}
                alt={tile.item.alt ?? ""}
                draggable={false}
                loading="lazy"
                decoding="async"
                className="pointer-events-none h-full w-full select-none object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {children !== undefined ? (
        children
      ) : (
        <div
          className="pointer-events-none absolute left-1/2 z-20 w-[min(92%,640px)] -translate-x-1/2 px-4 text-center"
          style={{
            top: geometry.width > 0 ? `${geometry.textTop}px` : "52%",
          }}
        >
          <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {eyebrow}
          </p>
          <h2 className="mt-4 font-mono text-[clamp(30px,4.4vw,56px)] font-medium leading-[1.05] tracking-[-0.04em] text-neutral-950 dark:text-neutral-50">
            {heading}
          </h2>
          {description ? (
            <p className="mx-auto mt-5 max-w-[420px] font-mono text-[15px] leading-[1.5] text-[#6b6b6b] dark:text-neutral-400">
              {description}
            </p>
          ) : null}
        </div>
      )}

      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {currentItem ? `Tile ${activeIndex + 1} of ${items.length}` : undefined}
      </span>
    </section>
  );
}

export default ArcCarousel;
