"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export interface PixelWipeSlide {
  src: string;
  alt: string;
}

export interface PixelWipeCarouselProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Images displayed by the carousel. */
  slides: PixelWipeSlide[];
  /** Time between the beginning of two transitions, in milliseconds. */
  interval?: number;
  /** Duration of the pixel wipe, in milliseconds. */
  transitionDuration?: number;
  /** Largest mosaic cell used at the middle of a transition. */
  pixelSize?: number;
  /** Begin cycling as soon as the images are ready. */
  autoPlay?: boolean;
  /** Pause automatic transitions while the pointer is over the carousel. */
  pauseOnHover?: boolean;
  /** Small first line rendered over the lower-left corner. */
  label?: React.ReactNode;
  /** Second line rendered below the label. */
  caption?: React.ReactNode;
  /** Content rendered above the canvas. */
  overlay?: React.ReactNode;
  /** Accessible name for the carousel region. */
  ariaLabel?: string;
}

type DrawableImage = HTMLImageElement | null | undefined;

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const scale = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;

  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function easeOutQuint(value: number) {
  return 1 - Math.pow(1 - value, 5);
}

export function PixelWipeCarousel({
  slides,
  interval = 1600,
  transitionDuration = 800,
  pixelSize = 34,
  autoPlay = true,
  pauseOnHover = false,
  label = "ACME",
  caption = "for SYSTEM MAGAZINE",
  overlay,
  ariaLabel = "Pixel wipe image carousel",
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  ...props
}: PixelWipeCarouselProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const pixelCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const imagesRef = React.useRef<DrawableImage[]>([]);
  const currentIndexRef = React.useRef(0);
  const transitionStartRef = React.useRef<number | null>(null);
  const frameRef = React.useRef(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleNextRef = React.useRef<() => void>(() => undefined);
  const pausedRef = React.useRef(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const slidesKey = React.useMemo(
    () =>
      slides.map((slide) => `${slide.src}\u0000${slide.alt}`).join("\u0001"),
    [slides],
  );

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!host || !canvas || !context || slides.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let disposed = false;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const cancelWork = () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    const drawSharp = (image: DrawableImage) => {
      if (!image || !image.naturalWidth || !image.naturalHeight) return;
      context.imageSmoothingEnabled = true;
      drawCover(context, image, width, height);
    };

    const drawPixelated = (image: DrawableImage, blockSize: number) => {
      if (!image || !image.naturalWidth || !image.naturalHeight) return;

      const pixelCanvas =
        pixelCanvasRef.current ?? document.createElement("canvas");
      pixelCanvasRef.current = pixelCanvas;
      const pixelContext = pixelCanvas.getContext("2d");
      if (!pixelContext) return;

      const safeBlockSize = Number.isFinite(blockSize)
        ? Math.max(1, blockSize)
        : 1;
      const columns = Math.max(1, Math.ceil(width / safeBlockSize));
      const rows = Math.max(1, Math.ceil(height / safeBlockSize));
      if (pixelCanvas.width !== columns) pixelCanvas.width = columns;
      if (pixelCanvas.height !== rows) pixelCanvas.height = rows;
      if (!pixelCanvas.width || !pixelCanvas.height) return;

      pixelContext.clearRect(0, 0, columns, rows);
      pixelContext.imageSmoothingEnabled = true;
      drawCover(pixelContext, image, columns, rows);

      context.imageSmoothingEnabled = false;
      context.drawImage(pixelCanvas, 0, 0, width, height);
      context.imageSmoothingEnabled = true;
    };

    const renderStill = () => {
      context.clearRect(0, 0, width, height);
      drawSharp(imagesRef.current[currentIndexRef.current]);
    };

    const scheduleNext = () => {
      if (
        disposed ||
        pausedRef.current ||
        !autoPlay ||
        reducedMotion ||
        slides.length < 2
      ) {
        return;
      }

      const holdDuration = Math.max(0, interval - transitionDuration);
      timerRef.current = setTimeout(() => {
        transitionStartRef.current = performance.now();
        frameRef.current = requestAnimationFrame(renderTransition);
      }, holdDuration);
    };
    scheduleNextRef.current = scheduleNext;

    const renderTransition = (now: number) => {
      const startedAt = transitionStartRef.current ?? now;
      const duration = Math.max(120, transitionDuration);
      const progress = Math.min(1, (now - startedAt) / duration);
      const reveal = easeOutQuint(progress);
      const nextIndex = (currentIndexRef.current + 1) % slides.length;
      const mosaicStrength = Math.sin(Math.PI * Math.pow(progress, 0.72));
      const blockSize = Math.max(
        1,
        1 + (Math.max(2, pixelSize) - 1) * mosaicStrength,
      );

      context.clearRect(0, 0, width, height);
      drawSharp(imagesRef.current[currentIndexRef.current]);
      context.save();
      context.beginPath();
      context.rect(width * (1 - reveal), 0, width * reveal + 1, height);
      context.clip();
      drawPixelated(imagesRef.current[nextIndex], blockSize);
      context.restore();

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(renderTransition);
        return;
      }

      currentIndexRef.current = nextIndex;
      transitionStartRef.current = null;
      frameRef.current = 0;
      setActiveIndex(nextIndex);
      renderStill();
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
      renderStill();
    };

    cancelWork();
    currentIndexRef.current = 0;
    setActiveIndex(0);
    imagesRef.current = slides.map(() => null);

    let loaded = 0;
    slides.forEach((slide, index) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (disposed) return;
        imagesRef.current[index] = image;
        loaded += 1;
        if (index === 0) renderStill();
        if (loaded === slides.length) scheduleNext();
      };
      image.onerror = () => {
        if (disposed) return;
        loaded += 1;
        if (loaded === slides.length) scheduleNext();
      };
      image.src = slide.src;
    });

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    return () => {
      disposed = true;
      observer.disconnect();
      cancelWork();
      scheduleNextRef.current = () => undefined;
    };
  }, [autoPlay, interval, pixelSize, slides, slidesKey, transitionDuration]);

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
    if (pauseOnHover && wasPaused && !transitionStartRef.current) {
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
        "relative isolate overflow-hidden bg-white transition-colors duration-300 dark:bg-black",
        className,
      )}
      style={{ containerType: "size", ...style }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0" />

      {(label || caption) && (
        <div className="absolute bottom-[4.4%] left-[6.84%] z-10 flex max-w-[82%] flex-col items-start gap-[0.4cqh] font-['Arial_Narrow',Arial,sans-serif] text-[clamp(7px,2.35cqw,20px)] font-semibold leading-none tracking-[-0.035em] text-black dark:text-white">
          {label && (
            <span className="flex h-[4.4cqh] w-[13.3cqw] items-center bg-white px-[1.4cqw] ring-1 ring-black/8 backdrop-blur-sm dark:bg-black/90 dark:ring-white/15">
              {label}
            </span>
          )}
          {caption && (
            <span className="flex h-[4.4cqh] w-[42.8cqw] items-center whitespace-nowrap bg-white px-[1.4cqw] ring-1 ring-black/8 backdrop-blur-sm dark:bg-black/90 dark:ring-white/15">
              {caption}
            </span>
          )}
        </div>
      )}

      {overlay && <div className="absolute inset-0 z-20">{overlay}</div>}

      <span className="sr-only" aria-live="polite">
        {slides[activeIndex]?.alt}
      </span>
    </div>
  );
}
