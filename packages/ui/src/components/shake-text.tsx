"use client";

import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ShakeTextTag = "h1" | "h2" | "h3" | "span" | "div";

export type ShakeTextTrigger = "loop" | "manual";

export interface ShakeTextHandle {
  /** Plays the shake animation. No-op when reduced motion is preferred. */
  shake: () => void;
}

export interface ShakeTextProps {
  /** Text rendered in the front layer and every depth layer. */
  text: string;
  /** Semantic tag for the front (accessible) layer. @default "h1" */
  as?: ShakeTextTag;
  /** Font family for every layer. @default "Inter, sans-serif" */
  fontFamily?: string;
  /** Font size. Numbers become px; strings pass through (responsive values ok). @default 137 */
  fontSize?: number | string;
  /** Font weight. @default 900 */
  fontWeight?: number;
  /** Letter spacing. Numbers become px. @default 0 */
  letterSpacing?: number | string;
  /** Front layer color. @default "#fff8e7" */
  frontColor?: string;
  /** Back-to-front colors for the 4 depth layers. @default teal/green/coral/yellow */
  layerColors?: [string, string, string, string];
  /** Z-depth step per layer in px at the 137px reference size (scales with font). @default 8 */
  depth?: number;
  /** Vertical offset step per layer in px at the 137px reference size (scales with font). @default 8 */
  layerOffset?: number;
  /** CSS perspective of the wrapper in px. @default 1000 */
  perspective?: number;
  /** Multiplier for the shake keyframes. @default 1 */
  shakeIntensity?: number;
  /** Duration of one motion cycle in seconds. @default 1.4 */
  shakeDuration?: number;
  /** Extra timeline repeats for a manual shake. @default 0 */
  shakeRepeat?: number;
  /** Continuously animate or wait for the imperative shake() method. @default "loop" */
  trigger?: ShakeTextTrigger;
  /** Start the continuous loop automatically. @default true */
  autoPlay?: boolean;
  /** Extra classes for the outer wrapper. */
  className?: string;
  /** Extra classes applied to the front text layer. */
  textClassName?: string;
  /** Inline style overrides for the outer wrapper. */
  style?: React.CSSProperties;
}

export const SHAKE_TEXT_DEFAULTS = {
  as: "h1",
  fontFamily: "Inter, sans-serif",
  fontSize: 137,
  fontWeight: 900,
  letterSpacing: 0,
  frontColor: "#fff8e7",
  layerColors: ["#50adbf", "#5f845c", "#e76168", "#fdda76"],
  depth: 8,
  layerOffset: 8,
  perspective: 1000,
  shakeIntensity: 1,
  shakeDuration: 1.4,
  shakeRepeat: 0,
  trigger: "loop",
  autoPlay: true,
} as const;

// ─────────────────────────────────────────────────────────────
// Layer construction — offsets in em so depth scales with type.
// Reference: 137px font, depth/layerOffset step of 8px.
// Cumulative extrusion: teal lifts above the front, then each
// deeper layer steps further down, so every color band stays
// visibly exposed behind the front letters instead of hiding
// underneath them. Z adds a whisper of perspective scaling.
// ─────────────────────────────────────────────────────────────

const REFERENCE_FONT_SIZE = 137;

const LAYER_DEPTH_MULTIPLIERS = [1, 2, 3, 4];
// Y multipliers (× layerOffset): teal up, then stepping down.
const LAYER_Y_MULTIPLIERS = [-1, 1, 2, 3];
const LAYER_Z_INDEXES = [40, 30, 20, 10];

// Crisp black dimensional edge, identical on every layer. No blur.
const EDGE_SHADOW =
  "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000";

interface ShakeFrame {
  x: number;
  y: number;
  rotation: number;
  skewX: number;
}

// Each colored copy follows its own closed path while the accessible front
// layer remains completely still. The final identity frame keeps the loop
// seamless and prevents transform drift in long-running previews.
const LAYER_MOTION: ShakeFrame[][] = [
  [
    { x: -7, y: -3, rotation: -0.8, skewX: -1.4 },
    { x: 5, y: 3, rotation: 0.55, skewX: 0.8 },
    { x: -3, y: 1, rotation: -0.3, skewX: -0.5 },
    { x: 7, y: -2, rotation: 0.7, skewX: 1.1 },
    { x: -4, y: 3, rotation: -0.4, skewX: -0.7 },
    { x: 0, y: 0, rotation: 0, skewX: 0 },
  ],
  [
    { x: 5, y: -4, rotation: 0.65, skewX: 1 },
    { x: -7, y: 2, rotation: -0.7, skewX: -1.2 },
    { x: 4, y: 4, rotation: 0.4, skewX: 0.6 },
    { x: -5, y: -2, rotation: -0.5, skewX: -0.8 },
    { x: 6, y: 1, rotation: 0.55, skewX: 0.9 },
    { x: 0, y: 0, rotation: 0, skewX: 0 },
  ],
  [
    { x: -4, y: 4, rotation: -0.45, skewX: -0.7 },
    { x: 6, y: -3, rotation: 0.6, skewX: 1 },
    { x: -7, y: -1, rotation: -0.65, skewX: -1.1 },
    { x: 3, y: 5, rotation: 0.35, skewX: 0.55 },
    { x: -2, y: -4, rotation: -0.25, skewX: -0.4 },
    { x: 0, y: 0, rotation: 0, skewX: 0 },
  ],
  [
    { x: 7, y: 3, rotation: 0.7, skewX: 1.1 },
    { x: -4, y: -5, rotation: -0.45, skewX: -0.75 },
    { x: 5, y: 1, rotation: 0.5, skewX: 0.8 },
    { x: -6, y: 4, rotation: -0.6, skewX: -1 },
    { x: 2, y: -3, rotation: 0.25, skewX: 0.4 },
    { x: 0, y: 0, rotation: 0, skewX: 0 },
  ],
];

const IDENTITY = { x: 0, y: 0, rotation: 0, skewX: 0 };

// ─────────────────────────────────────────────────────────────
// Component — one stable front layer and four independently moving depth layers.
// ─────────────────────────────────────────────────────────────

export const ShakeText = React.forwardRef<ShakeTextHandle, ShakeTextProps>(function ShakeText(
  {
    text,
    as = SHAKE_TEXT_DEFAULTS.as,
    fontFamily = SHAKE_TEXT_DEFAULTS.fontFamily,
    fontSize = SHAKE_TEXT_DEFAULTS.fontSize,
    fontWeight = SHAKE_TEXT_DEFAULTS.fontWeight,
    letterSpacing = SHAKE_TEXT_DEFAULTS.letterSpacing,
    frontColor = SHAKE_TEXT_DEFAULTS.frontColor,
    layerColors = [...SHAKE_TEXT_DEFAULTS.layerColors] as [string, string, string, string],
    depth = SHAKE_TEXT_DEFAULTS.depth,
    layerOffset = SHAKE_TEXT_DEFAULTS.layerOffset,
    perspective = SHAKE_TEXT_DEFAULTS.perspective,
    shakeIntensity = SHAKE_TEXT_DEFAULTS.shakeIntensity,
    shakeDuration = SHAKE_TEXT_DEFAULTS.shakeDuration,
    shakeRepeat = SHAKE_TEXT_DEFAULTS.shakeRepeat,
    trigger = SHAKE_TEXT_DEFAULTS.trigger,
    autoPlay = SHAKE_TEXT_DEFAULTS.autoPlay,
    className,
    textClassName,
    style,
  }: ShakeTextProps,
  ref,
) {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const innerRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const timelineRef = React.useRef<gsap.core.Timeline | null>(null);
  const ctxRef = React.useRef<gsap.Context | null>(null);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    // Legacy Safari fallback.
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  const resolvedFontSize = typeof fontSize === "number" ? `${fontSize}px` : fontSize;
  const resolvedLetterSpacing =
    typeof letterSpacing === "number" ? `${letterSpacing}px` : letterSpacing;

  // em factor converts the px-at-137 reference offsets to font-relative units.
  const emPerStep = (px: number) => `${(px / REFERENCE_FONT_SIZE).toFixed(4)}em`;

  const layerTypeStyle: React.CSSProperties = {
    fontFamily,
    fontSize: resolvedFontSize,
    fontStyle: "normal",
    fontWeight,
    letterSpacing: resolvedLetterSpacing,
    lineHeight: "1em",
    textAlign: "center",
    whiteSpace: "nowrap",
    margin: 0,
    display: "block",
    textShadow: EDGE_SHADOW,
  };

  const shake = React.useCallback(() => {
    if (typeof window === "undefined") return;

    // Kill any in-flight motion and snap every depth layer back before restarting.
    timelineRef.current?.kill();
    timelineRef.current = null;
    innerRefs.current.forEach((node) => {
      if (node) gsap.set(node, IDENTITY);
    });

    const inners = innerRefs.current.filter((n): n is HTMLDivElement => n !== null);
    if (inners.length === 0) return;
    inners.forEach((node) => {
      node.style.willChange = "transform";
    });

    const intensity = Number.isFinite(shakeIntensity) ? (shakeIntensity as number) : 1;
    const total = Number.isFinite(shakeDuration) && (shakeDuration as number) > 0
      ? (shakeDuration as number)
      : SHAKE_TEXT_DEFAULTS.shakeDuration;
    const frameCount = LAYER_MOTION[0]?.length ?? 1;
    const step = total / frameCount;

    const tl = gsap.timeline({
      defaults: { ease: "sine.inOut" },
      repeat:
        trigger === "loop"
          ? -1
          : Number.isFinite(shakeRepeat)
            ? Math.max(0, Math.round(shakeRepeat as number))
            : 0,
      onComplete: () => {
        inners.forEach((node) => {
          node.style.willChange = "";
        });
        if (timelineRef.current === tl) timelineRef.current = null;
      },
    });

    inners.forEach((node, layerIndex) => {
      const frames = LAYER_MOTION[layerIndex] ?? LAYER_MOTION[0] ?? [];
      frames.forEach((frame, frameIndex) => {
        tl.to(
          node,
          {
            x: frame.x * intensity,
            y: frame.y * intensity,
            rotation: frame.rotation * intensity,
            skewX: frame.skewX * intensity,
            duration: step,
            force3D: true,
          },
          frameIndex * step,
        );
      });
    });

    timelineRef.current = tl;
    return tl;
  }, [shakeIntensity, shakeDuration, shakeRepeat, trigger]);

  const shakeRef = React.useRef(shake);
  shakeRef.current = shake;

  const reducedRef = React.useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  const play = React.useCallback(() => {
    if (reducedRef.current) return;
    shakeRef.current();
  }, []);

  React.useImperativeHandle(ref, () => ({ shake: () => void play() }), [play]);

  // GSAP scoping + StrictMode-safe teardown.
  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || typeof window === "undefined") return;
    const ctx = gsap.context(() => {}, wrapper);
    ctxRef.current = ctx;
    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      ctx.revert();
      ctxRef.current = null;
    };
  }, []);

  // Continuous motion starts automatically and restarts when its tuning changes.
  React.useEffect(() => {
    if (trigger !== "loop" || !autoPlay || reducedMotion) return;
    const animatedLayers = innerRefs.current.filter(
      (node): node is HTMLDivElement => node !== null,
    );
    const id = window.setTimeout(() => {
      play();
    }, 60);
    return () => {
      window.clearTimeout(id);
      timelineRef.current?.kill();
      timelineRef.current = null;
      animatedLayers.forEach((node) => {
        gsap.set(node, IDENTITY);
        node.style.willChange = "";
      });
    };
  }, [trigger, autoPlay, play, reducedMotion, shakeIntensity, shakeDuration]);

  const setInnerRef = React.useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      innerRefs.current[index] = node;
    },
    [],
  );

  const front = React.createElement(
    as,
    {
      className: cn("relative block", textClassName),
      style: {
        ...layerTypeStyle,
        position: "relative",
        zIndex: 50,
        color: frontColor,
      } as React.CSSProperties,
    },
    text,
  );

  return (
    <div
      ref={wrapperRef}
      data-slot="shake-text"
      className={cn("relative inline-block", className)}
      style={{ perspective: `${perspective}px`, ...style }}
    >
      <div
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {front}
        {layerColors.map((color, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              zIndex: LAYER_Z_INDEXES[i],
              // Match the text size so the em-based extrusion offsets below
              // resolve against the layer's own font size, not inherited body type.
              fontSize: resolvedFontSize,
              transform: `translate3d(0, ${emPerStep((LAYER_Y_MULTIPLIERS[i] ?? 1) * layerOffset)}, ${emPerStep(-(LAYER_DEPTH_MULTIPLIERS[i] ?? 1) * depth)})`,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              ref={setInnerRef(i)}
              className="block"
              style={{ ...layerTypeStyle, color }}
            >
              {text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ShakeText;
