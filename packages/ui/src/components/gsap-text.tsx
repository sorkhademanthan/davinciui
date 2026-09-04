"use client";

import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types — faithful to the reverse-engineered Framer component
// ─────────────────────────────────────────────────────────────

export type KineticDirection = "up" | "down" | "both";

export type KineticHtmlTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

export interface KineticTextFont {
  fontFamily?: string;
  fontSize?: string | number;
  fontStyle?: string;
  fontWeight?: string | number;
  letterSpacing?: string | number;
  lineHeight?: string | number;
  textAlign?: React.CSSProperties["textAlign"];
  variant?: string;
  [key: string]: unknown;
}

export interface KineticTextProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Text rendered in the main layer and every clone. `\n` sequences become line breaks. @default "GSAP TEXT" */
  text?: string;
  /** Structured font object. Falls back to Inter Display defaults. */
  font?: KineticTextFont;
  /** Text color. Follows the site theme when omitted (light: dark text, dark: light text). */
  textColor?: string;
  /** Opaque background shared by every layer (masking). Follows the site theme when omitted. */
  backgroundColor?: string;
  /** Number of kinetic layers. `both` creates 2 clones per layer. @default 10 */
  layerCount?: number;
  /** Seconds per GSAP tween; also drives the per-layer phase offset. @default 4 */
  duration?: number;
  /** Total vertical travel in px. `both` splits it to ±distance/2. @default 300 */
  distance?: number;
  /** Flow direction. @default "both" */
  direction?: KineticDirection;
  /** Semantic tag for the accessible main text. @default "h1" */
  htmlTag?: KineticHtmlTag;
  /** Extra classes for the outer wrapper. */
  className?: string;
  /** Extra classes applied to the main text and every clone. */
  textClassName?: string;

  // ── Legacy aliases (kept so existing docs/previews keep working) ──
  /** @deprecated Use `htmlTag` instead. */
  tag?: KineticHtmlTag;
  /** @deprecated Use `layerCount` instead. */
  amount?: number;
  /** @deprecated Use `textColor` instead. */
  color?: string;
  /** @deprecated Use `font.fontFamily` instead. */
  fontFamily?: string;
  /** @deprecated Use `font.fontSize` instead. */
  fontSize?: number | string;
  /** @deprecated Use `font.fontWeight` instead. */
  fontWeight?: number | string;
}

// Back-compat type names used by docs/previews.
export type KineticTextTag = KineticHtmlTag;
export type KineticTextDirection = KineticDirection;

const DEFAULT_TEXT = "GSAP TEXT";
// Framer reference colors — used as fallbacks when the host app does not
// define theme variables. With no explicit props, the component follows the
// site theme instead (see THEME_TEXT_COLOR / THEME_BACKGROUND_COLOR).
const DEFAULT_TEXT_COLOR = "#FEFFED";
const DEFAULT_BACKGROUND_COLOR = "#000000";
// Theme-aware runtime defaults: light mode → dark text on light bg,
// dark mode → light text on dark bg. Pure CSS, so toggling the theme
// never rebuilds the GSAP timelines.
const THEME_TEXT_COLOR = `var(--foreground, ${DEFAULT_TEXT_COLOR})`;
const THEME_BACKGROUND_COLOR = `var(--background, ${DEFAULT_BACKGROUND_COLOR})`;
const DEFAULT_LAYER_COUNT = 10;
const DEFAULT_DURATION = 4;
const DEFAULT_DISTANCE = 300;
const DEFAULT_DIRECTION: KineticDirection = "both";
const DEFAULT_HTML_TAG: KineticHtmlTag = "h1";

export const KINETIC_TEXT_DEFAULTS = {
  text: DEFAULT_TEXT,
  tag: DEFAULT_HTML_TAG,
  htmlTag: DEFAULT_HTML_TAG,
  fontFamily: '"Inter Display", "Inter Display Placeholder", sans-serif',
  fontSize: 88,
  fontWeight: 600,
  color: "rgb(254, 255, 237)",
  textColor: "rgb(254, 255, 237)",
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  direction: DEFAULT_DIRECTION,
  amount: 20,
  layerCount: DEFAULT_LAYER_COUNT,
  distance: 150,
  duration: 2,
} as const;

// ─────────────────────────────────────────────────────────────
// Font normalization — reproduces the original variant conversion
// ─────────────────────────────────────────────────────────────

const VARIANT_WEIGHTS: Array<[RegExp, number]> = [
  [/thin/i, 100],
  [/extra\s*light|ultra\s*light/i, 200],
  [/(?<!extra\s)(?<!ultra\s)light/i, 300],
  [/regular/i, 400],
  [/medium/i, 500],
  [/semibold|demi\s*bold/i, 600],
  [/extra\s*bold|ultra\s*bold/i, 800],
  [/(?<!extra\s)(?<!ultra\s)(?<!demi\s)(?<!semi\s)bold/i, 700],
  [/black|heavy/i, 900],
];

function weightFromVariant(variant: string): number | null {
  for (const [pattern, weight] of VARIANT_WEIGHTS) {
    if (pattern.test(variant)) return weight;
  }
  if (/\b700\b/.test(variant)) return 700;
  return null;
}

function normalizeFont(font?: KineticTextFont): React.CSSProperties {
  if (!font) {
    return {
      fontFamily: '"Inter Display", "Inter Display Placeholder", sans-serif',
      fontSize: "88px",
      fontWeight: 700,
      lineHeight: 1.1,
      textAlign: "center",
    };
  }

  const out: React.CSSProperties & Record<string, unknown> = { ...(font as Record<string, unknown>) };
  delete out.variant;

  if (typeof font.variant === "string" && font.variant.length > 0) {
    const weight = weightFromVariant(font.variant);
    if (weight !== null && out.fontWeight === undefined) out.fontWeight = weight;
    if (out.fontStyle === undefined) {
      out.fontStyle = /italic/i.test(font.variant) ? "italic" : "normal";
    }
  }

  if (typeof out.fontSize === "number") out.fontSize = `${out.fontSize}px`;
  if (typeof out.lineHeight === "number") {
    out.lineHeight = out.lineHeight > 5 ? `${out.lineHeight}px` : out.lineHeight;
  }
  if (typeof out.letterSpacing === "number") out.letterSpacing = `${out.letterSpacing}px`;

  return out as React.CSSProperties;
}

// ─────────────────────────────────────────────────────────────
// Component — exact recreation of the Framer "GSAP Kinetic Text"
// animation core: layerCount independent infinite GSAP timelines,
// each started at (layerIndex / layerCount) * duration.
// ─────────────────────────────────────────────────────────────

export function KineticText({
  text = DEFAULT_TEXT,
  font,
  textColor,
  backgroundColor,
  layerCount,
  duration = DEFAULT_DURATION,
  distance = DEFAULT_DISTANCE,
  direction = DEFAULT_DIRECTION,
  htmlTag,
  className,
  textClassName,
  style,
  // legacy aliases
  tag,
  amount,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  ...props
}: KineticTextProps) {
  const resolvedHtmlTag: KineticHtmlTag = htmlTag ?? tag ?? DEFAULT_HTML_TAG;
  const resolvedLayerCount = layerCount ?? amount ?? DEFAULT_LAYER_COUNT;
  const resolvedTextColor = textColor ?? color ?? THEME_TEXT_COLOR;
  const resolvedBackgroundColor = backgroundColor ?? THEME_BACKGROUND_COLOR;
  const safeLayerCount = Number.isFinite(resolvedLayerCount)
    ? Math.max(0, Math.round(resolvedLayerCount as number))
    : DEFAULT_LAYER_COUNT;
  const safeDuration =
    Number.isFinite(duration) && (duration as number) > 0 ? (duration as number) : DEFAULT_DURATION;
  const safeDistance =
    Number.isFinite(distance) ? (distance as number) : DEFAULT_DISTANCE;

  const mergedFont: KineticTextFont | undefined = React.useMemo(() => {
    const overrides: KineticTextFont = {};
    if (fontFamily !== undefined) overrides.fontFamily = fontFamily;
    if (fontSize !== undefined) overrides.fontSize = fontSize;
    if (fontWeight !== undefined) overrides.fontWeight = fontWeight;
    if (!font && Object.keys(overrides).length === 0) return undefined;
    return { ...(font ?? {}), ...overrides };
  }, [font, fontFamily, fontSize, fontWeight]);

  const fontStyles = React.useMemo(() => normalizeFont(mergedFont), [mergedFont]);
  const fontKey = React.useMemo(() => {
    try {
      return JSON.stringify(mergedFont ?? null);
    } catch {
      return String(mergedFont);
    }
  }, [mergedFont]);

  // `\n` sequences (literal backslash-n) become real line breaks.
  const resolvedText = React.useMemo(
    () => (text ?? DEFAULT_TEXT).replace(/\\n/g, "\n"),
    [text],
  );

  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const cloneContainerRef = React.useRef<HTMLDivElement | null>(null);
  const textRef = React.useRef<HTMLElement | null>(null);
  const timelinesRef = React.useRef<gsap.core.Timeline[]>([]);
  const runIdRef = React.useRef(0);

  const textStyles: React.CSSProperties = React.useMemo(
    () => ({
      margin: 0,
      display: "block",
      paddingLeft: (fontStyles.letterSpacing as string | number | undefined) ?? 0,
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: 0,
      whiteSpace: "pre-wrap",
      willChange: "transform",
      boxSizing: "content-box",
      ...fontStyles,
      color: resolvedTextColor,
      backgroundColor: resolvedBackgroundColor,
    }),
    [fontStyles, resolvedTextColor, resolvedBackgroundColor],
  );

  const directionPaddingTop = direction === "up" ? safeDistance : direction === "both" ? safeDistance / 2 : 0;
  const directionPaddingBottom =
    direction === "down" ? safeDistance : direction === "both" ? safeDistance / 2 : 0;
  const cloneAlign = direction === "up" ? "flex-end" : direction === "down" ? "flex-start" : "center";

  React.useEffect(() => {
    const container = cloneContainerRef.current;
    const textElement = textRef.current;
    if (!container || !textElement || typeof window === "undefined") return;

    // Run token: a stale timeout from a superseded mount/effect must never
    // build a second animation set (StrictMode, HMR, rapid prop changes).
    runIdRef.current += 1;
    const runId = runIdRef.current;

    const timeout = window.setTimeout(() => {
      if (runId !== runIdRef.current) return;

      // Tear down any previous run.
      timelinesRef.current.forEach((timeline) => timeline.kill());
      timelinesRef.current = [];
      container.innerHTML = "";

      const timelines: gsap.core.Timeline[] = [];

      for (let layerIndex = 0; layerIndex < safeLayerCount; layerIndex++) {
        const clones: HTMLDivElement[] = [];

        function createClone(): HTMLDivElement {
          const clone = document.createElement("div");
          clone.innerHTML = textElement!.innerHTML;
          clone.setAttribute("style", textElement!.getAttribute("style") || "");
          clone.setAttribute("aria-hidden", "true");
          return clone;
        }

        if (direction === "both") {
          clones.push(createClone());
        }
        clones.push(createClone());

        clones.forEach((clone) => {
          Object.assign(clone.style, {
            visibility: "visible",
            position: "absolute",
          });
          container.prepend(clone);
        });

        const timeline = gsap.timeline({
          repeat: -1,
          onRepeat: () => {
            clones.forEach((clone) => {
              container.append(clone);
            });
          },
        });

        timeline
          .fromTo(
            clones,
            {
              position: "absolute",
              scaleY: 1,
            },
            {
              duration: safeDuration,
              // GSAP invokes function-based values as (index, target, targets);
              // accept either ordering so the first/second clone split is exact.
              y: (a: unknown, b: unknown) => {
                const index = typeof a === "number" ? a : typeof b === "number" ? (b as number) : 0;
                if (direction === "up") return -safeDistance;
                if (direction === "down") return safeDistance;
                return index === 0 ? -safeDistance / 2 : safeDistance / 2;
              },
              scaleY: 1,
              ease: "power3.out",
            },
          )
          .play((layerIndex / safeLayerCount) * safeDuration);

        timelines.push(timeline);
      }

      timelinesRef.current = timelines;
    }, 10);

    return () => {
      runIdRef.current += 1;
      window.clearTimeout(timeout);
      timelinesRef.current.forEach((timeline) => timeline.kill());
      timelinesRef.current = [];
      if (container) container.innerHTML = "";
    };
  }, [resolvedText, safeLayerCount, safeDuration, safeDistance, direction, resolvedTextColor, resolvedBackgroundColor, fontKey]);

  const mainText = React.createElement(
    resolvedHtmlTag,
    {
      ref: textRef,
      className: cn("kinetic-text", textClassName),
      style: { ...textStyles, position: "relative", zIndex: 100 },
    },
    resolvedText,
  );

  return (
    <div
      ref={wrapperRef}
      data-slot="kinetic-text"
      className={cn("kinetic-wrapper", className)}
      style={{
        width: "max-content",
        height: "auto",
        minWidth: 100,
        minHeight: 100,
        flexShrink: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "visible",
        paddingTop: directionPaddingTop,
        paddingBottom: directionPaddingBottom,
        ...style,
      }}
      {...props}
    >
      <div
        ref={cloneContainerRef}
        aria-hidden="true"
        className="kinetic-clone-container pointer-events-none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: cloneAlign,
        }}
      />
      {mainText}
    </div>
  );
}

/** Back-compat alias — the registry entry is still named `gsap-text`. */
export const GSAPText = KineticText;
export type GSAPTextProps = KineticTextProps;
export const GSAP_TEXT_DEFAULTS = KINETIC_TEXT_DEFAULTS;

/** Exact reference instance from the original Framer page. */
export function KineticTextDemo() {
  return (
    <KineticText
      text="GSAP TEXT"
      htmlTag="span"
      font={{
        fontFamily: '"Inter Display", "Inter Display Placeholder", sans-serif',
        fontSize: "88px",
        fontStyle: "normal",
        fontWeight: 600,
        letterSpacing: "0em",
        lineHeight: "1.1em",
      }}
      textColor="rgb(254, 255, 237)"
      backgroundColor="rgb(0, 0, 0)"
      direction="both"
      distance={300}
      duration={7}
      layerCount={10}
    />
  );
}

export default KineticText;
