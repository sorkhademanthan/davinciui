"use client";

import { motion, useReducedMotion } from "framer-motion";
import * as React from "react";

export type MediaTextHoverMode = "fixed" | "dynamic";
export type MediaTextHoverMediaType = "image" | "video";

export interface MediaTextHoverProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Headline split around the revealed media. @default "DAVINCIUI" */
  text?: string;
  /** Character index used by fixed mode. Defaults to the word midpoint. */
  splitIndex?: number;
  /** Fixed keeps the split centered; dynamic follows the pointer across the word. */
  mode?: MediaTextHoverMode;
  /** Image or video URL. When omitted, a neutral media surface is rendered. */
  mediaSrc?: string;
  /** Explicit media type. Inferred from the URL when omitted. */
  mediaType?: MediaTextHoverMediaType;
  /** Alternative text for image media. Decorative media can use an empty string. */
  mediaAlt?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  mediaRadius?: number;
  /** Horizontal gap between the text and the expanded media window, in px. */
  mediaGap?: number;
  /** Extra zoom applied to the media inside the window. @default 1.15 */
  mediaScale?: number;
  objectFit?: React.CSSProperties["objectFit"];
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  letterSpacing?: number | string;
  lineHeight?: number | string;
  textColor?: string;
  backgroundColor?: string;
  springStiffness?: number;
  springDamping?: number;
}

const VIDEO_PATTERN = /\.(?:mp4|webm|mov)(?:[?#].*)?$/i;

function cssValue(value: number | string, unit = "px"): string | number {
  return typeof value === "number" ? `${value}${unit}` : value;
}

function splitGraphemes(value: string): string[] {
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    return Array.from(segmenter.segment(value), (part) => part.segment);
  }
  return Array.from(value);
}

export function MediaTextHover({
  text = "DAVINCIUI",
  splitIndex,
  mode = "fixed",
  mediaSrc,
  mediaType,
  mediaAlt = "",
  mediaWidth = 225,
  mediaHeight,
  mediaRadius = 6,
  mediaGap = 16,
  mediaScale = 1.15,
  objectFit = "cover",
  fontFamily = "Anton, 'Anton SC', sans-serif",
  fontSize = 130,
  fontWeight = 400,
  letterSpacing = "-0.02em",
  lineHeight = 1,
  textColor = "var(--foreground)",
  backgroundColor = "var(--background)",
  springStiffness = 225,
  springDamping = 50,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onPointerMove,
  onClick,
  tabIndex,
  ...divProps
}: MediaTextHoverProps) {
  const graphemes = React.useMemo(() => splitGraphemes(text), [text]);
  const fixedSplit = Math.min(
    graphemes.length,
    Math.max(0, splitIndex ?? Math.round(graphemes.length / 2)),
  );
  const [active, setActive] = React.useState(false);
  const [dynamicSplit, setDynamicSplit] = React.useState(fixedSplit);
  const reduceMotion = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const measureRef = React.useRef<HTMLSpanElement | null>(null);
  const charRefs = React.useRef<Array<HTMLSpanElement | null>>([]);
  const splitRef = React.useRef(fixedSplit);
  const charWidthsRef = React.useRef<number[]>([]);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const fontSizeValue = typeof fontSize === "number" ? fontSize : parseFloat(fontSize) || 0;
  const lineHeightValue = typeof lineHeight === "number" ? lineHeight : parseFloat(lineHeight) || 1;
  const resolvedMediaHeight = mediaHeight ?? Math.max(1, Math.round(fontSizeValue * lineHeightValue));
  const resolvedSplit = mode === "dynamic" ? dynamicSplit : fixedSplit;
  const resolvedMediaType =
    mediaType ?? (mediaSrc && VIDEO_PATTERN.test(mediaSrc) ? "video" : "image");

  React.useEffect(() => {
    setDynamicSplit(fixedSplit);
    splitRef.current = fixedSplit;
  }, [fixedSplit]);

  // Measure the real rendered width of every glyph once (and on resize /
  // font load) so dynamic mode can use actual character positions instead of
  // assuming fixed-width characters.
  React.useEffect(() => {
    const measure = () => {
      const widths = charRefs.current.map(
        (node) => node?.getBoundingClientRect().width ?? 0,
      );
      if (widths.every((width) => width > 0)) {
        charWidthsRef.current = widths;
      }
    };

    measure();
    if (typeof document !== "undefined" && "fonts" in document) {
      void document.fonts.ready.then(measure).catch(() => undefined);
    }
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    if (measureRef.current) observer.observe(measureRef.current);
    return () => observer.disconnect();
  }, [text, fontFamily, fontSize, fontWeight, letterSpacing]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && active) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [mediaSrc, resolvedMediaType, active]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active && !reduceMotion) {
      void video.play().catch(() => undefined);
    } else if (!active) {
      video.pause();
    }
  }, [active, reduceMotion]);

  const updateSplitFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (mode !== "dynamic" || graphemes.length < 2) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width <= 0) return;

    const widths = charWidthsRef.current;
    const total =
      widths.length === graphemes.length
        ? widths.reduce((sum, width) => sum + width, 0)
        : 0;

    let next: number;
    if (total > 0) {
      // Map the pointer to a position inside the measured text line, then pick
      // the nearest character boundary using the glyphs' real widths.
      const textLeft = bounds.left + (bounds.width - total) / 2;
      const target = Math.min(Math.max(event.clientX - textLeft, 0), total);
      let cumulative = 0;
      let boundary = 1;
      for (let index = 0; index < widths.length; index += 1) {
        cumulative += widths[index] ?? 0;
        if (target <= cumulative) {
          boundary = index + 1;
          break;
        }
        boundary = widths.length;
      }
      next = Math.min(graphemes.length - 1, Math.max(1, boundary));
    } else {
      const ratio = Math.min(
        1,
        Math.max(0, (event.clientX - bounds.left) / Math.max(bounds.width, 1)),
      );
      next = Math.min(
        graphemes.length - 1,
        Math.max(1, Math.round(ratio * graphemes.length)),
      );
    }

    // Only re-render when the split actually crosses a character boundary.
    if (next !== splitRef.current) {
      splitRef.current = next;
      setDynamicSplit(next);
    }
  };

  const left = graphemes.slice(0, resolvedSplit).join("");
  const right = graphemes.slice(resolvedSplit).join("");
  const reveal = reduceMotion ? true : active;
  const duration = reduceMotion ? 0 : undefined;
  const gap = Math.max(0, mediaGap);
  const transition = {
    type: "spring" as const,
    stiffness: springStiffness,
    damping: springDamping,
    mass: 0.9,
    duration,
  };

  const textStyleBase: React.CSSProperties = {
    flexShrink: 0,
    whiteSpace: "pre",
    fontFamily,
    fontSize: cssValue(fontSize),
    fontWeight,
    letterSpacing: cssValue(letterSpacing),
    lineHeight: cssValue(lineHeight, ""),
  };

  return (
    <div
      {...divProps}
      ref={rootRef}
      role={divProps.role ?? "group"}
      aria-label={divProps["aria-label"] ?? `${text} media reveal`}
      tabIndex={tabIndex ?? 0}
      data-slot="media-text-hover"
      data-state={reveal ? "open" : "closed"}
      data-mode={mode}
      className={className}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        backgroundColor,
        color: textColor,
        outline: "none",
        ...style,
      }}
      onMouseEnter={(event) => {
        setActive(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setActive(false);
        splitRef.current = fixedSplit;
        setDynamicSplit(fixedSplit);
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        setActive(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setActive(false);
        onBlur?.(event);
      }}
      onPointerMove={(event) => {
        updateSplitFromPointer(event);
        onPointerMove?.(event);
      }}
      onPointerDown={(event) => {
        if (event.pointerType === "touch") {
          updateSplitFromPointer(event);
          setActive(true);
        }
      }}
      onClick={(event) => {
        if (window.matchMedia?.("(hover: none)").matches) {
          setActive((current) => !current);
        }
        onClick?.(event);
      }}
    >
      {/* Hidden per-glyph measurement layer — drives accurate dynamic splits. */}
      <span
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          visibility: "hidden",
          pointerEvents: "none",
          whiteSpace: "pre",
          ...textStyleBase,
          flexShrink: undefined,
        }}
      >
        {graphemes.map((glyph, index) => (
          <span
            key={`${glyph}-${index}`}
            ref={(node) => {
              charRefs.current[index] = node;
            }}
          >
            {glyph}
          </span>
        ))}
      </span>

      <span aria-hidden="true" style={textStyleBase}>
        {left}
      </span>

      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          width: reveal ? mediaWidth : 0,
          marginInline: reveal ? gap : 0,
          opacity: reveal ? 1 : 0,
        }}
        transition={transition}
        style={{
          position: "relative",
          flexShrink: 0,
          height: resolvedMediaHeight,
          marginInline: 0,
          overflow: "hidden",
          borderRadius: mediaRadius,
          backgroundColor: "var(--background)",
          willChange: "width, margin, opacity",
        }}
      >
        {/* Fixed-size inner wrapper so the media is clipped, never squished. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: mediaWidth,
            height: mediaScale > 0 ? resolvedMediaHeight / mediaScale : resolvedMediaHeight,
            transform: `translateX(-50%) scale(${mediaScale})`,
            willChange: "transform",
          }}
        >
          {mediaSrc && resolvedMediaType === "video" ? (
            <video
              ref={videoRef}
              src={mediaSrc}
              autoPlay={Boolean(reduceMotion)}
              loop
              muted
              playsInline
              preload="metadata"
              style={{
                width: "100%",
                height: "100%",
                objectFit,
                display: "block",
              }}
            />
          ) : mediaSrc ? (
            <img
              src={mediaSrc}
              alt={mediaAlt}
              style={{
                width: "100%",
                height: "100%",
                objectFit,
                display: "block",
              }}
            />
          ) : null}
        </div>
      </motion.div>

      <span aria-hidden="true" style={textStyleBase}>
        {right}
      </span>
    </div>
  );
}

export default MediaTextHover;
