"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export const DEFAULT_COUNT = 20;
export const DEFAULT_INTERVAL = 500;
export const DEFAULT_TRANSITION_MS = 80;
export const DEFAULT_DRIFT_SPEED = 3.0;
export const DEFAULT_ROTATION_STEP = 360 / DEFAULT_COUNT;
export const DEFAULT_CENTER_INTERVAL = 250;
export const DEFAULT_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
export const DEFAULT_CARD_SIZE = 330;

  const MIN_INTERVAL = 150;
const MAX_COUNT = 60;

const DEFAULT_PALETTE = ["#f5f5f5", "#0a0a0a", "#b9b9b9", "#0a0a0a", "#b5441b"] as const;
const RUST = "#b5441b";

export interface EditorialImageStackImage {
  src: string;
  alt?: string;
}

export interface RadialCardStackItem {
  color?: string;
  image?: string;
  label?: string;
}

export interface EditorialImageStackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Number of ring cards (default: 20). */
  count?: number;
  /** Fixed card size in pixels. Overrides responsive sizing. */
  cardSize?: number;
  /** Center card size multiplier relative to card size. @default 1.15 */
  centerScale?: number;
  /** Center card size in pixels. Overrides centerScale. */
  centerSize?: number;
  /** Override the default 5-color cycle for ring cards. */
  palette?: readonly string[];
  /** Explicit per-card data for the ring. Overrides palette cycle. */
  cards?: readonly RadialCardStackItem[];
  /** Center card images, cycled in sync with each rotation step. */
  foregroundImages?: readonly EditorialImageStackImage[];
  /** Ring card images used as card faces (alternative to cards[].image). */
  backgroundImages?: readonly EditorialImageStackImage[];
  /** Milliseconds between rotation steps (default: 3000). */
  switchIntervalMs?: number;
  /** Milliseconds between rotation steps (alias for switchIntervalMs). */
  interval?: number;
  /** Milliseconds between center image changes (default: 250). */
  centerIntervalMs?: number;
  /** Step transition duration in milliseconds (default: 500). */
  transitionMs?: number;
  /** Degrees per step (default: 360 / count). */
  rotationStep?: number;
  /** Continuous drift in degrees per second (default: 0.75). */
  driftSpeed?: number;
  /** Large background typography behind the ring. */
  backdropText?: string;
  /** CSS easing for step transitions (default: cubic-bezier(0.22, 1, 0.36, 1)). */
  easing?: string;
  /** Whether to auto-rotate the stack. @default true */
  autoRotate?: boolean;
  /** Accessible name for the stack region. */
  ariaLabel?: string;
}

function parseHex(color: string): { r: number; g: number; b: number } | null {
  const m = color.trim().match(/^#?([a-f0-9]{3}|[a-f0-9]{6})$/i);
  if (!m) return null;
  const raw = m[1];
  if (!raw) return null;
  let hex = raw;
  if (hex.length === 3) hex = hex.split("").join("");
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function luminance(color: string): number {
  const rgb = parseHex(color);
  if (!rgb) return 0.5;
  const { r, g, b } = rgb;
  const toSrgb = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toSrgb(r) + 0.7152 * toSrgb(g) + 0.0722 * toSrgb(b);
}

function contrastText(color: string): string {
  return luminance(color) > 0.55 ? "#0a0a0a" : "#f5f5f5";
}

function darken(color: string, amount = 0.45): string {
  const rgb = parseHex(color);
  if (!rgb) return color;
  const { r, g, b } = rgb;
  const f = 1 - amount;
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(Math.round(r * f))}${toHex(Math.round(g * f))}${toHex(Math.round(b * f))}`;
}

export function EditorialImageStack({
  count = DEFAULT_COUNT,
  cardSize: explicitCardSize,
  centerScale = 1.15,
  centerSize: explicitCenterSize,
  palette: explicitPalette,
  cards: explicitCards,
  foregroundImages: rawCenterImages = [],
  backgroundImages: rawBgImages = [],
  switchIntervalMs = DEFAULT_INTERVAL,
  interval: intervalProp,
  centerIntervalMs = DEFAULT_CENTER_INTERVAL,
  transitionMs = DEFAULT_TRANSITION_MS,
  rotationStep: explicitRotationStep,
  driftSpeed = DEFAULT_DRIFT_SPEED,
  backdropText,
  easing = DEFAULT_EASING,
  autoRotate = true,
  ariaLabel = "Editorial image stack",
  className,
  style,
  ...props
}: EditorialImageStackProps) {
  const effectiveCount = Math.max(3, Math.min(MAX_COUNT, Math.floor(count)));
  const step: number = explicitRotationStep ?? 360 / effectiveCount;
  const interval = intervalProp ?? switchIntervalMs;
  const safeInterval = Math.max(MIN_INTERVAL, interval);
  const safeTransition = Math.max(0, transitionMs);
  const safeCenterInterval = Math.max(MIN_INTERVAL, centerIntervalMs);
  const palette =
    explicitPalette && explicitPalette.length > 0 ? explicitPalette : DEFAULT_PALETTE;

  const cardData: RadialCardStackItem[] = React.useMemo(() => {
    if (explicitCards && explicitCards.length > 0) {
      return explicitCards.map((item, i) => ({
        color: item.color ?? palette[i % palette.length],
        image: item.image,
        label: item.label,
      }));
    }
    if (rawBgImages && rawBgImages.length > 0) {
      return rawBgImages.map((img, i) => ({
        color: palette[i % palette.length],
        image: img.src,
      }));
    }
    return Array.from({ length: effectiveCount }, (_, i) => ({
      color: palette[i % palette.length],
    }));
  }, [explicitCards, effectiveCount, palette, rawBgImages]);

  const size = Math.max(60, Math.floor(explicitCardSize ?? DEFAULT_CARD_SIZE));
  const centerSize =
    explicitCenterSize ??
    `calc(var(--stack-size, ${size}px) * ${centerScale})`;
  const centerSizeOffset =
    typeof centerSize === "number" ? -centerSize / 2 : `calc(${centerSize} / -2)`;

  const centerImages: readonly EditorialImageStackImage[] = React.useMemo(
    () => rawCenterImages,
    [rawCenterImages],
  );

  const prefersReducedMotion = React.useRef(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      prefersReducedMotion.current = media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const rotatorRef = React.useRef<HTMLDivElement>(null);
  const driftRef = React.useRef<HTMLDivElement>(null);

  const [centerStepIndex, setCenterStepIndex] = React.useState(0);

  React.useEffect(() => {
    const node = rootRef.current;
    const parent = node?.parentElement;
    if (!node || !parent) return;

    const update = () => {
      if (explicitCardSize) {
        node.style.setProperty("--stack-size", `${size}px`);
        return;
      }
      const rect = parent.getBoundingClientRect();
      const fit = Math.min(rect.width, rect.height) / 1.55;
      const value = Math.max(120, Math.min(900, fit));
      node.style.setProperty("--stack-size", `${value}px`);
    };

    update();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(update);
      ro.observe(parent);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [explicitCardSize, size]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId = 0;
    let now = performance.now();
    let lastStep = now;
    let lastCenterStep = now;
    let accumulated = 0;
    let drift = 0;

    const start = () => {
      now = performance.now();
      lastStep = now;
      lastCenterStep = now;
      rafId = requestAnimationFrame(tick);
    };

    const tick = (time: number) => {
      const dt = time - now;
      now = time;

      if (autoRotate && !prefersReducedMotion.current && driftSpeed > 0) {
        drift += (driftSpeed * dt) / 1000;
      }

      if (autoRotate && time - lastStep >= safeInterval) {
        accumulated += step;
        lastStep = time;
      }

      if (
        autoRotate &&
        centerImages.length > 1 &&
        time - lastCenterStep >= safeCenterInterval
      ) {
        lastCenterStep = time;
        setCenterStepIndex((s) => s + 1);
      }

      const rotator = rotatorRef.current;
      const driftLayer = driftRef.current;
      if (rotator) {
        rotator.style.setProperty("--accumulated-angle", `${accumulated}deg`);
      }
      if (driftLayer) {
        driftLayer.style.setProperty("--drift-angle", `${drift}deg`);
      }

      rafId = requestAnimationFrame(tick);
    };

    start();

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [step, safeInterval, driftSpeed, autoRotate, safeCenterInterval, centerImages.length]);

  const centerIndex = centerImages.length ? centerStepIndex % centerImages.length : 0;
  const centerImage = centerImages[centerIndex];

  return (
    <div
      {...props}
      ref={rootRef}
      data-slot="editorial-image-stack"
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "editorial-image-stack relative isolate overflow-hidden select-none flex items-center justify-center bg-white dark:bg-[#0a0a0a]",
        className,
      )}
      style={{
        ...style,
        width: "100%",
        height: "100%",
        minWidth: `calc(var(--stack-size, ${size}px) * 1.41421356)`,
        minHeight: `calc(var(--stack-size, ${size}px) * 1.41421356)`,
      }}
    >
      {backdropText && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        >
          <span
            className="text-black/10 dark:text-white/10 font-black select-none"
            style={{
              whiteSpace: "nowrap",
              fontSize: `calc(var(--stack-size) * 0.24)`,
              letterSpacing: "0.03em",
            }}
          >
            {backdropText}
          </span>
        </div>
      )}

      {/* One wrapper rotated by the accumulated angle. */}
      <div
        ref={rotatorRef}
        className="absolute left-1/2 top-1/2 z-10"
        style={{
          width: `var(--stack-size, ${size}px)`,
          height: `var(--stack-size, ${size}px)`,
          marginLeft: `calc(var(--stack-size, ${size}px) / -2)`,
          marginTop: `calc(var(--stack-size, ${size}px) / -2)`,
          transformOrigin: "50% 50%",
          willChange: "transform",
          transform: "rotate(var(--accumulated-angle)) translateZ(0)",
          transition: `transform ${prefersReducedMotion.current ? 0 : safeTransition}ms ${easing}`,
        }}
      >
        {/* Continuous slow drift between steps, never transitioned. */}
        <div
          ref={driftRef}
          className="absolute inset-0"
          style={{
            transformOrigin: "50% 50%",
            willChange: "transform",
            transform: "rotate(var(--drift-angle)) translateZ(0)",
          }}
        >
          {cardData.map((_item, i) => {
            const item = cardData[i];
            const color = item?.color ?? palette[i % palette.length] ?? "";
            const isRust = color === RUST;
            const hasImage = !!item?.image;
            const rotation = i * step;
            const labelColor = contrastText(color);

            return (
              <div
                key={i}
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  transformOrigin: "50% 50%",
                  willChange: "transform",
                  transform: `rotate(${rotation}deg) translateZ(0)`,
                  zIndex: i + 1,
                  background: isRust
                    ? `linear-gradient(135deg, ${RUST} 0%, ${darken(RUST)} 100%)`
                    : color,
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.03)",
                  opacity: 0.3,
                }}
              >
                {hasImage && (
                  <img
                    src={item?.image ?? ""}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    decoding="async"
                    loading="eager"
                    className="block w-full h-full object-cover"
                  />
                )}
                {item?.label && (
                  <span
                    className="pointer-events-none absolute left-1/2 top-0 select-none"
                    style={{
                      color: labelColor,
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      filter: hasImage ? "drop-shadow(0 0 6px rgba(0,0,0,0.5))" : undefined,
                      transform: `translateX(-50%) rotate(${-rotation}deg)`,
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stable center card — sits on top, never rotates. */}
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: centerSize,
          height: centerSize,
          marginLeft: centerSizeOffset,
          marginTop: centerSizeOffset,
          border: "1px solid rgba(0, 0, 0, 0.10)",
          borderRadius: 0,
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 24px 48px -16px rgba(0, 0, 0, 0.18)",
          background: centerImages.length ? "transparent" : "#ffffff",
          zIndex: effectiveCount + 100,
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      >
        {centerImages.length && centerImage && (
          <img
            src={centerImage.src}
            alt={centerImage.alt ?? "Center card image"}
            className="block w-full h-full object-cover"
            draggable={false}
            decoding="async"
            loading="eager"
          />
        )}
      </div>
    </div>
  );
}

export default EditorialImageStack;
