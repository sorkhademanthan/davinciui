"use client";

import { useEffect, useRef } from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ---------------------------------- types --------------------------------- */

export type ScrollBlurEasingName =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out";

export type ScrollBlurEasing = ScrollBlurEasingName | ((t: number) => number);

export type ScrollBlurStartLineUnit = "vh" | "%";
export type ScrollBlurThresholdUnit = "px" | "vh";
export type ScrollBlurQuality = "auto" | "low" | "high";

export interface ScrollBlurOverlayProps {
  /** Tint applied to the translucent overlay. @default "#000000" */
  backgroundColor?: string;
  /** Tint strength 0 → 1, independent from blur intensity. @default 0 */
  opacity?: number;
  /** Blur (px) at progress = 1. @default 30 */
  maxBlur?: number;
  /** Blur (px) at progress = 0. @default 0 */
  minBlur?: number;
  /** Viewport line (0 → 100) where the effect starts. @default 50 */
  startLine?: number;
  /** Unit for Start Line ("%" = % of viewport height). @default "vh" */
  startLineUnit?: ScrollBlurStartLineUnit;
  /** Distance over which blur reaches its maximum. @default 400 */
  threshold?: number;
  /** Unit for Threshold. @default "px" */
  thresholdUnit?: ScrollBlurThresholdUnit;
  /**
   * When true the backdrop layer extends above its own bounds by the
   * threshold distance, so the incoming section progressively blurs the
   * outgoing section above it. @default false
   */
  extendAbove?: boolean;
  /**
   * Explicit upward extension (px). Defaults to the resolved threshold
   * distance. Only used when `extendAbove` is true.
   */
  extendHeight?: number;
  /** Easing applied to scroll progress (never time-based). @default "ease-out" */
  easing?: ScrollBlurEasing;
  /** Cap blur on small viewports (px). Defaults to `maxBlur`. */
  mobileMaxBlur?: number;
  /** Disable the effect on viewports narrower than 768px. @default false */
  disableOnMobile?: boolean;
  /** Blur rounding: "low" snaps to 0.5px, "high" keeps 0.01px. @default "auto" */
  blurQuality?: ScrollBlurQuality;
  /** When true, renders nothing and performs no work. @default false */
  disabled?: boolean;
  /** Show the viewport start line + live progress readout. @default false */
  debug?: boolean;
  /** z-index of the overlay layer. @default 10 */
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Optional wrapper mode: renders a relatively-positioned container around
   * children with the overlay pinned inside. When omitted, the component
   * renders only the absolute overlay — place it inside your own
   * relatively-positioned section.
   */
  children?: React.ReactNode;
}

/* --------------------------------- helpers -------------------------------- */

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const EASING_FNS: Record<ScrollBlurEasingName, (t: number) => number> = {
  linear: (t) => t,
  "ease-in": (t) => t * t * t,
  "ease-out": (t) => 1 - Math.pow(1 - t, 3),
  "ease-in-out": (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

export function resolveScrollBlurEasing(
  easing: ScrollBlurEasing | undefined,
): (t: number) => number {
  if (typeof easing === "function") return easing;
  return EASING_FNS[easing ?? "ease-out"] ?? EASING_FNS["ease-out"];
}

export function resolveThresholdPx(
  threshold: number,
  thresholdUnit: ScrollBlurThresholdUnit,
  viewportH: number,
): number {
  const raw =
    thresholdUnit === "vh" ? (threshold / 100) * viewportH : threshold;
  return Math.max(1, Number.isFinite(raw) ? raw : 400);
}

export function resolveStartLinePx(
  startLine: number,
  viewportH: number,
): number {
  return (clamp(startLine, 0, 100) / 100) * viewportH;
}

/**
 * Core scroll geometry. Pure function of the trigger position, so scrolling
 * backward perfectly reverses the effect.
 *
 * distance = startLinePx - triggerTop
 * progress = clamp(distance / thresholdPx, 0, 1)
 */
export function calcScrollBlurProgress(
  triggerTop: number,
  viewportH: number,
  startLine: number,
  threshold: number,
  thresholdUnit: ScrollBlurThresholdUnit,
): number {
  const startLinePx = resolveStartLinePx(startLine, viewportH);
  const thresholdPx = resolveThresholdPx(threshold, thresholdUnit, viewportH);
  return clamp((startLinePx - triggerTop) / thresholdPx, 0, 1);
}

export function calcScrollBlur(
  rawProgress: number,
  minBlur: number,
  maxBlur: number,
  easing: ScrollBlurEasing | undefined,
): number {
  const eased = resolveScrollBlurEasing(easing)(clamp(rawProgress, 0, 1));
  return lerp(Math.max(0, minBlur), Math.max(0, maxBlur), eased);
}

function hexToRgba(hex: string, alpha: number): string | null {
  const m = hex.trim().match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (!m) return null;
  let h = m[1]!;
  if (h.length === 3 || h.length === 4) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  let a = alpha;
  if (h.length === 8) {
    a = (parseInt(h.slice(6, 8), 16) / 255) * alpha;
  }
  return `rgba(${r}, ${g}, ${b}, ${clamp(a, 0, 1).toFixed(3)})`;
}

/** Bake tint alpha into the color so the element itself stays at opacity 1. */
export function resolveTintBackground(
  backgroundColor: string,
  opacity: number,
): string {
  const a = clamp(opacity, 0, 1);
  const rgba = hexToRgba(backgroundColor, a);
  if (rgba) return rgba;
  if (a <= 0) return "transparent";
  if (a >= 1) return backgroundColor;
  return `color-mix(in srgb, ${backgroundColor} ${(a * 100).toFixed(1)}%, transparent)`;
}

/* ------------------------- shared scroll scheduler ------------------------ */

interface BlurInstance {
  host: HTMLElement;
  layer: HTMLElement;
  read: () => {
    startLine: number;
    threshold: number;
    thresholdUnit: ScrollBlurThresholdUnit;
    minBlur: number;
    maxBlur: number;
    easing: ScrollBlurEasing | undefined;
    extendAbove: boolean;
    extendHeight: number | undefined;
    mobileMaxBlur: number | undefined;
    disableOnMobile: boolean;
    quality: ScrollBlurQuality;
    effectDisabled: boolean;
    debug: boolean;
    debugEl: HTMLElement | null;
  };
  lastBlur: number;
  lastExtend: number;
  inView: boolean;
}

const instances = new Set<BlurInstance>();
let listenersAttached = false;
let tickScheduled = false;
let reduceMotion = false;
let mobileQuery: MediaQueryList | null = null;

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  if (mobileQuery) return mobileQuery.matches;
  return window.innerWidth < 768;
}

function attachSharedListeners() {
  if (listenersAttached || typeof window === "undefined") return;
  listenersAttached = true;

  if (typeof window.matchMedia !== "undefined") {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotion = mq.matches;
    mq.addEventListener("change", (e) => {
      reduceMotion = e.matches;
      scheduleBlurTick();
    });
    mobileQuery = window.matchMedia("(max-width: 767px)");
    mobileQuery.addEventListener("change", () => scheduleBlurTick());
  }

  const onScroll = () => scheduleBlurTick();
  // Capture phase: also catches scrolls from nested scroll containers
  // (e.g. docs preview panes), since scroll events do not bubble.
  window.addEventListener("scroll", onScroll, {
    passive: true,
    capture: true,
  });
  window.addEventListener("resize", onScroll, { passive: true });
}

function scheduleBlurTick() {
  if (tickScheduled || typeof window === "undefined") return;
  tickScheduled = true;
  requestAnimationFrame(() => {
    tickScheduled = false;
    updateAllInstances();
  });
}

/**
 * `scroll` does not bubble. Capture on window works in modern browsers, but
 * registering the concrete scrolling ancestors as well makes the effect
 * reliable inside preview panes, modals, and any nested scroll container.
 */
function getScrollableAncestors(element: HTMLElement) {
  const ancestors: HTMLElement[] = [];
  let parent = element.parentElement;

  while (parent) {
    if (
      parent.scrollHeight > parent.clientHeight ||
      parent.scrollWidth > parent.clientWidth
    ) {
      ancestors.push(parent);
    }
    parent = parent.parentElement;
  }

  return ancestors;
}

function quantizeBlur(blur: number, quality: ScrollBlurQuality) {
  if (quality === "low") return Math.round(blur * 2) / 2;
  if (quality === "high") return Math.round(blur * 100) / 100;
  return Math.round(blur * 20) / 20;
}

/** Single rAF-throttled pass over every mounted instance. No React state. */
function updateAllInstances() {
  if (instances.size === 0) return;
  const viewportH = window.innerHeight || 1;
  const mobile = isMobileViewport();

  for (const inst of instances) {
    const cfg = inst.read();
    const rect = inst.host.getBoundingClientRect();

    // Skip work while fully outside the extended influence zone.
    const thresholdPx = resolveThresholdPx(
      cfg.threshold,
      cfg.thresholdUnit,
      viewportH,
    );
    const influence = thresholdPx + viewportH;
    if (rect.bottom < -influence || rect.top > viewportH + thresholdPx) {
      if (inst.inView) inst.inView = false;
      continue;
    }
    inst.inView = true;

    let blur: number;
    let progress = 0;
    if (cfg.effectDisabled || (cfg.disableOnMobile && mobile)) {
      blur = 0;
    } else if (reduceMotion) {
      blur = Math.max(0, cfg.minBlur);
    } else {
      progress = calcScrollBlurProgress(
        rect.top,
        viewportH,
        cfg.startLine,
        cfg.threshold,
        cfg.thresholdUnit,
      );
      const cap =
        mobile && typeof cfg.mobileMaxBlur === "number"
          ? cfg.mobileMaxBlur
          : cfg.maxBlur;
      blur = calcScrollBlur(progress, cfg.minBlur, cap, cfg.easing);
    }

    const q = quantizeBlur(blur, cfg.quality);
    const extendPx =
      cfg.extendAbove && cfg.extendHeight != null && cfg.extendHeight >= 0
        ? cfg.extendHeight
        : thresholdPx;

    // Extend the layer upward only when the geometry actually changed.
    if (cfg.extendAbove && Math.abs(extendPx - inst.lastExtend) > 0.5) {
      inst.lastExtend = extendPx;
      inst.layer.style.top = `${(-extendPx - 1).toFixed(1)}px`;
    } else if (!cfg.extendAbove && inst.lastExtend !== 0) {
      inst.lastExtend = 0;
      inst.layer.style.top = "-1px";
    }

    // Avoid DOM writes when the value is visually unchanged.
    if (Math.abs(q - inst.lastBlur) < 0.001 && !cfg.debug) continue;
    inst.lastBlur = q;

    const value = q <= 0.005 ? "blur(0px)" : `blur(${q.toFixed(2)}px)`;
    inst.layer.style.backdropFilter = value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (inst.layer.style as any).webkitBackdropFilter = value;
    inst.layer.style.setProperty("--scroll-blur", `${q.toFixed(2)}px`);

    if (cfg.debug && cfg.debugEl) {
      cfg.debugEl.textContent = `progress: ${progress.toFixed(2)} · blur: ${q.toFixed(1)}px · threshold: ${Math.round(thresholdPx)}px`;
    }
  }
}

/* -------------------------------- component ------------------------------- */

export function ScrollBlurOverlay({
  backgroundColor = "#000000",
  opacity = 0,
  maxBlur = 30,
  minBlur = 0,
  startLine = 50,
  startLineUnit = "vh",
  threshold = 400,
  thresholdUnit = "px",
  extendAbove = false,
  extendHeight,
  easing = "ease-out",
  mobileMaxBlur,
  disableOnMobile = false,
  blurQuality = "auto",
  disabled = false,
  debug = false,
  zIndex = 10,
  className,
  style,
  children,
}: ScrollBlurOverlayProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const debugTextRef = useRef<HTMLDivElement>(null);
  const debugLineRef = useRef<HTMLDivElement>(null);

  // Live config for the shared rAF loop (prop changes apply instantly,
  // without resubscribing or rerendering on scroll).
  const configRef = useRef({
    startLine,
    threshold,
    thresholdUnit,
    minBlur,
    maxBlur,
    easing,
    extendAbove,
    extendHeight,
    mobileMaxBlur,
    disableOnMobile,
    quality: blurQuality,
    effectDisabled: disabled,
    debug,
  });
  configRef.current = {
    startLine,
    threshold,
    thresholdUnit,
    minBlur,
    maxBlur,
    easing,
    extendAbove,
    extendHeight,
    mobileMaxBlur,
    disableOnMobile,
    quality: blurQuality,
    effectDisabled: disabled,
    debug,
  };

  useEffect(() => {
    const host = hostRef.current;
    const layer = layerRef.current;
    if (!host || !layer) return;
    if (disabled) {
      const off = "blur(0px)";
      layer.style.backdropFilter = off;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layer.style as any).webkitBackdropFilter = off;
      return;
    }

    attachSharedListeners();

    const inst: BlurInstance = {
      host,
      layer,
      read: () => ({
        ...configRef.current,
        debugEl: debugTextRef.current,
      }),
      lastBlur: Number.NaN,
      lastExtend: Number.NaN,
      inView: true,
    };
    instances.add(inst);
    scheduleBlurTick();

    // IntersectionObserver is an optimization ONLY: it gates whether this
    // instance participates in the shared tick. Progress always derives
    // from continuous getBoundingClientRect geometry.
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(() => scheduleBlurTick(), {
        rootMargin: "800px",
      });
      io.observe(host);
    }

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => scheduleBlurTick());
      ro.observe(host);
    }

    const scrollParents = getScrollableAncestors(host);
    scrollParents.forEach((parent) =>
      parent.addEventListener("scroll", scheduleBlurTick, { passive: true }),
    );

    return () => {
      instances.delete(inst);
      io?.disconnect();
      ro?.disconnect();
      scrollParents.forEach((parent) =>
        parent.removeEventListener("scroll", scheduleBlurTick),
      );
    };
  }, [disabled]);

  // Keep the debug start-line marker glued to the configured viewport line.
  useEffect(() => {
    if (!debug) return;
    const line = debugLineRef.current;
    if (!line) return;
    const place = () => {
      const vh = window.innerHeight || 1;
      line.style.top = `${resolveStartLinePx(startLine, vh).toFixed(1)}px`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [debug, startLine, startLineUnit]);

  if (disabled) return children ? <>{children}</> : null;

  const tint = resolveTintBackground(backgroundColor, opacity);

  // First-frame geometry so the layer never measures at zero height before
  // the shared rAF tick resolves exact pixels (vh thresholds via svh units).
  const initialTop = extendAbove
    ? extendHeight != null
      ? `${-extendHeight - 1}px`
      : thresholdUnit === "vh"
        ? `calc(-${threshold}svh - 1px)`
        : `${-threshold - 1}px`
    : -1;

  const layer = (
    <div
      ref={layerRef}
      aria-hidden="true"
      data-slot="scroll-blur-layer"
      className={cn("pointer-events-none absolute", className)}
      style={{
        top: initialTop,
        left: 0,
        right: 0,
        bottom: -1,
        zIndex,
        background: tint,
        backdropFilter: "blur(0px)",
        WebkitBackdropFilter: "blur(0px)",
        // Explicit var for consumers: blur(var(--scroll-blur)).
        ["--scroll-blur" as string]: "0px",
        ...style,
      }}
    />
  );

  const debugOverlay = debug ? (
    <>
      <div
        ref={debugLineRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 z-[9999] w-screen border-t border-dashed border-red-500"
      >
        <span className="absolute left-2 top-1 bg-red-500 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
          Start line
        </span>
      </div>
      <div
        ref={debugTextRef}
        aria-hidden="true"
        className="pointer-events-none fixed bottom-3 left-3 z-[9999] rounded-md bg-black/80 px-2 py-1 font-mono text-[11px] text-white"
      />
    </>
  ) : null;

  // Wrapper mode: relatively-positioned container around user content.
  if (children) {
    return (
      <div
        ref={hostRef}
        data-slot="scroll-blur"
        className="relative"
        style={{ isolation: "auto" }}
      >
        {children}
        {layer}
        {debugOverlay}
      </div>
    );
  }

  // Bare mode: absolute overlay for placement inside the user's own section.
  // The host box always equals the parent bounds (stable trigger); the inner
  // layer alone extends upward so measurement never shifts.
  return (
    <>
      <div
        ref={hostRef}
        aria-hidden="true"
        data-slot="scroll-blur"
        className="pointer-events-none absolute inset-0"
        style={{ isolation: "auto" }}
      >
        {layer}
      </div>
      {debugOverlay}
    </>
  );
}

export default ScrollBlurOverlay;

/* Registry / Framer property-controls bridge. */
export const ScrollBlurOverlayPropertyControls = {
  backgroundColor: {
    type: "color",
    title: "Background",
    defaultValue: "#000000",
  },
  opacity: {
    type: "number",
    title: "Opacity",
    defaultValue: 0,
    min: 0,
    max: 1,
  },
  maxBlur: {
    type: "number",
    title: "Max Blur",
    defaultValue: 30,
    min: 0,
    max: 100,
  },
  minBlur: {
    type: "number",
    title: "Min Blur",
    defaultValue: 0,
    min: 0,
    max: 100,
  },
  startLine: {
    type: "number",
    title: "Start Line",
    defaultValue: 50,
    min: 0,
    max: 100,
  },
  startLineUnit: {
    type: "enum",
    title: "Start Line Unit",
    options: ["vh", "%"],
    defaultValue: "vh",
  },
  threshold: {
    type: "number",
    title: "Threshold",
    defaultValue: 400,
    min: 1,
    max: 2000,
  },
  thresholdUnit: {
    type: "enum",
    title: "Threshold Unit",
    options: ["px", "vh"],
    defaultValue: "px",
  },
  extendAbove: {
    type: "boolean",
    title: "Extend Above",
    defaultValue: false,
  },
  easing: {
    type: "enum",
    title: "Easing",
    options: ["linear", "ease-in", "ease-out", "ease-in-out"],
    defaultValue: "ease-out",
  },
  disableOnMobile: {
    type: "boolean",
    title: "Disable Mobile",
    defaultValue: false,
  },
  debug: { type: "boolean", title: "Debug", defaultValue: false },
};
