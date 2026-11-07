"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Default image order (and the visual rhythm of the helix):
 * glasses → sunglasses → blue → red → lavender.
 * These assets already live in the documentation site's public folder.
 */
export const SPIRAL_MEDIA_GALLERY_DEFAULT_IMAGES: string[] = [
  "/images/spiral-3d-slider/visor-portrait.jpg",
  "/images/spiral-3d-slider/dark-glitch.jpg",
  "/images/spiral-3d-slider/blue-double.jpg",
  "/images/spiral-3d-slider/red-echo.jpg",
  "/images/spiral-3d-slider/prism-portrait.jpg",
];

export interface SpiralMediaGalleryProps {
  /** Image sources arranged around the helix. Repeats automatically. */
  images?: string[];
  /** Number of cards in the helix. */
  cardCount?: number;
  /** Card width in pixels. */
  cardWidth?: number;
  /** Card height in pixels. */
  cardHeight?: number;
  /** Card corner radius in pixels. */
  borderRadius?: number;
  /** Horizontal radius of the cylinder in pixels. */
  cylinderRadius?: number;
  /** Vertical distance between neighbouring cards in pixels. */
  verticalSpacing?: number;
  /** CSS perspective in pixels. */
  perspective?: number;
  /** Scale applied to the card at the back of the cylinder. */
  minScale?: number;
  /** Opacity applied to the card at the back of the cylinder. */
  minOpacity?: number;
  /** Whether the helix advances automatically while idle. */
  autoRotate?: boolean;
  /** Automatic movement in degrees per frame at 60fps. */
  autoRotateSpeed?: number;
  /** Velocity decay applied on every frame after a drag or wheel. */
  dragFriction?: number;
  /** Multiplier applied to wheel input. */
  wheelSpeed?: number;
  /** Show small index labels on cards. Off by default. */
  showNumbers?: boolean;
  /** Optional stage background colour. Defaults to the theme surface. */
  background?: string;
  /** Accessible name for the gallery region. */
  ariaLabel?: string;
  /** Optional alternative text for the source images (screen readers only). */
  imageAlts?: string[];
  /** Additional classes for the root stage. */
  className?: string;
}

/** Alias kept for the SpiralFlow reference naming. */
export type SpiralFlowGalleryProps = SpiralMediaGalleryProps;

export interface SpiralCardFrameOptions {
  index: number;
  offsetDeg: number;
  cardCount: number;
  cylinderRadius: number;
  verticalSpacing: number;
  minScale: number;
  minOpacity: number;
}

export interface SpiralCardFrame {
  /** Wrapped angle in degrees, in [-180, 180). */
  angle: number;
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  zIndex: number;
  /** Normalised front-facing depth, 0 at the back and 1 at the front. */
  depth: number;
}

/**
 * Pure geometry for one card. Kept exported so the exact live-site values can
 * be verified without a browser. Matches the measured DOM transforms:
 * front card at angle 0 → x 0, y 0, z R, scale 1, opacity 1, z-index 100.
 */
export function getSpiralCardFrame({
  index,
  offsetDeg,
  cardCount,
  cylinderRadius,
  verticalSpacing,
  minScale,
  minOpacity,
}: SpiralCardFrameOptions): SpiralCardFrame {
  const count = Math.max(1, cardCount);
  const step = 360 / count;
  const pitch = verticalSpacing * count;

  let angle = (index * step + offsetDeg) % 360;
  if (angle >= 180) angle -= 360;
  if (angle < -180) angle += 360;

  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const depth = (1 + cos) / 2;
  const scale = minScale + (1 - minScale) * depth;
  const opacity = minOpacity + (1 - minOpacity) * depth;
  const zIndex = Math.round(50 + 50 * cos);

  return {
    angle,
    x: cylinderRadius * sin,
    y: (angle * pitch) / 360,
    z: cylinderRadius * cos,
    scale,
    opacity,
    zIndex,
    depth,
  };
}

function formatTransform(frame: SpiralCardFrame) {
  return `translate3d(${frame.x.toFixed(2)}px, ${frame.y.toFixed(2)}px, ${frame.z.toFixed(2)}px) scale(${frame.scale.toFixed(4)})`;
}

const MAX_VELOCITY = 60;
const IDLE_VELOCITY = 0.001;
const VELOCITY_IDLE_MS = 90;

/**
 * A 3D vertical helix of media cards. Pure CSS 3D transforms are written
 * directly to the DOM from one requestAnimationFrame loop; React only renders
 * the initial markup. Drag vertically, scroll, or use the arrow keys to spin
 * the helix infinitely.
 */
export function SpiralMediaGallery({
  images = SPIRAL_MEDIA_GALLERY_DEFAULT_IMAGES,
  cardCount = 25,
  cardWidth = 220,
  cardHeight = 140,
  borderRadius = 16,
  cylinderRadius = 230,
  verticalSpacing = 40,
  perspective = 1000,
  minScale = 0.45,
  minOpacity = 0.12,
  autoRotate = true,
  autoRotateSpeed = 0.08,
  dragFriction = 0.94,
  wheelSpeed = 0.08,
  showNumbers = false,
  background,
  ariaLabel = "Spiral media gallery",
  imageAlts,
  className,
}: SpiralMediaGalleryProps) {
  const safeCardCount = Math.max(1, Math.round(cardCount));
  const safeVerticalSpacing = Math.max(1, verticalSpacing);
  const pitch = safeVerticalSpacing * safeCardCount;
  const degPerPixel = 360 / pitch;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const offsetRef = React.useRef(0);
  const velocityRef = React.useRef(0);
  const draggingRef = React.useRef(false);
  const visibleRef = React.useRef(true);
  const runningRef = React.useRef(false);
  const rafRef = React.useRef<number | null>(null);
  const lastFrameRef = React.useRef(0);
  const startLoopRef = React.useRef<() => void>(() => {});
  const stopLoopRef = React.useRef<() => void>(() => {});
  const dragRef = React.useRef<{
    pointerId: number;
    lastY: number;
    lastTime: number;
    velocity: number;
  } | null>(null);

  const [reducedMotion, setReducedMotion] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const configRef = React.useRef({
    cardCount: safeCardCount,
    cylinderRadius,
    verticalSpacing: safeVerticalSpacing,
    minScale,
    minOpacity,
    autoRotate,
    autoRotateSpeed,
    dragFriction,
    wheelSpeed,
    reducedMotion,
  });

  configRef.current = {
    cardCount: safeCardCount,
    cylinderRadius,
    verticalSpacing: safeVerticalSpacing,
    minScale,
    minOpacity,
    autoRotate,
    autoRotateSpeed,
    dragFriction,
    wheelSpeed,
    reducedMotion,
  };

  const applyTransforms = React.useCallback(() => {
    const config = configRef.current;
    const nodes = cardRefs.current;

    for (let index = 0; index < config.cardCount; index += 1) {
      const node = nodes[index];
      if (!node) continue;

      const frame = getSpiralCardFrame({
        index,
        offsetDeg: offsetRef.current,
        cardCount: config.cardCount,
        cylinderRadius: config.cylinderRadius,
        verticalSpacing: config.verticalSpacing,
        minScale: config.minScale,
        minOpacity: config.minOpacity,
      });

      node.style.transform = formatTransform(frame);
      node.style.opacity = String(frame.opacity);
      node.style.zIndex = String(frame.zIndex);
    }
  }, []);

  // Single animation loop. It writes transforms only and self-suspends when
  // there is nothing left to animate.
  React.useEffect(() => {
    const tick = (now: number) => {
      const config = configRef.current;
      const previous = lastFrameRef.current || now;
      const rawDelta = now - previous;
      const delta = rawDelta > 0 ? Math.min(rawDelta, 50) : 16.667;
      const frameScale = delta / 16.667;
      lastFrameRef.current = now;

      if (!draggingRef.current) {
        if (Math.abs(velocityRef.current) > IDLE_VELOCITY) {
          offsetRef.current += velocityRef.current * frameScale;
          velocityRef.current *= Math.pow(
            Math.min(0.999, Math.max(0.5, config.dragFriction)),
            frameScale,
          );
          if (Math.abs(velocityRef.current) < IDLE_VELOCITY) {
            velocityRef.current = 0;
          }
        } else if (config.autoRotate && !config.reducedMotion) {
          offsetRef.current += config.autoRotateSpeed * frameScale;
        }
      }

      applyTransforms();

      const keepRunning =
        draggingRef.current ||
        Math.abs(velocityRef.current) > IDLE_VELOCITY ||
        (config.autoRotate && !config.reducedMotion);

      if (
        keepRunning &&
        visibleRef.current &&
        typeof document !== "undefined" &&
        !document.hidden
      ) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        runningRef.current = false;
        rafRef.current = null;
        lastFrameRef.current = 0;
      }
    };

    const start = () => {
      if (runningRef.current) return;
      if (!visibleRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      runningRef.current = true;
      lastFrameRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
      runningRef.current = false;
      lastFrameRef.current = 0;
    };

    startLoopRef.current = start;
    stopLoopRef.current = stop;
    applyTransforms();
    start();

    return () => {
      stop();
      startLoopRef.current = () => {};
      stopLoopRef.current = () => {};
    };
  }, [applyTransforms]);

  // Pause offscreen and while the tab is hidden.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    visibleRef.current = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = Boolean(entry?.isIntersecting);
        if (visibleRef.current) startLoopRef.current();
        else stopLoopRef.current();
      },
      { threshold: 0 },
    );
    observer.observe(root);

    const handleVisibility = () => {
      if (document.hidden) stopLoopRef.current();
      else if (visibleRef.current) startLoopRef.current();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Honour the reduced-motion preference live.
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Re-apply immediately when geometry props change, and restart if needed.
  React.useEffect(() => {
    applyTransforms();
    startLoopRef.current();
  }, [
    applyTransforms,
    safeCardCount,
    cylinderRadius,
    safeVerticalSpacing,
    minScale,
    minOpacity,
    autoRotate,
    autoRotateSpeed,
    dragFriction,
    wheelSpeed,
    reducedMotion,
  ]);

  // Native wheel listener so preventDefault works reliably.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const handleWheel = (event: WheelEvent) => {
      if (draggingRef.current) return;
      event.preventDefault();
      const config = configRef.current;
      const delta =
        event.deltaY *
        (360 / (config.verticalSpacing * config.cardCount)) *
        config.wheelSpeed;
      velocityRef.current = Math.max(
        -MAX_VELOCITY,
        Math.min(MAX_VELOCITY, velocityRef.current - delta),
      );
      startLoopRef.current();
    };

    root.addEventListener("wheel", handleWheel, { passive: false });
    return () => root.removeEventListener("wheel", handleWheel);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocity: 0,
    };
    draggingRef.current = true;
    velocityRef.current = 0;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Pointer capture is best-effort. */
    }

    event.currentTarget.focus({ preventScroll: true });
    startLoopRef.current();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dy = event.clientY - drag.lastY;
    if (dy === 0) return;

    const deltaDegrees = dy * degPerPixel;
    offsetRef.current += deltaDegrees;

    const now = performance.now();
    const elapsed = Math.max(8, now - drag.lastTime);
    const instantVelocity = (deltaDegrees / elapsed) * 16.667;
    drag.velocity = drag.velocity * 0.7 + instantVelocity * 0.3;
    drag.lastY = event.clientY;
    drag.lastTime = now;

    applyTransforms();
    startLoopRef.current();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    draggingRef.current = false;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* Pointer capture is best-effort. */
    }

    const idle = performance.now() - drag.lastTime;
    velocityRef.current =
      event.type === "pointercancel" || idle > VELOCITY_IDLE_MS
        ? 0
        : Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, drag.velocity));

    startLoopRef.current();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = 360 / safeCardCount;
    let direction = 0;

    if (event.key === "ArrowDown" || event.key === "PageDown") direction = -1;
    else if (event.key === "ArrowUp" || event.key === "PageUp") direction = 1;
    else if (event.key === "Home") {
      event.preventDefault();
      offsetRef.current = 0;
      velocityRef.current = 0;
      applyTransforms();
      startLoopRef.current();
      return;
    } else return;

    event.preventDefault();
    const multiplier = event.key.startsWith("Page") ? 4 : 1;
    offsetRef.current += direction * step * multiplier;
    velocityRef.current = 0;
    applyTransforms();
    startLoopRef.current();
  };

  const cards = React.useMemo(() => {
    const length = images.length;
    return Array.from({ length: safeCardCount }, (_, index) => ({
      index,
      src: length > 0 ? images[index % length] : undefined,
    }));
  }, [images, safeCardCount]);

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="gallery"
      aria-label={ariaLabel}
      tabIndex={0}
      data-spiral-media-gallery=""
      className={cn(
        "absolute inset-0 select-none overflow-hidden bg-background outline-none",
        "focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring/50",
        className,
      )}
      style={{
        perspective: `${perspective}px`,
        perspectiveOrigin: "50% 50%",
        cursor: "ns-resize",
        touchAction: "none",
        ...(background ? { background } : {}),
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
        }}
      >
        {cards.map(({ index, src }) => {
          const frame = getSpiralCardFrame({
            index,
            offsetDeg: offsetRef.current,
            cardCount: safeCardCount,
            cylinderRadius,
            verticalSpacing: safeVerticalSpacing,
            minScale,
            minOpacity,
          });

          return (
            <div
              key={index}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              data-spiral-card=""
              data-spiral-index={index}
              style={{
                position: "absolute",
                width: cardWidth,
                height: cardHeight,
                top: "50%",
                left: "50%",
                marginTop: -cardHeight / 2,
                marginLeft: -cardWidth / 2,
                borderRadius,
                background: "rgb(26, 26, 46)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                willChange: "transform, opacity",
                opacity: frame.opacity,
                zIndex: frame.zIndex,
                transform: formatTransform(frame),
                boxShadow:
                  "0 4px 16px rgba(0, 0, 0, 0.6), 0 20px 55px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
              }}
            >
              {src ? (
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              ) : null}

              {showNumbers ? (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 10,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 10,
                    lineHeight: 1,
                    letterSpacing: "0.08em",
                    color: "rgba(255, 255, 255, 0.72)",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                    pointerEvents: "none",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {imageAlts && imageAlts.length > 0 ? (
        <ul className="sr-only">
          {imageAlts.map((alt, index) => (
            <li key={`${alt}-${index}`}>{alt}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Reference-name alias. */
export const SpiralFlowGallery = SpiralMediaGallery;

export default SpiralMediaGallery;
