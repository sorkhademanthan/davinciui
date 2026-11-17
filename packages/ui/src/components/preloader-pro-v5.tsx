"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type PreloaderProV5RevealStyle = "lift" | "split" | "iris";
export type PreloaderProV5ImageFit = "cover" | "contain";
export type PreloaderProV5Theme = "light" | "dark" | "auto";

export interface PreloaderProV5Image {
  src: string;
  expandSrc?: string;
  alt?: string;
  position?: string;
}

export interface PreloaderProV5Props {
  logo?: React.ReactNode;
  brandName?: string;
  introText?: string;
  theme?: PreloaderProV5Theme;
  fontFamily?: string;
  textColor?: string;
  imageTextColor?: string;
  images?: ReadonlyArray<PreloaderProV5Image | string>;
  imageCount?: number;
  imageWidth?: number;
  imageHeight?: number;
  imageRadius?: number;
  imageFit?: PreloaderProV5ImageFit;
  imagePosition?: string;
  backgroundColor?: string;
  overlayColor?: string;
  cardBackground?: string;
  titleSize?: number | string;
  introTextSize?: number | string;
  imageGap?: number;
  arcRadius?: number;
  animationDuration?: number;
  staggerDelay?: number;
  cardMovementSpeed?: number;
  transitionDuration?: number;
  animationEasing?: string;
  revealStyle?: PreloaderProV5RevealStyle;
  playOnEveryLoad?: boolean;
  playOncePerSession?: boolean;
  disableScrollDuringPlayback?: boolean;
  onComplete?: () => void;
  skipPreloader?: boolean;
  featuredIndex?: number;
  zIndex?: number;
  preview?: boolean;
  previewTime?: number;
  sessionKey?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface PreloaderProV5Handle {
  replay: () => void;
  skip: () => void;
  seek: (time: number) => Promise<void>;
}

export const DEFAULT_PRELOADER_PRO_V5_IMAGES: PreloaderProV5Image[] = [
  {
    src: "/images/spiral-3d-slider/crimson-profile.webp",
    alt: "Portrait in crimson light",
  },
  {
    src: "/images/spiral-3d-slider/blue-double.webp",
    alt: "Two figures in blue light",
  },
  {
    src: "/images/spiral-3d-slider/prism-portrait.webp",
    alt: "Portrait under prismatic light",
  },
  {
    src: "/images/spiral-3d-slider/red-echo.webp",
    expandSrc: "/images/spiral-3d-slider/red-echo-16x9.webp",
    alt: "Close portrait in red light",
  },
  {
    src: "/images/spiral-3d-slider/green-portrait.webp",
    alt: "Portrait in green light",
  },
  {
    src: "/images/spiral-3d-slider/orange-haze.webp",
    alt: "Portrait in warm orange haze",
  },
  {
    src: "/images/spiral-3d-slider/ghosted-portrait.webp",
    alt: "Motion-blurred portrait",
  },
  {
    src: "/images/spiral-3d-slider/visor-portrait.webp",
    alt: "Portrait wearing a visor",
  },
];

const SESSION_KEY = "preloader-pro-v5-shown";

const THEME_DEFAULTS = {
  light: {
    background: "#ECECEA",
    text: "#111111",
    card: "#d8d5cf",
    overlay: "rgba(7, 7, 7, 0.22)",
  },
  dark: {
    background: "#0B0B0A",
    text: "#F1EEE8",
    card: "#23211E",
    overlay: "rgba(0, 0, 0, 0.38)",
  },
} as const;

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

function useColorScheme(mode: PreloaderProV5Theme): "light" | "dark" {
  const [scheme, setScheme] = React.useState<"light" | "dark">(() =>
    mode === "auto" ? "dark" : mode,
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
const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const easeOutCubic = (value: number) => {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
};

const easeInCubic = (value: number) => {
  const t = clamp01(value);
  return t * t * t;
};

const easeInOutCubic = (value: number) => {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

function resolveEasing(value: string) {
  const easing = value.trim().toLowerCase();
  if (easing === "linear") return (t: number) => clamp01(t);
  if (easing === "ease-in") return easeInCubic;
  if (easing === "ease-out") return easeOutCubic;
  if (easing === "ease-in-out") return easeInOutCubic;
  if (easing === "ease") return cubicBezier(0.25, 0.1, 0.25, 1);
  const match = easing.match(
    /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/,
  );
  if (match) {
    return cubicBezier(
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
      Number(match[4]),
    );
  }
  return cubicBezier(0.22, 1, 0.36, 1);
}

function readSessionFlag(key: string) {
  try {
    return (
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(key) === "1"
    );
  } catch {
    return false;
  }
}

function writeSessionFlag(key: string) {
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* storage blocked — ignore */
  }
}

function normalizeImages(
  source: ReadonlyArray<PreloaderProV5Image | string> | undefined,
) {
  if (!source || source.length === 0) return DEFAULT_PRELOADER_PRO_V5_IMAGES;
  return source.map((item) =>
    typeof item === "string" ? { src: item } : item,
  );
}

function imageKeyFor(images: PreloaderProV5Image[]) {
  return images
    .map(
      (image) =>
        `${image.src}::${image.expandSrc ?? ""}::${image.position ?? ""}`,
    )
    .join("|");
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    if (!src) {
      resolve();
      return;
    }
    const image = new window.Image();
    image.decoding = "async";
    const done = () => resolve();
    image.onload = () => {
      if (typeof image.decode === "function") {
        image.decode().then(done, done);
      } else {
        done();
      }
    };
    image.onerror = done;
    image.src = src;
  });
}

function isImageSource(value: React.ReactNode) {
  return (
    typeof value === "string" &&
    (value.startsWith("/") ||
      value.startsWith("http") ||
      /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(value))
  );
}

interface ArcSlot {
  angle: number;
  x: number;
  y: number;
  rotation: number;
  yaw: number;
  z: number;
  scale: number;
}

interface ArcLayout {
  width: number;
  height: number;
  cardWidth: number;
  cardHeight: number;
  radius: number;
  centerX: number;
  circleY: number;
  slots: ArcSlot[];
  featuredIndex: number;
  mobile: boolean;
  tablet: boolean;
  splitGap: number;
}

function computeLayout(
  width: number,
  height: number,
  count: number,
  options: {
    imageWidth: number;
    imageHeight: number;
    arcRadius: number;
    imageGap: number;
    featuredIndex: number;
  },
): ArcLayout {
  const mobile = width < 640;
  const tablet = width >= 640 && width < 1024;

  const scale = mobile
    ? clamp(width / 780, 0.42, 0.64)
    : tablet
      ? clamp(width / 1400, 0.6, 0.85)
      : clamp(width / 1440, 0.72, 1.14);

  const cardWidth = Math.max(58, options.imageWidth * scale);
  const cardHeight = Math.max(72, options.imageHeight * scale);

  const radius = mobile
    ? clamp(width * 0.62, 190, 300)
    : tablet
      ? clamp(width * 0.55, 360, 620)
      : clamp(
          options.arcRadius * (height / 800),
          height * 0.62,
          Math.min(height * 1.05, width * 0.76),
        );

  const centerX = width / 2;
  const circleY = mobile ? height * 0.98 : tablet ? height : height * 1.18;
  const startAngle = mobile ? 202 : tablet ? 196 : 188;
  const endAngle = mobile ? 338 : tablet ? 344 : 352;
  const span = endAngle - startAngle;
  const gapAngle = (options.imageGap / Math.max(1, radius)) * (180 / Math.PI);
  const usableSpan = Math.max(0, span - gapAngle * Math.max(0, count - 1));
  const step = count > 1 ? usableSpan / (count - 1) : 0;
  const featured = clamp(
    options.featuredIndex,
    0,
    Math.max(0, count - 1),
  );

  const slots: ArcSlot[] = [];
  for (let index = 0; index < count; index += 1) {
    const angle = startAngle + index * (step + gapAngle);
    const radians = (angle * Math.PI) / 180;
    const distance = Math.sin(radians);
    slots.push({
      angle,
      x: centerX + radius * Math.cos(radians),
      y: circleY + radius * distance,
      rotation: (angle - 270) * 0.3,
      yaw: -Math.cos(radians) * 9,
      z: 20 + Math.round(16 * Math.sin(radians - Math.PI / 2)),
      scale: 1 - Math.abs(index - (count - 1) / 2) * 0.012,
    });
  }

  return {
    width,
    height,
    cardWidth,
    cardHeight,
    radius,
    centerX,
    circleY,
    slots,
    featuredIndex: featured,
    mobile,
    tablet,
    splitGap: clamp(height * 0.017, mobile ? 8 : 10, 22),
  };
}

export const PreloaderProV5 = React.forwardRef<
  PreloaderProV5Handle,
  PreloaderProV5Props
>(function PreloaderProV5(
  {
    logo,
    brandName = "DaVinci UI",
    introText = "Every interface, considered.",
    theme = "auto",
    fontFamily = "var(--font-sans), 'Inter Display', Inter, system-ui, sans-serif",
    textColor: textColorProp,
    imageTextColor = "#ffffff",
    images: imagesProp,
    imageCount = 7,
    imageWidth = 240,
    imageHeight = 320,
    imageRadius = 10,
    imageFit = "cover",
    imagePosition = "50% 50%",
    backgroundColor: backgroundColorProp,
    overlayColor: overlayColorProp,
    cardBackground: cardBackgroundProp,
    titleSize = "clamp(2rem, 8.5vw, 8rem)",
    introTextSize = "clamp(1.6rem, 5.6vw, 5.2rem)",
    imageGap = 26,
    arcRadius = 720,
    animationDuration = 7.4,
    staggerDelay = 0.09,
    cardMovementSpeed = 1,
    transitionDuration = 1.05,
    animationEasing = "cubic-bezier(0.22, 1, 0.36, 1)",
    revealStyle = "split",
    playOnEveryLoad = true,
    playOncePerSession = false,
    disableScrollDuringPlayback = true,
    onComplete,
    skipPreloader = false,
    featuredIndex = 3,
    zIndex = 99999,
    preview = false,
    previewTime = 5,
    sessionKey = SESSION_KEY,
    className,
    style,
  },
  ref,
) {
  const images = normalizeImages(imagesProp);
  const imageKey = imageKeyFor(images);
  const isSessionBound = playOncePerSession || !playOnEveryLoad;

  const scheme = useColorScheme(theme);
  const palette = THEME_DEFAULTS[scheme];
  const textColor = textColorProp ?? palette.text;
  const backgroundColor = backgroundColorProp ?? palette.background;
  const cardBackground = cardBackgroundProp ?? palette.card;
  const overlayColor = overlayColorProp ?? palette.overlay;

  const [active, setActive] = React.useState(!skipPreloader);
  const [assetsReady, setAssetsReady] = React.useState(false);
  const [runKey, setRunKey] = React.useState(0);
  const [failedImages, setFailedImages] = React.useState<
    Record<string, boolean>
  >({});
  const [reducedMotion, setReducedMotion] = React.useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const rootRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const featureRef = React.useRef<HTMLDivElement>(null);
  const expandImageRef = React.useRef<HTMLImageElement>(null);
  const scrimRef = React.useRef<HTMLDivElement>(null);
  const splitTopRef = React.useRef<HTMLDivElement>(null);
  const splitBottomRef = React.useRef<HTMLDivElement>(null);
  const exitTopRef = React.useRef<HTMLDivElement>(null);
  const exitBottomRef = React.useRef<HTMLDivElement>(null);
  const exitTopImageRef = React.useRef<HTMLImageElement>(null);
  const exitBottomImageRef = React.useRef<HTMLImageElement>(null);
  const introRef = React.useRef<HTMLDivElement>(null);
  const arcTitleRef = React.useRef<HTMLDivElement>(null);
  const imageTitleRef = React.useRef<HTMLDivElement>(null);
  const introCharsRef = React.useRef<Array<HTMLSpanElement | null>>([]);
  const titleCharsRef = React.useRef<Array<HTMLSpanElement | null>>([]);
  const imageTitleCharsRef = React.useRef<Array<HTMLSpanElement | null>>([]);
  const liveRef = React.useRef<HTMLSpanElement>(null);
  const dimsRef = React.useRef({ width: 0, height: 0 });
  const completedRef = React.useRef(false);
  const sessionWrittenRef = React.useRef(false);
  const onCompleteRef = React.useRef(onComplete);
  const skipRef = React.useRef<() => void>(() => {});
  const seekRef = React.useRef<(time: number) => Promise<void>>(
    () => Promise.resolve(),
  );
  const phaseRef = React.useRef("");

  onCompleteRef.current = onComplete;

  const counts = React.useMemo(
    () => ({
      responsiveMax: 5,
      wanted: Math.max(1, Math.min(imageCount, images.length)),
    }),
    [imageCount, images.length],
  );

  const cards = React.useMemo(() => {
    const total = Math.max(1, counts.wanted);
    const result: PreloaderProV5Image[] = [];
    for (let index = 0; index < total; index += 1) {
      result.push(images[index % images.length]!);
    }
    return result;
  }, [counts.wanted, images]);

  const [cardCount, setCardCount] = React.useState(() =>
    Math.min(cards.length, 7),
  );

  React.useEffect(() => {
    const update = () => {
      const width =
        rootRef.current?.offsetWidth ||
        (typeof window !== "undefined" ? window.innerWidth : 1200);
      const mobile = width < 640;
      const tablet = width >= 640 && width < 1024;
      const responsiveMax = mobile ? counts.responsiveMax : tablet ? 6 : 7;
      setCardCount(Math.max(1, Math.min(cards.length, responsiveMax)));
    };
    update();
    const observer =
      typeof ResizeObserver !== "undefined" && rootRef.current
        ? new ResizeObserver(update)
        : null;
    if (observer && rootRef.current) observer.observe(rootRef.current);
    window.addEventListener("resize", update, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [cards.length, counts.responsiveMax]);

  const sourceFeatured = clamp(
    featuredIndex,
    0,
    Math.max(0, cards.length - 1),
  );
  const visibleCount = Math.max(1, Math.min(cardCount, cards.length));
  const visibleStart = clamp(
    sourceFeatured - Math.floor(visibleCount / 2),
    0,
    Math.max(0, cards.length - visibleCount),
  );
  const visibleCards = cards.slice(visibleStart, visibleStart + visibleCount);
  const resolvedFeatured = clamp(
    sourceFeatured - visibleStart,
    0,
    Math.max(0, visibleCards.length - 1),
  );
  const featuredCard = visibleCards[resolvedFeatured] ?? visibleCards[0];
  const splitSrc = featuredCard?.expandSrc ?? featuredCard?.src ?? "";
  const cardsRef = React.useRef(visibleCards);
  cardsRef.current = visibleCards;

  const introCharacters = React.useMemo(
    () => Array.from(introText),
    [introText],
  );
  const titleCharacters = React.useMemo(
    () => Array.from(brandName),
    [brandName],
  );

  const finish = React.useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setActive(false);
    onCompleteRef.current?.();
  }, []);

  skipRef.current = () => {
    finish();
  };

  React.useImperativeHandle(
    ref,
    () => ({
      replay: () => {
        completedRef.current = false;
        setActive(true);
        setRunKey((value) => value + 1);
      },
      skip: finish,
      seek: (time: number) => seekRef.current(time),
    }),
    [finish],
  );

  React.useLayoutEffect(() => {
    if (preview) return;
    if (skipPreloader) {
      setActive(false);
      onCompleteRef.current?.();
      return;
    }
    if (isSessionBound && readSessionFlag(sessionKey)) {
      setActive(false);
      onCompleteRef.current?.();
    }
  }, [isSessionBound, preview, sessionKey, skipPreloader]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    if (!active || preview) {
      setAssetsReady(false);
      return;
    }
    let cancelled = false;
    setAssetsReady(false);
    setFailedImages({});
    const sources = new Set<string>();
    cardsRef.current.forEach((card) => {
      if (card.src) sources.add(card.src);
      if (card.expandSrc) sources.add(card.expandSrc);
    });
    const timeout = window.setTimeout(() => {
      if (!cancelled) setAssetsReady(true);
    }, 1400);
    Promise.allSettled(Array.from(sources).map(preloadImage)).then(() => {
      if (cancelled) return;
      window.clearTimeout(timeout);
      setAssetsReady(true);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [active, imageKey, preview, runKey]);

  React.useEffect(() => {
    if (!active || preview || !disableScrollDuringPlayback) return;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousOverscroll = body.style.overscrollBehavior;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    if (scrollbar > 0) {
      const current = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbar}px`;
    }
    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousOverscroll;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [active, disableScrollDuringPlayback, preview, runKey]);

  React.useEffect(() => {
    if (preview) return;
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, finish, preview]);

  React.useEffect(() => {
    if (preview) {
      const root = rootRef.current;
      if (root) {
        dimsRef.current = {
          width: root.offsetWidth || 1200,
          height: root.offsetHeight || 750,
        };
      }
      return;
    }
    const root = rootRef.current;
    if (root) {
      dimsRef.current = {
        width: root.offsetWidth || window.innerWidth,
        height: root.offsetHeight || window.innerHeight,
      };
    }
    const observer =
      typeof ResizeObserver !== "undefined" && root
        ? new ResizeObserver(() => {
            if (!root) return;
            dimsRef.current = {
              width: root.offsetWidth || window.innerWidth,
              height: root.offsetHeight || window.innerHeight,
            };
          })
        : null;
    if (observer && root) observer.observe(root);
    return () => observer?.disconnect();
  }, [preview]);

  React.useEffect(() => {
    if (!active) return;

    const root = rootRef.current;
    if (!root) return;

    if (!dimsRef.current.width || !dimsRef.current.height) {
      dimsRef.current = {
        width: root.offsetWidth || window.innerWidth,
        height: root.offsetHeight || window.innerHeight,
      };
    }

    if (!preview && isSessionBound && !sessionWrittenRef.current) {
      writeSessionFlag(sessionKey);
      sessionWrittenRef.current = true;
    }

    const items = cardsRef.current.slice(0, cardCount);
    const easing = resolveEasing(animationEasing);
    const total = Math.max(2.4, animationDuration);
    const exitDuration = Math.max(0.25, transitionDuration);
    const entryStart = total * 0.41;
    const entryDuration = clamp(
      (total * 0.18) / Math.max(0.25, cardMovementSpeed),
      0.45,
      total * 0.3,
    );
    const convergeStart = total * 0.72;
    const convergeEnd = total * 0.78;
    const expandStart = convergeEnd;
    const expandEnd = total * 0.96;
    const expandInsetPoint = 0.55;
    const titleOverImageStart = expandStart + (expandEnd - expandStart) * 0.24;
    const splitStart = expandEnd;
    const splitEnd = total * 0.995;
    const revealStart = total;

    const layout = () =>
      computeLayout(
        dimsRef.current.width || 1200,
        dimsRef.current.height || 750,
        items.length,
        {
          imageWidth,
          imageHeight,
          arcRadius,
          imageGap,
          featuredIndex: resolvedFeatured,
        },
      );

    let raf = 0;
    let pausedAt: number | null = null;
    let pauseTotal = 0;
    let seekPaused = false;
    let seekTime = 0;
    const started =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    const setPhase = (phase: string) => {
      if (phaseRef.current === phase) return;
      phaseRef.current = phase;
      if (rootRef.current) rootRef.current.dataset.phase = phase;
      if (liveRef.current) {
        if (phase === "image") liveRef.current.textContent = "Revealing image";
        else if (phase === "exit") liveRef.current.textContent = "Revealing page";
        else if (phase === "arc") liveRef.current.textContent = brandName;
        else if (phase === "intro") liveRef.current.textContent = introText;
      }
    };

    const setRootBase = () => {
      if (!rootRef.current) return;
      rootRef.current.style.opacity = "1";
      rootRef.current.style.transform = "none";
      rootRef.current.style.clipPath = "none";
      rootRef.current.style.backgroundColor = backgroundColor;
    };

    const applyCard = (
      index: number,
      state: {
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
        yaw: number;
        scale: number;
        opacity: number;
        z: number;
        radius: number;
      },
    ) => {
      const element = cardRefs.current[index];
      if (!element) return;
      element.style.width = `${state.width.toFixed(2)}px`;
      element.style.height = `${state.height.toFixed(2)}px`;
      element.style.borderRadius = `${state.radius.toFixed(2)}px`;
      element.style.opacity = state.opacity.toFixed(3);
      element.style.zIndex = String(state.z);
      element.style.transform = `translate3d(${(
        state.x -
        state.width / 2
      ).toFixed(2)}px, ${(state.y - state.height / 2).toFixed(2)}px, 0) rotateY(${state.yaw.toFixed(
        3,
      )}deg) rotateZ(${state.rotation.toFixed(3)}deg) scale(${state.scale.toFixed(
        3,
      )})`;
    };

    const applyCharacters = (
      refs: React.MutableRefObject<Array<HTMLSpanElement | null>>,
      characters: string[],
      time: number,
      revealStartTime: number,
      span: number,
      entering: boolean,
      hiddenAtStart: boolean,
    ) => {
      const count = characters.length;
      if (count === 0) return;
      const duration = Math.max(0.08, span * 0.5);
      const stagger = span * 0.5 / Math.max(1, count - 1);
      for (let index = 0; index < count; index += 1) {
        const element = refs.current[index];
        if (!element) continue;
        const localStart = revealStartTime + index * stagger;
        const progress = clamp01((time - localStart) / duration);
        if (entering) {
          if (hiddenAtStart && time < revealStartTime) {
            element.style.transform = "translate3d(0, 125%, 0)";
            element.style.opacity = "0";
          } else {
            const y = (1 - easeOutCubic(progress)) * 125;
            element.style.transform = `translate3d(0, ${y.toFixed(3)}%, 0)`;
            element.style.opacity = smoothstep(
              clamp01((progress - 0.22) / 0.62),
            ).toFixed(3);
          }
        } else {
          const y = -easeInCubic(progress) * 125;
          element.style.transform = `translate3d(0, ${y.toFixed(3)}%, 0)`;
        }
      }
    };

    const titleMixAt = (time: number) => {
      const progress = clamp01(
        (time - expandStart) / Math.max(0.001, expandEnd - expandStart),
      );
      return smoothstep(clamp01((progress - 0.25) / 0.45));
    };

    const applyTitleState = (time: number) => {
      applyCharacters(
        titleCharsRef,
        titleCharacters,
        time,
        total * 0.32,
        total * 0.14,
        true,
        true,
      );
      const mix = titleMixAt(time);
      if (arcTitleRef.current) {
        arcTitleRef.current.style.opacity = (1 - mix).toFixed(3);
        arcTitleRef.current.style.visibility =
          mix >= 0.999 ? "hidden" : "visible";
      }
      if (imageTitleRef.current) {
        imageTitleRef.current.style.opacity = mix.toFixed(3);
        imageTitleRef.current.style.visibility =
          mix <= 0.001 ? "hidden" : "visible";
      }
      if (mix > 0.001) {
        imageTitleCharsRef.current.forEach((element) => {
          if (element) element.style.transform = "translate3d(0, 0%, 0)";
        });
      }
    };

    const renderReduced = (time: number, now: number) => {
      const frameLayout = layout();
      setRootBase();
      if (arcTitleRef.current) {
        arcTitleRef.current.style.opacity = "1";
        arcTitleRef.current.style.visibility = "visible";
      }
      if (introRef.current) introRef.current.style.opacity = "0";
      applyCharacters(
        titleCharsRef,
        titleCharacters,
        total,
        total * 0.32,
        total * 0.14,
        true,
        true,
      );
      if (imageTitleRef.current) imageTitleRef.current.style.opacity = "0";
      if (featureRef.current) featureRef.current.style.opacity = "0";
      if (splitTopRef.current) splitTopRef.current.style.display = "none";
      if (splitBottomRef.current) splitBottomRef.current.style.display = "none";
      if (exitTopRef.current) exitTopRef.current.style.display = "none";
      if (exitBottomRef.current) exitBottomRef.current.style.display = "none";
      if (contentRef.current) contentRef.current.style.opacity = "1";

      frameLayout.slots.forEach((slot, index) => {
        if (index >= items.length) return;
        applyCard(index, {
          x: slot.x,
          y: slot.y,
          width: frameLayout.cardWidth,
          height: frameLayout.cardHeight,
          rotation: slot.rotation,
          yaw: slot.yaw,
          scale: slot.scale,
          opacity: 1,
          z: index === frameLayout.featuredIndex ? 1000 : slot.z,
          radius: imageRadius,
        });
      });

      const hold = 0.72;
      const fade = 0.32;
      const elapsed = (now - started) / 1000;
      const opacity = elapsed <= hold ? 1 : 1 - clamp01((elapsed - hold) / fade);
      if (rootRef.current) rootRef.current.style.opacity = opacity.toFixed(3);
      if (elapsed >= hold + fade) finish();
      setPhase(elapsed < hold ? "static" : "exit");
    };

    const renderAt = (time: number, previewMode = false) => {
      const frameLayout = layout();
      const currentLayout = frameLayout;
      const selected = currentLayout.featuredIndex;


      setRootBase();
      if (contentRef.current) contentRef.current.style.opacity = "1";

      const introInStart = total * 0.03;
      const introInSpan = total * 0.115;
      const introOutStart = total * 0.29;
      const introOutSpan = total * 0.065;

      const introInDuration = Math.max(0.08, introInSpan * 0.5);
      const introInStagger =
        (introInSpan * 0.5) / Math.max(1, introCharacters.length - 1);
      const introExit = easeInCubic(
        clamp01((time - introOutStart) / Math.max(0.001, introOutSpan)),
      );
      introCharacters.forEach((_, index) => {
        const element = introCharsRef.current[index];
        if (!element) return;
        const enter = clamp01(
          (time - (introInStart + index * introInStagger)) / introInDuration,
        );
        const y = (1 - easeOutCubic(enter)) * 125 - introExit * 125;
        element.style.transform = `translate3d(0, ${y.toFixed(3)}%, 0)`;
      });
      applyTitleState(time);

      if (introRef.current) {
        introRef.current.style.opacity =
          time < introOutStart + introOutSpan ? "1" : "0";
      }

      const orbitProgress = easeInOutCubic(
        clamp01((time - total * 0.6) / Math.max(0.001, total * 0.14)),
      );
      const orbit = orbitProgress * 4.5;

      items.forEach((_, index) => {
        const slot = currentLayout.slots[index] ?? currentLayout.slots[0]!;
        const entryBegin = entryStart + index * staggerDelay;
        const entry = clamp01((time - entryBegin) / entryDuration);
        const entered = easeOutCubic(entry);
        const startAngle = slot.angle - 58;
        const startRadians = (startAngle * Math.PI) / 180;
        const startX = currentLayout.centerX + currentLayout.radius * Math.cos(startRadians);
        const startY = currentLayout.circleY + currentLayout.radius * Math.sin(startRadians);
        const startRotation = (startAngle - 270) * 0.3;
        const startYaw = -Math.cos(startRadians) * 9;
        const orbitRadians = ((slot.angle + orbit) * Math.PI) / 180;
        const orbitX =
          currentLayout.centerX + currentLayout.radius * Math.cos(orbitRadians);
        const orbitY =
          currentLayout.circleY + currentLayout.radius * Math.sin(orbitRadians);
        const orbitRotation = (slot.angle + orbit - 270) * 0.3;
        const orbitYaw = -Math.cos(orbitRadians) * 9;

        let x = lerp(startX, orbitX, entered);
        let y = lerp(startY, orbitY, entered);
        let rotation = lerp(startRotation, orbitRotation, entered);
        let yaw = lerp(startYaw, orbitYaw, entered);
        let scale = lerp(0.8, slot.scale, entered);
        let opacity = smoothstep(clamp01(entry * 1.65));
        let z = index === selected ? 1000 : slot.z;
        const radius = imageRadius;

        if (time >= convergeStart) {
          const converge = easeInOutCubic(
            clamp01(
              (time - convergeStart) /
                Math.max(0.001, convergeEnd - convergeStart),
            ),
          );
          const targetX = currentLayout.centerX;
          const targetY = currentLayout.height / 2;
          if (index === selected) {
            x = lerp(x, targetX, converge);
            y = lerp(y, targetY, converge);
            rotation = lerp(rotation, 0, converge);
            yaw = lerp(yaw, 0, converge);
            scale = lerp(scale, 1.16, converge);
            opacity = 1;
            z = 1000;
          } else {
            x = lerp(x, targetX, converge);
            y = lerp(y, targetY, converge);
            rotation = lerp(rotation, 0, converge);
            yaw = lerp(yaw, 0, converge);
            scale = lerp(scale, 0.62, converge);
            opacity = lerp(opacity, 0, converge);
            z = 500 + index;
          }
        }

        const featureVisible = time >= expandStart;
        if (index === selected && featureVisible) opacity = 0;

        applyCard(index, {
          x,
          y,
          width: currentLayout.cardWidth,
          height: currentLayout.cardHeight,
          rotation,
          yaw,
          scale,
          opacity,
          z,
          radius,
        });
      });

      const feature = featureRef.current;
      const expandProgress = clamp01((time - expandStart) / Math.max(0.001, expandEnd - expandStart));
      const featureOn =
        time >= expandStart &&
        (revealStyle === "split" ? time <= revealStart : true);
      if (feature) {
        feature.style.display = featureOn ? "block" : "none";
        if (featureOn) {
          const startWidth = currentLayout.cardWidth * 1.16;
          const startHeight = currentLayout.cardHeight * 1.16;
          const startLeft = currentLayout.width / 2 - startWidth / 2;
          const startTop = currentLayout.height / 2 - startHeight / 2;
          const insetWidth = currentLayout.width * 0.8;
          const insetHeight = currentLayout.height * 0.84;
          const insetLeft = (currentLayout.width - insetWidth) / 2;
          const insetTop = (currentLayout.height - insetHeight) / 2;
          const insetRadius = clamp(imageRadius * 1.2, 10, 24);
          const eased = easeInOutCubic(expandProgress);
          let stage = clamp01(eased / expandInsetPoint);
          let left = lerp(startLeft, insetLeft, stage);
          let top = lerp(startTop, insetTop, stage);
          let width = lerp(startWidth, insetWidth, stage);
          let height = lerp(startHeight, insetHeight, stage);
          let radius = lerp(imageRadius, insetRadius, stage);
          if (eased > expandInsetPoint) {
            stage = clamp01(
              (eased - expandInsetPoint) / Math.max(0.001, 1 - expandInsetPoint),
            );
            left = lerp(insetLeft, 0, stage);
            top = lerp(insetTop, 0, stage);
            width = lerp(insetWidth, currentLayout.width, stage);
            height = lerp(insetHeight, currentLayout.height, stage);
            radius = lerp(insetRadius, 0, stage);
          }
          feature.style.left = `${left.toFixed(2)}px`;
          feature.style.top = `${top.toFixed(2)}px`;
          feature.style.width = `${width.toFixed(2)}px`;
          feature.style.height = `${height.toFixed(2)}px`;
          feature.style.borderRadius = `${radius.toFixed(2)}px`;
          feature.style.opacity = "1";
        } else {
          feature.style.opacity = "0";
        }
      }
      if (expandImageRef.current) {
        expandImageRef.current.style.opacity = smoothstep(
          clamp01((expandProgress - 0.38) / 0.42),
        ).toFixed(3);
      }
      if (scrimRef.current) {
        scrimRef.current.style.opacity = smoothstep(
          clamp01((expandProgress - 0.62) / 0.38),
        ).toFixed(3);
      }

      const splitProgress = clamp01(
        (time - splitStart) / Math.max(0.001, splitEnd - splitStart),
      );
      const splitOn = revealStyle === "split" && time >= splitStart;
      const splitEased = easeInOutCubic(splitProgress);
      const gap = currentLayout.splitGap * splitEased;
      const gapInset = currentLayout.height > 0 ? (gap / currentLayout.height) * 50 : 0;
      if (splitTopRef.current) {
        splitTopRef.current.style.display = splitOn ? "block" : "none";
        if (splitOn) {
          splitTopRef.current.style.clipPath = `inset(0 0 ${(50 + gapInset).toFixed(3)}% 0)`;
          splitTopRef.current.style.opacity = "1";
        }
      }
      if (splitBottomRef.current) {
        splitBottomRef.current.style.display = splitOn ? "block" : "none";
        if (splitOn) {
          splitBottomRef.current.style.clipPath = `inset(${(50 + gapInset).toFixed(3)}% 0 0 0)`;
          splitBottomRef.current.style.opacity = "1";
        }
      }

      const exitProgress = clamp01(
        (time - revealStart) / Math.max(0.001, exitDuration),
      );
      const exitEased = easing(exitProgress);
      const inExit = time >= revealStart;

      if (exitTopRef.current) {
        exitTopRef.current.style.display =
          inExit && revealStyle === "split" ? "block" : "none";
      }
      if (exitBottomRef.current) {
        exitBottomRef.current.style.display =
          inExit && revealStyle === "split" ? "block" : "none";
      }

      if (inExit) {
        if (revealStyle === "lift") {
          if (rootRef.current) {
            rootRef.current.style.transform = `translate3d(0, ${(-100 * exitEased).toFixed(3)}%, 0)`;
          }
          setPhase("exit");
        } else if (revealStyle === "iris") {
          const radius = lerp(145, 0, exitEased);
          if (rootRef.current) {
            rootRef.current.style.clipPath = `circle(${radius.toFixed(3)}% at 50% 50%)`;
          }
          setPhase("exit");
        } else {
          if (rootRef.current) {
            rootRef.current.style.backgroundColor = "transparent";
          }
          if (contentRef.current) contentRef.current.style.opacity = "0";
          const exitGap = currentLayout.splitGap;
          const topHeight = Math.max(0, (currentLayout.height - exitGap) / 2);
          const bottomTop = topHeight + exitGap;
          const bottomHeight = topHeight;
          if (exitTopRef.current) {
            exitTopRef.current.style.top = "0px";
            exitTopRef.current.style.height = `${topHeight}px`;
            exitTopRef.current.style.transform = `translate3d(0, ${(-100 * exitEased).toFixed(3)}%, 0)`;
            exitTopRef.current.style.clipPath = "none";
          }
          if (exitBottomRef.current) {
            exitBottomRef.current.style.top = `${bottomTop.toFixed(2)}px`;
            exitBottomRef.current.style.height = `${bottomHeight.toFixed(2)}px`;
            exitBottomRef.current.style.transform = `translate3d(0, ${(100 * exitEased).toFixed(3)}%, 0)`;
            exitBottomRef.current.style.clipPath = "none";
          }
          if (exitTopImageRef.current) {
            exitTopImageRef.current.style.width = `${currentLayout.width}px`;
            exitTopImageRef.current.style.height = `${currentLayout.height}px`;
            exitTopImageRef.current.style.top = "0px";
          }
          if (exitBottomImageRef.current) {
            exitBottomImageRef.current.style.width = `${currentLayout.width}px`;
            exitBottomImageRef.current.style.height = `${currentLayout.height}px`;
            exitBottomImageRef.current.style.top = `${(-bottomTop).toFixed(2)}px`;
          }
          setPhase("exit");
        }
        if (imageTitleRef.current) {
          imageTitleRef.current.style.opacity = (
            1 - clamp01(exitProgress / 0.28)
          ).toFixed(3);
        }
      } else if (time >= titleOverImageStart) {
        setPhase("image");
      } else if (time >= convergeStart) {
        setPhase("converge");
      } else if (time >= entryStart) {
        setPhase("arc");
      } else {
        setPhase("intro");
      }

      if (!previewMode && time >= revealStart + exitDuration) {
        finish();
      }
    };

    const renderPreview = () => {
      renderAt(previewTime, true);
      if (rootRef.current) {
        rootRef.current.style.opacity = "1";
        rootRef.current.style.transform = "none";
        rootRef.current.style.clipPath = "none";
      }
    };

    if (preview) {
      renderPreview();
      return;
    }

    if (!assetsReady && !reducedMotion) {
      return;
    }

    if (reducedMotion) {
      let reducedRaf = 0;
      const frame = (now: number) => {
        renderReduced(0, now);
        if (!completedRef.current) {
          reducedRaf = window.requestAnimationFrame(frame);
        }
      };
      reducedRaf = window.requestAnimationFrame(frame);
      return () => window.cancelAnimationFrame(reducedRaf);
    }

    const seekTo = (time: number) => {
      const target = Math.max(0, time);
      seekPaused = true;
      seekTime = target;
      if (time < revealStart) {
        setRootBase();
        if (contentRef.current) contentRef.current.style.opacity = "1";
      }
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
      __preloaderV5Seek?: (time: number) => Promise<void>;
      __preloaderV5Timeline?: {
        duration: number;
        revealStart: number;
        expandStart: number;
        total: number;
        featuredIndex: number;
        cardWidth: number;
        cardHeight: number;
        arcRadius: number;
        revealStyle: PreloaderProV5RevealStyle;
        run: number;
        cardAt: (index: number) => { x: number; y: number; rotation: number };
      };
    };
    const timelineWindow = window as TimelineWindow;
    timelineWindow.__preloaderV5Seek = seekTo;
    timelineWindow.__preloaderV5Timeline = {
      duration: total,
      revealStart,
      expandStart,
      total: total + exitDuration,
      featuredIndex: resolvedFeatured,
      cardWidth: layout().cardWidth,
      cardHeight: layout().cardHeight,
      arcRadius: layout().radius,
      revealStyle,
      run: runKey,
      cardAt: (index: number) => {
        const slot = layout().slots[index] ?? layout().slots[0]!;
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
      if (completedRef.current) return;
      if (seekPaused) return;
      if (pausedAt != null) return;
      const elapsed = Math.max(0, (now - started - pauseTotal) / 1000);
      renderAt(elapsed);
      if (!completedRef.current) {
        raf = window.requestAnimationFrame(frame);
      }
    };

    renderAt(0);
    raf = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      if (timelineWindow.__preloaderV5Seek === seekTo) {
        delete timelineWindow.__preloaderV5Seek;
      }
      if (timelineWindow.__preloaderV5Timeline) {
        delete timelineWindow.__preloaderV5Timeline;
      }
    };
  }, [
    active,
    animationDuration,
    animationEasing,
    arcRadius,
    assetsReady,
    backgroundColor,
    brandName,
    cardCount,
    cardMovementSpeed,
    finish,
    imageGap,
    imageHeight,
    imageRadius,
    imageWidth,
    introCharacters,
    introText,
    isSessionBound,
    preview,
    previewTime,
    reducedMotion,
    resolvedFeatured,
    revealStyle,
    runKey,
    sessionKey,
    staggerDelay,
    titleCharacters,
    transitionDuration,
  ]);

  if ((!active && !preview) || skipPreloader) return null;

  const fallbackLayout = computeLayout(1465, 750, Math.max(1, visibleCards.length), {
    imageWidth,
    imageHeight,
    arcRadius,
    imageGap,
    featuredIndex: resolvedFeatured,
  });

  const renderMaskedText = (
    characters: string[],
    refs: React.MutableRefObject<Array<HTMLSpanElement | null>>,
    ariaHidden = true,
  ) => (
    <span
      aria-hidden={ariaHidden ? "true" : undefined}
      style={{ display: "inline-block", whiteSpace: "nowrap" }}
    >
      {characters.map((character, index) => (
        <span
          key={`${character}-${index}`}
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "top",
          }}
        >
          <span
            ref={(element) => {
              refs.current[index] = element;
            }}
            style={{
              display: "inline-block",
              transform: "translate3d(0, 125%, 0)",
              willChange: "transform",
            }}
          >
            {character === " " ? "\u00A0" : character}
          </span>
        </span>
      ))}
    </span>
  );

  const logoNode = isImageSource(logo) ? (
    <img
      src={logo as string}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{
        display: "block",
        height: "clamp(18px, 2vw, 28px)",
        width: "auto",
        objectFit: "contain",
        marginBottom: "clamp(8px, 1.1vw, 16px)",
      }}
    />
  ) : logo ? (
    <div
      aria-hidden="true"
      style={{ marginBottom: "clamp(8px, 1.1vw, 16px)" }}
    >
      {logo}
    </div>
  ) : null;

  const titleStyle: React.CSSProperties = {
    fontSize: typeof titleSize === "number" ? `${titleSize}px` : titleSize,
    letterSpacing: "-0.01em",
    fontWeight: 500,
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  const introStyle: React.CSSProperties = {
    fontSize:
      typeof introTextSize === "number"
        ? `${introTextSize}px`
        : introTextSize,
    letterSpacing: "-0.022em",
    fontWeight: 400,
    lineHeight: 1.1,
    whiteSpace: "nowrap",
  };

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Loading ${brandName}`}
      data-slot="preloader-pro-v5"
      data-reveal={revealStyle}
      className={cn(className)}
      style={{
        position: preview ? "absolute" : "fixed",
        inset: 0,
        zIndex: preview ? 1 : zIndex,
        background: backgroundColor,
        color: textColor,
        fontFamily,
        overflow: "hidden",
        isolation: "isolate",
        contain: "layout paint",
        ...style,
      }}
    >
      <span ref={liveRef} style={SR_ONLY}>
        Loading
      </span>

      <div
        ref={contentRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          transform: "translateZ(0)",
          willChange: "opacity",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            perspective: "1400px",
            transformStyle: "preserve-3d",
          }}
        >
          {visibleCards.map((card, index) => (
            <div
              key={`${index}-${card.src}`}
              data-card-index={index}
              data-featured={
                index === resolvedFeatured ? "true" : undefined
              }
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: fallbackLayout.cardWidth,
                height: fallbackLayout.cardHeight,
                overflow: "hidden",
                borderRadius: imageRadius,
                background: cardBackground,
                opacity: 0,
                transformOrigin: "50% 50%",
                willChange: "transform, opacity, border-radius",
                backfaceVisibility: "hidden",
              }}
            >
              {!failedImages[card.src] && (
                <img
                  src={card.src}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  decoding="async"
                  onError={() =>
                    setFailedImages((current) => ({
                      ...current,
                      [card.src]: true,
                    }))
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: imageFit,
                    objectPosition: card.position ?? imagePosition,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div
          ref={featureRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            overflow: "hidden",
            borderRadius: imageRadius,
            background: cardBackground,
            opacity: 0,
            display: "none",
            willChange: "left, top, width, height, border-radius, opacity",
          }}
        >
          {featuredCard && !failedImages[featuredCard.src] && (
            <img
              src={featuredCard.src}
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: imageFit,
                objectPosition: featuredCard.position ?? imagePosition,
              }}
            />
          )}
          {featuredCard?.expandSrc &&
            !failedImages[featuredCard.expandSrc] && (
              <img
                ref={expandImageRef}
                src={featuredCard.expandSrc}
                alt=""
                aria-hidden="true"
                draggable={false}
                onError={() =>
                  setFailedImages((current) => ({
                    ...current,
                    [featuredCard.expandSrc!]: true,
                  }))
                }
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: featuredCard.position ?? imagePosition,
                  opacity: 0,
                }}
              />
            )}
          <div
            ref={scrimRef}
            style={{
              position: "absolute",
              inset: 0,
              background: overlayColor,
              opacity: 0,
            }}
          />
        </div>

        {[
          { ref: splitTopRef, key: "top" },
          { ref: splitBottomRef, key: "bottom" },
        ].map(({ ref: layerRef, key }) => (
          <div
            key={key}
            ref={layerRef}
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              display: "none",
              willChange: "clip-path",
            }}
          >
            {featuredCard && !failedImages[splitSrc] && (
              <img
                src={splitSrc}
                alt=""
                aria-hidden="true"
                draggable={false}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: featuredCard.position ?? imagePosition,
                }}
              />
            )}
          </div>
        ))}

        <div
          ref={introRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ ...introStyle, textAlign: "center" }}>
            {renderMaskedText(introCharacters, introCharsRef)}
          </div>
        </div>

        <div
          ref={arcTitleRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            textAlign: "center",
            willChange: "opacity",
            zIndex: 1200,
          }}
        >
          {logoNode}
          <div style={titleStyle}>
            {renderMaskedText(titleCharacters, titleCharsRef)}
          </div>
        </div>

        <div
          ref={imageTitleRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            textAlign: "center",
            color: imageTextColor,
            opacity: 0,
            visibility: "hidden",
            zIndex: 1300,
          }}
        >
          {logoNode}
          <div style={titleStyle}>
            {renderMaskedText(titleCharacters, imageTitleCharsRef)}
          </div>
        </div>
      </div>

      <div
        ref={exitTopRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "50%",
          overflow: "hidden",
          background: backgroundColor,
          display: "none",
          zIndex: 10,
          willChange: "transform",
        }}
      >
        {featuredCard && !failedImages[splitSrc] && (
          <img
            ref={exitTopImageRef}
            src={splitSrc}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: featuredCard.position ?? imagePosition,
            }}
          />
        )}
      </div>
      <div
        ref={exitBottomRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          width: "100%",
          height: "50%",
          overflow: "hidden",
          background: backgroundColor,
          display: "none",
          zIndex: 10,
          willChange: "transform",
        }}
      >
        {featuredCard && !failedImages[splitSrc] && (
          <img
            ref={exitBottomImageRef}
            src={splitSrc}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              position: "absolute",
              left: 0,
              top: "-50%",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: featuredCard.position ?? imagePosition,
            }}
          />
        )}
      </div>
    </div>
  );
});

PreloaderProV5.displayName = "PreloaderProV5";