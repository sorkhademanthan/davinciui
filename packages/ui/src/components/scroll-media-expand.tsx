"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/* ---------------------------------- types --------------------------------- */

export type ScrollMediaExpandMediaType = "image" | "video" | "auto";

export interface ScrollMediaExpandProps {
  /** Image or video URL. Videos detected by extension unless `mediaType` is set. */
  src: string;
  /** How the media element is rendered. Defaults to `"auto"`. */
  mediaType?: ScrollMediaExpandMediaType;
  /** Poster frame for video media. */
  poster?: string;
  /** Label pushed left as the media expands. @default "©2026" */
  leftLabel?: string;
  /** Label pushed right as the media expands. @default "Showreel" */
  rightLabel?: string;
  /** Center CTA text revealed once the media becomes a readable card. */
  overlayText?: string;
  /** Media focal point (CSS object-position). @default "50% 35%" */
  objectPosition?: string;
  /** How media fills its window. @default "cover" */
  objectFit?: "cover" | "contain" | "fill";
  /** Rest-state pill width (px). Defaults to a responsive clamp. */
  initialWidth?: number;
  /** Rest-state pill height (px). Defaults to a responsive clamp. */
  initialHeight?: number;
  /** Height of the tall scroll track driving the scrub. @default "400vh" */
  sectionHeight?: string | number;
  /** Height of the pinned viewport (any CSS length). @default "100vh" */
  viewportHeight?: string;
  /** Corner radius (px) of the rest-state pill. @default 50 */
  startRadius?: number;
  /** Corner radius (px) at fullscreen. @default 0 */
  endRadius?: number;
  startWidth?: number;
  startHeight?: number;
  fontSize?: number;
  playFontSize?: number;
  labelWidth?: number;
  gap?: number;
  textColor?: string;
  onPlay?: () => void;
  radiusLagSeconds?: number;
  /** Show the center CTA overlay. @default true */
  showOverlay?: boolean;
  /** Show a minimal scroll cue at rest that fades once scrolling begins. @default true */
  showScrollHint?: boolean;
  /**
   * Scroll-follow smoothing, 0 (direct scrub) to 1. Defaults to 0 so the
   * animation timeline literally IS the scroll position: stopping scroll
   * stops the animation at exactly that frame with no settle motion.
   * @default 0
   */
  smoothing?: number;
  /** When false, renders a static accessible card instead of the scroll effect. */
  enabled?: boolean;
  /** Pause video media while the section is far offscreen. @default true */
  pauseOffscreenVideo?: boolean;
  /** Pause transform work while the section is far offscreen. @default true */
  pauseWhenOffscreen?: boolean;
  /** Stage background. Defaults to the active theme background token. */
  background?: string;
  /** Label foreground. Defaults to the active theme foreground token. */
  foreground?: string;
  className?: string;
  style?: React.CSSProperties;
}

/* --------------------------------- helpers -------------------------------- */

const DEFAULT_SRC =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85";

const RADIUS_LAG_SECONDS = 0.29;
const PLAY_START = 0.48;
const PLAY_RISE_END = 0.62;
const PLAY_FALL_END = 1;
const PLAY_HIDDEN_OFFSET = 60;

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/** Smoothstep 0 → 1 across [start, end]. Eased, deterministic, reversible. */
function smoothstep(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Smootherstep 0 → 1 across [start, end]. Zero first AND second derivatives
 * at both ends, so geometry eases in and out of every phase with a
 * cinematic glide. Still a pure function of progress: fully reversible.
 */
function smootherstep(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function isVideoSrc(src: string, mediaType: ScrollMediaExpandMediaType) {
  if (mediaType === "video") return true;
  if (mediaType === "image") return false;
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src);
}

function resolveLength(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
}

/* -------------------------------- component ------------------------------- */

export function ScrollMediaExpand({
  src = DEFAULT_SRC,
  mediaType = "auto",
  poster,
  leftLabel = "©2026",
  rightLabel = "Showreel",
  overlayText = "Play showreel",
  objectPosition = "50% 35%",
  objectFit = "cover",
  initialWidth,
  initialHeight,
  sectionHeight = "400vh",
  viewportHeight = "100vh",
  startRadius = 50,
  endRadius = 0,
  startWidth,
  startHeight,
  fontSize = 40,
  playFontSize = 42,
  labelWidth = 160,
  gap = 16,
  textColor = "#000",
  onPlay,
  radiusLagSeconds = 0.29,
  showOverlay = true,
  showScrollHint = false,
  smoothing = 0,
  enabled = true,
  pauseOffscreenVideo = true,
  pauseWhenOffscreen = true,
  background = "var(--background, #fff)",
  foreground = "var(--foreground, #111)",
  className,
  style,
}: ScrollMediaExpandProps) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const labelLeftRef = useRef<HTMLSpanElement>(null);
  const labelRightRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLAnchorElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const radiusRef = useRef(50);
  const lastTimeRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);

  // Imperative animation state — never in React state, scrolling never rerenders.
  const targetRef = useRef(0);
  const renderedRef = useRef(0);
  const inViewRef = useRef(true);
  const metricsRef = useRef({ stageW: 0, stageH: 0, startW: 0, startH: 0 });
  const firstFrameRef = useRef(true);

  const [reducedMotion, setReducedMotion] = useState(false);
  const smoothFactor = clamp(smoothing, 0, 1);
  const isVideo = isVideoSrc(src, mediaType);
  const motionActive = enabled && !reducedMotion;

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  /* Live config for the rAF loop (prop changes apply without resubscribing). */
  const configRef = useRef({
    startWidth,
    startHeight,
    fontSize,
    playFontSize,
    labelWidth,
    gap,
    textColor,
    background,
    onPlay,
    radiusLagSeconds,
    startRadius,
    endRadius,
    objectFit,
    objectPosition,
    showOverlay,
  });
  configRef.current = {
    startWidth,
    startHeight,
    fontSize,
    playFontSize,
    labelWidth,
    gap,
    textColor,
    background,
    onPlay,
    radiusLagSeconds,
    startRadius,
    endRadius,
    objectFit,
    objectPosition,
    showOverlay,
  };

  /* Reduced motion: static card, no interpolation. */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* Measure stage + resolve responsive rest geometry; never per frame. */
  useEffect(() => {
    if (!motionActive) return;
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const stageW = stage.clientWidth || window.innerWidth || 1;
      const stageH = stage.clientHeight || window.innerHeight || 1;
      const mobile = stageW < 810;
      const cfg = configRef.current;
      const startW = cfg.startWidth ?? (mobile ? stageW * 0.34 : stageW * 0.15);
      const startH = cfg.startHeight ?? stageH * 0.05;
      metricsRef.current = { stageW, stageH, startW, startH };
      renderFrame(renderedRef.current, performance.now());
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [motionActive, viewportHeight]);

  /* Pause work while far offscreen. */
  useEffect(() => {
    if (!motionActive || !pauseWhenOffscreen) {
      inViewRef.current = true;
      return;
    }
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry?.isIntersecting ?? true;
      },
      { rootMargin: "600px" },
    );
    io.observe(track);
    return () => io.disconnect();
  }, [motionActive, pauseWhenOffscreen]);

  /* Pause video media outside the viewport. */
  useEffect(() => {
    if (!motionActive || !isVideo || !pauseOffscreenVideo) return;
    const track = trackRef.current;
    const video = videoRef.current;
    if (!track || !video || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(track);
    return () => io.disconnect();
  }, [motionActive, isVideo, pauseOffscreenVideo, src]);

  /* Imperative render: the entire visual state derives from one progress value,
     so render(progress) is complete and reversing scroll reverses everything. */
  function renderFrame(progress: number, now = performance.now()) {
    const media = mediaRef.current;
    const inner = innerRef.current;
    if (!media || !inner) return;
    const { stageW, stageH } = metricsRef.current;
    if (stageW <= 0 || stageH <= 0) return;
    const cfg = configRef.current;
    const p = clamp(progress, 0, 1);

    const w = stageW * (0.15 + 0.85 * p);
    const h = stageH * (0.05 + 0.95 * p);
    const targetRadius = cfg.startRadius + (cfg.endRadius - cfg.startRadius) * p;
    const radius = reducedMotion
      ? targetRadius
      : radiusRef.current + (targetRadius - radiusRef.current) * (1 - Math.exp(-(now - lastTimeRef.current) / Math.max(cfg.radiusLagSeconds, 0.0001)));
    radiusRef.current = radius;
    lastTimeRef.current = now;
    const appliedRadius = Math.abs(targetRadius - radius) < 0.05 ? targetRadius : radius;
    media.style.width = `${w.toFixed(2)}px`;
    media.style.height = `${h.toFixed(2)}px`;
    media.style.borderRadius = `${appliedRadius.toFixed(2)}px`;
    inner.style.transform = "none";

    const gap = cfg.gap ?? (stageW < 810 ? 12 : 16);
    const offset = w / 2 + gap;
    const labelLeft = labelLeftRef.current;
    if (labelLeft) {
      labelLeft.style.transform = `translate(calc(-100% - ${offset.toFixed(2)}px), -50%)`;
      labelLeft.style.opacity = "1";
      labelLeft.style.filter = "blur(0px)";
    }
    const labelRight = labelRightRef.current;
    if (labelRight) {
      labelRight.style.transform = `translate(${offset.toFixed(2)}px, -50%)`;
      labelRight.style.opacity = "1";
      labelRight.style.filter = "blur(0px)";
    }

    const overlay = overlayRef.current;
    const scrim = scrimRef.current;
    const rise = clamp((p - PLAY_START) / (PLAY_RISE_END - PLAY_START), 0, 1);
    const fall = 1 - clamp((p - PLAY_RISE_END) / (PLAY_FALL_END - PLAY_RISE_END), 0, 1);
    const overlayOpacity = Math.min(rise, fall);
    const overlayY = PLAY_HIDDEN_OFFSET * (1 - rise);
    const effectiveOverlayOpacity = isPlaying ? 0 : overlayOpacity;
    if (scrim && cfg.showOverlay) {
      scrim.style.opacity = (0.9 * effectiveOverlayOpacity).toFixed(3);
      scrim.style.visibility = effectiveOverlayOpacity <= 0 ? "hidden" : "visible";
    }
    if (overlay && cfg.showOverlay) {
      overlay.style.opacity = effectiveOverlayOpacity.toFixed(3);
      overlay.style.transform = `translate(-50%, calc(-50% + ${overlayY.toFixed(2)}px)) scale(${(0.96 + 0.04 * effectiveOverlayOpacity).toFixed(3)})`;
      overlay.style.pointerEvents = effectiveOverlayOpacity < 0.2 ? "none" : "auto";
      overlay.style.visibility = effectiveOverlayOpacity < 0.2 ? "hidden" : "visible";
      overlay.setAttribute("aria-hidden", String(effectiveOverlayOpacity < 0.2));
      overlay.tabIndex = 0;
    }

    const hint = hintRef.current;
    if (hint) {
      const hO = 1 - smoothstep(0, 0.08, p);
      hint.style.opacity = hO.toFixed(3);
      hint.style.visibility = hO <= 0 ? "hidden" : "visible";
    }

    if (firstFrameRef.current) {
      firstFrameRef.current = false;
      const stage = stageRef.current;
      if (stage) stage.style.opacity = "";
    }
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    if (isVideo) {
      void videoRef.current?.play().catch(() => {});
    } else {
      onPlay?.();
    }
  };

  /* Read normalized scroll progress from the track position. */
  useEffect(() => {
    if (!motionActive) return;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const updateTarget = () => {
      const scrollable = track.offsetHeight - stage.offsetHeight;
      if (scrollable <= 0) {
        targetRef.current = 0;
      } else {
        const y = -track.getBoundingClientRect().top;
        targetRef.current = clamp(y / scrollable, 0, 1);
      }
    };

    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);
    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
    };
  }, [motionActive, smoothFactor, pauseWhenOffscreen, sectionHeight]);

  /* One rAF loop drives scroll progress, radius lag, and the CTA tent. */
  useEffect(() => {
    if (!motionActive) return;
    let raf = 0;

    const tick = () => {
      if (!inViewRef.current && pauseWhenOffscreen) {
        renderedRef.current = targetRef.current;
        raf = requestAnimationFrame(tick);
        return;
      }
      const target = targetRef.current;
      let rendered = renderedRef.current;
      if (smoothFactor > 0) {
        rendered += (target - rendered) * smoothFactor;
        if (Math.abs(target - rendered) < 0.0004) rendered = target;
      } else {
        rendered = target;
      }
      renderedRef.current = rendered;
      renderFrame(rendered, performance.now());
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motionActive, pauseWhenOffscreen, smoothFactor]);

  /* ------------------------- fallbacks / edge cases ------------------------ */

  if (!src) return null;

  if (!motionActive) {
    return (
      <section
        aria-label="Showreel media"
        className={cn(
          "relative flex w-full items-center justify-center",
          className,
        )}
        style={{ background, minHeight: viewportHeight, ...style }}
      >
        <div className="flex w-full max-w-5xl flex-wrap items-center justify-center gap-4 px-6 py-24">
          <span
            className="text-[13px] font-medium tracking-wide"
            style={{ color: foreground }}
          >
            {leftLabel}
          </span>
          <div
            className="relative w-full max-w-3xl overflow-hidden"
            style={{ aspectRatio: "16 / 9", borderRadius: 16 }}
          >
            {isVideo ? (
              <video
                src={src}
                poster={poster}
                playsInline
                muted
                preload="metadata"
                className="block h-full w-full"
                style={{ objectFit, objectPosition }}
                aria-label={rightLabel}
              />
            ) : (
              <img
                src={src}
                alt={`${leftLabel} ${rightLabel}`.trim()}
                loading="lazy"
                decoding="async"
                className="block h-full w-full"
                style={{ objectFit, objectPosition }}
              />
            )}
          </div>
          <span
            className="text-[13px] font-medium tracking-wide"
            style={{ color: foreground }}
          >
            {rightLabel}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={trackRef}
      aria-label="Scroll-driven expanding showreel media"
      data-testid="scroll-media-expand-track"
      className={cn("scroll-media-expand relative w-full", className)}
      style={{
        height: resolveLength(sectionHeight),
        background,
        overflowX: "clip",
        ...style,
      }}
    >
      <div
        ref={stageRef}
        data-testid="scroll-media-expand-stage"
        className="sticky top-0 flex w-full items-center justify-center overflow-hidden"
        style={{ height: viewportHeight, background, opacity: 0, padding: "0 20px" }}
      >
        {/* The single continuous media window — geometry morphs with progress. */}
        <div
          ref={mediaRef}
          className="relative shrink-0 overflow-hidden"
          style={{ willChange: "width, height, border-radius" }}
        >
          <div
            ref={innerRef}
            className="absolute inset-0"
            style={{ willChange: "transform" }}
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={src}
                poster={poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                tabIndex={-1}
                className="block h-full w-full"
                style={{ objectFit, objectPosition }}
              />
            ) : (
              <img
                src={src}
                alt=""
                aria-hidden="true"
                draggable={false}
                decoding="async"
                className="block h-full w-full select-none"
                style={{ objectFit, objectPosition }}
              />
            )}
          </div>

          {/* Readability scrim — soft center vignette under the CTA. */}
          <div
            ref={scrimRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: 0,
              visibility: "hidden",
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0) 68%)",
            }}
          />

          {/* Center CTA — glass pill revealed once the media is readable. */}
          {showOverlay ? (
            <a
              ref={overlayRef}
              href="#"
              onClick={handleOverlayClick}
              aria-hidden="true"
              tabIndex={0}
              className="absolute left-1/2 top-1/2 z-10 flex items-center gap-2.5 rounded-full bg-black/35 py-1.5 pl-1.5 pr-4 ring-1 ring-white/25 backdrop-blur-md"
              style={{ opacity: 0, visibility: "hidden", minHeight: "44px" }}
            >
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-black/55">
                <Play className="h-3 w-3 fill-white text-black" />
              </span>
              <span
                className="whitespace-nowrap text-center"
                style={{ fontSize: playFontSize }}
              >
                {overlayText}
              </span>
            </a>
          ) : null}
        </div>

        {/* Labels glued to the media edges — pushed outward by expansion. */}
        <span
          ref={labelLeftRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 shrink-0 whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.18em] md:text-[13px]"
          style={{ color: foreground, willChange: "transform, opacity" }}
        >
          {leftLabel}
        </span>
        <span
          ref={labelRightRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 shrink-0 whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.18em] md:text-[13px]"
          style={{ color: foreground, willChange: "transform, opacity" }}
        >
          {rightLabel}
        </span>

        {/* Minimal scroll cue — dissolves the moment scrolling begins. */}
        {showScrollHint ? (
          <div
            ref={hintRef}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
          >
            <span className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
              Scroll to explore
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default ScrollMediaExpand;

/* Registry / Framer property-controls bridge. */
export const ScrollMediaExpandPropertyControls = {
  src: { type: "string", title: "Media Source", defaultValue: DEFAULT_SRC },
  mediaType: {
    type: "enum",
    title: "Media Type",
    options: ["image", "video", "auto"],
    defaultValue: "auto",
  },
  poster: { type: "string", title: "Video Poster", defaultValue: "" },
  leftLabel: { type: "string", title: "Left Label", defaultValue: "©2026" },
  rightLabel: {
    type: "string",
    title: "Right Label",
    defaultValue: "Showreel",
  },
  overlayText: {
    type: "string",
    title: "Overlay Text",
    defaultValue: "Play showreel",
  },
  objectPosition: {
    type: "string",
    title: "Focal Point",
    defaultValue: "50% 35%",
  },
  objectFit: {
    type: "enum",
    title: "Media Fit",
    options: ["cover", "contain", "fill"],
    defaultValue: "cover",
  },
  sectionHeight: {
    type: "string",
    title: "Scroll Track Height",
    defaultValue: "300vh",
  },
  viewportHeight: {
    type: "string",
    title: "Viewport Height",
    defaultValue: "100svh",
  },
  startRadius: {
    type: "number",
    title: "Pill Radius",
    defaultValue: 999,
    min: 0,
    max: 999,
  },
  endRadius: {
    type: "number",
    title: "Fullscreen Radius",
    defaultValue: 0,
    min: 0,
    max: 120,
  },
  showOverlay: {
    type: "boolean",
    title: "Show Center CTA",
    defaultValue: true,
  },
  showScrollHint: {
    type: "boolean",
    title: "Show Scroll Cue",
    defaultValue: false,
  },
  smoothing: {
    type: "number",
    title: "Scroll Smoothing",
    defaultValue: 0,
    min: 0,
    max: 1,
  },
  enabled: {
    type: "boolean",
    title: "Enable Scroll Animation",
    defaultValue: true,
  },
  pauseOffscreenVideo: {
    type: "boolean",
    title: "Pause Offscreen Video",
    defaultValue: true,
  },
  pauseWhenOffscreen: {
    type: "boolean",
    title: "Pause Offscreen",
    defaultValue: true,
  },
  background: {
    type: "string",
    title: "Background",
    defaultValue: "var(--background, #fff)",
  },
  foreground: {
    type: "string",
    title: "Label Color",
    defaultValue: "var(--foreground, #111)",
  },
};
