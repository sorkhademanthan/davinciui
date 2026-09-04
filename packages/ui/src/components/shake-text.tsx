"use client";

import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ShakeTextTag = "h1" | "h2" | "h3" | "span" | "div";

export type ShakeTextTrigger = "mount" | "hover" | "click" | "manual";

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
  /** Front layer color. @default "rgb(231, 231, 231)" */
  frontColor?: string;
  /** Back-to-front colors for the 4 depth layers. @default orange/violet/salmon/sand */
  layerColors?: [string, string, string, string];
  /** Z-depth step per layer in px at the 137px reference size (scales with font). @default 8 */
  depth?: number;
  /** Vertical offset step per layer in px at the 137px reference size (scales with font). @default 8 */
  layerOffset?: number;
  /** CSS perspective of the wrapper in px. @default 1000 */
  perspective?: number;
  /** Multiplier for the shake keyframes. @default 1 */
  shakeIntensity?: number;
  /** Total shake duration in seconds. @default 0.65 */
  shakeDuration?: number;
  /** Extra timeline repeats per shake. @default 0 */
  shakeRepeat?: number;
  /** How the shake is triggered. @default "mount" */
  trigger?: ShakeTextTrigger;
  /** Play once on mount (mount trigger only). @default true */
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
  frontColor: "rgb(231, 231, 231)",
  layerColors: ["rgb(242, 76, 0)", "rgb(151, 146, 227)", "rgb(242, 122, 122)", "rgb(237, 169, 109)"],
  depth: 8,
  layerOffset: 8,
  perspective: 1000,
  shakeIntensity: 1,
  shakeDuration: 0.65,
  shakeRepeat: 0,
  trigger: "mount",
  autoPlay: true,
} as const;

// ─────────────────────────────────────────────────────────────
// Layer construction — offsets in em so depth scales with type.
// Reference: 137px font, depth/layerOffset step of 8px.
// Cumulative extrusion: orange lifts above the front, then each
// deeper layer steps further down, so every color band stays
// visibly exposed behind the front letters instead of hiding
// underneath them. Z adds a whisper of perspective scaling.
// ─────────────────────────────────────────────────────────────

const REFERENCE_FONT_SIZE = 137;

const LAYER_DEPTH_MULTIPLIERS = [1, 2, 3, 4];
// Y multipliers (× layerOffset): orange up, then stepping down.
const LAYER_Y_MULTIPLIERS = [-1, 1, 2, 3];
const LAYER_Z_INDEXES = [40, 30, 20, 10];
// Subtle rear-layer exaggeration applied on top of the locked stack motion.
const LAYER_EXAGGERATION = [1.02, 1.04, 1.06, 1.08];

// Crisp black dimensional edge, identical on every layer. No blur.
const EDGE_SHADOW =
  "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000";

interface ShakeFrame {
  x: number;
  y: number;
  rotation: number;
  skewX: number;
  scale: number;
}

// Base keyframes at intensity 1 — quick physical shake, exact return.
const BASE_FRAMES: ShakeFrame[] = [
  { x: -6, y: 2, rotation: -1.2, skewX: -1, scale: 1.005 },
  { x: 5, y: -2, rotation: 1, skewX: 1, scale: 0.995 },
  { x: -3, y: 1, rotation: -0.5, skewX: -0.5, scale: 1.002 },
  { x: 2, y: -0.5, rotation: -0.25, skewX: 0, scale: 1 },
  { x: 0, y: 0, rotation: 0, skewX: 0, scale: 1 },
];

const IDENTITY = { x: 0, y: 0, rotation: 0, skewX: 0, scale: 1 };

// ─────────────────────────────────────────────────────────────
// Component — one wrapper, five text layers, one GSAP timeline.
// The stack shakes as a single locked 3D object.
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
  const stackRef = React.useRef<HTMLDivElement | null>(null);
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
    const stack = stackRef.current;
    if (!stack || typeof window === "undefined") return;

    // Kill any in-flight shake and snap back to identity before restarting.
    timelineRef.current?.kill();
    timelineRef.current = null;
    gsap.set(stack, IDENTITY);
    innerRefs.current.forEach((node) => {
      if (node) gsap.set(node, IDENTITY);
    });

    const inners = innerRefs.current.filter((n): n is HTMLDivElement => n !== null);
    const animated: HTMLElement[] = [stack, ...inners];
    animated.forEach((node) => {
      node.style.willChange = "transform";
    });

    const intensity = Number.isFinite(shakeIntensity) ? (shakeIntensity as number) : 1;
    const total = Number.isFinite(shakeDuration) && (shakeDuration as number) > 0
      ? (shakeDuration as number)
      : SHAKE_TEXT_DEFAULTS.shakeDuration;
    const step = total / BASE_FRAMES.length;

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      repeat: Number.isFinite(shakeRepeat) ? Math.max(0, Math.round(shakeRepeat as number)) : 0,
      onComplete: () => {
        animated.forEach((node) => {
          node.style.willChange = "";
        });
        if (timelineRef.current === tl) timelineRef.current = null;
      },
    });

    BASE_FRAMES.forEach((frame, i) => {
      const at = i === 0 ? 0 : ">";
      tl.to(
        stack,
        {
          x: frame.x * intensity,
          y: frame.y * intensity,
          rotation: frame.rotation * intensity,
          skewX: frame.skewX * intensity,
          scale: 1 + (frame.scale - 1) * intensity,
          duration: step,
        },
        at,
      );
      inners.forEach((node, k) => {
        // Rear layers ride the stack, plus a whisper of extra motion.
        const delta = (LAYER_EXAGGERATION[k] ?? 1) - 1;
        if (delta === 0) return;
        tl.to(
          node,
          {
            x: frame.x * intensity * delta,
            y: frame.y * intensity * delta,
            rotation: frame.rotation * intensity * delta,
            skewX: frame.skewX * intensity * delta,
            duration: step,
          },
          at,
        );
      });
    });

    timelineRef.current = tl;
    return tl;
  }, [shakeIntensity, shakeDuration, shakeRepeat]);

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

  // Mount trigger.
  React.useEffect(() => {
    if (trigger !== "mount" || !autoPlay) return;
    const id = window.setTimeout(() => {
      play();
    }, 60);
    return () => window.clearTimeout(id);
  }, [trigger, autoPlay, play]);

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
      onMouseEnter={trigger === "hover" ? play : undefined}
      onClick={trigger === "click" ? play : undefined}
    >
      <div
        ref={stackRef}
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
