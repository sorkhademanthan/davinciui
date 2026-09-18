"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

/* ---------------------------------- types --------------------------------- */

export type InteractiveMediaAccordionMediaType = "image" | "video" | "auto";
export type InteractiveMediaAccordionTrigger = "scroll" | "hover" | "click";
export type InteractiveMediaAccordionFit = "cover" | "contain";

export interface InteractiveMediaAccordionItem {
  id: string;
  /** Image or video URL. Videos detected by extension unless mediaType is set. */
  media: string;
  mediaType?: InteractiveMediaAccordionMediaType;
  /** Alt text for image media. */
  alt?: string;
  title?: string;
  description?: string;
  /** Focal point of the media crop, 0–100. Defaults to 50 (center). */
  positionX?: number;
  /** Focal point of the media crop, 0–100. Defaults to 50 (center). */
  positionY?: number;
}

export interface InteractiveMediaAccordionProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> {
  items?: InteractiveMediaAccordionItem[];

  /* Layout */
  /** Gallery height in px. @default 600 */
  height?: number;
  /** Gap between cards in px. @default 14 */
  gap?: number;
  /** Collapsed (pill) width in px, desktop. @default 132 */
  collapsedWidth?: number;
  /** Collapsed width on tablet-width containers. @default 96 */
  tabletCollapsedWidth?: number;
  /** Collapsed width on compact/mobile containers. @default 64 */
  mobileCollapsedWidth?: number;
  /** Active card corner radius in px. @default 48 */
  radius?: number;
  /** Inactive pill radius in px. Defaults to half the effective collapsed width (capsule). */
  collapsedRadius?: number;
  /** Outer padding of the gallery in px. @default 0 */
  outerPadding?: number;

  /* Media */
  fit?: InteractiveMediaAccordionFit;
  /** Subtle bottom gradient behind the active text. @default true */
  textGradient?: boolean;
  /** Gradient strength 0–1. @default 0.55 */
  gradientStrength?: number;
  /** Inactive media brightness 0–2 (1 = original). @default 1 */
  inactiveBrightness?: number;
  /** Inactive media saturation 0–2 (1 = original). @default 1 */
  inactiveSaturation?: number;

  /* Text */
  titleFont?: string;
  descriptionFont?: string;
  titleColor?: string;
  descriptionColor?: string;
  titleSize?: number;
  descriptionSize?: number;
  /** Vertical gap between title and description. @default 6 */
  textGap?: number;
  /** Content inset from the active card edges [x, y]. @default [40, 44] */
  contentPadding?: [number, number];
  textAlign?: "left" | "center" | "right";

  /* Interaction */
  trigger?: InteractiveMediaAccordionTrigger;
  /** Scroll distance in px assigned to each item in scroll mode. @default 800 */
  scrollStep?: number;
  /** Sticky offset from the top of the nearest scroll container in px. @default 40 */
  stickyTop?: number;
  /** Controlled active index. */
  activeIndex?: number;
  /** Uncontrolled initial active index. @default 0 */
  initialActiveIndex?: number;
  onActiveChange?: (index: number) => void;
  /** Auto-advance through items. @default false */
  autoPlay?: boolean;
  /** Auto-play interval in ms. @default 4000 */
  autoPlayInterval?: number;
  /** Pause auto-play while the pointer is over the gallery. @default true */
  pauseAutoPlayOnHover?: boolean;

  /* Motion */
  /** Transition duration in ms. @default 650 */
  duration?: number;
  /** Easing curve. @default "cubic-bezier(0.22, 1, 0.36, 1)" */
  easing?: string;
  /** Disable complex transitions, keep functionality. @default false */
  reducedMotion?: boolean;
}

const EASE_DEFAULT = "cubic-bezier(0.22, 1, 0.36, 1)";
const VIDEO_PATTERN = /\.(?:mp4|webm|mov|m4v)(?:[?#].*)?$/i;
const UNSPLASH_PARAMS = "?q=80&w=1600&auto=format&fit=crop";

const DEFAULT_ITEMS: InteractiveMediaAccordionItem[] = [
  {
    id: "mist",
    media: `https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05${UNSPLASH_PARAMS}`,
    alt: "Mountains of Mist — fog rolling over layered green hills",
    title: "Mountains of Mist",
    description: "Wander into nature's hands.",
  },
  {
    id: "dunes",
    media: `https://images.unsplash.com/photo-1473580044384-7ba9967e16a0${UNSPLASH_PARAMS}`,
    alt: "Golden Dunes — wind-shaped sand ripples at dusk",
    title: "Golden Dunes",
    description: "Where the desert breathes.",
  },
  {
    id: "tide",
    media: `https://images.unsplash.com/photo-1507525428034-b723cf961d3e${UNSPLASH_PARAMS}`,
    alt: "Emerald Tide — turquoise waves folding onto the shore",
    title: "Emerald Tide",
    description: "Chase the endless horizon.",
  },
  {
    id: "aurora",
    media: `https://images.unsplash.com/photo-1531366936337-7c912a4589a7${UNSPLASH_PARAMS}`,
    alt: "Northern Aurora — violet light over snowy peaks",
    title: "Northern Aurora",
    description: "Light dancing on winter skies.",
  },
  {
    id: "forest",
    media: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e${UNSPLASH_PARAMS}`,
    alt: "Silent Forest — sunbeams through tall pines",
    title: "Silent Forest",
    description: "Listen to the trees whisper.",
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function isVideoItem(item: InteractiveMediaAccordionItem): boolean {
  if (item.mediaType === "video") return true;
  if (item.mediaType === "image") return false;
  return VIDEO_PATTERN.test(item.media);
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useContainerWidth<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

/* ------------------------------- video card ------------------------------ */

function AccordionVideo({
  src,
  active,
  fit,
  objectPosition,
  label,
}: {
  src: string;
  active: boolean;
  fit: InteractiveMediaAccordionFit;
  objectPosition: string;
  label?: string;
}) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [active]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) video.pause();
        else if (active) void video.play().catch(() => undefined);
      },
      { threshold: 0.15 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [active]);

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      preload="metadata"
      aria-label={label}
      tabIndex={-1}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: fit,
        objectPosition,
        pointerEvents: "none",
      }}
    />
  );
}

/* -------------------------------- component ------------------------------ */

export function InteractiveMediaAccordion({
  items = DEFAULT_ITEMS,
  height = 600,
  gap = 14,
  collapsedWidth = 132,
  tabletCollapsedWidth = 96,
  mobileCollapsedWidth = 64,
  radius = 48,
  collapsedRadius,
  outerPadding = 0,
  fit = "cover",
  textGradient = true,
  gradientStrength = 0.55,
  inactiveBrightness = 1,
  inactiveSaturation = 1,
  titleFont = "Inter, system-ui, -apple-system, sans-serif",
  descriptionFont = "Inter, system-ui, -apple-system, sans-serif",
  titleColor = "#ffffff",
  descriptionColor = "rgba(255, 255, 255, 0.82)",
  titleSize = 40,
  descriptionSize = 15,
  textGap = 6,
  contentPadding = [40, 44],
  textAlign = "left",
  trigger = "scroll",
  scrollStep = 800,
  stickyTop = 40,
  activeIndex: controlledIndex,
  initialActiveIndex = 0,
  onActiveChange,
  autoPlay = false,
  autoPlayInterval = 4000,
  pauseAutoPlayOnHover = true,
  duration = 650,
  easing = EASE_DEFAULT,
  reducedMotion: reducedMotionProp = false,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  ...divProps
}: InteractiveMediaAccordionProps) {
  const count = items.length;
  const scrollDriven = trigger === "scroll";
  const systemReduced = usePrefersReducedMotion();
  const reduceMotion = reducedMotionProp || systemReduced;
  const effectiveDuration = reduceMotion ? 0 : duration;

  const { ref: containerRef, width: containerWidth } =
    useContainerWidth<HTMLDivElement>();

  const [internalIndex, setInternalIndex] = React.useState(() =>
    count > 0 ? clamp(initialActiveIndex, 0, count - 1) : 0,
  );
  const active =
    controlledIndex !== undefined
      ? clamp(controlledIndex, 0, Math.max(0, count - 1))
      : clamp(internalIndex, 0, Math.max(0, count - 1));
  const activeRef = React.useRef(active);

  React.useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const setActive = React.useCallback(
    (index: number) => {
      const next = clamp(index, 0, Math.max(0, count - 1));
      if (controlledIndex === undefined) setInternalIndex(next);
      onActiveChange?.(next);
    },
    [controlledIndex, count, onActiveChange],
  );

  // Keep the active index valid when the item list changes.
  React.useEffect(() => {
    if (controlledIndex === undefined) {
      setInternalIndex((prev) => clamp(prev, 0, Math.max(0, count - 1)));
    }
  }, [count, controlledIndex]);

  /* The reference interaction is a sticky gallery with one discrete scroll
     band per item. Listening to the nearest scroll container makes the same
     component work in a page, a modal, or the docs preview pane. */
  React.useEffect(() => {
    if (!scrollDriven || count <= 1) return;

    const element = containerRef.current;
    if (!element || typeof window === "undefined") return;

    let parent = element.parentElement;
    let scrollRoot: HTMLElement | Window = window;
    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (/(auto|scroll|overlay)/.test(overflowY)) {
        scrollRoot = parent;
        break;
      }
      parent = parent.parentElement;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rootTop =
        scrollRoot === window
          ? 0
          : (scrollRoot as HTMLElement).getBoundingClientRect().top;
      const distance =
        rootTop + stickyTop - element.getBoundingClientRect().top;
      const next = clamp(
        Math.floor(Math.max(0, distance) / Math.max(1, scrollStep)),
        0,
        count - 1,
      );

      if (next === activeRef.current) return;
      activeRef.current = next;
      if (controlledIndex === undefined) setInternalIndex(next);
      onActiveChange?.(next);
    };
    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    scrollRoot.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      scrollRoot.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [
    containerRef,
    controlledIndex,
    count,
    onActiveChange,
    scrollDriven,
    scrollStep,
    stickyTop,
  ]);

  /* Container-aware geometry: tablet + compact breakpoints follow the
     gallery's own width, never the viewport, so the component behaves
     inside narrow grid columns and Framer stacks too. */
  const isCompact = containerWidth > 0 && containerWidth < 560;
  const isTablet =
    containerWidth > 0 && containerWidth >= 560 && containerWidth < 900;
  const effectiveCollapsed = isCompact
    ? mobileCollapsedWidth
    : isTablet
      ? tabletCollapsedWidth
      : collapsedWidth;
  const effectiveGap = isCompact
    ? Math.min(gap, 8)
    : isTablet
      ? Math.min(gap, 12)
      : gap;
  const effectiveRadius = reduceMotion ? Math.min(radius, 24) : radius;
  // Pill capsule by default: radius is half the pill width.
  const effectiveCollapsedRadius =
    collapsedRadius ?? Math.round(effectiveCollapsed / 2);
  const effectiveTitleSize = isCompact
    ? Math.round(titleSize * 0.68)
    : isTablet
      ? Math.round(titleSize * 0.82)
      : titleSize;
  const effectiveDescriptionSize = isCompact
    ? Math.round(descriptionSize * 0.88)
    : descriptionSize;
  const [padX, padY] = contentPadding;
  const effectivePadX = isCompact ? Math.round(padX * 0.65) : padX;
  const effectivePadY = isCompact ? Math.round(padY * 0.7) : padY;

  /* Auto-play */
  const [autoPaused, setAutoPaused] = React.useState(false);
  const paused = autoPlay && pauseAutoPlayOnHover && autoPaused;
  React.useEffect(() => {
    if (!autoPlay || scrollDriven || count <= 1 || paused || reduceMotion)
      return;
    const id = window.setInterval(
      () => {
        const next = (active + 1) % count;
        if (controlledIndex === undefined) setInternalIndex(next);
        onActiveChange?.(next);
      },
      Math.max(800, autoPlayInterval),
    );
    return () => window.clearInterval(id);
  }, [
    autoPlay,
    autoPlayInterval,
    count,
    active,
    paused,
    reduceMotion,
    controlledIndex,
    onActiveChange,
    scrollDriven,
  ]);

  const isCoarsePointer = React.useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(hover: none)").matches;
  }, []);

  if (count === 0) return null;

  const single = count === 1;
  // One shared transition so width, radius and position move as one gesture.
  const layoutTransition = `flex-grow ${effectiveDuration}ms ${easing}, flex-shrink ${effectiveDuration}ms ${easing}, flex-basis ${effectiveDuration}ms ${easing}, border-radius ${effectiveDuration}ms ${easing}`;
  const overlayStrength = clamp(gradientStrength, 0, 1);

  const activate = (index: number) => {
    if (index !== active) setActive(index);
  };

  return (
    <div
      {...divProps}
      ref={containerRef}
      data-slot="interactive-media-accordion"
      data-scroll-driven={scrollDriven ? "true" : undefined}
      data-active-index={active}
      role="group"
      aria-label={divProps["aria-label"] ?? "Interactive media gallery"}
      className={cn("w-full", className)}
      style={{
        padding: outerPadding,
        minHeight: scrollDriven
          ? Math.max(height, Math.max(1, scrollStep) * (count + 1))
          : undefined,
        position: scrollDriven ? "relative" : undefined,
        overflow: scrollDriven ? "visible" : "hidden",
        ...style,
      }}
      onMouseEnter={(event) => {
        setAutoPaused(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setAutoPaused(false);
        onMouseLeave?.(event);
      }}
    >
      <div
        role="presentation"
        style={{
          position: scrollDriven ? "sticky" : "relative",
          top: scrollDriven ? stickyTop : undefined,
          display: "flex",
          alignItems: "stretch",
          gap: effectiveGap,
          width: "100%",
          height,
          maxWidth: "100%",
          // Compact containers keep the accordion but allow a sideways
          // nudge instead of crushing pills into slivers.
          overflowX: isCompact ? "auto" : "hidden",
          overflowY: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {items.map((item, index) => {
          const isActive = single || index === active;
          const objectPosition = `${clamp(item.positionX ?? 50, 0, 100)}% ${clamp(item.positionY ?? 50, 0, 100)}%`;
          const video = isVideoItem(item);
          const showText =
            isActive && (item.title || item.description) ? true : false;

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.title ?? item.alt ?? `Media item ${index + 1}`}
              aria-expanded={isActive}
              aria-current={isActive ? "true" : undefined}
              onMouseEnter={
                trigger === "hover" && !isCoarsePointer()
                  ? () => activate(index)
                  : undefined
              }
              onFocus={() => activate(index)}
              onClick={() => activate(index)}
              data-state={isActive ? "active" : "inactive"}
              data-testid={`interactive-media-accordion-item-${index}`}
              className="group relative block shrink-0 cursor-pointer border-0 bg-zinc-200 p-0 outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-[#111] dark:focus-visible:ring-offset-black"
              style={{
                // Width redistribution: the active card takes every free
                // pixel (flex 1 1 0%), pills hold a fixed basis. Because
                // these are real flex values with one shared transition,
                // collapse and expansion always happen simultaneously and
                // rapid hovers simply redirect mid-interpolation.
                flexGrow: isActive ? 1 : 0,
                flexShrink: isActive ? 1 : 0,
                flexBasis: isActive
                  ? single
                    ? "100%"
                    : "0%"
                  : `${effectiveCollapsed}px`,
                minWidth: isActive
                  ? isCompact
                    ? "min(78%, 320px)"
                    : 0
                  : `${effectiveCollapsed}px`,
                maxWidth: "100%",
                height: "100%",
                overflow: "hidden",
                borderRadius: isActive
                  ? effectiveRadius
                  : effectiveCollapsedRadius,
                transition: layoutTransition,
                textAlign: "left",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* Media — the card is a moving crop window. The image always
                  fills 100% with object-fit cover, so collapsing only
                  reveals a narrower vertical slice; nothing ever squeezes. */}
              {video ? (
                <AccordionVideo
                  src={item.media}
                  active={isActive}
                  fit={fit}
                  objectPosition={objectPosition}
                  label={item.alt ?? item.title}
                />
              ) : (
                <img
                  src={item.media}
                  alt={item.alt ?? item.title ?? ""}
                  draggable={false}
                  loading={index <= 2 ? "eager" : "lazy"}
                  decoding="async"
                  className="select-none"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: fit,
                    objectPosition,
                    filter:
                      !isActive &&
                      (inactiveBrightness !== 1 || inactiveSaturation !== 1)
                        ? `brightness(${inactiveBrightness}) saturate(${inactiveSaturation})`
                        : undefined,
                    transition: `filter ${effectiveDuration}ms ${easing}`,
                  }}
                />
              )}

              {/* Readability gradient — restrained, bottom only. */}
              {textGradient && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background: `linear-gradient(to top, rgba(0,0,0,${(0.72 * overlayStrength).toFixed(2)}) 0%, rgba(0,0,0,${(0.28 * overlayStrength).toFixed(2)}) 34%, rgba(0,0,0,0) 62%)`,
                    opacity: isActive ? 1 : 0,
                    transition: `opacity ${Math.round(effectiveDuration * 0.6)}ms ${easing}`,
                  }}
                />
              )}

              {/* Active text — bottom-left overlay. Fades fast with no
                  delay on collapse; enters with a delay + rise only after
                  the card has opened enough room. Clipped so it can never
                  spill into a narrowing pill. */}
              <span
                aria-hidden={!isActive}
                style={{
                  position: "absolute",
                  left: effectivePadX,
                  right: effectivePadX,
                  bottom: effectivePadY,
                  display: "block",
                  overflow: "hidden",
                  pointerEvents: "none",
                  textAlign,
                  opacity: showText ? 1 : 0,
                  transform: showText ? "translateY(0)" : "translateY(10px)",
                  transition: showText
                    ? `opacity 380ms ${easing} ${Math.round(effectiveDuration * 0.38)}ms, transform 480ms ${easing} ${Math.round(effectiveDuration * 0.38)}ms`
                    : `opacity 160ms ${easing}, transform 200ms ${easing}`,
                  whiteSpace: "nowrap",
                }}
              >
                {item.title ? (
                  <span
                    style={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: titleFont,
                      fontSize: effectiveTitleSize,
                      fontWeight: 600,
                      lineHeight: 1.08,
                      letterSpacing: "-0.02em",
                      color: titleColor,
                    }}
                  >
                    {item.title}
                  </span>
                ) : null}
                {item.description ? (
                  <span
                    style={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: item.title ? textGap : 0,
                      fontFamily: descriptionFont,
                      fontSize: effectiveDescriptionSize,
                      fontWeight: 400,
                      lineHeight: 1.45,
                      letterSpacing: "0.01em",
                      color: descriptionColor,
                    }}
                  >
                    {item.description}
                  </span>
                ) : null}
              </span>

              {/* Screen-reader live label for the active item. */}
              <span className="sr-only">
                {isActive ? `${item.title ?? "Active"}. ` : ""}
                {item.description ?? ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default InteractiveMediaAccordion;
