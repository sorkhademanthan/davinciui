"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export interface SegmentedImageSlide {
  /** Image source displayed by the carousel. */
  src: string;
  /** Accessible description for the image. */
  alt: string;
  /** Horizontal focal point used while cover-cropping, from 0 to 1. */
  positionX?: number;
  /** Vertical focal point used while cover-cropping, from 0 to 1. */
  positionY?: number;
}

export interface SegmentedImageCarouselProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Images displayed in sequence. */
  slides: readonly SegmentedImageSlide[];
  /** Number of horizontal slices in the transition grid. */
  rows?: number;
  /** Number of vertical slices in the transition grid. */
  columns?: number;
  /** Time between the beginning of consecutive transitions, in milliseconds. */
  interval?: number;
  /** Total duration of one segmented handoff, in milliseconds. */
  transitionDuration?: number;
  /** Automatically cycle through the supplied slides. */
  autoPlay?: boolean;
  /** Pause automatic playback while the pointer is over the component. */
  pauseOnHover?: boolean;
  /** Keep the faint editorial grid visible between transitions. */
  showGrid?: boolean;
  /** Accessible name for the carousel region. */
  ariaLabel?: string;
}

type LoadedImage = HTMLImageElement | null | undefined;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smootherStep(value: number) {
  const progress = clamp(value);
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  slide: SegmentedImageSlide,
) {
  const scale = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const positionX = clamp(slide.positionX ?? 0.5);
  const positionY = clamp(slide.positionY ?? 0.5);

  context.drawImage(
    image,
    -(drawWidth - width) * positionX,
    -(drawHeight - height) * positionY,
    drawWidth,
    drawHeight,
  );
}

function shuffledCellOrder(total: number, seed: number) {
  const order = Array.from({ length: total }, (_, index) => index);
  let value = (seed + 1) * 0x9e3779b1;

  for (let index = total - 1; index > 0; index -= 1) {
    value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
    value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
    value ^= value >>> 15;
    const swapIndex = Math.abs(value) % (index + 1);
    const current = order[index];
    order[index] = order[swapIndex] ?? index;
    order[swapIndex] = current ?? swapIndex;
  }

  return order;
}

/**
 * An autoplaying image carousel that reconstructs every new frame through a
 * staggered grid of hard-edged editorial slices.
 */
export function SegmentedImageCarousel({
  slides,
  rows = 9,
  columns = 2,
  interval = 1500,
  transitionDuration = 680,
  autoPlay = true,
  pauseOnHover = false,
  showGrid = true,
  ariaLabel = "Segmented image carousel",
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  ...props
}: SegmentedImageCarouselProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imagesRef = React.useRef<LoadedImage[]>([]);
  const currentIndexRef = React.useRef(0);
  const nextIndexRef = React.useRef(0);
  const transitionStartRef = React.useRef<number | null>(null);
  const animationFrameRef = React.useRef(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = React.useRef(false);
  const visibleRef = React.useRef(true);
  const reducedMotionRef = React.useRef(false);
  const cycleRef = React.useRef(0);
  const cellOrderRef = React.useRef<number[]>([]);
  const scheduleNextRef = React.useRef<() => void>(() => undefined);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const safeRows = Math.max(1, Math.round(rows));
  const safeColumns = Math.max(1, Math.round(columns));
  const slidesKey = React.useMemo(
    () =>
      slides
        .map(
          (slide) =>
            `${slide.src}\u0000${slide.alt}\u0000${slide.positionX ?? ""}\u0000${slide.positionY ?? ""}`,
        )
        .join("\u0001"),
    [slides],
  );

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!host || !canvas || !context || slides.length === 0) return;

    let disposed = false;
    let width = 1;
    let height = 1;
    let dpr = 1;

    const cancelWork = () => {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    const drawSlide = (index: number) => {
      const image = imagesRef.current[index];
      const slide = slides[index];
      if (!image?.naturalWidth || !image.naturalHeight || !slide) return;
      drawCover(context, image, width, height, slide);
    };

    const drawStill = () => {
      context.clearRect(0, 0, width, height);
      context.globalAlpha = 1;
      drawSlide(currentIndexRef.current);
    };

    const scheduleNext = () => {
      if (
        disposed ||
        pausedRef.current ||
        !visibleRef.current ||
        reducedMotionRef.current ||
        !autoPlay ||
        slides.length < 2 ||
        timerRef.current ||
        transitionStartRef.current !== null
      ) {
        return;
      }

      const holdDuration = Math.max(0, interval - transitionDuration);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const totalCells = safeRows * safeColumns;
        cycleRef.current += 1;
        nextIndexRef.current = (currentIndexRef.current + 1) % slides.length;
        cellOrderRef.current = shuffledCellOrder(totalCells, cycleRef.current);
        transitionStartRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(renderTransition);
      }, holdDuration);
    };
    scheduleNextRef.current = scheduleNext;

    const renderTransition = (now: number) => {
      const startedAt = transitionStartRef.current ?? now;
      const duration = Math.max(180, transitionDuration);
      const elapsed = Math.max(0, now - startedAt);
      const progress = Math.min(1, elapsed / duration);
      const cellWidth = width / safeColumns;
      const cellHeight = height / safeRows;
      const totalCells = safeRows * safeColumns;
      const maxStagger = duration * 0.42;
      const tileDuration = Math.max(120, duration - maxStagger);

      context.clearRect(0, 0, width, height);
      context.globalAlpha = 1;
      drawSlide(currentIndexRef.current);

      for (let orderIndex = 0; orderIndex < totalCells; orderIndex += 1) {
        const cellIndex = cellOrderRef.current[orderIndex] ?? orderIndex;
        const row = Math.floor(cellIndex / safeColumns);
        const column = cellIndex % safeColumns;
        const delay =
          totalCells <= 1 ? 0 : (orderIndex / (totalCells - 1)) * maxStagger;
        const localProgress = smootherStep((elapsed - delay) / tileDuration);
        if (localProgress <= 0) continue;

        context.save();
        context.beginPath();
        context.rect(
          column * cellWidth,
          row * cellHeight,
          cellWidth + 0.5,
          cellHeight + 0.5,
        );
        context.clip();
        context.globalAlpha = localProgress;
        drawSlide(nextIndexRef.current);
        context.restore();
      }

      context.globalAlpha = 1;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(renderTransition);
        return;
      }

      currentIndexRef.current = nextIndexRef.current;
      transitionStartRef.current = null;
      animationFrameRef.current = 0;
      setActiveIndex(currentIndexRef.current);
      drawStill();
      scheduleNext();
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawStill();
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      reducedMotionRef.current = motionQuery.matches;
      if (motionQuery.matches) {
        cancelWork();
        transitionStartRef.current = null;
        drawStill();
      } else {
        scheduleNext();
      }
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? false;
        if (!visibleRef.current) {
          cancelWork();
          transitionStartRef.current = null;
          drawStill();
        } else {
          scheduleNext();
        }
      },
      { rootMargin: "160px" },
    );

    cancelWork();
    currentIndexRef.current = 0;
    nextIndexRef.current = 0;
    cycleRef.current = 0;
    setActiveIndex(0);
    imagesRef.current = slides.map(() => null);

    let settled = 0;
    slides.forEach((slide, index) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (disposed) return;
        imagesRef.current[index] = image;
        settled += 1;
        if (index === 0) drawStill();
        if (settled === slides.length) scheduleNext();
      };
      image.onerror = () => {
        if (disposed) return;
        settled += 1;
        if (settled === slides.length) scheduleNext();
      };
      image.src = slide.src;
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    visibilityObserver.observe(host);
    motionQuery.addEventListener("change", updateMotionPreference);
    reducedMotionRef.current = motionQuery.matches;
    resize();

    return () => {
      disposed = true;
      cancelWork();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      motionQuery.removeEventListener("change", updateMotionPreference);
      scheduleNextRef.current = () => undefined;
    };
  }, [
    autoPlay,
    interval,
    safeColumns,
    safeRows,
    slides,
    slidesKey,
    transitionDuration,
  ]);

  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pauseOnHover) {
      pausedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onPointerEnter?.(event);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    const wasPaused = pausedRef.current;
    pausedRef.current = false;
    if (pauseOnHover && wasPaused && transitionStartRef.current === null) {
      scheduleNextRef.current();
    }
    onPointerLeave?.(event);
  };

  return (
    <div
      ref={hostRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={cn(
        "relative isolate overflow-hidden bg-neutral-100 text-black dark:bg-neutral-950 dark:text-white",
        className,
      )}
      style={{ containerType: "size", ...style }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0" />

      {showGrid && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, transparent calc(100% - 1px), currentColor calc(100% - 1px)), linear-gradient(to right, transparent calc(100% - 1px), currentColor calc(100% - 1px))",
            backgroundSize: `${100 / safeColumns}% ${100 / safeRows}%`,
          }}
        />
      )}

      <span className="sr-only" aria-live="off">
        {slides[activeIndex]?.alt}
      </span>
    </div>
  );
}
