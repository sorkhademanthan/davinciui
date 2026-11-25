"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/*                                                                     */
/* Rolling Text — every character is an independent vertical rolling   */
/* column. Each column is a clipped 1em viewport containing a vertical */
/* stack of repeated copies of that same character. The inner track    */
/* translates vertically with transform only, so the roll geometry is  */
/* expressed in em units and stays synchronized at any font size.      */
/*                                                                     */
/* - "sequential": every column rolls downward, staggered by index.    */
/* - "alternating": even columns roll downward while odd columns roll  */
/*   upward, so neighboring tracks move in opposing directions. Both   */
/*   resting states show the same glyph (all copies are identical),    */
/*   which reproduces the reference's mixed resting transforms.        */
/* ------------------------------------------------------------------ */

export type RollingTextPattern = "sequential" | "alternating";

export interface RollingTextHandle {
  /** Plays the roll animation from its start state. Safe to call rapidly. */
  play: () => void;
  /** Cancels any in-flight animation and snaps to the final resting state. */
  reset: () => void;
}

export interface RollingTextProps {
  /** Text content. Wraps at word boundaries; spaces keep their width. */
  text?: string;
  /** Roll choreography across the character columns. @default "alternating" */
  pattern?: RollingTextPattern;
  /** Repeated copies of each glyph stacked inside its column. @default 8 */
  duplicateCount?: number;
  /** Per-character roll duration, in seconds. @default 1.4 */
  rollDuration?: number;
  /** Delay between consecutive characters, in seconds. @default 0.04 */
  staggerDelay?: number;
  /** Vertical motion blur applied during movement, in px (0–20). @default 3 */
  blurIntensity?: number;
  /** Start automatically when mounted/ready and replay when animation props change. @default true */
  autoPlay?: boolean;
  /** Font family applied to the text. */
  fontFamily?: string;
  /** Font size. Numbers become px; strings pass through (e.g. clamp()). @default 60 */
  fontSize?: number | string;
  /** Font weight applied to the text. @default 900 */
  fontWeight?: number | string;
  /** Font style applied to the text. @default "normal" */
  fontStyle?: "normal" | "italic";
  /** Line height. Numbers are unitless multipliers. @default 1 */
  lineHeight?: number | string;
  /** Tracking. Numbers become px; strings pass through (e.g. "-0.02em"). @default "-0.02em" */
  letterSpacing?: number | string;
  /** Text color. Follows the site theme when omitted (light: dark text, dark: light text). */
  textColor?: string;
  /** Container background. Follows the site theme when omitted. Accepts "transparent". */
  backgroundColor?: string;
  /** Text alignment. @default "center" */
  textAlign?: "left" | "center" | "right";
  /** Additional classes for the outer element. */
  className?: string;
  /** Additional inline styles for the outer element. */
  style?: React.CSSProperties;
}

export const ROLLING_TEXT_DEFAULTS = {
  text: "DAVINCIUI",
  pattern: "alternating",
  duplicateCount: 8,
  rollDuration: 1.4,
  staggerDelay: 0.04,
  blurIntensity: 3,
  autoPlay: true,
  fontFamily: "Inter, sans-serif",
  fontSize: 111,
  fontWeight: 900,
  fontStyle: "normal",
  lineHeight: 1,
  letterSpacing: "-0.02em",
  textColor: "#FFFFFF",
  backgroundColor: "#000000",
  textAlign: "center",
} as const;

/** Premium ease: fast fluid start that settles cleanly, no bounce. */
const ROLL_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

// Theme-aware runtime defaults: light mode → dark text on light bg,
// dark mode → light text on dark bg. Pure CSS, so toggling the theme
// never rebuilds the WAAPI animations.
const THEME_TEXT_COLOR = `var(--foreground, ${ROLLING_TEXT_DEFAULTS.textColor})`;
const THEME_BACKGROUND_COLOR = `var(--background, ${ROLLING_TEXT_DEFAULTS.backgroundColor})`;

const MIN_DUPLICATES = 2;
const MAX_DUPLICATES = 20;
const MAX_BLUR = 20;

function clampDuplicates(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : ROLLING_TEXT_DEFAULTS.duplicateCount;
  return Math.min(MAX_DUPLICATES, Math.max(MIN_DUPLICATES, n));
}

function clampBlur(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : ROLLING_TEXT_DEFAULTS.blurIntensity;
  return Math.min(MAX_BLUR, Math.max(0, n));
}

function clampDuration(value: unknown, fallback: number): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.max(0.01, n);
}

/** Split into alternating word / whitespace tokens, preserving spacing. */
function tokenize(text: string): { value: string; isWord: boolean }[] {
  return text
    .split(/(\s+)/)
    .filter((part) => part.length > 0)
    .map((part) => ({ value: part, isWord: !/^\s+$/.test(part) }));
}

// Layout effect before paint on the client (no SSR warning), plain
// effect on the server. Lets autoplay install its WAAPI animations
// before the first paint so there is no flash of the resting state.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export const RollingText = React.forwardRef<RollingTextHandle, RollingTextProps>(function RollingText(
  {
    text = ROLLING_TEXT_DEFAULTS.text,
    pattern = ROLLING_TEXT_DEFAULTS.pattern,
    duplicateCount = ROLLING_TEXT_DEFAULTS.duplicateCount,
    rollDuration = ROLLING_TEXT_DEFAULTS.rollDuration,
    staggerDelay = ROLLING_TEXT_DEFAULTS.staggerDelay,
    blurIntensity = ROLLING_TEXT_DEFAULTS.blurIntensity,
    autoPlay = ROLLING_TEXT_DEFAULTS.autoPlay,
    fontFamily = ROLLING_TEXT_DEFAULTS.fontFamily,
    fontSize = ROLLING_TEXT_DEFAULTS.fontSize,
    fontWeight = ROLLING_TEXT_DEFAULTS.fontWeight,
    fontStyle = ROLLING_TEXT_DEFAULTS.fontStyle,
    lineHeight = ROLLING_TEXT_DEFAULTS.lineHeight,
    letterSpacing = ROLLING_TEXT_DEFAULTS.letterSpacing,
    textColor,
    backgroundColor,
    textAlign = ROLLING_TEXT_DEFAULTS.textAlign,
    className,
    style,
  }: RollingTextProps,
  ref,
) {
  const safeDuplicates = clampDuplicates(duplicateCount);
  const safeDuration = clampDuration(rollDuration, ROLLING_TEXT_DEFAULTS.rollDuration);
  const safeStagger =
    typeof staggerDelay === "number" && Number.isFinite(staggerDelay)
      ? Math.max(0, staggerDelay)
      : ROLLING_TEXT_DEFAULTS.staggerDelay;
  const safeBlur = clampBlur(blurIntensity);

  /** Vertical travel in em — one row per copy, resting on the last one. */
  const travelEm = safeDuplicates - 1;

  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent): void => setReducedMotion(e.matches);
    setReducedMotion(mq.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  const tokens = React.useMemo(() => tokenize(text ?? ""), [text]);

  // Render model: per-token word characters with their global stream
  // index (spaces included in the numbering so the stagger wave travels
  // naturally across gaps). Spaces are rendered as plain preserved
  // whitespace — they keep their visual width but never create rolling
  // glyphs.
  interface WordChar {
    char: string;
    index: number;
  }
  const tokenChars = React.useMemo(() => {
    const model: (WordChar[] | null)[] = [];
    let index = 0;
    for (const token of tokens) {
      if (token.isWord) {
        const chars: WordChar[] = [];
        for (const char of Array.from(token.value)) {
          chars.push({ char, index });
          index += 1;
        }
        model.push(chars);
      } else {
        index += Array.from(token.value).length;
        model.push(null);
      }
    }
    return model;
  }, [tokens]);

  const trackRefs = React.useRef<Map<number, HTMLSpanElement>>(new Map());
  const animationsRef = React.useRef<Animation[]>([]);

  const cancelAnimations = React.useCallback(() => {
    for (const animation of animationsRef.current) {
      try {
        animation.cancel();
      } catch {
        /* Already finished/cancelled — resting inline styles apply. */
      }
    }
    animationsRef.current = [];
  }, []);

  // Resting transform per column. Sequential (and even alternating
  // columns) rest at translate none; odd alternating columns rest
  // translated by the full travel — visually identical since every copy
  // is the same glyph, matching the reference's mixed resting states.
  const endEmFor = React.useCallback(
    (index: number): number => {
      if (pattern === "alternating" && index % 2 === 1) return -travelEm;
      return 0;
    },
    [pattern, travelEm],
  );

  const startEmFor = React.useCallback(
    (index: number): number => {
      if (pattern === "alternating") return index % 2 === 1 ? 0 : -travelEm;
      return -travelEm;
    },
    [pattern, travelEm],
  );

  const play = React.useCallback(() => {
    if (typeof window === "undefined" || reducedMotion) return;
    cancelAnimations();
    // Drop track nodes left over from a previous (longer) text.
    const live = new Set<number>();
    for (const chars of tokenChars) {
      if (chars) for (const item of chars) live.add(item.index);
    }
    for (const key of Array.from(trackRefs.current.keys())) {
      if (!live.has(key)) trackRefs.current.delete(key);
    }
    const animations: Animation[] = [];
    for (const chars of tokenChars) {
      if (!chars) continue;
      for (const item of chars) {
        const track = trackRefs.current.get(item.index);
        if (!track) continue;
        const startEm = startEmFor(item.index);
        const endEm = endEmFor(item.index);
        const keyframes: Keyframe[] = [
          {
            transform: `translate3d(0, ${startEm}em, 0)`,
            ...(safeBlur > 0 ? { filter: `blur(${safeBlur}px)` } : null),
          },
          {
            transform: `translate3d(0, ${endEm}em, 0)`,
            ...(safeBlur > 0 ? { filter: "blur(0px)" } : null),
          },
        ];
        try {
          const animation = track.animate(keyframes, {
            duration: safeDuration * 1000,
            delay: item.index * safeStagger * 1000,
            easing: ROLL_EASING,
            fill: "both",
          });
          animations.push(animation);
        } catch {
          /* WAAPI unavailable — tracks keep their resting inline styles. */
        }
      }
    }
    animationsRef.current = animations;
  }, [tokenChars, reducedMotion, cancelAnimations, startEmFor, endEmFor, safeBlur, safeDuration, safeStagger]);

  const reset = React.useCallback(() => {
    cancelAnimations();
  }, [cancelAnimations]);

  const playRef = React.useRef(play);
  playRef.current = play;

  React.useImperativeHandle(ref, () => ({ play: () => playRef.current(), reset }), [reset]);

  // Autoplay: animate once into the final state on mount and whenever
  // the animation geometry changes. fill:"both" holds the resting
  // state without React re-rendering per frame; cleanup cancels.
  useIsomorphicLayoutEffect(() => {
    if (!autoPlay || reducedMotion) return;
    playRef.current();
    return () => {
      for (const animation of animationsRef.current) {
        try {
          animation.cancel();
        } catch {
          /* noop */
        }
      }
      animationsRef.current = [];
    };
  }, [autoPlay, reducedMotion, text, pattern, safeDuplicates, safeDuration, safeStagger, safeBlur]);

  // Unmount safety net (StrictMode remounts run the effect cleanup above,
  // this covers the autoplay-off path where no animations were started
  // by the effect but play() was called imperatively).
  React.useEffect(() => cancelAnimations, [cancelAnimations]);

  const resolvedFontSize = typeof fontSize === "number" ? `${fontSize}px` : fontSize;
  const resolvedLetterSpacing = typeof letterSpacing === "number" ? `${letterSpacing}px` : letterSpacing;
  const resolvedTextColor = textColor ?? THEME_TEXT_COLOR;
  const resolvedBackgroundColor = backgroundColor ?? THEME_BACKGROUND_COLOR;

  const setTrackRef = (index: number) => (node: HTMLSpanElement | null) => {
    if (node) trackRefs.current.set(index, node);
    else trackRefs.current.delete(index);
  };

  return (
    <div
      data-slot="rolling-text"
      className={cn("w-full", className)}
      style={{
        backgroundColor: resolvedBackgroundColor,
        fontFamily,
        fontSize: resolvedFontSize,
        fontWeight,
        fontStyle,
        lineHeight,
        letterSpacing: resolvedLetterSpacing,
        color: resolvedTextColor,
        textAlign,
        whiteSpace: "pre-wrap",
        ...style,
      }}
    >
      {/* Screen-reader text (not a visual layer). */}
      <span className="sr-only">{text}</span>

      {/* Animated tree — hidden from assistive tech (no per-copy chatter). */}
      <span aria-hidden="true">
        {tokens.map((token, tokenIndex) => {
          const chars = tokenChars[tokenIndex];
          if (!token.isWord || !chars) {
            return <span key={tokenIndex}>{token.value}</span>;
          }
          return (
            <span key={tokenIndex} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {chars.map(({ char, index: globalIndex }) => {
                if (reducedMotion) {
                  return <span key={globalIndex}>{char}</span>;
                }
                const endEm = endEmFor(globalIndex);
                return (
                  <span
                    key={globalIndex}
                    className="rolling-text__char"
                    style={{
                      display: "inline-flex",
                      height: "1em",
                      overflow: "hidden",
                      verticalAlign: "top",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      ref={setTrackRef(globalIndex)}
                      className="rolling-text__track"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        willChange: "transform",
                        transform: `translate3d(0, ${endEm}em, 0)`,
                      }}
                    >
                      {Array.from({ length: safeDuplicates }).map((_, copyIndex) => (
                        <span
                          key={copyIndex}
                          className="rolling-text__row"
                          style={{
                            height: "1em",
                            lineHeight: "1em",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            whiteSpace: "pre",
                          }}
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </div>
  );
});

export default RollingText;
