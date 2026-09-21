"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import type {
  TubesCursorEngineOptions,
  TubesCursorInstance,
  TubesCursorRenderer,
  TubesCursorTubes,
} from "threejs-components/build/cursors/tubes1.min.js";

export type {
  TubesCursorEngineOptions,
  TubesCursorInstance,
  TubesCursorRenderer,
  TubesCursorTubes,
};

export type TubesCursorTheme = "auto" | "light" | "dark";

export interface TubesCursorProps {
  /** Tube body colors sampled along the bundle. */
  tubeColors?: string[];
  /** Point-light colors that tint the tubes and surrounding bloom. */
  lightColors?: string[];
  /** Intensity of the four point lights. */
  lightIntensity?: number;
  /** Color scheme. `"auto"` follows the site theme live. */
  theme?: TubesCursorTheme;
  /** Number of tubes in the bundle. Applied when the renderer is created. */
  tubeCount?: number;
  /** Bloom threshold. Applied when the renderer is created. */
  bloomThreshold?: number;
  /** Bloom strength. Applied when the renderer is created. */
  bloomStrength?: number;
  /** Bloom radius. Applied when the renderer is created. */
  bloomRadius?: number;
  /** Clicking the interaction area randomizes the tube and light palette. */
  randomizeOnClick?: boolean;
  /**
   * Ambient drift while the pointer is outside the canvas. Defaults to true
   * (tubes keep swimming a slow figure). Set to false so the bundle settles
   * to center and rests when not hovered. Applied when the renderer is created.
   */
  idleMotion?: boolean;
  /** Rendering detail and DPR cap. Live-updated without recreating the scene. */
  quality?: "low" | "medium" | "high";
  /** Stacking order of the non-interactive overlay. */
  zIndex?: number;
  /** Disables the effect without unmounting it. */
  disabled?: boolean;
  /**
   * Optional host that constrains pointer tracking and canvas rendering.
   * The host must be positioned (e.g. relative) and have non-zero size.
   * When omitted the effect covers the viewport.
   */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Optional class name applied to the overlay wrapper. */
  className?: string;
  /** Content layered above the effect (e.g. page content). */
  children?: React.ReactNode;
}

/** Minimal contract of the threejs-components tubes1 renderer (see tubes-cursor-engine.d.ts). */

const DEFAULT_TUBE_COLORS = ["#5e72e4", "#8965e0", "#f5365c"];
const DEFAULT_LIGHT_COLORS = ["#21d4fd", "#b721ff", "#f4d03f", "#11cdef"];
const DEFAULT_LIGHT_INTENSITY = 200;
const DEFAULT_TUBE_COUNT = 16;

const QUALITY_DPR: Record<"low" | "medium" | "high", { min: number; max: number }> = {
  low: { min: 1, max: 1 },
  medium: { min: 1, max: 1.5 },
  high: { min: 2, max: 2 },
};

const randomHexColor = () => {
  const channel = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  return `#${channel()}${channel()}${channel()}`;
};

const sameColors = (a: string[] | undefined, b: string[] | undefined) => {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  return a.every((color, index) => color === b[index]);
};

/** Read the page color scheme without requiring a theme provider. */
const resolveColorScheme = (): "light" | "dark" => {
  if (typeof document === "undefined") return "dark";
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  const dataTheme = root.dataset.theme;
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme;
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark";
};

/** Resolve the effective scheme, following the site theme live when `"auto"`. */
const useThemeScheme = (theme: TubesCursorTheme): "light" | "dark" => {
  const [scheme, setScheme] = React.useState<"light" | "dark">(() =>
    theme === "auto" || typeof document === "undefined" ? resolveColorScheme() : theme,
  );
  React.useEffect(() => {
    if (theme !== "auto") {
      setScheme(theme);
      return;
    }
    setScheme(resolveColorScheme());
    const observer = new MutationObserver(() => setScheme(resolveColorScheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setScheme(resolveColorScheme());
    query.addEventListener("change", onChange);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", onChange);
    };
  }, [theme]);
  return scheme;
};

/**
 * A pointer-transparent WebGL overlay of luminous 3D tubes that chase the
 * cursor with inertia. Rendering, motion, and bloom are provided by the
 * threejs-components tubes1 engine; this wrapper integrates it cleanly into
 * React (reliable init, StrictMode-safe disposal, live color updates,
 * click-to-randomize, reduced-motion support).
 *
 * Dark mode renders the full neon look (bloom over black). Light mode renders
 * the same tube motion without the bloom pass over a transparent canvas, so a
 * light stage behind it stays visible.
 */
export function TubesCursor({
  tubeColors = DEFAULT_TUBE_COLORS,
  lightColors = DEFAULT_LIGHT_COLORS,
  lightIntensity = DEFAULT_LIGHT_INTENSITY,
  theme = "auto",
  tubeCount = DEFAULT_TUBE_COUNT,
  bloomThreshold = 0,
  bloomStrength = 1.5,
  bloomRadius = 0.5,
  randomizeOnClick = true,
  idleMotion = true,
  quality = "high",
  zIndex = 10,
  disabled = false,
  containerRef,
  className,
  children,
}: TubesCursorProps) {
  const scheme = useThemeScheme(theme);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const appRef = React.useRef<TubesCursorInstance | null>(null);
  const appliedRef = React.useRef({ tubeColors, lightColors, lightIntensity, quality });
  const settingsRef = React.useRef({ randomizeOnClick });
  settingsRef.current = { randomizeOnClick };

  const randomizePalette = React.useCallback(() => {
    const app = appRef.current;
    if (!app?.tubes) return;
    const nextTubes = Array.from({ length: 3 }, randomHexColor);
    const nextLights = Array.from({ length: 4 }, randomHexColor);
    app.tubes.setColors?.(nextTubes);
    app.tubes.setLightsColors?.(nextLights);
    appliedRef.current = { ...appliedRef.current, tubeColors: nextTubes, lightColors: nextLights };
  }, []);

  const onInteractionClick = React.useCallback(
    (event: MouseEvent) => {
      if (!settingsRef.current.randomizeOnClick) return;
      const host = hostRef.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return;
      }
      randomizePalette();
    },
    [randomizePalette],
  );

  // Live-apply color, intensity, and quality changes without recreating the scene.
  React.useEffect(() => {
    const app = appRef.current;
    if (!app?.tubes) {
      appliedRef.current = { tubeColors, lightColors, lightIntensity, quality };
      return;
    }
    if (!sameColors(appliedRef.current.tubeColors, tubeColors) && tubeColors.length > 0) {
      app.tubes.setColors?.(tubeColors);
      appliedRef.current.tubeColors = tubeColors;
    }
    if (!sameColors(appliedRef.current.lightColors, lightColors) && lightColors.length >= 4) {
      app.tubes.setLightsColors?.(lightColors);
      appliedRef.current.lightColors = lightColors;
    }
    if (appliedRef.current.lightIntensity !== lightIntensity) {
      app.tubes.setLightsIntensity?.(lightIntensity);
      appliedRef.current.lightIntensity = lightIntensity;
    }
    if (appliedRef.current.quality !== quality && app.three) {
      const dpr = QUALITY_DPR[quality];
      if (typeof dpr !== "undefined") {
        app.three.minPixelRatio = dpr.min;
        app.three.maxPixelRatio = dpr.max;
        app.three.resize?.();
      }
      appliedRef.current.quality = quality;
    }
  }, [tubeColors, lightColors, lightIntensity, quality]);

  // Create the renderer once the host has valid dimensions; dispose on cleanup.
  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas || disabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let observer: ResizeObserver | null = null;

    const start = async () => {
      if (cancelled) return;
      const engine = await import("threejs-components/build/cursors/tubes1.min.js");
      if (cancelled) return;
      const createTubesCursor = engine.default;
      if (typeof createTubesCursor !== "function") return;
      const dpr = QUALITY_DPR[quality] ?? QUALITY_DPR.high;
      const light = scheme === "light";
      const app = createTubesCursor(canvas, {
        // The bloom composer outputs an opaque black frame, so light mode
        // skips it and renders the tubes directly over a transparent canvas.
        bloom: light
          ? null
          : { threshold: bloomThreshold, strength: bloomStrength, radius: bloomRadius },
        tubes: {
          count: tubeCount,
          colors: [...tubeColors],
          lights: { intensity: lightIntensity, colors: [...lightColors] },
        },
        // Zero sleep radii park the bundle at center instead of swimming a
        // perpetual figure while the pointer is outside the canvas.
        ...(idleMotion ? null : { sleepRadiusX: 0, sleepRadiusY: 0 }),
      });
      if (cancelled) {
        app.dispose?.();
        return;
      }
      if (app.three) {
        app.three.minPixelRatio = dpr.min;
        app.three.maxPixelRatio = dpr.max;
        app.three.resize?.();
      }
      appRef.current = app;
      appliedRef.current = { tubeColors, lightColors, lightIntensity, quality };
    };

    const begin = () => {
      observer?.disconnect();
      observer = null;
      void start();
    };

    if (host.clientWidth > 0 && host.clientHeight > 0) {
      begin();
    } else if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        if (cancelled) return;
        if (host.clientWidth > 0 && host.clientHeight > 0) begin();
      });
      observer.observe(host);
    } else {
      begin();
    }

    const container = containerRef?.current;
    if (container) container.addEventListener("click", onInteractionClick);
    else window.addEventListener("click", onInteractionClick);

    return () => {
      cancelled = true;
      observer?.disconnect();
      observer = null;
      if (container) container.removeEventListener("click", onInteractionClick);
      else window.removeEventListener("click", onInteractionClick);
      appRef.current?.dispose?.();
      // Release the GL context immediately so recreating the renderer
      // (e.g. on theme switch) never reuses a dead context on this canvas,
      // and repeated toggles can't exhaust the browser's context budget.
      appRef.current?.three?.renderer?.forceContextLoss?.();
      appRef.current = null;
    };
    // Init-time options recreate the scene; colors/intensity/quality update live above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, disabled, scheme, tubeCount, bloomThreshold, bloomStrength, bloomRadius, idleMotion, onInteractionClick]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={cn(containerRef ? "absolute inset-0 overflow-hidden" : "fixed inset-0 overflow-hidden", className)}
      style={{ pointerEvents: "none", zIndex }}
    >
      <canvas
        key={scheme}
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
      />
      {children ? <div className="pointer-events-none absolute inset-0">{children}</div> : null}
    </div>
  );
}

export default TubesCursor;
