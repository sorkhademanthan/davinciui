"use client";

/**
 * CurvedInlineType
 * -----------------------------------------------------------------------------
 * A scroll-driven stack of headline lines wrapped around an invisible vertical
 * ring. Lines swing through a sticky stage in plain DOM + CSS 3D transforms:
 * they rise from below, flatten and brighten at the front centre, then roll up
 * and fade over the top. Images and looping videos sit inline between words.
 *
 * Rendering model
 *   The page scroll is read once per requestAnimationFrame tick, passed through
 *   a critically-tuned spring, and written straight to each line's transform /
 *   opacity (plus the media row's blur). React never re-renders per frame.
 *
 * Calibration notes
 *   The published demo's ring is 260 degrees of spacing rotated through a
 *   -140..+140 degree sweep. `computeLineState` implements the spec's canonical
 *   per-line formula (theta = base - index * step) and reproduces the reference
 *   values exactly. `mapping: "spec"` is available for the 0..sweepDeg variant.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 900
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

import * as React from "react";
import { addPropertyControls, ControlType } from "framer";

export type CurvedInlineMediaType = "image" | "video";

export interface CurvedInlineMedia {
  type: CurvedInlineMediaType;
  src: string;
  alt?: string;
  poster?: string;
}

export interface CurvedInlineLine {
  before: string;
  media?: CurvedInlineMedia;
  after?: string;
  href?: string;
  newTab?: boolean;
}

export interface CurvedSpringSettings {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export interface CurvedInlineTypeProps {
  lines?: CurvedInlineLine[];
  sweepDeg?: number;
  ringHeight?: number;
  ringDepth?: number;
  perspective?: number;
  textRotation?: number;
  fadeExponent?: number;
  minOpacity?: number;
  blurAmount?: number;
  fontFamily?: string;
  fontSize?: string;
  letterSpacing?: string;
  textColor?: string;
  background?: string;
  mediaHeight?: number;
  mediaWidth?: number;
  mediaRadius?: number;
  mediaFit?: "cover" | "contain";
  gap?: number;
  scrollLength?: string | number;
  direction?: "forward" | "reverse";
  mapping?: "live" | "spec";
  sweepFrom?: number;
  sweepTo?: number;
  spring?: CurvedSpringSettings;
  showCaption?: boolean;
  captionText?: string;
  captionColor?: string;
  captionPulse?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface CurvedLineStateOptions {
  count?: number;
  sweepDeg?: number;
  textRotation?: number;
  fadeExponent?: number;
  minOpacity?: number;
  blurAmount?: number;
}

export interface CurvedLineState {
  theta: number;
  y: number;
  z: number;
  rotateX: number;
  opacity: number;
  blur: number;
  front: number;
}

export const DEFAULT_LINES: CurvedInlineLine[] = [
  { before: "Wander" },
  {
    before: "Design",
    after: "On",
    media: { type: "image", src: "./assets/red-popsicle.jpg", alt: "" },
  },
  { before: "Horizon" },
  {
    before: "Pulse",
    after: "Mode",
    media: { type: "video", src: "./assets/pulse-red-head.mp4" },
  },
  { before: "Grain" },
  {
    before: "Every",
    after: "Day",
    media: { type: "image", src: "./assets/heart-sunglasses.jpg", alt: "" },
  },
  { before: "Drift" },
  {
    before: "Echo",
    after: "Man",
    media: { type: "video", src: "./assets/amber-alley.mp4" },
  },
  { before: "Bloom" },
  {
    before: "Made",
    after: "Simple",
    media: { type: "image", src: "./assets/grass-flock.jpg", alt: "" },
  },
  { before: "Quiet" },
  {
    before: "Bold",
    after: "Ideas",
    media: { type: "image", src: "./assets/glossy-red.png", alt: "" },
  },
  { before: "Vivid" },
  {
    before: "Origin",
    media: { type: "video", src: "./assets/purple-lotus.mp4" },
  },
];

export const DEFAULT_PROPS = {
  sweepDeg: 260,
  ringHeight: 0.8,
  ringDepth: 1.25,
  perspective: 1200,
  textRotation: 1.15,
  fadeExponent: 1.5,
  minOpacity: 0.06,
  blurAmount: 3,
  fontFamily: '"Funnel Display", "Funnel Display Placeholder", sans-serif',
  fontSize: "clamp(24px, 8.55vw, 94px)",
  letterSpacing: "-0.04em",
  textColor: "#f4f2ed",
  background: "#0b0b0e",
  mediaHeight: 0.9,
  mediaWidth: 1.035,
  mediaRadius: 10,
  mediaFit: "cover" as const,
  gap: 0.05,
  scrollLength: "400vh",
  direction: "forward" as const,
  mapping: "live" as const,
  sweepFrom: -140,
  sweepTo: 140,
  spring: { stiffness: 90, damping: 26, mass: 1 },
  showCaption: true,
  captionText: "SCROLL SCROLL SCROLL...",
  captionColor: "#f4f2ed",
  captionPulse: true,
};

const DEG = Math.PI / 180;

export function normalizeAngle(degrees: number): number {
  return (((degrees + 180) % 360) + 360) % 360 - 180;
}

export function computeLineState(
  baseAngle: number,
  index: number,
  options: CurvedLineStateOptions = {},
): CurvedLineState {
  const count = Math.max(1, options.count ?? DEFAULT_LINES.length);
  const sweepDeg = options.sweepDeg ?? DEFAULT_PROPS.sweepDeg;
  const textRotation = options.textRotation ?? DEFAULT_PROPS.textRotation;
  const fadeExponent = options.fadeExponent ?? DEFAULT_PROPS.fadeExponent;
  const minOpacity = options.minOpacity ?? DEFAULT_PROPS.minOpacity;
  const blurAmount = options.blurAmount ?? DEFAULT_PROPS.blurAmount;
  const step = sweepDeg / count;
  const theta = normalizeAngle(baseAngle - index * step);
  const radians = theta * DEG;
  const front = (Math.cos(radians) + 1) / 2;
  const opacity =
    minOpacity + (1 - minOpacity) * Math.pow(front, fadeExponent);
  const blur =
    blurAmount > 0 ? blurAmount * Math.pow(1 - front, 1.6) : 0;
  return {
    theta,
    y: Math.sin(radians),
    z: Math.cos(radians),
    rotateX: -textRotation * theta,
    opacity,
    blur,
    front,
  };
}

export function formatLineTransform(state: CurvedLineState): string {
  return `translate3d(-50%, calc(-50% + var(--orrery-lift) * ${state.y.toFixed(
    4,
  )}), calc(var(--orrery-reach) * ${state.z.toFixed(
    4,
  )})) rotateX(${state.rotateX.toFixed(2)}deg)`;
}

export function progressToBaseAngle(
  progress: number,
  options: Pick<
    CurvedInlineTypeProps,
    "mapping" | "sweepDeg" | "sweepFrom" | "sweepTo" | "direction"
  > = {},
): number {
  const p = Math.min(1, Math.max(0, progress));
  const mapping = options.mapping ?? DEFAULT_PROPS.mapping;
  const direction = options.direction ?? DEFAULT_PROPS.direction;
  const directed = direction === "reverse" ? 1 - p : p;
  if (mapping === "spec") {
    return directed * (options.sweepDeg ?? DEFAULT_PROPS.sweepDeg);
  }
  const from = options.sweepFrom ?? DEFAULT_PROPS.sweepFrom;
  const to = options.sweepTo ?? DEFAULT_PROPS.sweepTo;
  const sweepDeg = options.sweepDeg ?? DEFAULT_PROPS.sweepDeg;
  const count = DEFAULT_LINES.length;
  const step = sweepDeg / count;
  const anchorZero = -sweepDeg / 2 + step / 2;
  return -(from + directed * (to - from) + anchorZero);
}

interface SpringState {
  value: number;
  target: number;
  velocity: number;
  initialized: boolean;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }
    query.addListener(update);
    return () => query.removeListener(update);
  }, []);
  return reduced;
}

function hydrateLength(value: string | number): string {
  return typeof value === "number" ? `${value}vh` : value;
}

function mediaBoxStyle(
  props: Required<
    Pick<
      CurvedInlineTypeProps,
      "mediaHeight" | "mediaWidth" | "mediaRadius" | "mediaFit"
    >
  >,
): React.CSSProperties {
  return {
    height: `${props.mediaHeight.toFixed(3)}em`,
    width: `${props.mediaWidth.toFixed(3)}em`,
    borderRadius: `${props.mediaRadius}px`,
    flex: "none",
    display: "block",
    overflow: "hidden",
    objectFit: props.mediaFit,
    objectPosition: "center",
    userSelect: "none",
  };
}

export default function CurvedInlineType(props: CurvedInlineTypeProps) {
  const lines = props.lines && props.lines.length > 0 ? props.lines : DEFAULT_LINES;
  const {
    sweepDeg = DEFAULT_PROPS.sweepDeg,
    ringHeight = DEFAULT_PROPS.ringHeight,
    ringDepth = DEFAULT_PROPS.ringDepth,
    perspective = DEFAULT_PROPS.perspective,
    textRotation = DEFAULT_PROPS.textRotation,
    fadeExponent = DEFAULT_PROPS.fadeExponent,
    minOpacity = DEFAULT_PROPS.minOpacity,
    blurAmount = DEFAULT_PROPS.blurAmount,
    fontFamily = DEFAULT_PROPS.fontFamily,
    fontSize = DEFAULT_PROPS.fontSize,
    letterSpacing = DEFAULT_PROPS.letterSpacing,
    textColor = DEFAULT_PROPS.textColor,
    background = DEFAULT_PROPS.background,
    mediaHeight = DEFAULT_PROPS.mediaHeight,
    mediaWidth = DEFAULT_PROPS.mediaWidth,
    mediaRadius = DEFAULT_PROPS.mediaRadius,
    mediaFit = DEFAULT_PROPS.mediaFit,
    gap = DEFAULT_PROPS.gap,
    scrollLength = DEFAULT_PROPS.scrollLength,
    direction = DEFAULT_PROPS.direction,
    mapping = DEFAULT_PROPS.mapping,
    sweepFrom = DEFAULT_PROPS.sweepFrom,
    sweepTo = DEFAULT_PROPS.sweepTo,
    spring = DEFAULT_PROPS.spring,
    showCaption = DEFAULT_PROPS.showCaption,
    captionText = DEFAULT_PROPS.captionText,
    captionColor = DEFAULT_PROPS.captionColor,
    captionPulse = DEFAULT_PROPS.captionPulse,
    className,
    style,
  } = props;

  const reducedMotion = useReducedMotion();
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const lineRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const rowRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const videoRefs = React.useRef<Array<HTMLVideoElement | null>>([]);
  const videoPlaying = React.useRef<boolean[]>([]);
  const springRef = React.useRef<SpringState>({
    value: 0,
    target: 0,
    velocity: 0,
    initialized: false,
  });
  const progressRef = React.useRef(0);

  const readProgress = () => {
    const track = trackRef.current;
    if (!track) return 0;
    const viewport = window.innerHeight || 1;
    const rect = track.getBoundingClientRect();
    const travel = rect.height - viewport;
    if (travel <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / travel));
  };

  const applyLines = (baseAngle: number) => {
    const config = configRef.current;
    const fronts: number[] = [];
    for (let index = 0; index < config.lines.length; index += 1) {
      const outer = lineRefs.current[index];
      const row = rowRefs.current[index];
      if (!outer || !row) {
        fronts[index] = 0;
        continue;
      }
      const state = computeLineState(baseAngle, index, {
        count: config.lines.length,
        sweepDeg: config.sweepDeg,
        textRotation: config.textRotation,
        fadeExponent: config.fadeExponent,
        minOpacity: config.minOpacity,
        blurAmount: config.blurAmount,
      });
      outer.style.transform = formatLineTransform(state);
      outer.style.opacity = state.opacity.toFixed(6);
      row.style.filter =
        state.blur < 0.06 ? "none" : `blur(${state.blur.toFixed(2)}px)`;
      fronts[index] = state.front;
    }
    return fronts;
  };

  const configRef = React.useRef({
    lines,
    sweepDeg,
    textRotation,
    fadeExponent,
    minOpacity,
    blurAmount,
    direction,
    mapping,
    sweepFrom,
    sweepTo,
    spring,
  });
  configRef.current = {
    lines,
    sweepDeg,
    textRotation,
    fadeExponent,
    minOpacity,
    blurAmount,
    direction,
    mapping,
    sweepFrom,
    sweepTo,
    spring,
  };

  React.useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let videoTimer = 0;

    const applyVideos = (fronts: number[]) => {
      const gate = (Math.cos(70 * DEG) + 1) / 2;
      const order = fronts
        .map((front, index) => ({ front, index }))
        .filter((entry) => entry.front >= gate)
        .sort((a, b) => b.front - a.front);
      const playing = new Set(order.slice(0, 3).map((entry) => entry.index));
      for (let index = 0; index < videoRefs.current.length; index += 1) {
        const video = videoRefs.current[index];
        if (!video) continue;
        const shouldPlay = playing.has(index);
        if (shouldPlay && !videoPlaying.current[index]) {
          videoPlaying.current[index] = true;
          const result = video.play();
          if (result && typeof result.catch === "function") {
            result.catch(() => {});
          }
        } else if (!shouldPlay && videoPlaying.current[index]) {
          videoPlaying.current[index] = false;
          video.pause();
        }
      }
    };

    const tick = (now: number) => {
      const config = configRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      const progress = readProgress();
      progressRef.current = progress;
      const targetBase = progressToBaseAngle(progress, {
        mapping: config.mapping,
        direction: config.direction,
        sweepDeg: config.sweepDeg,
        sweepFrom: config.sweepFrom,
        sweepTo: config.sweepTo,
      });

      const springState = springRef.current;
      if (!springState.initialized) {
        springState.value = targetBase;
        springState.target = targetBase;
        springState.velocity = 0;
        springState.initialized = true;
      }

      springState.target = targetBase;
      if (reducedMotion) {
        springState.value = targetBase;
        springState.velocity = 0;
      } else {
        const stiffness = config.spring.stiffness ?? 90;
        const damping = config.spring.damping ?? 26;
        const mass = Math.max(0.1, config.spring.mass ?? 1);
        const subSteps = 4;
        const subDt = dt / subSteps;
        for (let step = 0; step < subSteps; step += 1) {
          const acceleration =
            (-stiffness * (springState.value - springState.target) -
              damping * springState.velocity) /
            mass;
          springState.velocity += acceleration * subDt;
          springState.value += springState.velocity * subDt;
        }
        if (
          Math.abs(springState.value - springState.target) < 0.001 &&
          Math.abs(springState.velocity) < 0.01
        ) {
          springState.value = springState.target;
          springState.velocity = 0;
        }
      }

      const fronts = applyLines(springState.value);

      if (now - videoTimer > 110) {
        videoTimer = now;
        applyVideos(fronts);
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  React.useLayoutEffect(() => {
    const baseAngle = progressToBaseAngle(readProgress(), configRef.current);
    springRef.current = {
      value: baseAngle,
      target: baseAngle,
      velocity: 0,
      initialized: true,
    };
    progressRef.current = readProgress();
    applyLines(baseAngle);
  }, []);

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: `${gap}em`,
    color: "inherit",
    textDecoration: "none",
  };

  const lineStyle: React.CSSProperties = {
    fontSize,
    letterSpacing,
    lineHeight: "1em",
    fontFamily,
    fontStyle: "normal",
    fontWeight: 400,
    color: textColor,
    whiteSpace: "nowrap",
    margin: 0,
    userSelect: "none",
    position: "absolute",
    left: "50%",
    top: "50%",
    transformStyle: "preserve-3d",
    backfaceVisibility: "hidden",
    willChange: "transform, opacity",
    display: "flex",
    alignItems: "center",
  };

  const captionStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    top: "clamp(20px, 4vh, 48px)",
    textAlign: "center",
    color: captionColor,
    fontSize: "12px",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    pointerEvents: "none",
    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "1em",
    animation: captionPulse
      ? "curved-caption-pulse 5.5s ease-in-out infinite"
      : undefined,
  };

  const initialBaseAngle = progressToBaseAngle(0, {
    mapping,
    direction,
    sweepDeg,
    sweepFrom,
    sweepTo,
  });

  return (
    <div
      ref={trackRef}
      data-curved-track=""
      className={className}
      style={{
        ...style,
        position: "relative",
        width: "100%",
        height: hydrateLength(scrollLength),
        background,
      }}
    >
      <style>{`
        @keyframes curved-caption-pulse {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.55; }
        }
      `}</style>
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          perspective: `min(${perspective}px, 170vw)`,
          perspectiveOrigin: "50% 50%",
          ["--orrery-lift" as string]: `calc(min(42vh, 42vw) * ${ringHeight.toFixed(3)})`,
          ["--orrery-reach" as string]: `calc(min(46vh, 46vw) * ${ringDepth.toFixed(3)})`,
        }}
      >
        <div
          data-curved-ring=""
          style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}
        >
          {lines.map((line, index) => {
            const media = line.media;
            const initialState = computeLineState(initialBaseAngle, index, {
              count: lines.length,
              sweepDeg,
              textRotation,
              fadeExponent,
              minOpacity,
              blurAmount,
            });
            const box = mediaBoxStyle({
              mediaHeight,
              mediaWidth,
              mediaRadius,
              mediaFit,
            });
            const content = (
              <div
                ref={(node) => {
                  rowRefs.current[index] = node;
                }}
                style={{
                  ...rowStyle,
                  filter:
                    initialState.blur < 0.06
                      ? "none"
                      : `blur(${initialState.blur.toFixed(2)}px)`,
                }}
              >
                <span>{line.before}</span>
                {media ? (
                  media.type === "video" ? (
                    <video
                      ref={(node) => {
                        videoRefs.current[index] = node;
                      }}
                      src={media.src}
                      poster={media.poster}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      disablePictureInPicture
                      style={{
                        ...box,
                        backgroundColor: "rgba(128,128,128,0.18)",
                        pointerEvents: "none",
                      }}
                    />
                  ) : (
                    <img
                      src={media.src}
                      alt={media.alt ?? ""}
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      style={box}
                    />
                  )
                ) : null}
                {line.after ? <span>{line.after}</span> : null}
              </div>
            );
            return (
              <div
                key={`${index}-${line.before}-${line.after ?? ""}`}
                ref={(node) => {
                  lineRefs.current[index] = node;
                }}
                style={{
                  ...lineStyle,
                  transform: formatLineTransform(initialState),
                  opacity: initialState.opacity.toFixed(6),
                }}
              >
                {line.href ? (
                  <a
                    href={line.href}
                    target={line.newTab ? "_blank" : undefined}
                    rel={line.newTab ? "noopener noreferrer" : undefined}
                    style={rowStyle}
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
        {showCaption ? (
          <div aria-hidden="true" style={captionStyle}>
            {captionText}
          </div>
        ) : null}
      </div>
    </div>
  );
}

addPropertyControls(CurvedInlineType, {
  sweepDeg: {
    type: ControlType.Number,
    title: "Curve",
    min: 90,
    max: 540,
    step: 5,
    defaultValue: DEFAULT_PROPS.sweepDeg,
  },
  direction: {
    type: ControlType.Enum,
    title: "Direction",
    options: ["forward", "reverse"],
    optionTitles: ["Forward", "Reverse"],
    defaultValue: DEFAULT_PROPS.direction,
  },
  mapping: {
    type: ControlType.Enum,
    title: "Mapping",
    options: ["live", "spec"],
    optionTitles: ["Live", "Spec"],
    defaultValue: DEFAULT_PROPS.mapping,
  },
  textColor: {
    type: ControlType.Color,
    title: "Text",
    defaultValue: DEFAULT_PROPS.textColor,
  },
  background: {
    type: ControlType.Color,
    title: "Background",
    defaultValue: DEFAULT_PROPS.background,
  },
  fontSize: {
    type: ControlType.String,
    title: "Font Size",
    defaultValue: DEFAULT_PROPS.fontSize,
  },
  fontFamily: {
    type: ControlType.String,
    title: "Font",
    defaultValue: DEFAULT_PROPS.fontFamily,
  },
  scrollLength: {
    type: ControlType.String,
    title: "Scroll Length",
    defaultValue: DEFAULT_PROPS.scrollLength,
  },
  showCaption: {
    type: ControlType.Boolean,
    title: "Caption",
    defaultValue: DEFAULT_PROPS.showCaption,
  },
  captionText: {
    type: ControlType.String,
    title: "Caption Text",
    defaultValue: DEFAULT_PROPS.captionText,
  },
});
