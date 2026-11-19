"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type PreloaderProMode = "preview" | "fullscreen";

export type PreloaderProTheme = "auto" | "light" | "dark";

export type PreloaderProPhase =
  | "loading"
  | "holding"
  | "exiting"
  | "revealed"
  | "looping";

export interface PreloaderProProps {
  /**
   * `"preview"` sizes for library panels/cards, `"fullscreen"` lifts the
   * caps for viewport-sized canvases. Same engine, same timeline —
   * only responsive dimensions change.
   */
  mode?: PreloaderProMode;
  /** Milliseconds for the 0 → 100 progression. */
  duration?: number;
  /** Milliseconds the completed 100% frame holds. */
  completionHold?: number;
  /** Milliseconds for the white-panel exit reveal. */
  exitDuration?: number;
  /** Thin progress line color. */
  progressColor?: string;
  /** Loader panel background. */
  loaderBackground?: string;
  /** Hero word, rendered once, centered. Rendered exactly as provided. */
  text?: string;
  /** Brightest (center) hero ink. */
  textColor?: string;
  /** Hero base background. */
  backgroundColor?: string;
  /** Atmospheric red illumination at the hero center. */
  glowColor?: string;
  /**
   * Color scheme for the theme-aware hero defaults. `"auto"` follows the
   * website (`dark` class / `data-theme` / `prefers-color-scheme`, in that
   * order) and updates live when the site theme changes. Explicit
   * `backgroundColor` / `textColor` / `glowColor` props always win.
   * The white loading stage is fixed reference artwork in both schemes.
   */
  theme?: PreloaderProTheme;
  /** Show the percentage counter + line. */
  showProgress?: boolean;
  /** Start playing on mount. When false, the hero rests revealed. */
  autoStart?: boolean;
  /** Loop forever: hero fades → black → panel returns → replay. */
  loop?: boolean;
  /** Milliseconds the revealed hero holds before a loop restart. */
  loopHold?: number;
  /** Counter / hero font stack (heavy geometric sans). */
  fontFamily?: string;
  /** Additional classes applied to the container. */
  className?: string;
  /** Fires on every phase transition. */
  onPhaseChange?: (phase: PreloaderProPhase) => void;
  /** Fires once the reveal finishes (every loop when looping). */
  onComplete?: () => void;
}

/** Loading curve keys: quick open, steady middle, deliberate landing. */
const PROGRESS_KEYS = [0, 15, 40, 70, 90, 100];
const PROGRESS_TIMES = [0, 0.18, 0.42, 0.65, 0.85, 1];

const THEME_DEFAULTS = {
  dark: {
    backgroundColor: "#070707",
    textColor: "#F4ECEC",
    glowColor: "rgba(140, 18, 26, 0.32)",
    glowMid: "rgba(30, 5, 8, 0.16)",
  },
  light: {
    backgroundColor: "#F4F1EE",
    textColor: "#191114",
    glowColor: "rgba(211, 0, 27, 0.12)",
    glowMid: "rgba(190, 60, 65, 0.10)",
  },
} as const;

/** Read the page color scheme without requiring a theme provider. */
function resolveColorScheme(): "light" | "dark" {
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
}

/** Follow the page color scheme live when `theme` is `"auto"`. */
function useColorScheme(mode: PreloaderProTheme): "light" | "dark" {
  const [scheme, setScheme] = React.useState<"light" | "dark">(() =>
    mode === "auto" ? resolveColorScheme() : mode,
  );
  React.useEffect(() => {
    if (mode !== "auto") {
      setScheme(mode);
      return;
    }
    setScheme(resolveColorScheme());
    const root = document.documentElement;
    const observer = new MutationObserver(() =>
      setScheme(resolveColorScheme()),
    );
    observer.observe(root, {
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
  }, [mode]);
  return scheme;
}

const MODE_SIZES = {
  preview: {
    counter: "clamp(48px, 12cqw, 90px)",
    lineWidth: "clamp(90px, 24cqw, 150px)",
    lineGap: "clamp(18px, 4cqw, 28px)",
    hero: "clamp(38px, 11cqw, 100px)",
  },
  fullscreen: {
    counter: "clamp(58px, 6cqw, 96px)",
    lineWidth: "clamp(110px, 12cqw, 160px)",
    lineGap: "clamp(20px, 2.4cqw, 30px)",
    hero: "clamp(55px, 6.5cqw, 110px)",
  },
} as const;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function smoothstep(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/** Piecewise-smooth interpolation through the loading-curve keys. */
function curvedProgress(t: number): number {
  const c = clamp01(t);
  for (let i = 1; i < PROGRESS_TIMES.length; i += 1) {
    const t1 = PROGRESS_TIMES[i] ?? 1;
    if (c <= t1) {
      const t0 = PROGRESS_TIMES[i - 1] ?? 0;
      const v0 = PROGRESS_KEYS[i - 1] ?? 0;
      const v1 = PROGRESS_KEYS[i] ?? 100;
      return v0 + (v1 - v0) * smoothstep(t1 <= t0 ? 1 : (c - t0) / (t1 - t0));
    }
  }
  return 100;
}

function easeInOutCubic(t: number): number {
  const c = clamp01(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/** Controlled expo ease matching cubic-bezier(0.76, 0, 0.24, 1). */
function easeExpoInOut(t: number): number {
  const c = clamp01(t);
  if (c <= 0) return 0;
  if (c >= 1) return 1;
  return c < 0.5
    ? Math.pow(2, 20 * c - 10) / 2
    : (2 - Math.pow(2, -20 * c + 10)) / 2;
}

function easeOutExpo(t: number): number {
  const c = clamp01(t);
  return c >= 1 ? 1 : 1 - Math.pow(2, -10 * c);
}

/**
 * Geometric separator mark — two opposing curved blocks pinched at the
 * middle, drawn to cap-height scale. Inline SVG: sharp at any size.
 */
export function PreloaderProMark({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 48 72"
      aria-hidden="true"
      className={className}
      style={style}
      fill="currentColor"
    >
      <path d="M6 6 Q24 10 42 6 L35.5 30 Q24 26 12.5 30 Z" />
      <path d="M6 66 Q24 62 42 66 L35.5 42 Q24 46 12.5 42 Z" />
    </svg>
  );
}

/**
 * PreloaderPro — a two-stage cinematic preloader.
 *
 * STAGE A: pure-white panel, heavy centered percentage, thin red line
 * growing left-to-right in lockstep (scaleX, transform origin left).
 * STAGE B: the white panel slides away upward, exposing a near-black
 * hero with deep-red central illumination and a massive cropped
 * single centered "DAVINCIUI" hero word.
 *
 * The container is the viewport: relative positioning + container-query
 * units only, never `position: fixed`. The identical component fills a
 * library card, the preview panel, and fullscreen.
 *
 * ONE requestAnimationFrame timeline derives every visual from elapsed
 * time. The counter/line update imperatively — React never renders
 * at 60fps.
 *
 * Replay by remounting (`key`), or set `loop` for a self-running loop.
 */
export function PreloaderPro({
  mode = "preview",
  duration = 2200,
  completionHold = 180,
  exitDuration = 900,
  progressColor = "#D3001B",
  loaderBackground = "#FFFFFF",
  text = "DAVINCIUI",
  textColor,
  backgroundColor,
  glowColor,
  theme = "auto",
  showProgress = true,
  autoStart = true,
  loop = false,
  loopHold = 2600,
  fontFamily = '"Geist", "Geist Sans", Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
  className,
  onPhaseChange,
  onComplete,
}: PreloaderProProps) {
  const sizes = MODE_SIZES[mode] ?? MODE_SIZES.preview;

  const [phase, setPhase] = React.useState<PreloaderProPhase>(
    autoStart ? "loading" : "revealed",
  );
  const [ariaValue, setAriaValue] = React.useState(0);
  const scheme = useColorScheme(theme);
  const resolvedBackground =
    backgroundColor ?? THEME_DEFAULTS[scheme].backgroundColor;
  const resolvedText = textColor ?? THEME_DEFAULTS[scheme].textColor;
  const resolvedGlow = glowColor ?? THEME_DEFAULTS[scheme].glowColor;
  const resolvedGlowMid = THEME_DEFAULTS[scheme].glowMid;

  const panelRef = React.useRef<HTMLDivElement>(null);
  const counterRef = React.useRef<HTMLDivElement>(null);
  const fillRef = React.useRef<HTMLDivElement>(null);
  const stripSettleRef = React.useRef<HTMLDivElement>(null);
  const glowRef = React.useRef<HTMLDivElement>(null);

  const phaseRef = React.useRef<PreloaderProPhase>(
    autoStart ? "loading" : "revealed",
  );
  const completedRef = React.useRef(false);
  const rafRef = React.useRef(0);
  const lastRenderedValue = React.useRef(-1);
  const lastMilestone = React.useRef(-1);

  const onPhaseChangeRef = React.useRef(onPhaseChange);
  const onCompleteRef = React.useRef(onComplete);
  onPhaseChangeRef.current = onPhaseChange;
  onCompleteRef.current = onComplete;

  const goToPhase = React.useCallback((next: PreloaderProPhase) => {
    if (phaseRef.current === next) return;
    phaseRef.current = next;
    setPhase(next);
    onPhaseChangeRef.current?.(next);
  }, []);

  const shouldLockScroll = mode === "fullscreen" && (loop || phase !== "revealed");

  React.useEffect(() => {
    if (!shouldLockScroll) return;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlOverscroll = html.style.overscrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousBodyPaddingRight = body.style.paddingRight;
    const scrollbar = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      html.style.overflow = previousHtmlOverflow;
      html.style.overscrollBehavior = previousHtmlOverscroll;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [shouldLockScroll]);

  // ------------------------- MASTER RAF TIMELINE -------------------------
  // loading → holding → exiting → revealed → (loop: fade → black →
  // reenter → loading). Every visual derives from elapsed; the clock
  // restart happens under full white cover, so loops are seamless.
  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !autoStart) return;

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loadMs = rm ? Math.min(duration, 500) : Math.max(1, duration);
    const holdMs = rm ? 120 : Math.max(0, completionHold);
    const exitMs = rm ? 300 : Math.max(1, exitDuration);
    const settleMs = rm ? 0 : 800;
    const settleDelayMs = rm ? 0 : 120;
    const fadeMs = 500;
    const blackMs = 350;
    const reenterMs = rm ? 300 : 700;

    // Segment boundaries for one pass (loop restarts the clock).
    const exitStart = loadMs + holdMs;
    const revealedAt = exitStart + exitMs;

    let start = performance.now();
    let looping = false; // true while running a loop-restart pass

    const renderProgress = (value: number) => {
      if (value === lastRenderedValue.current) return;
      lastRenderedValue.current = value;
      if (counterRef.current) {
        counterRef.current.textContent = `${value}%`;
      }
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${(value / 100).toFixed(4)})`;
      }
      const milestone =
        value >= 100 ? 100 : value >= 75 ? 75 : value >= 50 ? 50 : value >= 25 ? 25 : 0;
      if (milestone !== lastMilestone.current) {
        lastMilestone.current = milestone;
        setAriaValue(milestone);
      }
    };

    const setPanel = (yPercent: number, opacity: number) => {
      panel.style.transform = `translateY(${yPercent.toFixed(3)}%)`;
      panel.style.opacity = `${clamp01(opacity)}`;
    };

    /** Hero settle-in, coordinated with the panel exit (0 → 1). */
    const renderHero = (t: number) => {
      const e = easeOutExpo(t);
      const strip = stripSettleRef.current;
      const glow = glowRef.current;
      if (strip) {
        strip.style.opacity = `${e}`;
        strip.style.transform = `translateY(${((1 - e) * 26).toFixed(2)}px)`;
      }
      if (glow) glow.style.opacity = `${(e * 0.9).toFixed(3)}`;
    };

    const frame = (now: number) => {
      const elapsed = now - start;

      if (!looping) {
        // ---------- forward pass ----------
        if (elapsed < loadMs) {
          goToPhase("loading");
          renderProgress(Math.round(curvedProgress(elapsed / loadMs)));
          setPanel(0, 1);
          renderHero(0);
        } else if (elapsed < exitStart) {
          goToPhase("holding");
          renderProgress(100);
          setPanel(0, 1);
          renderHero(0);
        } else if (elapsed < revealedAt) {
          goToPhase("exiting");
          renderProgress(100);
          const t = (elapsed - exitStart) / exitMs;
          if (rm) {
            panel.style.transform = "translateY(0%)";
            panel.style.opacity = `${1 - t}`;
          } else {
            setPanel(-easeExpoInOut(t) * 100, 1);
          }
          renderHero((elapsed - exitStart - settleDelayMs) / settleMs);
        } else {
          // ---------- revealed ----------
          renderProgress(100);
          if (!rm) setPanel(-100, 1);
          else {
            panel.style.transform = "translateY(0%)";
            panel.style.opacity = "0";
          }
          panel.style.pointerEvents = "none";
          renderHero(1);
          if (!completedRef.current) {
            completedRef.current = true;
            goToPhase("revealed");
            onCompleteRef.current?.();
          } else {
            goToPhase("revealed");
          }
          if (!loop) {
            return; // rest on the hero
          }
          if (elapsed >= revealedAt + loopHold) {
            looping = true;
            start = now;
          }
        }
      } else {
        // ---------- loop-restart pass: hero fades → black → panel returns ----------
        goToPhase("looping");
        const strip = stripSettleRef.current;
        const glow = glowRef.current;
        const fadeEnd = fadeMs;
        const blackEnd = fadeEnd + blackMs;
        const reenterEnd = blackEnd + reenterMs;
        if (elapsed < fadeEnd) {
          const e = easeInOutCubic(elapsed / fadeMs);
          if (strip) strip.style.opacity = `${1 - e}`;
          if (glow) glow.style.opacity = `${0.9 * (1 - e)}`;
          if (!rm) setPanel(-100, 1);
        } else if (elapsed < blackEnd) {
          if (strip) strip.style.opacity = "0";
          if (glow) glow.style.opacity = "0";
          // Pre-reset the counter while the canvas is pure hero-black —
          // invisible, and the panel is still away so nothing flashes.
          renderProgress(0);
        } else if (elapsed < reenterEnd) {
          const t = (elapsed - blackEnd) / reenterMs;
          if (rm) {
            panel.style.transform = "translateY(0%)";
            panel.style.opacity = `${t}`;
          } else {
            setPanel(-100 + easeExpoInOut(t) * 100, 1);
          }
          panel.style.pointerEvents = "auto";
          if (strip) strip.style.opacity = "0";
          if (glow) glow.style.opacity = "0";
        } else {
          // Panel fully covers → restart the clock invisibly.
          looping = false;
          completedRef.current = false;
          lastRenderedValue.current = -1;
          lastMilestone.current = -1;
          renderProgress(0);
          setPanel(0, 1);
          renderHero(0);
          start = now;
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    // Seed the first painted frame.
    renderProgress(0);
    setPanel(0, 1);
    renderHero(0);
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
    // One engine per mount (replay = remount via key; loop restarts itself).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const staticHero = !autoStart;

  return (
    <div
      role="progressbar"
      aria-label="Page loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaValue}
      data-slot="cinematic-panel-preloader"
      data-phase={phase}
      data-mode={mode}
      className={cn("cinematic-panel-preloader", className)}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: resolvedBackground,
        containerType: "inline-size",
      }}
    >
      {/* ================= HERO (underneath) ================= */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: resolvedBackground,
          overflow: "hidden",
        }}
      >
        {/* Atmospheric deep-red center illumination */}
        <div
          ref={glowRef}
          style={{
            position: "absolute",
            inset: "-10%",
            background: `radial-gradient(ellipse 55% 48% at 50% 50%, ${resolvedGlow} 0%, ${resolvedGlowMid} 46%, rgba(0, 0, 0, 0) 78%)`,
            opacity: staticHero ? 0.9 : 0,
            willChange: "opacity",
          }}
        />
        {/* Edge fade mask: typography emerges from darkness */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        >
          {/* Centering layer (static) → drift layer (ambient) → settle layer (RAF) */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "max-content",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              data-pro-drift
              style={{
                width: "max-content",
                animation:
                  "cinematic-panel-preloader-drift 11s ease-in-out infinite alternate",
              }}
            >
              <div
                ref={stripSettleRef}
                style={{
                  width: "max-content",
                  maxWidth: "92%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  opacity: staticHero ? 1 : 0,
                  transform: staticHero ? "translateY(0px)" : "translateY(26px)",
                  willChange: "transform, opacity",
                }}
              >
                <span
                  style={{
                    fontFamily,
                    fontWeight: 900,
                    fontSize: sizes.hero,
                    letterSpacing: "-0.04em",
                    lineHeight: 0.9,
                    color: resolvedText,
                    textAlign: "center",
                  }}
                >
                  {text}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= WHITE LOADER PANEL (above) ================= */}
      <div
        ref={panelRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: loaderBackground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          willChange: "transform, opacity",
          ...(staticHero
            ? { transform: "translateY(-100%)", pointerEvents: "none" as const }
            : null),
        }}
      >
        {showProgress && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              ref={counterRef}
              style={{
                fontFamily,
                fontWeight: 900,
                fontSize: sizes.counter,
                letterSpacing: "-0.06em",
                lineHeight: 1,
                color: "#000000",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              0%
            </div>
            <div
              style={{
                marginTop: sizes.lineGap,
                width: sizes.lineWidth,
                height: 2,
                overflow: "hidden",
              }}
            >
              <div
                ref={fillRef}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: progressColor,
                  transform: "scaleX(0)",
                  transformOrigin: "left center",
                  willChange: "transform",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes cinematic-panel-preloader-drift { from { transform: translateX(-14px); } to { transform: translateX(14px); } } @media (prefers-reduced-motion: reduce) { [data-slot="cinematic-panel-preloader"] [data-pro-drift] { animation: none !important; } }`}</style>
    </div>
  );
}

export default PreloaderPro;

/* Framer Code Component controls — attached only where the Framer runtime
   provides `addPropertyControls`. Harmless in React / Next.js. */
if (typeof window !== "undefined") {
  try {
    const framer = window as unknown as {
      addPropertyControls?: (
        component: unknown,
        controls: Record<string, unknown>,
      ) => void;
    };
    framer?.addPropertyControls?.(PreloaderPro, {
      mode: {
        type: "enum",
        title: "Mode",
        options: ["preview", "fullscreen"],
        defaultValue: "preview",
      },
      duration: {
        type: "number",
        title: "Duration (ms)",
        min: 500,
        max: 6000,
        step: 100,
        defaultValue: 2200,
      },
      progressColor: {
        type: "color",
        title: "Progress Color",
        defaultValue: "#D3001B",
      },
      loaderBackground: {
        type: "color",
        title: "Loader Background",
        defaultValue: "#FFFFFF",
      },
      text: {
        type: "string",
        title: "Hero Text",
        defaultValue: "DAVINCIUI",
      },
      theme: {
        type: "enum",
        title: "Theme",
        options: ["auto", "light", "dark"],
        defaultValue: "auto",
      },
      textColor: { type: "color", title: "Text Color", defaultValue: "#F4ECEC" },
      backgroundColor: {
        type: "color",
        title: "Background",
        defaultValue: "#070707",
      },
      showProgress: { type: "boolean", title: "Show Progress", defaultValue: true },
      loop: { type: "boolean", title: "Loop", defaultValue: false },
    });
  } catch {
    /* non-Framer runtime — controls skipped */
  }
}
