"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

export type FocusCarouselMediaMode = "image" | "video";

export interface FocusCarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  image: { src: string; alt: string };
  video?: { src: string; poster?: string };
}

export interface FocusCarouselProps {
  /** At least three items; the deck loops infinitely in both directions. */
  items: FocusCarouselItem[];
  defaultIndex?: number;
  index?: number;
  onIndexChange?: (index: number) => void;
  mediaMode?: FocusCarouselMediaMode;
  defaultMediaMode?: FocusCarouselMediaMode;
  onMediaModeChange?: (mode: FocusCarouselMediaMode) => void;
  showToggle?: boolean;
  showCaption?: boolean;
  activeWidth?: number;
  sideWidth?: number;
  aspectRatio?: number;
  gap?: number;
  maxBlur?: number;
  duration?: number;
  draggable?: boolean;
  /** Scale the deck down in containers narrower than 700px. */
  responsive?: boolean;
  "aria-label"?: string;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export function focusCarouselMod(value: number, divisor: number) {
  if (divisor <= 0) return 0;
  return ((value % divisor) + divisor) % divisor;
}

export function focusCarouselSmoothstep(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

export function focusCarouselWidth(
  distance: number,
  activeWidth = 400,
  sideWidth = 208,
) {
  return (
    activeWidth + (sideWidth - activeWidth) * focusCarouselSmoothstep(distance)
  );
}

export function focusCarouselGrayscale(distance: number) {
  return clamp((distance - 0.6) / 0.4);
}

export function focusCarouselBlur(distance: number, maxBlur = 9) {
  return distance <= 1 ? 0 : Math.min(4 * (distance - 1), maxBlur);
}

/** Keep a position inside one full loop, centred on zero: [-count/2, count/2). */
export function focusCarouselWrapPosition(position: number, count: number) {
  if (count <= 0) return 0;
  return focusCarouselMod(position + count / 2, count) - count / 2;
}

/**
 * Every copy of an item differs by a multiple of `count`. Pick the copy that
 * is closest to the current position, preferring the clicked copy on ties.
 */
export function focusCarouselNearestIndex(
  index: number,
  position: number,
  count: number,
) {
  if (count <= 1) return index;
  const nearest = index + Math.round((position - index) / count) * count;
  return Math.abs(index - position) <= Math.abs(nearest - position) + 1e-9
    ? index
    : nearest;
}

/** Velocity-aware release target for a drag gesture. */
export function focusCarouselSnapTarget(
  position: number,
  velocity: number,
  slotStep: number,
) {
  const projected = position - (velocity / Math.max(slotStep, 1)) * 0.16;
  return Math.round(projected);
}

function cardWidthAt(
  index: number,
  position: number,
  activeWidth: number,
  sideWidth: number,
) {
  return focusCarouselWidth(Math.abs(index - position), activeWidth, sideWidth);
}

/** Centre of a card relative to the card at `Math.floor(position)`. */
function cardCenterOffset(
  index: number,
  position: number,
  activeWidth: number,
  sideWidth: number,
  gap: number,
) {
  const base = Math.floor(position);
  if (index === base) return 0;

  let offset = 0;
  if (index > base) {
    for (let slot = base; slot < index; slot += 1) {
      offset +=
        (cardWidthAt(slot, position, activeWidth, sideWidth) +
          cardWidthAt(slot + 1, position, activeWidth, sideWidth)) /
          2 +
        gap;
    }
  } else {
    for (let slot = base; slot > index; slot -= 1) {
      offset -=
        (cardWidthAt(slot, position, activeWidth, sideWidth) +
          cardWidthAt(slot - 1, position, activeWidth, sideWidth)) /
          2 +
        gap;
    }
  }
  return offset;
}

/** Fractional anchor between floor(position) and ceil(position). */
function stripAnchorOffset(
  position: number,
  activeWidth: number,
  sideWidth: number,
  gap: number,
) {
  const base = Math.floor(position);
  const fraction = position - base;
  const from = cardCenterOffset(base, position, activeWidth, sideWidth, gap);
  const to = cardCenterOffset(base + 1, position, activeWidth, sideWidth, gap);
  return from + (to - from) * fraction;
}

function useElementWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setWidth(element.clientWidth);
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

interface FocusCardProps {
  item: FocusCarouselItem;
  index: number;
  position: MotionValue<number>;
  activeWidth: number;
  activeHeight: number;
  sideWidth: number;
  gap: number;
  maxBlur: number;
  mediaMode: FocusCarouselMediaMode;
  isPrimary: boolean;
  isActive: boolean;
  isFocusable: boolean;
  near: boolean;
  shouldPlay: boolean;
  imageFailed: boolean;
  videoFailed: boolean;
  onImageError: (id: string) => void;
  onVideoError: (id: string) => void;
  onSelect: (index: number) => void;
}

function FocusCard({
  item,
  index,
  position,
  activeWidth,
  activeHeight,
  sideWidth,
  gap,
  maxBlur,
  mediaMode,
  isPrimary,
  isActive,
  isFocusable,
  near,
  shouldPlay,
  imageFailed,
  videoFailed,
  onImageError,
  onVideoError,
  onSelect,
}: FocusCardProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const distance = useTransform(position, (value) => Math.abs(index - value));

  const scale = useTransform(distance, (value) => {
    const width = focusCarouselWidth(value, activeWidth, sideWidth);
    return width / activeWidth;
  });

  const x = useTransform(position, (value) => {
    const offset = cardCenterOffset(index, value, activeWidth, sideWidth, gap);
    const anchor = stripAnchorOffset(value, activeWidth, sideWidth, gap);
    return offset - anchor - activeWidth / 2;
  });

  const zIndex = useTransform(
    distance,
    (value) => 100 - Math.min(90, Math.round(value * 10)),
  );

  const grayscale = useTransform(distance, (value) =>
    focusCarouselGrayscale(value).toFixed(3),
  );

  const brightness = useTransform(distance, (value) =>
    (1 - 0.06 * focusCarouselGrayscale(value)).toFixed(3),
  );

  // The card is scaled down to its visual size, so divide the blur by the
  // scale to keep the on-screen blur radius equal to the reference curve.
  const blur = useTransform(distance, (value) => {
    const visualScale = Math.max(
      focusCarouselWidth(value, activeWidth, sideWidth) / activeWidth,
      0.01,
    );
    return (focusCarouselBlur(value, maxBlur) / visualScale).toFixed(2);
  });

  const filter = useMotionTemplate`blur(${blur}px) grayscale(${grayscale}) brightness(${brightness})`;

  const showVideo =
    Boolean(item.video) && mediaMode === "video" && !videoFailed;
  const showImage = !showVideo && !imageFailed;

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {
          /* Autoplay may be blocked; the poster/image remains visible. */
        });
      }
    } else {
      video.pause();
    }
  }, [shouldPlay, showVideo]);

  const label = item.subtitle ? `${item.title}, ${item.subtitle}` : item.title;

  return (
    <motion.button
      type="button"
      data-fc-card=""
      data-fc-index={index}
      data-fc-active={isActive ? "true" : "false"}
      data-fc-clone={isPrimary ? "false" : "true"}
      aria-label={label}
      aria-current={isActive ? "true" : undefined}
      aria-hidden={isPrimary ? undefined : true}
      tabIndex={isFocusable ? 0 : -1}
      onClick={() => onSelect(index)}
      className={cn(
        "absolute left-1/2 top-1/2 m-0 block border-0 bg-muted p-0",
        "cursor-[inherit] overflow-hidden text-left outline-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
      style={{
        width: activeWidth,
        height: activeHeight,
        x,
        y: -activeHeight / 2,
        scale,
        filter,
        zIndex,
        willChange: near ? "transform, filter" : undefined,
        transformOrigin: "50% 50%",
      }}
    >
      {showVideo && item.video ? (
        <video
          ref={videoRef}
          src={item.video.src}
          poster={item.video.poster ?? item.image.src}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          draggable={false}
          onError={() => onVideoError(item.id)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {showImage ? (
        <img
          src={item.image.src}
          alt={item.image.alt}
          draggable={false}
          decoding="async"
          loading={Math.abs(index) <= 4 ? "eager" : "lazy"}
          onError={() => onImageError(item.id)}
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
      ) : null}

      {!showVideo && imageFailed ? (
        <span aria-hidden="true" className="absolute inset-0 bg-muted" />
      ) : null}
    </motion.button>
  );
}

interface FocusCaptionProps {
  item: FocusCarouselItem | undefined;
  epoch: number;
  color: string;
  reduceMotion: boolean;
}

function FocusCaption({ item, epoch, color, reduceMotion }: FocusCaptionProps) {
  if (!item) return null;

  const enter = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : {
        initial: { y: "110%", opacity: 0 },
        animate: { y: "0%", opacity: 1 },
      };

  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 h-[6px] w-[6px] -translate-x-1/2"
        style={{
          top: "calc(50% + var(--fc-half-h) + 16px)",
          background: color,
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-baseline justify-between gap-4"
        style={{
          top: "calc(50% + var(--fc-half-h) + 32px)",
          width: "var(--fc-active-w)",
        }}
        data-fc-caption=""
      >
        <span className="min-w-0 flex-1 overflow-hidden">
          <motion.span
            key={`title-${epoch}`}
            initial={enter.initial}
            animate={enter.animate}
            transition={{
              duration: reduceMotion ? 0.14 : 0.42,
              ease: EASE,
            }}
            className="block truncate text-[14px] font-medium leading-none tracking-[-0.01em]"
            style={{ color }}
            data-fc-title=""
          >
            {item.title}
          </motion.span>
        </span>

        <span className="min-w-0 flex-1 overflow-hidden text-right">
          <motion.span
            key={`subtitle-${epoch}`}
            initial={enter.initial}
            animate={enter.animate}
            transition={{
              duration: reduceMotion ? 0.14 : 0.42,
              ease: EASE,
              delay: reduceMotion ? 0 : 0.06,
            }}
            className="block truncate text-[13px] font-normal leading-none tracking-[-0.01em]"
            style={{ color }}
            data-fc-subtitle=""
          >
            {item.subtitle ?? ""}
          </motion.span>
        </span>
      </div>
    </>
  );
}

interface FocusToggleProps {
  mode: FocusCarouselMediaMode;
  onChange: (mode: FocusCarouselMediaMode) => void;
  track: string;
  ink: string;
  muted: string;
}

function FocusToggle({ mode, onChange, track, ink, muted }: FocusToggleProps) {
  const modes: FocusCarouselMediaMode[] = ["image", "video"];
  const activeIndex = mode === "image" ? 0 : 1;
  const groupRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let next: FocusCarouselMediaMode | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = "video";
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = "image";
    } else if (event.key === "Home") {
      next = "image";
    } else if (event.key === "End") {
      next = "video";
    }

    if (!next) return;
    event.preventDefault();
    event.stopPropagation();
    if (next !== mode) onChange(next);
    groupRef.current
      ?.querySelector<HTMLButtonElement>(`[data-fc-mode-option="${next}"]`)
      ?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Media type"
      data-fc-toggle=""
      data-fc-media-mode={mode}
      onKeyDown={handleKeyDown}
      className="absolute left-1/2 z-50 flex -translate-x-1/2 items-center overflow-hidden rounded-full"
      style={{
        top: 22,
        width: 164,
        height: 33,
        background: track,
        cursor: "default",
      }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute left-0 top-0 rounded-full"
        style={{ width: 82, height: 33, background: ink }}
        initial={false}
        animate={{ x: activeIndex * 82 }}
        transition={{ duration: 0.2, ease: EASE }}
      />

      {modes.map((value) => {
        const active = value === mode;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            data-fc-mode-option={value}
            onClick={() => onChange(value)}
            className={cn(
              "relative z-10 h-full w-1/2 rounded-full border-0 bg-transparent p-0",
              "text-[13px] font-medium leading-none outline-none transition-colors duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ring",
            )}
            style={{
              color: active ? "var(--background)" : muted,
              cursor: "pointer",
            }}
          >
            {value === "image" ? "Image" : "Video"}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Infinite, distance-driven media carousel. One active card sits at the
 * centre while every other card's width, blur, colour, and position are
 * continuous functions of its fractional distance from the animated
 * `position` value.
 */
export function FocusCarousel({
  items,
  defaultIndex = 0,
  index,
  onIndexChange,
  mediaMode,
  defaultMediaMode = "image",
  onMediaModeChange,
  showToggle = true,
  showCaption = true,
  activeWidth = 400,
  sideWidth = 208,
  aspectRatio = 3 / 4,
  gap = 22,
  maxBlur = 9,
  duration = 0.55,
  draggable = true,
  responsive = true,
  "aria-label": ariaLabel = "Focus carousel",
  className,
}: FocusCarouselProps) {
  const count = items.length;
  const safeCount = Math.max(count, 1);
  const reduceMotion = useReducedMotion() ?? false;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const containerWidth = useElementWidth(rootRef);

  const [internalMediaMode, setInternalMediaMode] =
    React.useState<FocusCarouselMediaMode>(defaultMediaMode);
  const resolvedMediaMode = mediaMode ?? internalMediaMode;

  const responsiveScale =
    responsive && containerWidth > 0 && containerWidth < 700
      ? Math.max(0.42, containerWidth / 700)
      : 1;

  const effectiveActiveWidth = activeWidth * responsiveScale;
  const effectiveSideWidth = sideWidth * responsiveScale;
  const effectiveGap = gap * responsiveScale;
  const effectiveActiveHeight = effectiveActiveWidth / aspectRatio;
  const stageTop = showToggle ? 55 : 0;
  const slotStep = effectiveSideWidth + effectiveGap;

  const initialCanonical = focusCarouselMod(index ?? defaultIndex, safeCount);
  const initialPhysical = focusCarouselWrapPosition(
    initialCanonical,
    safeCount,
  );

  const position = useMotionValue(initialPhysical);
  const [activePhysical, setActivePhysical] = React.useState(initialPhysical);
  const [captionIndex, setCaptionIndex] = React.useState(initialCanonical);
  const [captionEpoch, setCaptionEpoch] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [failedMedia, setFailedMedia] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [ghost, setGhost] = React.useState<{
    item: FocusCarouselItem;
    mediaMode: FocusCarouselMediaMode;
  } | null>(null);

  const captionOpacity = useMotionValue(1);
  const ghostOpacity = useMotionValue(0);
  const animationRef = React.useRef<ReturnType<typeof animate> | null>(null);
  const sequenceRef = React.useRef(0);
  const lastReportedRef = React.useRef(initialCanonical);
  const suppressClickRef = React.useRef(false);
  const dragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPosition: number;
    lastX: number;
    lastTime: number;
    velocity: number;
    moved: boolean;
  } | null>(null);

  const activeCanonical = focusCarouselMod(activePhysical, safeCount);
  const isControlled = index !== undefined;

  React.useEffect(() => {
    if (count === 0) return;
    const wrapped = focusCarouselWrapPosition(position.get(), count);
    const canonical = focusCarouselMod(wrapped, count);
    position.set(wrapped);
    setActivePhysical(wrapped);
    setCaptionIndex(canonical);
    lastReportedRef.current = canonical;
  }, [count, position]);

  const fadeCaptionOut = React.useCallback(() => {
    if (!showCaption) return;
    animate(captionOpacity, 0, {
      duration: reduceMotion ? 0.08 : 0.12,
      ease: "easeOut",
    });
  }, [captionOpacity, reduceMotion, showCaption]);

  const revealCaption = React.useCallback(
    (physicalIndex: number) => {
      if (!showCaption) return;
      setCaptionIndex(focusCarouselMod(physicalIndex, safeCount));
      setCaptionEpoch((epoch) => epoch + 1);
      animate(captionOpacity, 1, {
        duration: 0.01,
        ease: "linear",
      });
    },
    [captionOpacity, safeCount, showCaption],
  );

  const runNavigation = React.useCallback(
    (target: number, options?: { report?: boolean; force?: boolean }) => {
      if (count === 0) return;
      const current = position.get();
      const alreadyThere = Math.abs(target - current) < 0.001;
      if (alreadyThere && !options?.force) return;

      animationRef.current?.stop();
      animationRef.current = null;
      sequenceRef.current += 1;
      const sequence = sequenceRef.current;

      const canonical = focusCarouselMod(target, safeCount);
      setActivePhysical(target);

      if (options?.report !== false) {
        lastReportedRef.current = canonical;
        onIndexChange?.(canonical);
      }

      if (alreadyThere) {
        setCaptionIndex(canonical);
        setCaptionEpoch((epoch) => epoch + 1);
        captionOpacity.set(1);
        return;
      }

      fadeCaptionOut();

      if (reduceMotion) {
        const previousItem = items[activeCanonical];
        if (previousItem) {
          setGhost({
            item: previousItem,
            mediaMode: resolvedMediaMode,
          });
        }
        position.set(target);
        revealCaption(target);
        return;
      }

      animationRef.current = animate(position, target, {
        duration: Math.max(duration, 0.01),
        ease: EASE,
        onComplete: () => {
          if (sequenceRef.current !== sequence) return;
          const wrapped = focusCarouselWrapPosition(target, safeCount);
          if (wrapped !== target) {
            position.set(wrapped);
            setActivePhysical(wrapped);
          }
          revealCaption(target);
        },
      });
    },
    [
      activeCanonical,
      captionOpacity,
      count,
      duration,
      fadeCaptionOut,
      items,
      onIndexChange,
      position,
      reduceMotion,
      resolvedMediaMode,
      revealCaption,
      safeCount,
    ],
  );

  React.useEffect(() => {
    if (!ghost) return;
    ghostOpacity.set(1);
    const controls = animate(ghostOpacity, 0, {
      duration: 0.24,
      ease: "easeOut",
      onComplete: () => setGhost(null),
    });
    return () => controls.stop();
  }, [ghost, ghostOpacity]);

  React.useEffect(() => {
    if (!isControlled || count === 0) return;
    const canonical = focusCarouselMod(index, count);
    if (canonical === lastReportedRef.current) return;
    const target = focusCarouselNearestIndex(canonical, position.get(), count);
    lastReportedRef.current = canonical;
    runNavigation(target, { report: false });
  }, [count, index, isControlled, position, runNavigation]);

  const selectCard = React.useCallback(
    (cardIndex: number) => {
      const target = focusCarouselNearestIndex(
        cardIndex,
        position.get(),
        safeCount,
      );
      runNavigation(target);
    },
    [position, runNavigation, safeCount],
  );

  const step = React.useCallback(
    (direction: 1 | -1) => {
      if (count < 2) return;
      const current = Math.round(position.get());
      runNavigation(current + direction);
    },
    [count, position, runNavigation],
  );

  const selectMediaMode = React.useCallback(
    (next: FocusCarouselMediaMode) => {
      if (next === resolvedMediaMode) return;
      if (mediaMode === undefined) setInternalMediaMode(next);
      onMediaModeChange?.(next);
    },
    [mediaMode, onMediaModeChange, resolvedMediaMode],
  );

  const markMediaFailed = React.useCallback((key: string) => {
    setFailedMedia((previous) => {
      if (previous.has(key)) return previous;
      const next = new Set(previous);
      next.add(key);
      return next;
    });
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || count < 2 || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-fc-toggle]")) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: position.get(),
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      moved: false,
    };
    suppressClickRef.current = false;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.moved) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 4) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        dragRef.current = null;
        return;
      }
      drag.moved = true;
      setDragging(true);
      fadeCaptionOut();
      try {
        rootRef.current?.setPointerCapture(event.pointerId);
      } catch {
        /* Pointer capture is best-effort. */
      }
    }

    const now = performance.now();
    const dt = Math.max(1, now - drag.lastTime);
    const instantVelocity = ((event.clientX - drag.lastX) / dt) * 1000;
    drag.velocity = drag.velocity * 0.7 + instantVelocity * 0.3;
    drag.lastX = event.clientX;
    drag.lastTime = now;

    position.set(
      focusCarouselWrapPosition(
        drag.startPosition - dx / Math.max(slotStep, 1),
        safeCount,
      ),
    );
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;

    if (!drag.moved) {
      setDragging(false);
      return;
    }

    setDragging(false);
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);

    // A pause before release means the gesture is no longer a flick.
    const idle = performance.now() - drag.lastTime;
    const target = focusCarouselSnapTarget(
      position.get(),
      idle > 90 ? 0 : drag.velocity,
      slotStep,
    );
    runNavigation(target, { force: true });
  };

  if (count === 0) return null;

  const radius = Math.max(count, 8);
  const renderedIndexes: number[] = [];
  for (let cardIndex = -radius; cardIndex <= radius; cardIndex += 1) {
    renderedIndexes.push(cardIndex);
  }

  const captionItem = items[captionIndex];
  const ghostImage = ghost?.item.image.src;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      data-focus-carousel=""
      data-active-index={activeCanonical}
      className={cn(
        "relative w-full select-none overflow-hidden bg-background text-foreground",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ring/40",
        className,
      )}
      style={
        {
          "--fc-gap": `${effectiveGap}px`,
          "--fc-active-w": `${effectiveActiveWidth}px`,
          "--fc-side-w": `${effectiveSideWidth}px`,
          "--fc-active-h": `${effectiveActiveHeight}px`,
          "--fc-half-h": `${effectiveActiveHeight / 2}px`,
          "--fc-max-blur": `${maxBlur}px`,
          "--fc-ink": "var(--foreground)",
          "--fc-muted": "var(--muted-foreground)",
          "--fc-track": "var(--muted)",
          "--fc-dim": "0.94",
          "--fc-aspect": String(aspectRatio),
          height: "100%",
          minHeight:
            effectiveActiveHeight +
            56 +
            (showToggle ? 70 : 0) +
            (showCaption ? 90 : 0),
          touchAction: "pan-y",
          cursor: dragging ? "grabbing" : "grab",
        } as React.CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={(event) => {
        if (!suppressClickRef.current) return;
        suppressClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("[data-fc-toggle]")) return;

        if (event.key === "ArrowRight") {
          event.preventDefault();
          step(1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          step(-1);
        } else if (event.key === "Home") {
          event.preventDefault();
          runNavigation(
            focusCarouselNearestIndex(0, position.get(), safeCount),
          );
        } else if (event.key === "End") {
          event.preventDefault();
          runNavigation(
            focusCarouselNearestIndex(safeCount - 1, position.get(), safeCount),
          );
        }
      }}
    >
      {showToggle ? (
        <FocusToggle
          mode={resolvedMediaMode}
          onChange={selectMediaMode}
          track="var(--muted)"
          ink="var(--foreground)"
          muted="var(--muted-foreground)"
        />
      ) : null}

      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {items[activeCanonical]?.title ?? ""}
      </span>

      <div
        className="absolute inset-x-0"
        style={{ top: stageTop, bottom: 0 }}
        data-fc-stage=""
      >
        <div className="relative h-full w-full">
          {renderedIndexes.map((cardIndex) => {
            const item = items[focusCarouselMod(cardIndex, count)];
            if (!item) return null;

            const primaryIndex =
              count <= 1
                ? activePhysical
                : focusCarouselNearestIndex(cardIndex, activePhysical, count);
            const isPrimary = cardIndex === primaryIndex;
            const isActive =
              isPrimary &&
              focusCarouselMod(cardIndex, count) === activeCanonical;

            return (
              <FocusCard
                key={cardIndex}
                item={item}
                index={cardIndex}
                position={position}
                activeWidth={effectiveActiveWidth}
                activeHeight={effectiveActiveHeight}
                sideWidth={effectiveSideWidth}
                gap={effectiveGap}
                maxBlur={maxBlur}
                mediaMode={resolvedMediaMode}
                isPrimary={isPrimary}
                isActive={isActive}
                isFocusable={
                  isPrimary && Math.abs(cardIndex - activePhysical) <= 3
                }
                near={Math.abs(cardIndex - activePhysical) <= 6}
                shouldPlay={isActive && resolvedMediaMode === "video"}
                imageFailed={failedMedia.has(`image:${item.id}`)}
                videoFailed={failedMedia.has(`video:${item.id}`)}
                onImageError={(id) => markMediaFailed(`image:${id}`)}
                onVideoError={(id) => markMediaFailed(`video:${id}`)}
                onSelect={selectCard}
              />
            );
          })}

          {ghost && ghostImage ? (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 overflow-hidden bg-muted"
              style={{
                width: effectiveActiveWidth,
                height: effectiveActiveHeight,
                x: -effectiveActiveWidth / 2,
                y: -effectiveActiveHeight / 2,
                opacity: ghostOpacity,
                zIndex: 40,
              }}
            >
              <img
                src={ghostImage}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </motion.div>
          ) : null}

          {showCaption ? (
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{ opacity: captionOpacity }}
            >
              <FocusCaption
                item={captionItem}
                epoch={captionEpoch}
                color="var(--foreground)"
                reduceMotion={reduceMotion}
              />
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default FocusCarousel;
