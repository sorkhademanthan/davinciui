"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type TextRevealStyle =
  | "linear"
  | "diagonal"
  | "random"
  | "center-out"
  | "edges-in";
export type TextRevealBy = "characters" | "words";
export type TextRevealDiagonalDirection =
  | "top-left-to-bottom-right"
  | "top-right-to-bottom-left"
  | "bottom-left-to-top-right"
  | "bottom-right-to-top-left";

export interface TextRevealPoint {
  x: number;
  y: number;
}

export interface TextRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  revealStyle?: TextRevealStyle;
  revealBy?: TextRevealBy;
  diagonalDirection?: TextRevealDiagonalDirection;
  fromOpacity?: number;
  toOpacity?: number;
  revealedColor?: string;
  unrevealedColor?: string;
  revealSoftness?: number;
  startPosition?: string;
  endPosition?: string;
  startOffset?: number;
  endOffset?: number;
  scrub?: boolean;
  scrubSmoothness?: number;
  /** Optional scroll container or selector for embedded scrollable previews. */
  scroller?: HTMLElement | string;
  /** Optional trigger element or selector for embedded scrollable previews. */
  trigger?: HTMLElement | string;
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: "normal" | "italic";
  fontSize?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textAlign?: "left" | "center" | "right" | "justify";
  xOffset?: number;
  yOffset?: number;
  scaleFrom?: number;
  blurFrom?: number;
  randomSeed?: number;
  respectReducedMotion?: boolean;
  /** Native Framer Font-control value; individual typography props are fallbacks. */
  font?: Partial<Pick<React.CSSProperties, "fontFamily" | "fontWeight" | "fontStyle" | "fontSize" | "lineHeight" | "letterSpacing" | "textAlign">>;
}

const DEFAULT_TEXT =
  "DavinciUI brings a growing library of thoughtfully crafted components and flexible patterns together, helping teams build polished, consistent interfaces faster. Explore, customize every detail, and bring motion-rich experiences to life—from the first prototype through the final product.";
const DEFAULT_START = "top 80%";
const DEFAULT_END = "bottom 40%";
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
let refreshFrame = 0;
let scrollTriggerRegistered = false;
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function ensureScrollTrigger(): void {
  if (scrollTriggerRegistered) return;
  gsap.registerPlugin(ScrollTrigger);
  scrollTriggerRegistered = true;
}

function scheduleScrollRefresh(): void {
  if (!scrollTriggerRegistered || refreshFrame) return;
  refreshFrame = window.requestAnimationFrame(() => {
    refreshFrame = 0;
    ScrollTrigger.refresh();
  });
}

function normalize(value: number, min: number, max: number): number {
  return max - min < 1e-6 ? 0 : clamp01((value - min) / (max - min));
}

function diagonalMetric(
  point: TextRevealPoint,
  direction: TextRevealDiagonalDirection,
): number {
  switch (direction) {
    case "top-right-to-bottom-left":
      return 1 - point.x + point.y;
    case "bottom-left-to-top-right":
      return point.x + 1 - point.y;
    case "bottom-right-to-top-left":
      return 2 - point.x - point.y;
    default:
      return point.x + point.y;
  }
}

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns a stable normalized reveal position for one item in a layout. */
export function getRevealProgress(
  index: number,
  layout: readonly TextRevealPoint[],
  style: TextRevealStyle,
  direction: TextRevealDiagonalDirection = "top-left-to-bottom-right",
  randomProgress?: readonly number[],
): number {
  const count = layout.length;
  if (count <= 1) return 0;
  if (style === "linear") return index / (count - 1);
  if (style === "random") return randomProgress?.[index] ?? index / (count - 1);

  const values = layout.map((point) => {
    if (style === "diagonal") return diagonalMetric(point, direction);
    const distance = Math.hypot(point.x - 0.5, point.y - 0.5);
    return style === "edges-in" ? -distance : distance;
  });
  const value = values[index] ?? 0;
  return normalize(value, Math.min(...values), Math.max(...values));
}

/** Calculates the whole sequence once, after layout, never during scrolling. */
export function calculateRevealProgresses(
  layout: readonly TextRevealPoint[],
  style: TextRevealStyle,
  direction: TextRevealDiagonalDirection = "top-left-to-bottom-right",
  randomSeed = 1,
): number[] {
  const count = layout.length;
  if (count <= 1) return count === 0 ? [] : [0];
  if (style === "linear") {
    return layout.map((_, index) => index / (count - 1));
  }
  if (style === "random") {
    const random = seededRandom(randomSeed);
    const order = Array.from({ length: count }, (_, index) => index);
    for (let index = count - 1; index > 0; index--) {
      const swapIndex = Math.floor(random() * (index + 1));
      [order[index], order[swapIndex]] = [order[swapIndex]!, order[index]!];
    }
    const progress = new Array<number>(count);
    order.forEach((elementIndex, orderIndex) => {
      progress[elementIndex] = orderIndex / (count - 1);
    });
    return progress;
  }

  const values = layout.map((point) => {
    if (style === "diagonal") return diagonalMetric(point, direction);
    const distance = Math.hypot(point.x - 0.5, point.y - 0.5);
    return style === "edges-in" ? -distance : distance;
  });
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map((value) => normalize(value, min, max));
}

interface TextToken {
  value: string;
  isWord: boolean;
}

function tokenize(text: string): TextToken[] {
  return text
    .split(/(\s+)/u)
    .filter(Boolean)
    .map((value) => ({ value, isWord: !/^\s+$/u.test(value) }));
}

function splitGraphemes(value: string): string[] {
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), (part) => part.segment);
  }
  return Array.from(value);
}

function isFramerCanvas(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const framerWindow = window as unknown as Record<string, unknown>;
    if (framerWindow.__framer_canvas === true) return true;
    const framer = framerWindow.framer as Record<string, unknown> | undefined;
    if (framer?.inCanvas === true) return true;
    if (document.documentElement.hasAttribute("data-framer-canvas")) return true;
    const params = new URLSearchParams(window.location.search);
    return params.has("framerCanvas") || params.get("env") === "canvas";
  } catch {
    return false;
  }
}

function withOffset(position: string, offset: number): string {
  if (!offset) return position;
  return `${position}${offset > 0 ? "+=" : "-="}${Math.abs(offset)}`;
}

function useReducedMotion(enabled: boolean): boolean {
  const [reduced, setReduced] = React.useState(false);
  useIsomorphicLayoutEffect(() => {
    if (!enabled || typeof window.matchMedia !== "function") {
      setReduced(false);
      return;
    }
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, [enabled]);
  return enabled && reduced;
}

const SCREEN_READER_ONLY: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function TextReveal({
  text = DEFAULT_TEXT,
  revealStyle = "linear",
  revealBy = "words",
  diagonalDirection = "top-left-to-bottom-right",
  fromOpacity = 0.15,
  toOpacity = 1,
  revealedColor = "#FFFFFF",
  unrevealedColor = "#FFFFFF",
  revealSoftness = 0.24,
  startPosition = DEFAULT_START,
  endPosition = DEFAULT_END,
  startOffset = 0,
  endOffset = 0,
  scrub = true,
  scrubSmoothness = 0.4,
  scroller,
  trigger,
  fontFamily = "Inter, sans-serif",
  fontWeight = 600,
  fontStyle = "normal",
  fontSize = 32,
  lineHeight = 1.4,
  letterSpacing = 0,
  textAlign = "left",
  xOffset = 0,
  yOffset = 0,
  scaleFrom = 1,
  blurFrom = 0,
  randomSeed = 1,
  respectReducedMotion = true,
  font,
  className,
  style,
  ...divProps
}: TextRevealProps) {
  const effectiveFontFamily = font?.fontFamily ?? fontFamily;
  const effectiveFontWeight = font?.fontWeight ?? fontWeight;
  const effectiveFontStyle = font?.fontStyle ?? fontStyle;
  const effectiveFontSize = font?.fontSize ?? fontSize;
  const effectiveLineHeight = font?.lineHeight ?? lineHeight;
  const effectiveLetterSpacing = font?.letterSpacing ?? letterSpacing;
  const effectiveTextAlign = font?.textAlign ?? textAlign;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const unitsRef = React.useRef<HTMLSpanElement[]>([]);
  const [layoutRevision, setLayoutRevision] = React.useState(0);
  const [framerCanvas, setFramerCanvas] = React.useState(false);
  const reducedMotion = useReducedMotion(respectReducedMotion);
  const tokens = React.useMemo(() => tokenize(text), [text]);
  const renderTokens = React.useMemo(
    () =>
      tokens.map((token) => ({
        ...token,
        units: token.isWord
          ? revealBy === "words"
            ? [token.value]
            : splitGraphemes(token.value)
          : [],
      })),
    [tokens, revealBy],
  );

  useIsomorphicLayoutEffect(() => {
    setFramerCanvas(isFramerCanvas());
  }, []);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let width = -1;
    let height = -1;
    let triggerWidth = -1;
    let triggerHeight = -1;
    let hasMeasured = false;
    let timeoutId = 0;
    let disposed = false;
    const scheduleRebuild = () => {
      if (disposed) return;
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (disposed) return;
        setLayoutRevision((revision) => revision + 1);
        scheduleScrollRefresh();
      }, 60);
    };
    const triggerElement =
      typeof trigger === "string"
        ? root.closest<HTMLElement>(trigger) ?? root
        : trigger ?? root;
    const observer = new ResizeObserver((entries) => {
      let rootChanged = false;
      const rootRect = entries.find((entry) => entry.target === root)?.contentRect;
      if (rootRect) {
        const nextWidth = Math.round(rootRect.width * 10) / 10;
        const nextHeight = Math.round(rootRect.height * 10) / 10;
        rootChanged = nextWidth !== width || nextHeight !== height;
        width = nextWidth;
        height = nextHeight;
      }

      let triggerChanged = false;
      if (triggerElement !== root) {
        const triggerRect = entries.find(
          (entry) => entry.target === triggerElement,
        )?.contentRect;
        if (triggerRect) {
          const nextWidth = Math.round(triggerRect.width * 10) / 10;
          const nextHeight = Math.round(triggerRect.height * 10) / 10;
          triggerChanged =
            triggerWidth >= 0 &&
            (nextWidth !== triggerWidth || nextHeight !== triggerHeight);
          triggerWidth = nextWidth;
          triggerHeight = nextHeight;
        }
      }

      if (rootChanged && !hasMeasured) {
        hasMeasured = true;
        setLayoutRevision((revision) => revision + 1);
        return;
      }
      if (rootChanged || triggerChanged) scheduleRebuild();
    });
    observer.observe(root);
    if (triggerElement !== root) observer.observe(triggerElement);

    const fontSet = document.fonts;
    void fontSet?.ready.then(() => {
      if (!disposed) scheduleRebuild();
    });
    fontSet?.addEventListener?.("loadingdone", scheduleRebuild);
    return () => {
      disposed = true;
      observer.disconnect();
      fontSet?.removeEventListener?.("loadingdone", scheduleRebuild);
      window.clearTimeout(timeoutId);
    };
  }, [effectiveFontFamily, effectiveFontSize, effectiveFontWeight, effectiveFontStyle, text, trigger]);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const units = unitsRef.current.filter(
      (unit): unit is HTMLSpanElement => unit !== null,
    );
    if (!root || units.length === 0) return;

    if (reducedMotion || framerCanvas) {
      // A previous GSAP context can revert after React commits the static
      // styles, so explicitly leave every unit in the complete final state.
      for (const unit of units) {
        unit.style.opacity = String(toOpacity);
        unit.style.color = revealedColor;
        unit.style.transform = "none";
        unit.style.filter = "none";
      }
      return;
    }
    ensureScrollTrigger();
    const activeScroller =
      typeof scroller === "string"
        ? root.closest<HTMLElement>(scroller) ?? undefined
        : scroller;
    const activeTrigger =
      typeof trigger === "string"
        ? root.closest<HTMLElement>(trigger) ?? root
        : trigger ?? root;

    const bounds = root.getBoundingClientRect();
    const layout = units.map((unit) => {
      const rect = unit.getBoundingClientRect();
      return {
        x: bounds.width > 0 ? (rect.left + rect.width / 2 - bounds.left) / bounds.width : 0,
        y: bounds.height > 0 ? (rect.top + rect.height / 2 - bounds.top) / bounds.height : 0,
      };
    });
    const progress = calculateRevealProgresses(
      layout,
      revealStyle,
      diagonalDirection,
      randomSeed,
    );
    const softness = Math.min(1, Math.max(0.01, revealSoftness));
    const scrubValue = scrub
      ? scrubSmoothness > 0
        ? Math.min(2, scrubSmoothness)
        : true
      : false;
    const fromVars: gsap.TweenVars = {
      opacity: fromOpacity,
    };
    const revealVars: gsap.TweenVars = {
      opacity: toOpacity,
      duration: softness,
      ease: "none",
      stagger: (index: number) =>
        (progress[index] ?? 0) * (1 - softness),
    };

    // Keep equal theme-token colors as CSS variables so theme changes remain live.
    if (revealedColor !== unrevealedColor) {
      fromVars.color = unrevealedColor;
      revealVars.color = revealedColor;
    }
    if (xOffset !== 0) {
      fromVars.x = xOffset;
      revealVars.x = 0;
    }
    if (yOffset !== 0) {
      fromVars.y = yOffset;
      revealVars.y = 0;
    }
    if (scaleFrom !== 1) {
      fromVars.scale = scaleFrom;
      revealVars.scale = 1;
    }
    if (blurFrom > 0) {
      fromVars.filter = `blur(${blurFrom}px)`;
      revealVars.filter = "blur(0px)";
    }

    const context = gsap.context(() => {
      gsap.set(units, fromVars);

      const driver = { progress: 0 };
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: activeTrigger,
          scroller: activeScroller,
          start: withOffset(startPosition, startOffset),
          end: withOffset(endPosition, endOffset),
          scrub: scrubValue,
          invalidateOnRefresh: true,
        },
      });
      timeline.to(driver, { progress: 1, duration: 1, ease: "none" }, 0);
      timeline.to(units, revealVars, 0);
    }, root);

    scheduleScrollRefresh();
    return () => context.revert();
  }, [
    text,
    tokens,
    revealStyle,
    revealBy,
    diagonalDirection,
    fromOpacity,
    toOpacity,
    revealedColor,
    unrevealedColor,
    revealSoftness,
    startPosition,
    endPosition,
    startOffset,
    endOffset,
    scrub,
    scrubSmoothness,
    scroller,
    trigger,
    effectiveFontFamily,
    effectiveFontWeight,
    effectiveFontStyle,
    effectiveFontSize,
    effectiveLineHeight,
    effectiveLetterSpacing,
    effectiveTextAlign,
    xOffset,
    yOffset,
    scaleFrom,
    blurFrom,
    randomSeed,
    reducedMotion,
    framerCanvas,
    layoutRevision,
  ]);

  unitsRef.current = [];
  let unitIndex = 0;
  const staticFinal = reducedMotion || framerCanvas;
  const unitCount = renderTokens.reduce(
    (total, token) => total + token.units.length,
    0,
  );
  const allowWillChange = unitCount <= 80;
  const unitStyle: React.CSSProperties = {
    display: "inline-block",
    opacity: staticFinal ? toOpacity : fromOpacity,
    color: staticFinal ? revealedColor : unrevealedColor,
    willChange: allowWillChange
      ? xOffset !== 0 || yOffset !== 0 || scaleFrom !== 1 || blurFrom > 0
        ? "opacity, transform, filter"
        : "opacity"
      : undefined,
  };
  const wordStyle: React.CSSProperties = {
    display: "inline-block",
    whiteSpace: "nowrap",
    verticalAlign: "baseline",
  };
  const rootStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    fontFamily: effectiveFontFamily,
    fontWeight: effectiveFontWeight,
    fontStyle: effectiveFontStyle,
    fontSize: effectiveFontSize,
    lineHeight: effectiveLineHeight,
    letterSpacing: effectiveLetterSpacing,
    textAlign: effectiveTextAlign,
    color: revealedColor,
    ...style,
  };

  return (
    <div
      {...divProps}
      ref={rootRef}
      data-slot="text-reveal"
      data-reveal-style={revealStyle}
      data-reveal-by={revealBy}
      className={className}
      style={rootStyle}
    >
      <span style={SCREEN_READER_ONLY}>{text}</span>
      <span aria-hidden="true" data-text-reveal-visual="true">
        {renderTokens.map((token, tokenIndex) => {
          if (!token.isWord) {
            return <React.Fragment key={`space-${tokenIndex}`}>{token.value}</React.Fragment>;
          }

          if (revealBy === "words") {
            const index = unitIndex++;
            return (
              <span
                key={`word-${tokenIndex}`}
                ref={(node) => {
                  if (node) unitsRef.current[index] = node;
                }}
                data-text-reveal-unit="word"
                style={unitStyle}
              >
                {token.value}
              </span>
            );
          }

          return (
            <span
              key={`char-word-${tokenIndex}`}
              data-text-reveal-word="true"
              style={wordStyle}
            >
              {token.units.map((grapheme, graphemeIndex) => {
                const index = unitIndex++;
                return (
                  <span
                    key={`char-${tokenIndex}-${graphemeIndex}`}
                    ref={(node) => {
                      if (node) unitsRef.current[index] = node;
                    }}
                    data-text-reveal-unit="character"
                    style={unitStyle}
                  >
                    {grapheme}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </div>
  );
}

const STYLE_OPTIONS: TextRevealStyle[] = [
  "linear",
  "diagonal",
  "random",
  "center-out",
  "edges-in",
];
const DIRECTION_OPTIONS: TextRevealDiagonalDirection[] = [
  "top-left-to-bottom-right",
  "top-right-to-bottom-left",
  "bottom-left-to-top-right",
  "bottom-right-to-top-left",
];
const POSITION_OPTIONS = [
  "top 80%",
  "center 80%",
  "bottom 80%",
  "top 50%",
  "center 50%",
  "bottom 50%",
  "top 20%",
  "center 20%",
  "bottom 20%",
];

(TextReveal as unknown as Record<string, unknown>).propertyControls = {
  text: {
    type: "String",
    title: "Text",
    defaultValue: DEFAULT_TEXT,
    displayTextArea: true,
    group: "Content",
  },
  font: {
    type: "Font",
    title: "Font",
    defaultValue: {
      fontFamily: "Inter",
      fontWeight: 600,
      fontSize: 32,
      lineHeight: 1.4,
      letterSpacing: 0,
      textAlign: "left",
    },
    defaultFontType: "sans-serif",
    displayFontSize: true,
    displayFontWeight: true,
    displayFontStyle: true,
    displayLineHeight: true,
    displayLetterSpacing: true,
    displayTextAlignment: true,
    group: "Typography",
  },
  revealedColor: {
    type: "Color",
    title: "Revealed Color",
    defaultValue: "#FFFFFF",
    group: "Typography",
  },
  unrevealedColor: {
    type: "Color",
    title: "Unrevealed Color",
    defaultValue: "#FFFFFF",
    group: "Typography",
  },
  revealStyle: {
    type: "Enum",
    title: "Reveal Style",
    options: STYLE_OPTIONS,
    optionTitles: ["Linear", "Diagonal", "Random", "Center Out", "Edges In"],
    defaultValue: "linear",
    group: "Reveal",
  },
  revealBy: {
    type: "Enum",
    title: "Reveal By",
    options: ["words", "characters"],
    optionTitles: ["Words", "Characters"],
    defaultValue: "words",
    group: "Reveal",
  },
  fromOpacity: {
    type: "Number",
    title: "From Opacity",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.15,
    group: "Reveal",
  },
  toOpacity: {
    type: "Number",
    title: "To Opacity",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 1,
    group: "Reveal",
  },
  revealSoftness: {
    type: "Number",
    title: "Reveal Softness",
    min: 0.01,
    max: 0.5,
    step: 0.01,
    defaultValue: 0.24,
    group: "Reveal",
  },
  diagonalDirection: {
    type: "Enum",
    title: "Diagonal Direction",
    options: DIRECTION_OPTIONS,
    optionTitles: [
      "Top Left → Bottom Right",
      "Top Right → Bottom Left",
      "Bottom Left → Top Right",
      "Bottom Right → Top Left",
    ],
    defaultValue: "top-left-to-bottom-right",
    hidden: (props: TextRevealProps) => props.revealStyle !== "diagonal",
    group: "Direction",
  },
  startPosition: {
    type: "Enum",
    title: "Start Position",
    options: POSITION_OPTIONS,
    defaultValue: DEFAULT_START,
    group: "Scroll",
  },
  endPosition: {
    type: "Enum",
    title: "End Position",
    options: POSITION_OPTIONS,
    defaultValue: DEFAULT_END,
    group: "Scroll",
  },
  startOffset: {
    type: "Number",
    title: "Start Offset",
    min: -1000,
    max: 1000,
    step: 10,
    defaultValue: 0,
    group: "Scroll",
  },
  endOffset: {
    type: "Number",
    title: "End Offset",
    min: -1000,
    max: 1000,
    step: 10,
    defaultValue: 0,
    group: "Scroll",
  },
  scrub: {
    type: "Boolean",
    title: "Scrub",
    defaultValue: true,
    group: "Scroll",
  },
  scrubSmoothness: {
    type: "Number",
    title: "Scrub Smoothness",
    min: 0,
    max: 2,
    step: 0.1,
    defaultValue: 0.4,
    hidden: (props: TextRevealProps) => !props.scrub,
    group: "Scroll",
  },
  xOffset: {
    type: "Number",
    title: "X Offset",
    min: -200,
    max: 200,
    step: 1,
    defaultValue: 0,
    group: "Motion",
  },
  yOffset: {
    type: "Number",
    title: "Y Offset",
    min: -200,
    max: 200,
    step: 1,
    defaultValue: 0,
    group: "Motion",
  },
  scaleFrom: {
    type: "Number",
    title: "Scale From",
    min: 0.2,
    max: 2,
    step: 0.05,
    defaultValue: 1,
    group: "Motion",
  },
  blurFrom: {
    type: "Number",
    title: "Blur From",
    min: 0,
    max: 30,
    step: 1,
    defaultValue: 0,
    group: "Motion",
  },
  randomSeed: {
    type: "Number",
    title: "Random Seed",
    min: 0,
    max: 99999,
    step: 1,
    defaultValue: 1,
    hidden: (props: TextRevealProps) => props.revealStyle !== "random",
    group: "Advanced",
  },
  respectReducedMotion: {
    type: "Boolean",
    title: "Respect Reduced Motion",
    defaultValue: true,
    group: "Advanced",
  },
};

(TextReveal as unknown as Record<string, unknown>).addPropertyControls =
  (TextReveal as unknown as Record<string, unknown>).propertyControls;

export default TextReveal;
