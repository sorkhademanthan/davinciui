"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type CharacterFieldSet =
  | "mixed"
  | "letters"
  | "numbers"
  | "symbols"
  | "custom";

const CHARACTER_SETS: Record<Exclude<CharacterFieldSet, "custom">, string> = {
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}<>?/|:;",
  mixed:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}<>?/|:;",
};

export interface CharacterFieldProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Which character pool fills the grid. */
  characterSet?: CharacterFieldSet;
  /** Custom pool used when characterSet is "custom". */
  customCharacters?: string;
  /** CSS font family for glyphs (monospace recommended). */
  fontFamily?: string;
  /** Glyph size in CSS pixels. */
  fontSize?: number;
  /** CSS font weight for glyphs. */
  fontWeight?: number | string;
  /** Extra horizontal space between glyphs in CSS pixels. */
  characterSpacing?: number;
  /** Line height multiplier. */
  lineHeight?: number;
  /** Canvas background fill. */
  backgroundColor?: string;
  /** Base glyph color. */
  characterColor?: string;
  /** Color used for occasional bright glyphs. */
  highlightColor?: string;
  /** Global opacity multiplier for glyphs. */
  baseOpacity?: number;
  /** 0–1 spread of per-glyph brightness. Higher values make bright glyphs rarer. */
  brightnessVariation?: number;
  /** Grid density multiplier. Higher values pack more glyphs. */
  density?: number;
  /** Global mutation rate multiplier. */
  mutationSpeed?: number;
  /** Probability (0–1) that a scheduled cell event replaces its glyph. */
  mutationAmount?: number;
  /** Minimum delay in ms between mutations of the same cell. */
  minUpdateDelay?: number;
  /** Maximum delay in ms between mutations of the same cell. */
  maxUpdateDelay?: number;
  /** 0–1 per-frame opacity shimmer strength. */
  flickerIntensity?: number;
  /** Ease opacity toward its target instead of snapping. */
  smoothFade?: boolean;
  /** Pause the loop while the component is outside the viewport. */
  pauseWhenOffscreen?: boolean;
  /** Render one static field when the user prefers reduced motion. */
  respectReducedMotion?: boolean;
  /** Optional seed for a deterministic initial field. */
  seed?: number;
  /** Maximum device pixel ratio for the backing buffer. */
  maxDpr?: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseRgb(color: string): [number, number, number] {
  const hex = color.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  const short = /^([0-9a-fA-F]{3})$/.exec(hex);
  if (short?.[1]) {
    const s = short[1];
    return [
      parseInt(s[0]! + s[0], 16),
      parseInt(s[1]! + s[1], 16),
      parseInt(s[2]! + s[2], 16),
    ];
  }
  const rgb =
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(color) ?? null;
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }
  return [255, 255, 255];
}

interface ResolvedSettings {
  pool: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  characterSpacing: number;
  lineHeight: number;
  background: string;
  baseRgb: [number, number, number];
  highlightRgb: [number, number, number];
  baseOpacity: number;
  brightnessVariation: number;
  density: number;
  mutationSpeed: number;
  mutationAmount: number;
  minUpdateDelay: number;
  maxUpdateDelay: number;
  flickerIntensity: number;
  smoothFade: boolean;
  seed: number | undefined;
}

export function CharacterField({
  characterSet = "mixed",
  customCharacters = "",
  fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize = 14,
  fontWeight = 400,
  characterSpacing = 2,
  lineHeight = 1.5,
  backgroundColor = "#060a09",
  characterColor = "#1d3a34",
  highlightColor = "#8fc0b5",
  baseOpacity = 0.6,
  brightnessVariation = 0.55,
  density = 1,
  mutationSpeed = 1.8,
  mutationAmount = 0.16,
  minUpdateDelay = 60,
  maxUpdateDelay = 1400,
  flickerIntensity = 0.35,
  smoothFade = true,
  pauseWhenOffscreen = true,
  respectReducedMotion = true,
  seed,
  maxDpr = 2,
  className,
  style,
  ...props
}: CharacterFieldProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const settings = React.useMemo<ResolvedSettings>(() => {
    const pool =
      characterSet === "custom"
        ? customCharacters.length > 0
          ? customCharacters
          : CHARACTER_SETS.mixed
        : CHARACTER_SETS[characterSet];
    return {
      pool,
      fontFamily,
      fontSize: Math.max(6, fontSize),
      fontWeight,
      characterSpacing: Math.max(0, characterSpacing),
      lineHeight: Math.max(0.5, lineHeight),
      background: backgroundColor,
      baseRgb: parseRgb(characterColor),
      highlightRgb: parseRgb(highlightColor),
      baseOpacity: Math.min(1, Math.max(0, baseOpacity)),
      brightnessVariation: Math.min(1, Math.max(0, brightnessVariation)),
      density: Math.min(3, Math.max(0.25, density)),
      mutationSpeed: Math.max(0, mutationSpeed),
      mutationAmount: Math.min(1, Math.max(0, mutationAmount)),
      minUpdateDelay: Math.max(0, minUpdateDelay),
      maxUpdateDelay: Math.max(minUpdateDelay, maxUpdateDelay),
      flickerIntensity: Math.min(1, Math.max(0, flickerIntensity)),
      smoothFade,
      seed,
    };
  }, [
    characterSet,
    customCharacters,
    fontFamily,
    fontSize,
    fontWeight,
    characterSpacing,
    lineHeight,
    backgroundColor,
    characterColor,
    highlightColor,
    baseOpacity,
    brightnessVariation,
    density,
    mutationSpeed,
    mutationAmount,
    minUpdateDelay,
    maxUpdateDelay,
    flickerIntensity,
    smoothFade,
    seed,
  ]);

  const settingsRef = React.useRef(settings);
  settingsRef.current = settings;
  const behaviorRef = React.useRef({
    pauseWhenOffscreen,
    respectReducedMotion,
    maxDpr,
  });
  behaviorRef.current = { pauseWhenOffscreen, respectReducedMotion, maxDpr };

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flat cell buffers (struct-of-arrays, no per-frame allocation).
    let glyphs: Uint16Array = new Uint16Array(0);
    let opacity = new Float32Array(0);
    let targetOpacity = new Float32Array(0);
    let brightness = new Float32Array(0);
    let highlight = new Uint8Array(0);
    let nextMutation = new Float64Array(0);
    let flickerPhase = new Float32Array(0);
    let cols = 0;
    let rows = 0;
    let stepX = 10;
    let stepY = 20;
    let fontString = "";

    let disposed = false;
    let frameId = 0;
    let running = false;
    let visible = true;
    let pageVisible =
      typeof document === "undefined"
        ? true
        : document.visibilityState !== "hidden";
    const motionQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    let reducedMotion = motionQuery?.matches ?? false;

    const random = (() => {
      let fn: () => number = Math.random;
      return {
        reset: (s: number | undefined) => {
          fn = s === undefined ? Math.random : mulberry32(s);
        },
        next: () => fn(),
      };
    })();

    const scheduleNext = (now: number) => {
      const s = settingsRef.current;
      const span = Math.max(0, s.maxUpdateDelay - s.minUpdateDelay);
      return now + s.minUpdateDelay + random.next() * span;
    };

    const rollBrightness = (): { value: number; isHighlight: boolean } => {
      const s = settingsRef.current;
      // Skewed toward dim: most glyphs stay dark, rare ones pop.
      const skewed = 1 - Math.pow(random.next(), 1 + s.brightnessVariation * 4);
      const value = 0.25 + skewed * 0.75;
      return { value, isHighlight: skewed > 1 - s.brightnessVariation * 0.28 };
    };

    const mutateCell = (index: number, now: number, forceGlyph: boolean) => {
      const s = settingsRef.current;
      if (forceGlyph || random.next() < s.mutationAmount) {
        glyphs[index] = Math.floor(random.next() * s.pool.length);
        const rolled = rollBrightness();
        brightness[index] = rolled.value;
        highlight[index] = rolled.isHighlight ? 1 : 0;
        targetOpacity[index] =
          s.baseOpacity * (0.35 + rolled.value * 0.65);
      } else {
        // Subtle brightness nudge without replacing the glyph.
        const next = Math.min(
          1,
          Math.max(
            0.15,
            brightness[index]! + (random.next() - 0.5) * 0.3,
          ),
        );
        brightness[index] = next;
        targetOpacity[index] = s.baseOpacity * (0.35 + next * 0.65);
      }
      nextMutation[index] = scheduleNext(now);
    };

    const buildGrid = (now: number, staticFrame: boolean) => {
      const s = settingsRef.current;
      const rect = host.getBoundingClientRect();
      const cssWidth = Math.max(1, rect.width);
      const cssHeight = Math.max(1, rect.height);
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        Math.max(1, behaviorRef.current.maxDpr),
      );

      canvas.width = Math.max(1, Math.round(cssWidth * dpr));
      canvas.height = Math.max(1, Math.round(cssHeight * dpr));
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fontString = `${s.fontWeight} ${s.fontSize}px ${s.fontFamily}`;
      ctx.font = fontString;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      const advance = Math.max(4, ctx.measureText("M").width);
      stepX = Math.max(4, (advance + s.characterSpacing) / s.density);
      stepY = Math.max(4, (s.fontSize * s.lineHeight) / s.density);

      const nextCols = Math.max(1, Math.ceil(cssWidth / stepX));
      const nextRows = Math.max(1, Math.ceil(cssHeight / stepY));
      const count = nextCols * nextRows;

      random.reset(s.seed);

      const prevGlyphs = glyphs;
      const prevCols = cols;
      const prevRows = rows;
      const canReuse =
        prevGlyphs.length > 0 && fontString !== "" && prevCols === nextCols;

      glyphs = new Uint16Array(count);
      opacity = new Float32Array(count);
      targetOpacity = new Float32Array(count);
      brightness = new Float32Array(count);
      highlight = new Uint8Array(count);
      nextMutation = new Float64Array(count);
      flickerPhase = new Float32Array(count);

      for (let row = 0; row < nextRows; row++) {
        for (let col = 0; col < nextCols; col++) {
          const index = row * nextCols + col;
          const reused =
            canReuse &&
            row < prevRows &&
            prevGlyphs[row * prevCols + col] !== undefined;
          if (reused) {
            // Keep the settled glyph on resize; only reschedule its mutation.
            glyphs[index] = prevGlyphs[row * prevCols + col]!;
            const rolled = rollBrightness();
            brightness[index] = rolled.value;
            highlight[index] = rolled.isHighlight ? 1 : 0;
            targetOpacity[index] =
              s.baseOpacity * (0.35 + rolled.value * 0.65);
          } else {
            glyphs[index] = Math.floor(random.next() * s.pool.length);
            const rolled = rollBrightness();
            brightness[index] = rolled.value;
            highlight[index] = rolled.isHighlight ? 1 : 0;
            targetOpacity[index] =
              s.baseOpacity * (0.35 + rolled.value * 0.65);
          }
          opacity[index] = staticFrame ? targetOpacity[index]! : 0;
          nextMutation[index] = staticFrame
            ? Number.POSITIVE_INFINITY
            : scheduleNext(now + random.next() * 1200);
          flickerPhase[index] = random.next() * Math.PI * 2;
        }
      }

      cols = nextCols;
      rows = nextRows;
    };

    const draw = (now: number) => {
      const s = settingsRef.current;
      const rect = host.getBoundingClientRect();
      const cssWidth = Math.max(1, rect.width);
      const cssHeight = Math.max(1, rect.height);

      ctx.font = fontString;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillStyle = s.background;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      const speed = s.mutationSpeed;
      const flicker = s.flickerIntensity;
      const pool = s.pool;
      const base = s.baseRgb;
      const hi = s.highlightRgb;
      const time = now / 1000;

      for (let row = 0; row < rows; row++) {
        const y = row * stepY;
        if (y > cssHeight) break;
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col;
          if (speed > 0 && now >= (nextMutation[index] ?? 0)) {
            mutateCell(index, now, false);
          }

          let current = opacity[index]!;
          const target = targetOpacity[index]!;
          if (current !== target) {
            if (s.smoothFade) {
              const next = current + (target - current) * 0.12;
              current =
                Math.abs(target - next) < 0.004 ? target : next;
              opacity[index] = current;
            } else {
              current = target;
              opacity[index] = target;
            }
          }

          if (current <= 0.003) continue;

          let alpha = current;
          if (flicker > 0) {
            alpha *=
              1 +
              Math.sin(time * 2.1 + flickerPhase[index]!) *
                0.5 *
                flicker *
                (0.3 + brightness[index]! * 0.7);
            if (alpha <= 0.003) continue;
            if (alpha > 1) alpha = 1;
          }

          const rgb = highlight[index] === 1 ? hi : base;
          // Single fillStyle assignment per glyph; rgb channels are cached.
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha.toFixed(3)})`;
          ctx.fillText(pool[glyphs[index]!] ?? " ", col * stepX, y);
        }
      }
    };

    const renderStatic = () => {
      buildGrid(performance.now(), true);
      draw(performance.now());
    };

    const frame = (now: number) => {
      if (disposed) return;
      draw(now);
      if (
        visible &&
        pageVisible &&
        !reducedMotion &&
        settingsRef.current.mutationSpeed > 0
      ) {
        frameId = requestAnimationFrame(frame);
      } else {
        running = false;
        frameId = 0;
      }
    };

    const kick = () => {
      if (
        disposed ||
        running ||
        !visible ||
        !pageVisible ||
        reducedMotion ||
        settingsRef.current.mutationSpeed <= 0
      ) {
        return;
      }
      // Push schedules that expired while paused back into the future with a
      // fresh random stagger. Otherwise every cell would mutate on the same
      // frame when the component scrolls back into view.
      const now = performance.now();
      const s = settingsRef.current;
      const span = Math.max(0, s.maxUpdateDelay - s.minUpdateDelay);
      for (let i = 0; i < nextMutation.length; i++) {
        if (nextMutation[i]! < now) {
          nextMutation[i] =
            now + s.minUpdateDelay + random.next() * span;
        }
      }
      running = true;
      frameId = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const refresh = () => {
      if (disposed) return;
      if (reducedMotion && behaviorRef.current.respectReducedMotion) {
        stop();
        renderStatic();
        return;
      }
      buildGrid(performance.now(), false);
      draw(performance.now());
      kick();
    };

    let resizeTimer = 0;
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refresh, 120);
    });
    resizeObserver.observe(host);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (!behaviorRef.current.pauseWhenOffscreen) {
        visible = true;
      }
      if (visible) {
        if (reducedMotion && behaviorRef.current.respectReducedMotion) {
          renderStatic();
        } else {
          kick();
        }
      } else if (behaviorRef.current.pauseWhenOffscreen && frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
        running = false;
      }
    });
    intersectionObserver.observe(host);

    const handleVisibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      if (pageVisible) kick();
      else if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
        running = false;
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleMotion = () => {
      reducedMotion = motionQuery?.matches ?? false;
      if (reducedMotion && behaviorRef.current.respectReducedMotion) {
        stop();
        renderStatic();
      } else {
        refresh();
      }
    };
    motionQuery?.addEventListener?.("change", handleMotion);

    refresh();

    return () => {
      disposed = true;
      window.clearTimeout(resizeTimer);
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery?.removeEventListener?.("change", handleMotion);
    };
    // Mount-once engine: live values flow through refs. Grid-affecting
    // settings are detected by re-running this effect.
  }, [
    fontSize,
    fontFamily,
    fontWeight,
    characterSpacing,
    lineHeight,
    density,
    characterSet,
    customCharacters,
    seed,
  ]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label="Decorative animated field of mutating characters"
      data-slot="character-field"
      className={cn(
        "pointer-events-none relative overflow-hidden",
        className,
      )}
      style={{ backgroundColor, ...style }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default CharacterField;
