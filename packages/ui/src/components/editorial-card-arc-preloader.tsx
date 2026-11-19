"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type PreloaderProV4Mode = "timed" | "pageLoad";
export type PreloaderProV4Exit = "fade" | "slide-up";
export type PreloaderProV4Theme = "auto" | "light" | "dark";

export interface PreloaderProV4Card {
  src: string;
  expandSrc?: string;
  title?: string;
}

export interface PreloaderProV4Props {
  cards?: PreloaderProV4Card[];
  featuredIndex?: number;
  featuredTitle?: string;
  label?: string;
  mode?: PreloaderProV4Mode;
  duration?: number;
  exit?: PreloaderProV4Exit;
  theme?: PreloaderProV4Theme;
  background?: string;
  textColor?: string;
  mutedColor?: string;
  counterFont?: string;
  labelFont?: string;
  cardWidth?: number;
  spread?: number;
  radius?: number;
  rippleIntensity?: number;
  waveCount?: number;
  lockScroll?: boolean;
  oncePerSession?: boolean;
  preview?: boolean;
  previewTime?: number;
  className?: string;
  onComplete?: () => void;
}

export interface PreloaderProV4Handle {
  replay: () => void;
  seek: (time: number) => Promise<void>;
}

export const DEFAULT_PRELOADER_PRO_V4_CARDS: PreloaderProV4Card[] = [
  {
    src: "/images/spiral-3d-slider/camera-reflection.webp",
    title: "Field study",
  },
  { src: "/images/spiral-3d-slider/white-motion.webp", title: "Quiet rooms" },
  { src: "/images/spiral-3d-slider/orange-haze.webp", title: "North light" },
  {
    src: "/images/spiral-3d-slider/prism-portrait.webp",
    expandSrc: "/images/spiral-3d-slider/prism-portrait-16x9.webp",
  },
  {
    src: "/images/spiral-3d-slider/visor-portrait.webp",
    title: "Material notes",
  },
  { src: "/images/spiral-3d-slider/dark-glitch.webp", title: "Open studio" },
  { src: "/images/spiral-3d-slider/teal-echo.webp", title: "Late hours" },
];

const SESSION_KEY = "editorial-card-arc-preloader-shown";
const BASE_WIDTH = 1465;
const CARD_ASPECT = 5 / 7;
const BASE_RADIUS = 14;
const BASE_CARD_WIDTH = 170;
const MAX_CARDS = 15;
const MAX_SPREAD = 75;
const EXPAND_ASPECT = 16 / 9;

const RISE_START = 0.03;
const RISE_END = 0.3;
const COLLAPSE_END = 0.35;
const FAN_END = 0.85;
const TIMED_LIFT_START = 2.38;
const LIFT_DURATION = 0.4;
const EXPAND_DELAY = 0.77;
const EXPAND_DURATION = 0.5;
const EXIT_DELAY = 1.5;
const FADE_DURATION = 0.45;
const SLIDE_DURATION = 0.7;
const RIPPLE_START = 1.025;
const RIPPLE_BUMP = 0.35;
const RIPPLE_PERIOD = 0.66;
const RIPPLE_DELAY = 0.07;

const RISE_TOP_STOPS: readonly [number, number][] = [
  [0.03, 750],
  [0.06, 744],
  [0.1, 667],
  [0.13, 591],
  [0.16, 520],
  [0.2, 458],
  [0.23, 406],
  [0.26, 365],
  [0.3, 333],
];

const COUNTER_STOPS: readonly [number, number][] = [
  [0.15, 0],
  [0.26, 2],
  [0.43, 3],
  [0.6, 6],
  [0.66, 8],
  [0.73, 15],
  [0.83, 21],
  [0.93, 29],
  [1.03, 39],
  [1.23, 63],
  [1.43, 80],
  [1.63, 91],
  [1.83, 97],
  [1.93, 98],
  [2.03, 99],
  [2.13, 100],
  [2.15, 100],
];

const EXPAND_STOPS: readonly [number, number][] = [
  [0, 0],
  [0.08, 0.12],
  [0.13, 0.18],
  [0.18, 0.35],
  [0.23, 0.53],
  [0.28, 0.65],
  [0.33, 0.82],
  [0.38, 0.9],
  [0.5, 1],
];

const SR_ONLY: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const clamp01 = (value: number) => clamp(value, 0, 1);
const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const easeOutCubic = (value: number) => {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
};

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;

  return (input: number) => {
    const x = clamp01(input);
    let low = 0;
    let high = 1;
    let t = x;
    for (let i = 0; i < 14; i += 1) {
      const current = sampleX(t);
      if (Math.abs(current - x) < 0.0001) break;
      if (current < x) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return sampleY(t);
  };
}

const slideUpEase = cubicBezier(0.76, 0, 0.24, 1);

function interpolateStops(stops: readonly [number, number][], time: number) {
  if (time <= stops[0]![0]) return stops[0]![1];
  for (let i = 1; i < stops.length; i += 1) {
    const [t1, v1] = stops[i]!;
    const [t0, v0] = stops[i - 1]!;
    if (time <= t1) {
      const progress = (time - t0) / Math.max(0.0001, t1 - t0);
      return lerp(v0, v1, progress);
    }
  }
  return stops[stops.length - 1]![1];
}

function counterValue(time: number, duration = 2) {
  if (time <= 0.15) return 0;
  const scale = duration / 2;
  return interpolateStops(COUNTER_STOPS, 0.15 + (time - 0.15) / scale);
}

function expandValue(elapsed: number) {
  return interpolateStops(EXPAND_STOPS, clamp(elapsed, 0, EXPAND_DURATION));
}

function springResponse(time: number) {
  if (time <= 0) return 0;
  const stiffness = 140;
  const damping = 20;
  const mass = 1;
  const omega0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
  const value =
    1 -
    Math.exp(-zeta * omega0 * time) *
      (Math.cos(omegaD * time) +
        ((zeta * omega0) / omegaD) * Math.sin(omegaD * time));
  return clamp(value, 0, 1.02);
}

function rippleBob(
  time: number,
  index: number,
  amplitude: number,
  delay: number,
) {
  const phase = time - (RIPPLE_START + index * delay);
  if (phase < 0) return 0;
  const local = ((phase % RIPPLE_PERIOD) + RIPPLE_PERIOD) % RIPPLE_PERIOD;
  if (local > RIPPLE_BUMP) return 0;
  return -amplitude * Math.pow(Math.sin((Math.PI * local) / RIPPLE_BUMP), 2);
}

function parseHex(color: string) {
  const normalized = color.trim();
  if (/^#[0-9a-f]{6}$/i.test(normalized)) {
    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16),
    };
  }
  if (/^#[0-9a-f]{3}$/i.test(normalized)) {
    return {
      r: parseInt(normalized[1]! + normalized[1]!, 16),
      g: parseInt(normalized[2]! + normalized[2]!, 16),
      b: parseInt(normalized[3]! + normalized[3]!, 16),
    };
  }
  return null;
}

function mixColor(from: string, to: string, amount: number) {
  const a = parseHex(from);
  const b = parseHex(to);
  if (!a || !b) return from;
  const t = clamp01(amount);
  const channel = (x: number, y: number) =>
    Math.round(lerp(x, y, t))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(a.r, b.r)}${channel(a.g, b.g)}${channel(a.b, b.b)}`;
}

function layoutFor(
  width: number,
  height: number,
  count: number,
  cardWidth: number,
  spread: number,
  radius: number,
) {
  const scaledWidth = clamp(
    cardWidth * (width / BASE_WIDTH),
    110,
    Math.max(110, 220),
  );
  const cardHeight = scaledWidth / CARD_ASPECT;
  const scaledRadius = clamp(radius * (scaledWidth / BASE_CARD_WIDTH), 6, 22);
  const step =
    count > 1 ? Math.min(spread, MAX_SPREAD / Math.max(1, count - 1)) : 0;
  return {
    width,
    height,
    cx: width / 2,
    apexY: height * 0.5154,
    cardWidth: scaledWidth,
    cardHeight,
    radius: scaledRadius,
    step,
    fanRadius: width * 0.338,
    apexIndex: (count - 1) / 2,
  };
}

function fanSlot(
  layout: ReturnType<typeof layoutFor>,
  index: number,
  radiusScale = 1,
  yOffset = 0,
) {
  const k = index - layout.apexIndex;
  const theta = (k * layout.step * Math.PI) / 180;
  const fanRadius = layout.fanRadius * radiusScale;
  return {
    k,
    rotation: k * layout.step,
    x: layout.cx + fanRadius * Math.sin(theta),
    y: layout.apexY + fanRadius * (1 - Math.cos(theta)) + yOffset,
  };
}

function columnRanks(count: number, featuredIndex: number) {
  const ranks = new Map<number, number>();
  ranks.set(featuredIndex, 0);
  let rank = 1;
  for (let distance = 1; distance < count; distance += 1) {
    for (let index = 0; index < count; index += 1) {
      if (Math.abs(index - featuredIndex) === distance) {
        ranks.set(index, rank);
        rank += 1;
      }
    }
  }
  return ranks;
}

function readSessionFlag() {
  try {
    return (
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(SESSION_KEY) === "1"
    );
  } catch {
    return false;
  }
}

function writeSessionFlag() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    return;
  }
}

const noopSubscribe = () => () => {};

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function resolvePreloaderScheme(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  const root = document.documentElement;
  const explicit = root.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  if (root.classList.contains("light")) return "light";
  if (root.classList.contains("dark")) return "dark";
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

function usePreloaderScheme(theme: PreloaderProV4Theme): "light" | "dark" {
  const [scheme, setScheme] = React.useState<"light" | "dark">(() =>
    theme === "auto" ? "dark" : theme,
  );

  React.useEffect(() => {
    if (theme !== "auto") {
      setScheme(theme);
      return;
    }

    const sync = () => setScheme(resolvePreloaderScheme());
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    query.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", sync);
    };
  }, [theme]);

  return scheme;
}

export const PreloaderProV4 = React.forwardRef<
  PreloaderProV4Handle,
  PreloaderProV4Props
>(function PreloaderProV4(
  {
    cards,
    featuredIndex,
    label = "Loading",
    mode = "timed",
    duration = 2,
    exit = "fade",
    theme = "auto",
    background,
    textColor,
    mutedColor,
    counterFont = '"Inter Tight", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
    labelFont = '"Inter Tight", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
    cardWidth = BASE_CARD_WIDTH,
    spread = 12.5,
    radius = BASE_RADIUS,
    rippleIntensity = 1,
    waveCount = 1,
    lockScroll = true,
    oncePerSession = false,
    preview = false,
    previewTime = 1.6,
    className,
    onComplete,
  },
  ref,
) {
  const items = React.useMemo(
    () =>
      (cards && cards.length > 0
        ? cards
        : DEFAULT_PRELOADER_PRO_V4_CARDS
      ).slice(0, MAX_CARDS),
    [cards],
  );
  const count = items.length;
  const resolvedFeaturedIndex =
    featuredIndex == null
      ? Math.floor((count - 1) / 2)
      : Math.round(clamp(featuredIndex, 0, Math.max(0, count - 1)));
  const imageSources = React.useMemo(
    () =>
      Array.from(
        new Set(
          items.flatMap((item) =>
            item.expandSrc ? [item.src, item.expandSrc] : [item.src],
          ),
        ),
      ),
    [items],
  );
  const imageKey = imageSources.join("|");

  const [runKey, setRunKey] = React.useState(0);
  const [forceShow, setForceShow] = React.useState(false);
  const [booted, setBooted] = React.useState(preview);
  const [done, setDone] = React.useState(false);
  const [dims, setDims] = React.useState({ width: 0, height: 0 });
  const dimsRef = React.useRef({ width: 0, height: 0 });
  const loadFractionRef = React.useRef(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const counterRef = React.useRef<HTMLDivElement>(null);
  const liveRegionRef = React.useRef<HTMLSpanElement>(null);
  const cardElsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const expandImgElsRef = React.useRef<(HTMLImageElement | null)[]>([]);
  const completedRef = React.useRef(false);
  const exitStartedRef = React.useRef(false);
  const prevProgressRef = React.useRef(0);
  const milestoneRef = React.useRef(0);
  const liftAtRef = React.useRef<number | null>(
    mode === "pageLoad" ? null : duration + 0.38,
  );
  const seekRef = React.useRef<(time: number) => Promise<void>>(async () => {});
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const scheme = usePreloaderScheme(theme);
  const resolvedBackground =
    background ?? (scheme === "light" ? "#F3EFE7" : "#0F0F0F");
  const resolvedTextColor =
    textColor ?? (scheme === "light" ? "#141410" : "#EEE8DF");
  const resolvedMutedColor =
    mutedColor ?? (scheme === "light" ? "#6F6A61" : "#7F7D77");
  const cardShadow =
    scheme === "light"
      ? "0 24px 48px rgba(20,20,16,0.18)"
      : "0 24px 48px rgba(0,0,0,0.5)";
  const fadeOnly = !preview && prefersReduced;

  const sessionShown = React.useSyncExternalStore(
    noopSubscribe,
    () => oncePerSession && !forceShow && readSessionFlag(),
    () => false,
  );
  const skip = !preview && sessionShown;

  const counterSize = clamp(dims.width * 0.068, 64, 140);
  const counterBottom = clamp(counterSize * 0.15, 10, 18);
  const timedLiftStart = duration + (TIMED_LIFT_START - 2);

  React.useImperativeHandle(
    ref,
    () => ({
      replay: () => {
        setForceShow(true);
        setDone(false);
        setBooted(false);
        completedRef.current = false;
        exitStartedRef.current = false;
        prevProgressRef.current = 0;
        milestoneRef.current = 0;
        liftAtRef.current = mode === "pageLoad" ? null : timedLiftStart;
        loadFractionRef.current = 0;
        if (rootRef.current) {
          rootRef.current.style.opacity = "1";
          rootRef.current.style.transform = "none";
        }
        setRunKey((key) => key + 1);
      },
      seek: (time: number) => seekRef.current(time),
    }),
    [mode, timedLiftStart],
  );

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => {
      const next = { width: el.offsetWidth, height: el.offsetHeight };
      dimsRef.current = next;
      setDims((previous) =>
        previous.width === next.width && previous.height === next.height
          ? previous
          : next,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [preview, skip, done]);

  React.useEffect(() => {
    if (preview || skip) return;
    let cancelled = false;
    setBooted(false);
    loadFractionRef.current = 0;

    const decoded = imageSources.map((src) => {
      const image = new Image();
      image.src = src;
      return typeof image.decode === "function"
        ? image.decode().catch(() => undefined)
        : Promise.resolve();
    });

    let loaded = 0;
    decoded.forEach((promise) => {
      void promise.then(() => {
        loaded += 1;
        if (mode === "pageLoad") {
          loadFractionRef.current = Math.max(
            loadFractionRef.current,
            0.35 + 0.6 * (loaded / Math.max(1, decoded.length)),
          );
        }
      });
    });

    const timeout = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 1500);
    });

    void Promise.race([Promise.allSettled(decoded), timeout]).then(() => {
      if (cancelled) return;
      if (mode === "pageLoad" && document.readyState === "complete") {
        loadFractionRef.current = 1;
      }
      setBooted(true);
    });

    return () => {
      cancelled = true;
    };
  }, [preview, skip, runKey, imageKey, imageSources, mode]);

  React.useEffect(() => {
    if (mode !== "pageLoad" || preview || skip) return;
    const bump = (value: number) => {
      loadFractionRef.current = Math.max(loadFractionRef.current, value);
    };
    if (document.readyState === "complete") bump(1);
    else if (document.readyState === "interactive") bump(0.75);
    else bump(0.35);

    const onReady = () => bump(0.75);
    const onLoad = () => bump(1);
    document.addEventListener("DOMContentLoaded", onReady);
    window.addEventListener("load", onLoad);
    return () => {
      document.removeEventListener("DOMContentLoaded", onReady);
      window.removeEventListener("load", onLoad);
    };
  }, [mode, preview, skip, runKey]);

  React.useEffect(() => {
    if (!lockScroll || preview || skip || done) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    const previousOverscroll = html.style.overscrollBehavior;
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    const app = document.querySelector("main");
    const overlay = rootRef.current;
    const inertTarget = app && overlay && !app.contains(overlay) ? app : null;
    inertTarget?.setAttribute("inert", "");

    return () => {
      html.style.overflow = previousOverflow;
      html.style.overscrollBehavior = previousOverscroll;
      inertTarget?.removeAttribute("inert");
    };
  }, [lockScroll, preview, skip, done, runKey]);

  React.useEffect(() => {
    if (skip || !booted || done) return;

    const initialWidth = Math.max(
      1,
      Math.round(
        rootRef.current?.offsetWidth || dimsRef.current.width || BASE_WIDTH,
      ),
    );
    const initialHeight = Math.max(
      1,
      Math.round(
        rootRef.current?.offsetHeight || dimsRef.current.height || 750,
      ),
    );
    if (rootRef.current) {
      rootRef.current.style.opacity = "1";
      rootRef.current.style.transform = "none";
    }

    let raf = 0;
    let pauseTotal = 0;
    let pausedAt: number | null = null;
    let seekPaused = false;
    let seekTime = 0;

    const start = performance.now();
    const ranks = columnRanks(count, resolvedFeaturedIndex);

    const getLayout = () => {
      const current = dimsRef.current;
      return layoutFor(
        current.width || initialWidth,
        current.height || initialHeight,
        count,
        cardWidth,
        spread,
        radius,
      );
    };

    const applyCard = (
      index: number,
      state: {
        centerX: number;
        centerY: number;
        rotation: number;
        scale: number;
        width: number;
        height: number;
        radius: number;
        opacity: number;
        left: number;
        top: number;
        expanded: boolean;
        wideOpacity: number;
      },
    ) => {
      const el = cardElsRef.current[index];
      if (!el) return;
      el.style.width = `${state.width}px`;
      el.style.height = `${state.height}px`;
      el.style.borderRadius = `${state.radius}px`;
      el.style.opacity = state.opacity.toFixed(3);
      el.style.zIndex = String(
        index === resolvedFeaturedIndex
          ? 1000
          : 10 - Math.abs(index - (count - 1) / 2),
      );
      const expandImage = expandImgElsRef.current[index];
      if (expandImage) {
        expandImage.style.opacity = state.wideOpacity.toFixed(3);
      }

      if (state.expanded) {
        el.style.left = `${state.left}px`;
        el.style.top = `${state.top}px`;
        el.style.transform = "none";
        return;
      }

      el.style.left = "0px";
      el.style.top = "0px";
      el.style.transform = `translate3d(${(
        state.centerX -
        state.width / 2
      ).toFixed(2)}px, ${(state.centerY - state.height / 2).toFixed(
        2,
      )}px, 0) rotate(${state.rotation.toFixed(3)}deg) scale(${state.scale.toFixed(
        3,
      )})`;
    };

    const setCounter = (progress: number) => {
      const value = clamp(Math.round(progress), 0, 100);
      const text = String(value).padStart(3, "0");
      if (counterRef.current?.textContent !== text) {
        counterRef.current!.textContent = text;
      }
      const milestone =
        value >= 100
          ? 100
          : value >= 75
            ? 75
            : value >= 50
              ? 50
              : value >= 25
                ? 25
                : 0;
      if (milestone !== milestoneRef.current) {
        milestoneRef.current = milestone;
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = `${milestone}% loaded`;
        }
      }
    };

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setDone(true);
      onCompleteRef.current?.();
    };

    const setRootExit = (time: number, liftStart: number) => {
      const exitStart = liftStart + EXIT_DELAY;
      if (time < exitStart) {
        if (rootRef.current) {
          rootRef.current.style.opacity = "1";
          rootRef.current.style.transform = "none";
        }
        return false;
      }
      if (!exitStartedRef.current) {
        exitStartedRef.current = true;
        if (oncePerSession) writeSessionFlag();
      }
      if (exit === "fade") {
        const progress = clamp01((time - exitStart) / FADE_DURATION);
        if (rootRef.current) {
          rootRef.current.style.opacity = (1 - progress).toFixed(4);
          rootRef.current.style.transform = "none";
        }
      } else {
        const progress = slideUpEase(
          clamp01((time - exitStart) / SLIDE_DURATION),
        );
        if (rootRef.current) {
          rootRef.current.style.opacity = "1";
          rootRef.current.style.transform = `translate3d(0, ${(
            -100 * progress
          ).toFixed(3)}%, 0)`;
        }
      }
      return true;
    };

    const totalFor = (liftStart: number) =>
      liftStart +
      EXIT_DELAY +
      (exit === "fade" ? FADE_DURATION : SLIDE_DURATION);

    const renderReduced = (time: number) => {
      const layout = getLayout();
      const entered = time >= 0.6;
      if (rootRef.current) {
        rootRef.current.style.opacity = entered
          ? (1 - clamp01((time - 0.6) / 0.4)).toFixed(3)
          : "1";
        rootRef.current.style.transform = "none";
      }
      if (labelRef.current) labelRef.current.style.opacity = "1";
      if (counterRef.current) {
        counterRef.current.style.opacity = "1";
        counterRef.current.style.color = resolvedTextColor;
      }
      setCounter(100);
      items.forEach((_, index) => {
        const slot = fanSlot(layout, index);
        applyCard(index, {
          centerX: slot.x,
          centerY: slot.y,
          rotation: slot.rotation,
          scale: 1,
          width: layout.cardWidth,
          height: layout.cardHeight,
          radius: layout.radius,
          opacity: 1,
          left: 0,
          top: 0,
          expanded: false,
          wideOpacity: 0,
        });
      });
      if (time >= 1 && !seekPaused) finish();
    };

    const renderAt = (time: number, previewMode = false) => {
      const layout = getLayout();
      const riseScale = layout.height / 750;
      const liftStart =
        mode === "timed"
          ? timedLiftStart
          : liftAtRef.current == null
            ? Number.POSITIVE_INFINITY
            : liftAtRef.current;
      const liftProgress = Number.isFinite(liftStart)
        ? easeOutCubic(clamp01((time - liftStart) / LIFT_DURATION))
        : 0;
      const expandStart = liftStart + EXPAND_DELAY;
      const expandProgress =
        time >= expandStart ? expandValue(time - expandStart) : 0;

      if (fadeOnly) {
        renderReduced(time);
        return;
      }

      let progress = counterValue(time, duration);
      if (mode === "pageLoad") {
        progress = Math.min(progress, loadFractionRef.current * 100);
        if (
          liftAtRef.current == null &&
          progress >= 99.999 &&
          time >= FAN_END
        ) {
          liftAtRef.current = Math.max(timedLiftStart, time);
        }
      }
      if (!seekPaused) {
        progress = Math.max(prevProgressRef.current, progress);
      }
      prevProgressRef.current = progress;
      setCounter(progress);

      const revealRaw = (time - RISE_START) / 0.37;
      const revealClamped = clamp(revealRaw, 0, 1);
      const reveal = easeOutCubic(revealClamped);
      let uiOpacity = 0.3 + 0.7 * reveal;
      let counterColor = resolvedTextColor;
      if (Number.isFinite(liftStart) && time >= liftStart) {
        const fade = clamp01((time - liftStart) / 0.36);
        uiOpacity *= 1 - fade;
        counterColor = mixColor(
          resolvedTextColor,
          resolvedMutedColor,
          Math.min(1, fade * 1.8),
        );
      }
      if (labelRef.current)
        labelRef.current.style.opacity = uiOpacity.toFixed(3);
      if (counterRef.current) {
        counterRef.current.style.opacity = uiOpacity.toFixed(3);
        counterRef.current.style.color = counterColor;
      }

      const liftY = 115 * liftProgress;
      const fanLiftScale = 1 + 0.09 * liftProgress;
      const fanLiftY = 70 * liftProgress;
      const fanDim = lerp(1, 0.48, liftProgress);
      const fanExpandDim =
        time >= expandStart
          ? lerp(fanDim, 0.15, clamp01((time - expandStart) / 0.5))
          : fanDim;
      const waveDelay = RIPPLE_DELAY / Math.max(1, waveCount);
      const amplitude = layout.cardHeight * 0.127 * rippleIntensity;
      const rippleStop = Number.isFinite(liftStart)
        ? 1 - clamp01((time - (liftStart - 0.08)) / 0.08)
        : 1;

      items.forEach((_, index) => {
        const slot = fanSlot(layout, index);
        let centerX = slot.x;
        let centerY = slot.y;
        let rotation = slot.rotation;
        let scale = 1;
        let width = layout.cardWidth;
        let height = layout.cardHeight;
        let cardRadius = layout.radius;
        let opacity = 1;
        let left = 0;
        let top = 0;
        let expanded = false;
        let wideOpacity = 0;

        if (time < RISE_END) {
          const topEdge = interpolateStops(RISE_TOP_STOPS, time) * riseScale;
          const featuredCenter = topEdge + layout.cardHeight / 2;
          centerX = layout.cx;
          centerY =
            featuredCenter + (ranks.get(index) ?? 0) * (layout.cardHeight + 4);
          rotation = 0;
        } else if (time < COLLAPSE_END) {
          const topEdge =
            interpolateStops(RISE_TOP_STOPS, RISE_END) * riseScale;
          const featuredCenter = topEdge + layout.cardHeight / 2;
          const fromY =
            featuredCenter + (ranks.get(index) ?? 0) * (layout.cardHeight + 4);
          const collapse = easeOutCubic(
            (time - RISE_END) / (COLLAPSE_END - RISE_END),
          );
          centerX = layout.cx;
          centerY = lerp(
            fromY,
            layout.apexY + (ranks.get(index) ?? 0) * 2,
            collapse,
          );
          rotation = 0;
        } else if (time < FAN_END) {
          const pileY = layout.apexY + (ranks.get(index) ?? 0) * 2;
          const local = time - (COLLAPSE_END + Math.abs(slot.k) * 0.02);
          const spring = springResponse(local);
          centerX = lerp(layout.cx, slot.x, spring);
          centerY = lerp(pileY, slot.y, spring);
          rotation = lerp(0, slot.rotation, spring);
        }

        if (index !== resolvedFeaturedIndex && time >= liftStart + 0.001) {
          const lifted = fanSlot(layout, index, fanLiftScale, fanLiftY);
          centerX = lerp(centerX, lifted.x, liftProgress);
          centerY = lerp(centerY, lifted.y, liftProgress);
          opacity = lerp(1, fanExpandDim, liftProgress);
        }

        if (time >= RIPPLE_START && time < liftStart) {
          centerY += rippleBob(time, index, amplitude, waveDelay) * rippleStop;
        }

        if (index === resolvedFeaturedIndex) {
          opacity = 1;
          if (time >= liftStart) {
            centerX = slot.x;
            centerY = slot.y - liftY;
            scale = 1 + 0.14 * liftProgress;
            rotation = 0;
          }
          if (time >= expandStart) {
            expanded = true;
            const startWidth = layout.cardWidth * 1.14;
            const startHeight = layout.cardHeight * 1.14;
            const startLeft = slot.x - startWidth / 2;
            const startTop = slot.y - 115 - startHeight / 2;
            const heightFromWidth = layout.width / EXPAND_ASPECT;
            const targetWidth =
              heightFromWidth >= layout.height
                ? layout.width
                : layout.height * EXPAND_ASPECT;
            const targetHeight =
              heightFromWidth >= layout.height
                ? heightFromWidth
                : layout.height;
            const targetLeft = (layout.width - targetWidth) / 2;
            const targetTop = (layout.height - targetHeight) / 2;
            width = lerp(startWidth, targetWidth, expandProgress);
            height = lerp(startHeight, targetHeight, expandProgress);
            left = lerp(startLeft, targetLeft, expandProgress);
            top = lerp(startTop, targetTop, expandProgress);
            cardRadius = lerp(layout.radius, 0, expandProgress);
            wideOpacity = clamp01(expandProgress * 4);
          }
        }

        applyCard(index, {
          centerX,
          centerY,
          rotation,
          scale,
          width,
          height,
          radius: cardRadius,
          opacity: previewMode ? 1 : opacity,
          left,
          top,
          expanded,
          wideOpacity,
        });
      });

      const exited = setRootExit(time, liftStart);
      if (
        exited &&
        time >= totalFor(liftStart) &&
        !seekPaused &&
        !previewMode
      ) {
        finish();
      }
    };

    if (preview) {
      renderAt(previewTime, true);
      return;
    }

    const seekTo = (time: number) => {
      const target = Math.max(0, time);
      if (target < timedLiftStart + EXIT_DELAY) {
        exitStartedRef.current = false;
        if (rootRef.current) {
          rootRef.current.style.opacity = "1";
          rootRef.current.style.transform = "none";
        }
      }
      seekPaused = true;
      seekTime = target;
      renderAt(target);
      return new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          renderAt(seekTime);
          window.requestAnimationFrame(() => {
            renderAt(seekTime);
            resolve();
          });
        });
      });
    };
    seekRef.current = seekTo;

    type TimelineWindow = Window & {
      __preloaderV4Seek?: (time: number) => Promise<void>;
      __preloaderV4Timeline?: {
        duration: number;
        liftStart: number;
        expandStart: number;
        exitStart: number;
        total: number;
        featuredIndex: number;
        cardWidth: number;
        cardHeight: number;
        fanRadius: number;
        counterAt: (time: number) => number;
        fanAt: (index: number) => { x: number; y: number; rotation: number };
      };
    };
    const timelineWindow = window as TimelineWindow;
    timelineWindow.__preloaderV4Seek = seekTo;
    timelineWindow.__preloaderV4Timeline = {
      duration,
      liftStart: timedLiftStart,
      expandStart: timedLiftStart + EXPAND_DELAY,
      exitStart: timedLiftStart + EXIT_DELAY,
      total: totalFor(timedLiftStart),
      featuredIndex: resolvedFeaturedIndex,
      cardWidth: getLayout().cardWidth,
      cardHeight: getLayout().cardHeight,
      fanRadius: getLayout().fanRadius,
      counterAt: (time: number) => counterValue(time, duration),
      fanAt: (index: number) => {
        const slot = fanSlot(getLayout(), index);
        return { x: slot.x, y: slot.y, rotation: slot.rotation };
      },
    };

    const onVisibility = () => {
      if (document.hidden) {
        pausedAt = performance.now();
      } else if (pausedAt != null) {
        pauseTotal += performance.now() - pausedAt;
        pausedAt = null;
        if (!seekPaused) raf = window.requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const frame = (now: number) => {
      if (seekPaused || pausedAt != null || completedRef.current) return;
      const elapsed = Math.max(0, (now - start - pauseTotal) / 1000);
      renderAt(elapsed);
      if (!completedRef.current) {
        raf = window.requestAnimationFrame(frame);
      }
    };
    raf = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      if (timelineWindow.__preloaderV4Seek === seekTo) {
        delete timelineWindow.__preloaderV4Seek;
      }
      if (timelineWindow.__preloaderV4Timeline) {
        delete timelineWindow.__preloaderV4Timeline;
      }
    };
  }, [
    preview,
    previewTime,
    skip,
    booted,
    done,
    runKey,
    imageKey,
    items,
    mode,
    duration,
    timedLiftStart,
    exit,
    cardWidth,
    spread,
    radius,
    rippleIntensity,
    waveCount,
    count,
    resolvedFeaturedIndex,
    fadeOnly,
    resolvedTextColor,
    resolvedMutedColor,
    oncePerSession,
  ]);

  if (skip || (done && !preview)) {
    return null;
  }

  const fallbackLayout = layoutFor(
    BASE_WIDTH,
    750,
    count,
    cardWidth,
    spread,
    radius,
  );

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-slot="editorial-card-arc-preloader"
      data-theme-scheme={scheme}
      data-phase={done ? "done" : booted ? "loading" : "booting"}
      className={cn(className)}
      style={{
        position: preview ? "absolute" : "fixed",
        inset: 0,
        zIndex: preview ? 1 : 99999,
        background: resolvedBackground,
        color: resolvedTextColor,
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <span ref={liveRegionRef} style={SR_ONLY}>
        0% loaded
      </span>

      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      >
        {items.map((item, index) => (
          <div
            key={`${index}-${item.src}`}
            data-card-index={index}
            data-featured={index === resolvedFeaturedIndex ? "true" : undefined}
            ref={(el) => {
              cardElsRef.current[index] = el;
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: fallbackLayout.cardWidth,
              height: fallbackLayout.cardHeight,
              overflow: "hidden",
              borderRadius: fallbackLayout.radius,
              boxShadow: cardShadow,
              opacity: 0,
              willChange:
                index === resolvedFeaturedIndex
                  ? "transform, opacity, left, top, width, height"
                  : "transform, opacity",
              backfaceVisibility: "hidden",
              transformOrigin: "center center",
            }}
          >
            <img
              src={item.src}
              alt={item.title ?? ""}
              draggable={false}
              decoding="async"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
                userSelect: "none",
              }}
            />
            {index === resolvedFeaturedIndex && item.expandSrc ? (
              <img
                ref={(el) => {
                  expandImgElsRef.current[index] = el;
                }}
                data-expand-image="true"
                src={item.expandSrc}
                alt=""
                draggable={false}
                decoding="async"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center center",
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
            ) : null}
          </div>
        ))}

        <div
          ref={labelRef}
          style={{
            position: "absolute",
            left: 28,
            top: 25,
            fontSize: 12.5,
            lineHeight: 1,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 500,
            fontFamily: labelFont,
            color: resolvedMutedColor,
            opacity: 0.3,
            zIndex: 1200,
          }}
        >
          {label}
        </div>

        <div
          ref={counterRef}
          style={{
            position: "absolute",
            left: 28,
            bottom: counterBottom,
            fontFamily: counterFont,
            fontWeight: 400,
            fontSize: counterSize,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: resolvedTextColor,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
            opacity: 0.3,
            zIndex: 1200,
          }}
        >
          000
        </div>
      </div>
    </div>
  );
});

export default PreloaderProV4;
