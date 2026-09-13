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
  /** Image or video URL. When omitted, a colorful fallback surface is rendered. */
  mediaSrc?: string;
  /** Explicit media type. Inferred from the URL when omitted. */
  mediaType?: MediaTextHoverMediaType;
  /** Alternative text for image media. Decorative media can use an empty string. */
  mediaAlt?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  mediaRadius?: number;
  objectFit?: React.CSSProperties["objectFit"];
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  letterSpacing?: number | string;
  lineHeight?: number | string;
  textColor?: string;
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
  mediaWidth = 300,
  mediaHeight = 100,
  mediaRadius = 0,
  objectFit = "cover",
  fontFamily = "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
  fontSize = 130,
  fontWeight = 400,
  letterSpacing = "-0.02em",
  lineHeight = 1,
  textColor = "currentColor",
  springStiffness = 260,
  springDamping = 30,
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
    Math.max(0, splitIndex ?? Math.ceil(graphemes.length / 2)),
  );
  const [active, setActive] = React.useState(false);
  const [dynamicSplit, setDynamicSplit] = React.useState(fixedSplit);
  const reduceMotion = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const resolvedSplit = mode === "dynamic" ? dynamicSplit : fixedSplit;
  const resolvedMediaType =
    mediaType ?? (mediaSrc && VIDEO_PATTERN.test(mediaSrc) ? "video" : "image");

  React.useEffect(() => {
    setDynamicSplit(fixedSplit);
  }, [fixedSplit]);

  React.useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [mediaSrc, resolvedMediaType]);

  const left = graphemes.slice(0, resolvedSplit).join("");
  const right = graphemes.slice(resolvedSplit).join("");
  const reveal = reduceMotion ? true : active;
  const duration = reduceMotion ? 0 : undefined;
  const transition = {
    type: "spring" as const,
    stiffness: springStiffness,
    damping: springDamping,
    mass: 0.8,
    duration,
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
        display: "flex",
        width: "100%",
        maxWidth: "100%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
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
        if (mode === "dynamic" && graphemes.length > 1) {
          const bounds = event.currentTarget.getBoundingClientRect();
          const ratio = Math.min(
            1,
            Math.max(0, (event.clientX - bounds.left) / Math.max(bounds.width, 1)),
          );
          setDynamicSplit(
            Math.min(
              graphemes.length - 1,
              Math.max(1, Math.round(ratio * graphemes.length)),
            ),
          );
        }
        onPointerMove?.(event);
      }}
      onClick={(event) => {
        if (window.matchMedia?.("(hover: none)").matches) {
          setActive((current) => !current);
        }
        onClick?.(event);
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          whiteSpace: "pre",
          fontFamily,
          fontSize: cssValue(fontSize),
          fontWeight,
          letterSpacing: cssValue(letterSpacing),
          lineHeight: cssValue(lineHeight, ""),
        }}
      >
        {left}
      </span>

      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          width: reveal ? mediaWidth : 0,
          marginInline: reveal ? Math.max(4, mediaWidth * 0.04) : 0,
          opacity: reveal ? 1 : 0,
          filter: reveal ? "blur(0px)" : "blur(8px)",
        }}
        transition={transition}
        style={{
          position: "relative",
          height: mediaHeight,
          maxWidth: "36vw",
          flexShrink: 1,
          overflow: "hidden",
          borderRadius: mediaRadius,
          background:
            "linear-gradient(120deg, #ff4d00 0%, #ffd000 28%, #00b7ff 62%, #8b5cf6 100%)",
          willChange: "width, opacity, filter, margin",
        }}
      >
        {mediaSrc && resolvedMediaType === "video" ? (
          <video
            ref={videoRef}
            src={mediaSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit,
            }}
          />
        ) : mediaSrc ? (
          <img
            src={mediaSrc}
            alt={mediaAlt}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit,
            }}
          />
        ) : null}
      </motion.div>

      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          whiteSpace: "pre",
          fontFamily,
          fontSize: cssValue(fontSize),
          fontWeight,
          letterSpacing: cssValue(letterSpacing),
          lineHeight: cssValue(lineHeight, ""),
        }}
      >
        {right}
      </span>
    </div>
  );
}

export default MediaTextHover;
