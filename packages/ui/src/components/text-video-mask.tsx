"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/*                                                                     */
/* The video is revealed ONLY inside the text glyphs: the type is      */
/* rasterized with Canvas2D (using the page's real font stack, so      */
/* weights, spacing and alignment match by construction — including    */
/* counters/holes in `o`, `a`, `e`, `P`, …) and applied as a           */
/* `mask-image` over ONE native <video>. The footage underneath is a   */
/* single continuous surface, so every glyph is a window into the      */
/* same video while the type itself stays perfectly still.             */
/* Canvas masking (instead of SVG <foreignObject>) keeps this          */
/* reliable in Safari / iOS Safari, and unlike SVG-as-image masks it   */
/* can use document webfonts. No WebGL, no frame copying, no rAF.      */
/* ------------------------------------------------------------------ */

export type TextVideoMaskAlign = "left" | "center" | "right";
export type TextVideoMaskVerticalAlign = "top" | "center" | "bottom";
export type TextVideoMaskFit = "cover" | "contain" | "fill";
export type TextVideoMaskPreload = "none" | "metadata" | "auto";
export type TextVideoMaskSizing = "fixed" | "fit";
export type TextVideoMaskReducedMotion = "fallback" | "paused";

export interface TextVideoMaskProps {
  /** Text revealed as cutouts in the video. Supports multiline via \n. */
  text?: string;
  /** Video source — uploaded asset URL or remote .mp4/.webm URL. */
  src?: string;
  /** Font family baked into the mask texture. */
  fontFamily?: string;
  /** Base type size in px (exact in `fixed` mode, maximum in `fit` mode). */
  fontSize?: number;
  /** Font weight baked into the mask texture. */
  fontWeight?: number | string;
  /** Font style baked into the mask texture. */
  fontStyle?: "normal" | "italic";
  /** Line-height multiplier for multiline text. */
  lineHeight?: number;
  /** Tracking in px between characters. */
  letterSpacing?: number;
  /** Horizontal alignment of the text block. */
  textAlign?: TextVideoMaskAlign;
  /** Vertical alignment of the text block. */
  verticalAlign?: TextVideoMaskVerticalAlign;
  /** `fixed` uses fontSize; `fit` scales down to fit the padded width. */
  textSizing?: TextVideoMaskSizing;
  /** Horizontal inset in px, respected by alignment and fit mode. */
  horizontalPadding?: number;
  /** Vertical inset in px, respected by vertical alignment. */
  verticalPadding?: number;
  /** Start playback automatically. Falls back to muted on policy blocks. */
  autoplay?: boolean;
  /** Loop the footage. */
  loop?: boolean;
  /** Mute the footage (required for autoplay in most browsers). */
  muted?: boolean;
  /** Allow inline playback on iOS Safari. */
  playsInline?: boolean;
  /** Show native browser video controls. */
  controls?: boolean;
  /** How the footage fills the component (mapped to object-fit). */
  videoFit?: TextVideoMaskFit;
  /** Which footage area shows through, 0–100 (mapped to object-position). */
  positionX?: number;
  /** Which footage area shows through, 0–100 (mapped to object-position). */
  positionY?: number;
  /** Video preload hint. */
  preload?: TextVideoMaskPreload;
  /** Fills the component; the video never appears outside the glyphs. */
  backgroundColor?: string;
  /** Solid glyph color used when video is unavailable or reduced-motion. */
  fallbackColor?: string;
  /** `fallback` renders solid type; `paused` shows the video paused. */
  reducedMotion?: TextVideoMaskReducedMotion;
  /** Additional classes for the outer container. */
  className?: string;
  /** Additional inline styles for the outer container. */
  style?: React.CSSProperties;
}

export interface TextMaskOptions {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  fontStyle: string;
  lineHeight: number;
  letterSpacing: number;
  textAlign: TextVideoMaskAlign;
  verticalAlign: TextVideoMaskVerticalAlign;
  textSizing: TextVideoMaskSizing;
  horizontalPadding: number;
  verticalPadding: number;
  width: number;
  height: number;
}

const MAX_MASK_DPR = 2;

function fontStack(family: string): string {
  const clean = family.trim().replace(/^["']|["']$/g, "");
  return `"${clean}", sans-serif`;
}

function applyLetterSpacing(
  ctx: CanvasRenderingContext2D,
  value: number,
): void {
  // `CanvasRenderingContext2D.letterSpacing` is supported in all modern
  // browsers. When unavailable we intentionally skip tracking rather than
  // hand-kerning glyph-by-glyph (which would break ligatures/shaping).
  try {
    const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    if ("letterSpacing" in ctx) c.letterSpacing = `${value}px`;
  } catch {
    /* no-op */
  }
}

/**
 * Render white-on-transparent glyph coverage for `opts` into `canvas`
 * (sized to the container × DPR) and return a PNG data URL, or null when
 * there is nothing to mask (empty text / zero-size container).
 */
export function renderTextMask(
  canvas: HTMLCanvasElement,
  opts: TextMaskOptions,
): string | null {
  const {
    width,
    height,
    textSizing,
    horizontalPadding,
    verticalPadding,
    textAlign,
    verticalAlign,
  } = opts;

  if (width < 2 || height < 2) return null;
  const rawLines = opts.text.split("\n");
  const lines = rawLines.length > 0 ? rawLines : [""];
  if (lines.every((l) => l.length === 0)) return null;

  const dpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    MAX_MASK_DPR,
  );
  canvas.width = Math.max(2, Math.round(width * dpr));
  canvas.height = Math.max(2, Math.round(height * dpr));

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const hPad = Math.max(0, horizontalPadding);
  const vPad = Math.max(0, verticalPadding);
  const availW = Math.max(1, width - hPad * 2);

  const makeFont = (size: number): string =>
    `${opts.fontStyle} ${opts.fontWeight} ${size}px ${fontStack(opts.fontFamily)}`;

  let size = Math.max(1, opts.fontSize);

  // The font MUST be set before any measuring — metrics below must come
  // from the real typeface, never the default 10px canvas font.
  ctx.font = makeFont(size);
  applyLetterSpacing(ctx, opts.letterSpacing);

  // --- Fit Width: measure at the nominal size, then scale down only. ---
  if (textSizing === "fit") {
    const longest = Math.max(
      1,
      ...lines.map((l) => ctx.measureText(l).width),
    );
    size = Math.max(1, size * Math.min(1, availW / longest));
    ctx.font = makeFont(size);
    applyLetterSpacing(ctx, opts.letterSpacing);
  }

  // --- Per-line vertical metrics (real font data, with sane fallback). ---
  const lineHeightPx = Math.max(1, size * opts.lineHeight);
  const metrics = lines.map((l) => {
    const m = ctx.measureText(l);
    const ascent =
      m.actualBoundingBoxAscent && m.actualBoundingBoxAscent > 0
        ? m.actualBoundingBoxAscent
        : size * 0.8;
    const descent =
      m.actualBoundingBoxDescent && m.actualBoundingBoxDescent > 0
        ? m.actualBoundingBoxDescent
        : size * 0.2;
    return { ascent, descent };
  });
  // Empty lines ("") report zero boxes — reuse the font's typical box so
  // blank lines still consume correct vertical rhythm.
  const typicalAscent = Math.max(...metrics.map((m) => m.ascent), size * 0.8);
  const typicalDescent = Math.max(
    ...metrics.map((m) => m.descent),
    size * 0.2,
  );
  const boxes = metrics.map((m, i) => ({
    ascent: lines[i]!.length === 0 ? typicalAscent : m.ascent,
    descent: lines[i]!.length === 0 ? typicalDescent : m.descent,
  }));

  // Block = stacked line boxes (CSS model: n × line-height), NOT tight
  // glyph extents. This keeps single-line type truly centered and lets
  // tight leading overlap exactly like CSS instead of clipping.
  const blockH = lineHeightPx * lines.length;

  let blockTop: number;
  if (verticalAlign === "top") blockTop = vPad;
  else if (verticalAlign === "bottom") blockTop = height - vPad - blockH;
  else blockTop = (height - blockH) / 2;

  // --- Draw. White glyphs on transparent; alpha IS the mask. ---
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "alphabetic";
  ctx.font = makeFont(size);
  applyLetterSpacing(ctx, opts.letterSpacing);

  const anchorX =
    textAlign === "left" ? hPad : textAlign === "right" ? width - hPad : width / 2;
  ctx.textAlign = textAlign;

  lines.forEach((line, i) => {
    if (line.length === 0) return;
    const box = boxes[i]!;
    // Center this line's own glyphs inside its line box so ascenders /
    // descenders are never clipped and multiline rhythm stays exact.
    const baseline =
      blockTop + lineHeightPx * i + (lineHeightPx + box.ascent - box.descent) / 2;
    ctx.fillText(line, anchorX, baseline);
  });

  return canvas.toDataURL("image/png");
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function TextVideoMask({
  text = "DAVINCI.",
  src = "",
  fontFamily = "Anton",
  fontSize = 200,
  fontWeight = 800,
  fontStyle = "normal",
  lineHeight = 1,
  letterSpacing = 0,
  textAlign = "center",
  verticalAlign = "center",
  textSizing = "fit",
  horizontalPadding = 24,
  verticalPadding = 24,
  autoplay = true,
  loop = true,
  muted = true,
  playsInline = true,
  controls = false,
  videoFit = "cover",
  positionX = 50,
  positionY = 50,
  preload = "metadata",
  backgroundColor = "#000000",
  fallbackColor = "#ffffff",
  reducedMotion = "fallback",
  className,
  style,
}: TextVideoMaskProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const maskCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const [containerSize, setContainerSize] = React.useState({ w: 0, h: 0 });
  const [maskUrl, setMaskUrl] = React.useState<string | null>(null);
  const [videoError, setVideoError] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const source = (src || "").trim();

  // --- Track the component's own box (never the window). ---
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      setContainerSize((prev) =>
        prev.w === w && prev.h === h ? prev : { w, h },
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // --- Reduced-motion subscription. ---
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function")
      return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent): void =>
      setPrefersReducedMotion(e.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    // Legacy Safari (< 14).
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  // --- (Re)build the mask. Runs only when inputs or size change. ---
  const rebuildMask = React.useCallback((): void => {
    if (typeof document === "undefined") return;
    if (!maskCanvasRef.current) {
      maskCanvasRef.current = document.createElement("canvas");
    }
    const canvas = maskCanvasRef.current;
    const url = renderTextMask(canvas, {
      text,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      lineHeight,
      letterSpacing,
      textAlign,
      verticalAlign,
      textSizing,
      horizontalPadding,
      verticalPadding,
      width: containerSize.w,
      height: containerSize.h,
    });
    setMaskUrl((prev) => (prev === url ? prev : url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    text,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    lineHeight,
    letterSpacing,
    textAlign,
    verticalAlign,
    textSizing,
    horizontalPadding,
    verticalPadding,
    containerSize.w,
    containerSize.h,
  ]);

  React.useEffect(() => {
    rebuildMask();
  }, [rebuildMask]);

  // --- Rebuild once webfonts resolve so the mask uses the real glyphs. ---
  React.useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    let cancelled = false;
    const family = fontFamily.trim().replace(/^["']|["']$/g, "");
    const spec = `${fontStyle} ${fontWeight} 100px "${family}"`;
    const reload = (): void => {
      if (!cancelled) rebuildMask();
    };
    try {
      document.fonts.load(spec).then(reload).catch(() => {});
    } catch {
      /* font API may reject for unknown families — fonts.ready covers it */
    }
    document.fonts.ready.then(reload).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [fontFamily, fontWeight, fontStyle, rebuildMask]);

  // --- Reset error state when the source changes. ---
  React.useEffect(() => {
    setVideoError(false);
  }, [source]);

  const staticFallback =
    videoError ||
    !source ||
    (prefersReducedMotion && reducedMotion === "fallback");
  const pausedVideoOnly =
    !staticFallback && prefersReducedMotion && reducedMotion === "paused";

  // --- Playback: autoplay (with muted retry for policy blocks), loop via
  // --- attribute, pause while offscreen. Single video element, always. ---
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !source || staticFallback) return;

    let cancelled = false;
    const tryPlay = (): void => {
      if (cancelled || pausedVideoOnly) return;
      if (!autoplay) return;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {
          // Autoplay with sound was blocked — retry muted.
          if (cancelled) return;
          video.muted = true;
          video.play()?.catch(() => {});
        });
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      tryPlay();
      return () => {
        cancelled = true;
      };
    }

    const root = rootRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || cancelled) return;
        if (entry.isIntersecting) {
          tryPlay();
        } else {
          video.pause();
        }
      },
      { threshold: 0 },
    );
    if (root) io.observe(root);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [source, staticFallback, pausedVideoOnly, autoplay]);

  const maskStyle: React.CSSProperties = maskUrl
    ? {
        WebkitMaskImage: `url("${maskUrl}")`,
        maskImage: `url("${maskUrl}")`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
      }
    : { display: "none" };

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={text}
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{ backgroundColor, ...style }}
    >
      {/* Video layer — visible only through the glyph mask. */}
      {!staticFallback && source && (
        <div aria-hidden="true" className="absolute inset-0" style={maskStyle}>
          <video
            ref={videoRef}
            src={source}
            muted={muted}
            loop={loop}
            autoPlay={autoplay}
            playsInline={playsInline}
            controls={controls}
            preload={preload}
            onError={() => setVideoError(true)}
            className="absolute inset-0 block h-full w-full"
            style={{
              objectFit: videoFit,
              objectPosition: `${positionX}% ${positionY}%`,
            }}
          />
        </div>
      )}

      {/* Static fallback — same mask, solid color. Never over video. */}
      {staticFallback && maskUrl && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundColor: fallbackColor, ...maskStyle }}
        />
      )}

      {/* Accessible text (screen readers only; not a visual layer). */}
      <span className="sr-only" style={{ whiteSpace: "pre-wrap" }}>
        {text}
      </span>
    </div>
  );
}

export default TextVideoMask;
