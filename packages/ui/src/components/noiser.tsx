"use client";

import * as React from "react";

export type NoiserNoiseType = "gaussian" | "uniform";
export type NoiserColorMode = "mono" | "duo" | "multi";

export interface NoiserProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "color"
> {
  noiseType?: NoiserNoiseType;
  frequency?: number;
  octaves?: number;
  seed?: number;
  colorMode?: NoiserColorMode;
  monoColor?: string;
  colorA?: string;
  colorB?: string;
  colorC?: string;
  noiseOpacity?: number;
  colorOpacity?: number;
  animated?: boolean;
  fps?: number;
}

const DEFAULTS = {
  noiseType: "gaussian" as const,
  frequency: 0.26,
  octaves: 2,
  seed: 8,
  colorMode: "mono" as const,
  monoColor: "#ffffff",
  colorA: "#ffffff",
  colorB: "#8b5cf6",
  colorC: "#22d3ee",
  noiseOpacity: 0.3,
  colorOpacity: 0.8,
  animated: true,
  fps: 12,
};

const MODE_BANDS: Record<Exclude<NoiserColorMode, "mono">, number> = {
  duo: 2,
  multi: 3,
};

function makeBandValues(band: number, count: number) {
  return Array.from({ length: 33 }, (_, index) => {
    const amount = index / 32;
    if (count === 1) return Math.abs(amount - 0.5) * 2;
    if (count === 2) {
      return band === 0
        ? Math.max(0, 1 - amount * 2)
        : Math.max(0, amount * 2 - 1);
    }
    if (band === 0) return Math.max(0, 1 - amount * 3);
    if (band === 1) return Math.max(0, 1 - Math.abs(amount - 0.5) * 3);
    return Math.max(0, amount * 3 - 2);
  })
    .map((value) => value.toFixed(3))
    .join(" ");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * A responsive procedural grain overlay for hero sections and other surfaces.
 * It renders only SVG filter primitives and never captures pointer input.
 */
export function Noiser({
  noiseType = DEFAULTS.noiseType,
  frequency = DEFAULTS.frequency,
  octaves = DEFAULTS.octaves,
  seed = DEFAULTS.seed,
  colorMode = DEFAULTS.colorMode,
  monoColor = DEFAULTS.monoColor,
  colorA = DEFAULTS.colorA,
  colorB = DEFAULTS.colorB,
  colorC = DEFAULTS.colorC,
  noiseOpacity = DEFAULTS.noiseOpacity,
  colorOpacity = DEFAULTS.colorOpacity,
  animated = DEFAULTS.animated,
  fps = DEFAULTS.fps,
  style,
  ...props
}: NoiserProps) {
  const generatedId = React.useId();
  const filterId = `noiser-${generatedId.replace(/:/g, "")}`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const turbulenceRef = React.useRef<SVGFETurbulenceElement>(null);
  const isVisibleRef = React.useRef(true);
  const boundedFrequency = clamp(frequency, 0.01, 1.5);
  const boundedOctaves = Math.round(clamp(octaves, 1, 8));
  const boundedOpacity = clamp(noiseOpacity, 0, 1);
  const boundedColorOpacity = clamp(colorOpacity, 0, 1);
  const bands = colorMode === "mono" ? 1 : MODE_BANDS[colorMode];
  const colors =
    colorMode === "mono"
      ? [monoColor]
      : [colorA, colorB, colorC].slice(0, bands);
  const initialSeed = Number.isFinite(seed)
    ? Math.round(clamp(seed, 0, 99999))
    : DEFAULTS.seed;

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = Boolean(entry?.isIntersecting);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const turbulence = turbulenceRef.current;
    if (!animated || !turbulence || typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    let currentSeed = initialSeed;
    let frame = 0;
    let lastUpdate = performance.now();
    const frameDuration = 1000 / clamp(fps, 1, 60);
    turbulence.setAttribute("seed", String(currentSeed));

    const animate = (now: number) => {
      if (
        isVisibleRef.current &&
        document.visibilityState === "visible" &&
        now - lastUpdate >= frameDuration
      ) {
        const elapsedFrames = Math.max(
          1,
          Math.floor((now - lastUpdate) / frameDuration),
        );
        currentSeed = (currentSeed + elapsedFrames) % 100000;
        turbulence.setAttribute("seed", String(currentSeed));
        lastUpdate += elapsedFrames * frameDuration;
      }
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [animated, fps, initialSeed]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      {...props}
      style={{
        ...style,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        style={{ display: "block", overflow: "hidden", pointerEvents: "none" }}
      >
        <filter
          id={filterId}
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            ref={turbulenceRef}
            type={noiseType === "gaussian" ? "fractalNoise" : "turbulence"}
            baseFrequency={boundedFrequency}
            numOctaves={boundedOctaves}
            seed={initialSeed}
            stitchTiles="stitch"
            result="sourceNoise"
          />
          <feColorMatrix
            in="sourceNoise"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2126 0.7152 0.0722 0 0"
            result="noiseMask"
          />
          {colors.map((color, index) => (
            <React.Fragment key={`${color}-${index}`}>
              <feComponentTransfer in="noiseMask" result={`band-${index}`}>
                <feFuncA
                  type="table"
                  tableValues={makeBandValues(index, bands)}
                />
              </feComponentTransfer>
              <feFlood
                floodColor={color}
                floodOpacity={colorMode === "mono" ? 1 : boundedColorOpacity}
                result={`color-${index}`}
              />
              <feComposite
                in={`color-${index}`}
                in2={`band-${index}`}
                operator="in"
                result={`layer-${index}`}
              />
            </React.Fragment>
          ))}
          <feMerge>
            {colors.map((_, index) => (
              <feMergeNode key={index} in={`layer-${index}`} />
            ))}
          </feMerge>
          <feComponentTransfer>
            <feFuncA type="linear" slope={boundedOpacity} />
          </feComponentTransfer>
        </filter>
        <rect
          width="100%"
          height="100%"
          fill="transparent"
          filter={`url(#${filterId})`}
        />
      </svg>
    </div>
  );
}

const propertyControls = {
  noiseType: {
    type: "Enum",
    title: "Noise Type",
    options: ["gaussian", "uniform"],
    optionTitles: ["Gaussian", "Uniform"],
    defaultValue: DEFAULTS.noiseType,
    displaySegmentedControl: true,
    group: "Noise",
  },
  frequency: {
    type: "Number",
    title: "Frequency",
    min: 0.01,
    max: 1.5,
    step: 0.01,
    defaultValue: DEFAULTS.frequency,
    group: "Noise",
  },
  octaves: {
    type: "Number",
    title: "Octaves",
    min: 1,
    max: 8,
    step: 1,
    defaultValue: DEFAULTS.octaves,
    group: "Noise",
  },
  seed: {
    type: "Number",
    title: "Seed",
    min: 0,
    max: 99999,
    step: 1,
    defaultValue: DEFAULTS.seed,
    group: "Noise",
  },
  colorMode: {
    type: "Enum",
    title: "Color Mode",
    options: ["mono", "duo", "multi"],
    optionTitles: ["Mono", "Duo", "Multi"],
    defaultValue: DEFAULTS.colorMode,
    displaySegmentedControl: true,
    group: "Color",
  },
  monoColor: {
    type: "Color",
    title: "Color",
    defaultValue: DEFAULTS.monoColor,
    hidden: (props: NoiserProps) => props.colorMode !== "mono",
    group: "Color",
  },
  colorA: {
    type: "Color",
    title: "Color 1",
    defaultValue: DEFAULTS.colorA,
    hidden: (props: NoiserProps) => props.colorMode === "mono",
    group: "Color",
  },
  colorB: {
    type: "Color",
    title: "Color 2",
    defaultValue: DEFAULTS.colorB,
    hidden: (props: NoiserProps) => props.colorMode === "mono",
    group: "Color",
  },
  colorC: {
    type: "Color",
    title: "Color 3",
    defaultValue: DEFAULTS.colorC,
    hidden: (props: NoiserProps) => props.colorMode !== "multi",
    group: "Color",
  },
  noiseOpacity: {
    type: "Number",
    title: "Noise Opacity",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: DEFAULTS.noiseOpacity,
    group: "Color",
  },
  colorOpacity: {
    type: "Number",
    title: "Color Opacity",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: DEFAULTS.colorOpacity,
    hidden: (props: NoiserProps) => props.colorMode === "mono",
    group: "Color",
  },
  animated: {
    type: "Boolean",
    title: "Animated",
    defaultValue: DEFAULTS.animated,
    group: "Animation",
  },
  fps: {
    type: "Number",
    title: "FPS",
    min: 1,
    max: 60,
    step: 1,
    defaultValue: DEFAULTS.fps,
    hidden: (props: NoiserProps) => !props.animated,
    group: "Animation",
  },
};

(Noiser as unknown as Record<string, unknown>).propertyControls =
  propertyControls;
(Noiser as unknown as Record<string, unknown>).addPropertyControls =
  propertyControls;

export default Noiser;
