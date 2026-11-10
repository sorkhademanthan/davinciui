"use client";

import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import * as React from "react";
import {
  PREMIUM_PRELOADER_CARD_DURATION,
  premiumPreloaderMirrorPoint,
  premiumPreloaderPathPosition,
} from "@workspace/ui/lib/premium-preloader-path";

export type PremiumPreloaderSequence = "logo-images" | "images-logo";
export type PremiumPreloaderMode = "fullscreen" | "preview";
export type PremiumPreloaderTheme = "auto" | "light" | "dark";

export interface PremiumPreloaderHandle {
  /** Replays from the first frame. Optionally switches the choreography. */
  replay: (sequence?: PremiumPreloaderSequence) => void;
}

export interface PremiumPreloaderProps {
  /** Which choreography runs first. @default "logo-images" */
  sequence?: PremiumPreloaderSequence;
  /** Three-line editorial tagline. @default ["Copy", "Paste", "Ship"] */
  tagline?: string[];
  /**
   * Logo image source. When omitted, a typeset DAVINCIUI wordmark is drawn
   * so the loader still has a mark without a repo asset.
   */
  logo?: string;
  /** Card images, cycled in filename order. */
  images?: string[];
  /** Theme-aware paper and ink. @default "auto" */
  theme?: PremiumPreloaderTheme;
  /** Explicit paper color, overriding the theme. @default theme value */
  background?: string;
  /** Explicit ink color, overriding the theme. @default theme value */
  textColor?: string;
  /** Skip the overlay entirely below `mobileBreakpoint`. @default false */
  disableOnMobile?: boolean;
  /** Mobile cutoff in CSS pixels. @default 810 */
  mobileBreakpoint?: number;
  /** Play only once per page path, stored in sessionStorage. @default false */
  playOnce?: boolean;
  /** Fires after the curtains finish (and after every loop pass). */
  onComplete?: () => void;
  /**
   * `"fullscreen"` is a fixed viewport overlay; `"preview"` is absolute
   * inside a positioned parent (cards, docs stages).
   * @default "fullscreen"
   */
  mode?: PremiumPreloaderMode;
  /** Restart automatically after the reveal. Useful for gallery cards. */
  loop?: boolean;
  /** Milliseconds the revealed page holds before a loop restart. @default 900 */
  loopHold?: number;
  className?: string;
}

/** Filename-sorted card imagery already in the repo. */
export const PREMIUM_PRELOADER_IMAGES: string[] = [
  "/images/spiral-3d-slider/blue-double.jpg",
  "/images/spiral-3d-slider/blue-motion.jpg",
  "/images/spiral-3d-slider/blue-profile.jpg",
  "/images/spiral-3d-slider/camera-reflection.jpg",
  "/images/spiral-3d-slider/catalog-preview.jpg",
  "/images/spiral-3d-slider/crimson-profile.jpg",
  "/images/spiral-3d-slider/dark-glitch.jpg",
  "/images/spiral-3d-slider/ghosted-portrait.jpg",
  "/images/spiral-3d-slider/green-portrait.jpg",
  "/images/spiral-3d-slider/orange-haze.jpg",
  "/images/spiral-3d-slider/prism-portrait.jpg",
  "/images/spiral-3d-slider/red-blue-figure.jpg",
  "/images/spiral-3d-slider/red-echo.jpg",
  "/images/spiral-3d-slider/silver-motion.jpg",
  "/images/spiral-3d-slider/teal-echo.jpg",
  "/images/spiral-3d-slider/visor-portrait.jpg",
  "/images/spiral-3d-slider/white-motion.jpg",
];

export const PREMIUM_PRELOADER_TAGLINE: string[] = ["Copy", "Paste", "Ship"];

const THEME_DEFAULTS = {
  light: {
    background: "#F5F3F1",
    textColor: "#161616",
    markColor: "#8A8785",
    cardFallback: "#D9D5D0",
    cardShadow: "0 20px 50px rgba(0, 0, 0, 0.14)",
  },
  dark: {
    background: "#101012",
    textColor: "#F4F3EF",
    markColor: "#6D6A66",
    cardFallback: "#26262A",
    cardShadow: "0 20px 50px rgba(0, 0, 0, 0.55)",
  },
} as const;

/** Read the website theme without requiring a theme provider. */
function resolveColorScheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  const dataTheme = root.dataset.theme;
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme;
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** Follow the website theme live when `theme` is `"auto"`. */
function useColorScheme(mode: PremiumPreloaderTheme): "light" | "dark" {
  const [scheme, setScheme] = React.useState<"light" | "dark">(
    mode === "auto" ? "light" : mode,
  );

  useIsomorphicLayoutEffect(() => {
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
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setScheme(resolveColorScheme());
    query.addEventListener("change", onChange);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", onChange);
    };
  }, [mode]);

  return mode === "auto" ? scheme : mode;
}

const FONT_STACK =
  'var(--font-sans, "Geist", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif)';
const CARD_COUNT = 10;
const CARD_STAGGER = 0.145;
const WORD_TIMES = [0.35, 0.75, 1.15] as const;
const PLAYED_PREFIX = "premium-preloader:played:";

const MODE_SIZES = {
  fullscreen: {
    cardWidth: "16.4cqw",
    logoWidth: "28cqw",
    wordmarkSize: "max(26px, 5.05cqw)",
    tagline: "clamp(32px, 3.8cqw, 72px)",
    mark: 6,
    markOffsetX: "12.7%",
    markOffsetY: "32.5%",
  },
  preview: {
    cardWidth: "26cqw",
    logoWidth: "55cqw",
    wordmarkSize: "max(17px, 9.2cqw)",
    tagline: "clamp(14px, 7cqw, 30px)",
    mark: 4,
    markOffsetX: "12.7%",
    markOffsetY: "32.5%",
  },
} as const;

function safeArray<T>(value: readonly T[] | undefined, fallback: readonly T[]) {
  return value && value.length > 0 ? value : fallback;
}

function decodeImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
    if (typeof image.decode === "function") {
      image.decode().then(
        () => resolve(),
        () => resolve(),
      );
    }
  });
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Lock page scroll and mark every sibling branch inert without turning the
 * overlay's own ancestors inert. Restores the exact previous state.
 */
function isolatePage(root: HTMLElement): () => void {
  const body = document.body;
  const html = document.documentElement;
  const previousBodyOverflow = body.style.overflow;
  const previousHtmlOverflow = html.style.overflow;
  const previousBodyPadding = body.style.paddingRight;
  const scrollbar = window.innerWidth - html.clientWidth;

  body.style.overflow = "hidden";
  html.style.overflow = "hidden";
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

  const inerted: Element[] = [];
  let current: HTMLElement | null = root;
  while (current && current !== body) {
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) break;
    const siblings = Array.from(parent.children) as HTMLElement[];
    for (const sibling of siblings) {
      if (sibling === current) continue;
      if (sibling.tagName === "SCRIPT" || sibling.tagName === "STYLE") continue;
      if (sibling.hasAttribute("inert")) continue;
      sibling.setAttribute("inert", "");
      inerted.push(sibling);
    }
    current = parent;
  }

  return () => {
    body.style.overflow = previousBodyOverflow;
    html.style.overflow = previousHtmlOverflow;
    body.style.paddingRight = previousBodyPadding;
    for (const element of inerted) element.removeAttribute("inert");
  };
}

function Wordmark({ textColor, size }: { textColor: string; size: string }) {
  return (
    <span
      aria-hidden="true"
      role="presentation"
      style={{
        display: "inline-block",
        color: textColor,
        fontFamily: FONT_STACK,
        fontSize: size,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: "-0.045em",
        whiteSpace: "nowrap",
      }}
    >
      DAVINCIUI
    </span>
  );
}

interface StageProps {
  sequence: PremiumPreloaderSequence;
  tagline: readonly string[];
  logo?: string;
  images: readonly string[];
  background: string;
  textColor: string;
  markColor: string;
  cardFallback: string;
  cardShadow: string;
  mode: PremiumPreloaderMode;
  onFinish: () => void;
  className?: string;
}

function PremiumPreloaderStage({
  sequence,
  tagline,
  logo,
  images,
  background,
  textColor,
  markColor,
  cardFallback,
  cardShadow,
  mode,
  onFinish,
  className,
}: StageProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const leftPanelRef = React.useRef<HTMLDivElement>(null);
  const rightPanelRef = React.useRef<HTMLDivElement>(null);
  const marksRef = React.useRef<HTMLDivElement>(null);
  const taglineRef = React.useRef<HTMLDivElement>(null);
  const logoRef = React.useRef<HTMLDivElement>(null);
  const cardsLayerRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const progressRef = React.useRef<number[]>(
    Array.from({ length: CARD_COUNT }, () => 0),
  );
  const sizeRef = React.useRef({ width: 0, height: 0 });
  const onFinishRef = React.useRef(onFinish);
  onFinishRef.current = onFinish;
  const sizes = MODE_SIZES[mode];
  const resolvedImages = safeArray(images, PREMIUM_PRELOADER_IMAGES);

  const updateCardPosition = React.useCallback(
    (index: number, progress: number) => {
      const anchor = cardRefs.current[index];
      const mirror = cardRefs.current[index + CARD_COUNT];
      const { width, height } = sizeRef.current;
      if (!anchor || width === 0 || height === 0) return;

      const point = premiumPreloaderPathPosition(progress, width, height);
      anchor.style.transform = `translate3d(${point.x.toFixed(2)}px, ${point.y.toFixed(2)}px, 0) translate(-50%, -50%)`;

      if (mirror) {
        const mirrored = premiumPreloaderMirrorPoint(point, width, height);
        mirror.style.transform = `translate3d(${mirrored.x.toFixed(2)}px, ${mirrored.y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      }
    },
    [],
  );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let timeline: gsap.core.Timeline | null = null;
    let unlock: (() => void) | undefined;

    if (mode === "fullscreen") {
      unlock = isolatePage(root);
    }

    const measure = () => {
      sizeRef.current = {
        width: root.clientWidth,
        height: root.clientHeight,
      };
      for (let index = 0; index < CARD_COUNT; index += 1) {
        updateCardPosition(index, progressRef.current[index] ?? 0);
      }
    };

    measure();
    for (let index = 0; index < CARD_COUNT; index += 1) {
      updateCardPosition(index, 0);
    }

    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(root);

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      const content = root.querySelector<HTMLElement>("[data-pp-content]");
      if (content) content.style.visibility = "hidden";
      timeline = gsap.timeline({
        onComplete: () => {
          if (!disposed) onFinishRef.current();
        },
      });
      timeline.to(root, {
        opacity: 0,
        duration: 0.4,
        ease: "power1.out",
      });
      return () => {
        disposed = true;
        observer.disconnect();
        timeline?.kill();
        unlock?.();
      };
    }

    const sources = [...(logo ? [logo] : []), ...images.slice(0, 3)].filter(
      Boolean,
    );

    const run = async () => {
      const fonts =
        typeof document !== "undefined" && document.fonts
          ? document.fonts.ready
          : Promise.resolve();
      await Promise.race([
        Promise.all([fonts, ...sources.map((src) => decodeImage(src))]),
        wait(1500),
      ]);
      if (disposed) return;

      const words =
        taglineRef.current?.querySelectorAll<HTMLElement>("[data-pp-word]");

      timeline = gsap.timeline({ paused: true });

      words?.forEach((word, index) => {
        timeline!.fromTo(
          word,
          { opacity: 0, filter: "blur(10px)", y: 5 },
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          WORD_TIMES[index] ?? 0.35 + index * 0.4,
        );
      });

      timeline.to(
        [taglineRef.current, marksRef.current],
        {
          opacity: 0,
          filter: "blur(6px)",
          duration: 0.3,
          ease: "power2.inOut",
        },
        1.5,
      );
      if (sequence === "logo-images") {
        timeline.to(
          logoRef.current,
          {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.45,
            ease: "power2.out",
          },
          1.5,
        );
      }

      const cardsStart = sequence === "logo-images" ? 2.35 : 1.75;
      const curtainStart = sequence === "logo-images" ? 3.7 : 4.0;

      timeline.set(
        cardsLayerRef.current,
        { opacity: 1 },
        Math.max(0, cardsStart - 0.02),
      );

      if (sequence === "logo-images") {
        timeline.to(
          logoRef.current,
          {
            opacity: 0,
            filter: "blur(4px)",
            duration: 0.5,
            ease: "power2.in",
          },
          2.35,
        );
      } else {
        timeline.to(
          logoRef.current,
          {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.45,
            ease: "power2.out",
          },
          3.1,
        );
        timeline.to(
          logoRef.current,
          {
            opacity: 0,
            filter: "blur(4px)",
            duration: 0.25,
            ease: "power2.in",
          },
          4.0,
        );
      }

      for (let index = 0; index < CARD_COUNT; index += 1) {
        const state = { progress: 0 };
        timeline.to(
          state,
          {
            progress: 1,
            duration: PREMIUM_PRELOADER_CARD_DURATION,
            ease: "none",
            onUpdate: () => {
              progressRef.current[index] = state.progress;
              updateCardPosition(index, state.progress);
            },
          },
          cardsStart + index * CARD_STAGGER,
        );
      }

      timeline.to(
        cardsLayerRef.current,
        { opacity: 0, duration: 0.3, ease: "power1.out" },
        curtainStart,
      );
      timeline.to(
        rightPanelRef.current,
        {
          yPercent: 100,
          duration: 0.55,
          ease: "power3.inOut",
        },
        curtainStart,
      );
      timeline.to(
        leftPanelRef.current,
        {
          yPercent: -100,
          duration: 0.5,
          ease: "power3.inOut",
        },
        curtainStart + 0.1,
      );
      timeline.call(
        () => {
          if (!disposed) onFinishRef.current();
        },
        [],
        curtainStart + 0.62,
      );
      timeline.play(0);
    };

    void run();

    return () => {
      disposed = true;
      observer.disconnect();
      timeline?.kill();
      unlock?.();
    };
    // The stage remounts for every replay/sequence change; props are stable
    // for the lifetime of one run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const marks = [
    { left: sizes.markOffsetX, top: sizes.markOffsetY },
    { left: `calc(100% - ${sizes.markOffsetX})`, top: sizes.markOffsetY },
    { left: sizes.markOffsetX, top: `calc(100% - ${sizes.markOffsetY})` },
    {
      left: `calc(100% - ${sizes.markOffsetX})`,
      top: `calc(100% - ${sizes.markOffsetY})`,
    },
  ];

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Loading"
      data-slot="premium-preloader"
      data-sequence={sequence}
      data-mode={mode}
      className={cn("premium-preloader", className)}
      style={{
        position: mode === "fullscreen" ? "fixed" : "absolute",
        inset: 0,
        zIndex: mode === "fullscreen" ? 9999 : 20,
        overflow: "hidden",
        containerType: "inline-size",
        fontFamily: FONT_STACK,
      }}
    >
      <div
        ref={leftPanelRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "50%",
          height: "100%",
          backgroundColor: background,
          willChange: "transform",
        }}
      />
      <div
        ref={rightPanelRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "50%",
          height: "100%",
          backgroundColor: background,
          willChange: "transform",
        }}
      />

      <div
        data-pp-content
        aria-hidden="true"
        style={{ position: "absolute", inset: 0 }}
      >
        <div ref={marksRef} style={{ position: "absolute", inset: 0 }}>
          {marks.map((mark, index) => (
            <span
              key={index}
              style={{
                position: "absolute",
                ...mark,
                width: sizes.mark,
                height: sizes.mark,
                marginLeft: -sizes.mark / 2,
                marginTop: -sizes.mark / 2,
                backgroundColor: markColor,
              }}
            />
          ))}
        </div>

        <div
          ref={taglineRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.27em",
            fontSize: sizes.tagline,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            textAlign: "center",
          }}
        >
          {tagline.map((word, index) => (
            <span
              key={`${word}-${index}`}
              data-pp-word
              style={{
                display: "block",
                color: textColor,
                opacity: 0,
                filter: "blur(10px)",
                willChange: "transform, opacity, filter",
              }}
            >
              {word}
            </span>
          ))}
        </div>

        <div
          ref={logoRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            filter: "blur(8px)",
            willChange: "opacity, filter",
          }}
        >
          {logo ? (
            <img
              src={logo}
              alt=""
              style={{
                width: sizes.logoWidth,
                height: "auto",
                display: "block",
              }}
            />
          ) : (
            <Wordmark textColor={textColor} size={sizes.wordmarkSize} />
          )}
        </div>

        <div
          ref={cardsLayerRef}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            overflow: "hidden",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, #000 13%, #000 87%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, #000 13%, #000 87%, transparent 100%)",
            willChange: "opacity",
          }}
        >
          {Array.from({ length: CARD_COUNT * 2 }, (_, index) => {
            const cardIndex = index % CARD_COUNT;
            const isMirror = index >= CARD_COUNT;
            const image = resolvedImages[cardIndex % resolvedImages.length];
            return (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  zIndex: CARD_COUNT - cardIndex,
                  willChange: "transform",
                  transform: isMirror
                    ? "translate3d(109vw, 30vh, 0) translate(-50%, -50%)"
                    : "translate3d(-9vw, 70vh, 0) translate(-50%, -50%)",
                }}
              >
                <div
                  style={{
                    width: sizes.cardWidth,
                    aspectRatio: "240 / 215",
                    overflow: "hidden",
                    borderRadius: 18,
                    backgroundColor: cardFallback,
                    boxShadow: cardShadow,
                  }}
                >
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center 30%",
                        display: "block",
                      }}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@media (prefers-reduced-motion: reduce) { [data-slot="premium-preloader"] [data-pp-content] { visibility: hidden !important; } }`}</style>
    </div>
  );
}

/**
 * Premium Preloader — a theme-aware editorial curtain with a three-line
 * tagline, a centered wordmark, and two mirrored streams of portrait cards
 * that travel quadratic paths before the panels split away.
 *
 * Mount it over the page. The overlay renders immediately (SSR-safe), waits
 * for fonts and the first card images for at most 1.5s, then runs the master
 * GSAP timeline. Replay with the ref, or set `loop` for gallery cards.
 */
export const PremiumPreloader = React.forwardRef<
  PremiumPreloaderHandle,
  PremiumPreloaderProps
>(function PremiumPreloader(
  {
    sequence: initialSequence = "logo-images",
    tagline = PREMIUM_PRELOADER_TAGLINE,
    logo,
    images = PREMIUM_PRELOADER_IMAGES,
    theme = "auto",
    background,
    textColor,
    disableOnMobile = false,
    mobileBreakpoint = 810,
    playOnce = false,
    onComplete,
    mode = "fullscreen",
    loop = false,
    loopHold = 900,
    className,
  },
  ref,
) {
  const [active, setActive] = React.useState(true);
  const [run, setRun] = React.useState(0);
  const [sequence, setSequence] =
    React.useState<PremiumPreloaderSequence>(initialSequence);
  const loopTimerRef = React.useRef<number | null>(null);
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;
  const rootClass = `premium-preloader-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const scheme = useColorScheme(theme);
  const palette = THEME_DEFAULTS[scheme];
  const resolvedBackground = background ?? palette.background;
  const resolvedTextColor = textColor ?? palette.textColor;

  React.useEffect(() => {
    setSequence(initialSequence);
  }, [initialSequence]);

  React.useEffect(() => {
    if (!playOnce || typeof window === "undefined") return;
    try {
      if (
        window.sessionStorage.getItem(
          `${PLAYED_PREFIX}${window.location.pathname}`,
        )
      ) {
        setActive(false);
        onCompleteRef.current?.();
      }
    } catch {
      /* storage unavailable — play normally */
    }
  }, [playOnce]);

  React.useEffect(() => {
    if (
      !disableOnMobile ||
      mode !== "fullscreen" ||
      typeof window === "undefined"
    ) {
      return;
    }
    const query = window.matchMedia(
      `(max-width: ${Math.max(1, mobileBreakpoint - 1)}px)`,
    );
    const sync = () => {
      if (query.matches) setActive(false);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [disableOnMobile, mobileBreakpoint, mode]);

  React.useEffect(() => {
    return () => {
      if (loopTimerRef.current !== null) {
        window.clearTimeout(loopTimerRef.current);
      }
    };
  }, []);

  const finish = React.useCallback(() => {
    onCompleteRef.current?.();
    if (playOnce && typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          `${PLAYED_PREFIX}${window.location.pathname}`,
          "1",
        );
      } catch {
        /* ignore */
      }
    }
    if (loop) {
      loopTimerRef.current = window.setTimeout(
        () => {
          setRun((value) => value + 1);
        },
        Math.max(200, loopHold),
      );
      return;
    }
    setActive(false);
  }, [loop, loopHold, playOnce]);

  React.useImperativeHandle(
    ref,
    () => ({
      replay: (nextSequence) => {
        if (loopTimerRef.current !== null) {
          window.clearTimeout(loopTimerRef.current);
          loopTimerRef.current = null;
        }
        if (nextSequence) setSequence(nextSequence);
        setActive(true);
        setRun((value) => value + 1);
      },
    }),
    [],
  );

  if (!active) return null;

  return (
    <>
      {disableOnMobile && mode === "fullscreen" ? (
        <style>{`@media (max-width: ${Math.max(1, mobileBreakpoint - 1)}px) { .${rootClass} { display: none !important; } }`}</style>
      ) : null}
      <div className={rootClass}>
        <PremiumPreloaderStage
          key={`${run}-${sequence}`}
          sequence={sequence}
          tagline={safeArray(tagline, PREMIUM_PRELOADER_TAGLINE)}
          logo={logo}
          images={safeArray(images, PREMIUM_PRELOADER_IMAGES)}
          background={resolvedBackground}
          textColor={resolvedTextColor}
          markColor={palette.markColor}
          cardFallback={palette.cardFallback}
          cardShadow={palette.cardShadow}
          mode={mode}
          onFinish={finish}
          className={className}
        />
      </div>
    </>
  );
});

export default PremiumPreloader;

/* Framer controls — attached only where the runtime provides the API. */
if (typeof window !== "undefined") {
  try {
    const framer = window as unknown as {
      addPropertyControls?: (
        component: unknown,
        controls: Record<string, unknown>,
      ) => void;
    };
    framer?.addPropertyControls?.(PremiumPreloader, {
      sequence: {
        type: "enum",
        title: "Sequence",
        options: ["logo-images", "images-logo"],
        defaultValue: "logo-images",
      },
      tagline: {
        type: "array",
        title: "Tagline",
        defaultValue: ["Copy", "Paste", "Ship"],
        control: { type: "string" },
      },
      theme: {
        type: "enum",
        title: "Theme",
        options: ["auto", "light", "dark"],
        defaultValue: "auto",
      },
      background: {
        type: "color",
        title: "Background",
        defaultValue: "#F5F3F1",
      },
      textColor: {
        type: "color",
        title: "Text Color",
        defaultValue: "#161616",
      },
      disableOnMobile: {
        type: "boolean",
        title: "Disable on Mobile",
        defaultValue: false,
      },
      playOnce: {
        type: "boolean",
        title: "Play Once",
        defaultValue: false,
      },
    });
  } catch {
    /* non-Framer runtime */
  }
}
