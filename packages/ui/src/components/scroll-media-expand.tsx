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
  /** Height of the tall scroll track driving the scrub. @default "300vh" */
  sectionHeight?: string | number;
  /** Height of the pinned viewport (any CSS length). @default "100svh" */
  viewportHeight?: string;
  /** Corner radius (px) of the rest-state pill. @default 999 */
  startRadius?: number;
  /** Corner radius (px) at fullscreen. @default 0 */
  endRadius?: number;
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
  "https://images.unsplash.com/photo-1517796931930-443b6f13cf65?auto=format&fit=crop&w=2400&q=85";

/* Phase boundaries (normalized progress 0 → 1). Width leads, height follows,
   radius decays slightly delayed, CTA arrives once the card is readable,
   labels dissolve only after leaving the frame. */
const WIDTH_IN: readonly [number, number] = [0.08, 0.72];
const HEIGHT_IN: readonly [number, number] = [0.3, 0.86];
const RADIUS_IN: readonly [number, number] = [0.06, 0.34];
const RADIUS_OUT: readonly [number, number] = [0.74, 1];
const INNER_IN: readonly [number, number] = [0.08, 0.8];
const OVERLAY_IN: readonly [number, number] = [0.4, 0.56];
const LABEL_FADE: readonly [number, number] = [0.66, 0.82];
const HINT_OUT: readonly [number, number] = [0, 0.08];

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
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
  sectionHeight = "300vh",
  viewportHeight = "100svh",
  startRadius = 999,
  endRadius = 0,
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Imperative animation state — never in React state, scrolling never rerenders.
  const targetRef = useRef(0);
  const renderedRef = useRef(0);
  const inViewRef = useRef(true);
  const metricsRef = useRef({ stageW: 0, stageH: 0, initialW: 0, initialH: 0 });
  const firstFrameRef = useRef(true);

  const [reducedMotion, setReducedMotion] = useState(false);
  const smoothFactor = clamp(smoothing, 0, 1);
  const isVideo = isVideoSrc(src, mediaType);
  const motionActive = enabled && !reducedMotion;

  /* Live config for the rAF loop (prop changes apply without resubscribing). */
  const configRef = useRef({
    initialWidth,
    initialHeight,
    startRadius,
    endRadius,
    objectFit,
    objectPosition,
    showOverlay,
  });
  configRef.current = {
    initialWidth,
    initialHeight,
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
      const mobile = stageW < 640;
      const cfg = configRef.current;
      // Match the reference's visible cinematic aperture: a deliberate,
      // readable capsule rather than a tiny decorative dash.
      const initialW =
        cfg.initialWidth ??
        (mobile
          ? clamp(stageW * 0.22, 90, 140)
          : clamp(stageW * 0.14, 150, 220));
      const initialH =
        cfg.initialHeight ??
        (mobile ? clamp(stageW * 0.05, 22, 32) : clamp(stageW * 0.026, 28, 42));
      metricsRef.current = { stageW, stageH, initialW, initialH };
      renderFrame(renderedRef.current);
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
  function renderFrame(progress: number) {
    const media = mediaRef.current;
    const inner = innerRef.current;
    if (!media || !inner) return;
    const { stageW, stageH, initialW, initialH } = metricsRef.current;
    if (stageW <= 0 || stageH <= 0) return;
    const cfg = configRef.current;
    const p = clamp(progress, 0, 1);

    // Width leads, height follows, and the pill radius settles into a subtle
    // card radius before resolving to the fullscreen radius near the end.
    // Smootherstep gives every phase a cinematic glide with no visible seams.
    const widthP = smootherstep(WIDTH_IN[0], WIDTH_IN[1], p);
    const heightP = smootherstep(HEIGHT_IN[0], HEIGHT_IN[1], p);
    const radiusP = smootherstep(RADIUS_IN[0], RADIUS_IN[1], p);
    const innerP = smootherstep(INNER_IN[0], INNER_IN[1], p);

    // One continuous media element: pill → wide capsule → card → viewport.
    const w = lerp(initialW, stageW, widthP);
    const h = lerp(initialH, stageH, heightP);
    const readableRadius = Math.max(cfg.endRadius, stageW < 640 ? 12 : 16);
    const radius = lerp(
      lerp(cfg.startRadius, readableRadius, radiusP),
      cfg.endRadius,
      smootherstep(RADIUS_OUT[0], RADIUS_OUT[1], p),
    );
    media.style.width = `${w.toFixed(2)}px`;
    media.style.height = `${h.toFixed(2)}px`;
    media.style.borderRadius = `${radius.toFixed(2)}px`;

    // Keep the media covering the entire aperture from the very first frame.
    // A scale settle adds depth without translating the image out of the
    // shallow rest-state pill and exposing its background.
    const innerScale = lerp(1.12, 1, innerP);
    inner.style.transform = `scale(${innerScale.toFixed(4)})`;

    // Labels stay glued to the media edges: offset = half width + gap, so the
    // expansion physically pushes them outward toward the viewport edges.
    // They dissolve with a whisper of blur only once pushed off-frame.
    const gap = stageW < 640 ? 10 : 16;
    const offset = w / 2 + gap;
    const labelFadeP = smoothstep(LABEL_FADE[0], LABEL_FADE[1], p);
    const labelOpacity = 1 - labelFadeP;
    const labelBlur = 2.5 * labelFadeP;
    const labelLeft = labelLeftRef.current;
    if (labelLeft) {
      labelLeft.style.transform = `translate(calc(-100% - ${offset.toFixed(2)}px), -50%)`;
      labelLeft.style.opacity = labelOpacity.toFixed(3);
      labelLeft.style.filter =
        labelBlur <= 0.01 ? "blur(0px)" : `blur(${labelBlur.toFixed(2)}px)`;
    }
    const labelRight = labelRightRef.current;
    if (labelRight) {
      labelRight.style.transform = `translate(${offset.toFixed(2)}px, -50%)`;
      labelRight.style.opacity = labelOpacity.toFixed(3);
      labelRight.style.filter =
        labelBlur <= 0.01 ? "blur(0px)" : `blur(${labelBlur.toFixed(2)}px)`;
    }

    // Center CTA arrives only once the media is a readable card.
    const overlay = overlayRef.current;
    if (overlay && cfg.showOverlay) {
      const o = smootherstep(OVERLAY_IN[0], OVERLAY_IN[1], p);
      overlay.style.opacity = o.toFixed(3);
      overlay.style.transform = `translate(-50%, calc(-50% + ${(8 * (1 - o)).toFixed(2)}px)) scale(${(0.96 + 0.04 * o).toFixed(3)})`;
      overlay.style.filter =
        o >= 1 ? "blur(0px)" : `blur(${(4 * (1 - o)).toFixed(2)}px)`;
      overlay.style.visibility = o <= 0 ? "hidden" : "visible";
    }

    // Rest-state scroll cue dissolves the moment scrolling begins.
    const hint = hintRef.current;
    if (hint) {
      const hO = 1 - smoothstep(HINT_OUT[0], HINT_OUT[1], p);
      hint.style.opacity = hO.toFixed(3);
      hint.style.visibility = hO <= 0 ? "hidden" : "visible";
    }

    if (firstFrameRef.current) {
      firstFrameRef.current = false;
      const stage = stageRef.current;
      if (stage) stage.style.opacity = "";
    }
  }

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
      // Direct scrub: the timeline IS the scroll position — no lag, no settle.
      if (smoothFactor <= 0) {
        renderedRef.current = targetRef.current;
        if (inViewRef.current || !pauseWhenOffscreen) {
          renderFrame(renderedRef.current);
        }
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

  /* rAF loop only when smoothing is requested; otherwise scroll writes directly. */
  useEffect(() => {
    if (!motionActive || smoothFactor <= 0) return;
    firstFrameRef.current = true;
    renderFrame(targetRef.current);
    let raf = 0;

    const tick = () => {
      if (!inViewRef.current && pauseWhenOffscreen) {
        renderedRef.current = targetRef.current;
        raf = requestAnimationFrame(tick);
        return;
      }
      const target = targetRef.current;
      let rendered = renderedRef.current;
      rendered += (target - rendered) * smoothFactor;
      if (Math.abs(target - rendered) < 0.0004) rendered = target;
      renderedRef.current = rendered;
      renderFrame(rendered);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motionActive, smoothFactor, pauseWhenOffscreen]);

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
        style={{ height: viewportHeight, background, opacity: 0 }}
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

          {/* Center CTA — revealed once the media is a readable card. */}
          {showOverlay ? (
            <div
              ref={overlayRef}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 z-10"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-[13px] font-medium tracking-wide text-white/60">
                  {overlayText}
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/80 ring-1 ring-white/15">
                  <Play className="h-2.5 w-2.5 fill-white text-white" />
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Labels glued to the media edges — pushed outward by expansion. */}
        <span
          ref={labelLeftRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 shrink-0 whitespace-nowrap text-[12px] font-medium tracking-wide md:text-[13px]"
          style={{ color: foreground, willChange: "transform, opacity" }}
        >
          {leftLabel}
        </span>
        <span
          ref={labelRightRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 shrink-0 whitespace-nowrap text-[12px] font-medium tracking-wide md:text-[13px]"
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
