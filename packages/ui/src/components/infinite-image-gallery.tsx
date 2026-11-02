"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface InfiniteImageGalleryImage {
  /** Image source rendered inside a tile. */
  src: string;
  /** Accessible description for the image. */
  alt?: string;
}

export interface InfiniteImageGalleryProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Images repeated around the cylinder. */
  images: readonly InfiniteImageGalleryImage[];
  /** Rotation speed in degrees per second. */
  speed?: number;
  /** Direction the images travel across the front of the cylinder. */
  direction?: "left" | "right";
  /** Cylinder radius in pixels. Defaults to half the stage width. */
  radius?: number;
  /** CSS perspective distance in pixels. Defaults to 3.5 × radius. */
  perspective?: number;
  /** Base gap between tiles in pixels. */
  gap?: number;
  /** Base corner radius in pixels. */
  borderRadius?: number;
  /** CSS object-fit value used by every image. */
  imageFit?: React.CSSProperties["objectFit"];
  /** Whether the cylinder advances automatically. */
  autoplay?: boolean;
  /** Whether the keyboard pause/play control is available. */
  showControls?: boolean;
  /** Number of rows wrapped around the cylinder. */
  rows?: number;
  /** Number of columns around the cylinder. Derived from radius by default. */
  columns?: number;
  /** Camera tilt in degrees. */
  tilt?: number;
}

interface GallerySize {
  width: number;
  height: number;
}

interface GalleryGeometry {
  tileWidth: number;
  tileHeight: number;
  gap: number;
  radius: number;
  perspective: number;
  rows: number;
  columns: number;
  tilt: number;
  borderRadius: number;
  stepRad: number;
}

interface GalleryTile {
  key: string;
  image: InfiniteImageGalleryImage;
  x: number;
  y: number;
  z: number;
  angle: number;
}

const FALLBACK_WIDTH = 1200;
const FALLBACK_HEIGHT = 600;
const TILE_ASPECT_RATIO = 0.9;
const DEFAULT_SPEED = 9;
const DEFAULT_TILT = -8;
const DEFAULT_BORDER_RADIUS = 18;
const DEFAULT_ROWS = 3;
const MIN_COLUMNS = 8;
const MAX_COLUMNS = 34;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function buildGeometry(
  width: number,
  height: number,
  options: {
    radius?: number;
    perspective?: number;
    gap?: number;
    borderRadius?: number;
    rows?: number;
    columns?: number;
    tilt?: number;
  },
): GalleryGeometry {
  const rows = clamp(
    Math.round(
      options.rows ??
        (height > width * 1.2 && height >= 700 ? 5 : DEFAULT_ROWS),
    ),
    1,
    6,
  );
  const radius = Math.max(80, options.radius ?? width / 2);
  const perspective = Math.max(
    radius * 1.2,
    options.perspective ?? radius * 3.5,
  );
  const frontScale = perspective / (perspective - radius);
  const gapRatio = 0.14;
  const rowHeightBudget =
    (height * 0.94) /
    frontScale /
    (rows / TILE_ASPECT_RATIO + (rows - 1) * gapRatio);
  const tileWidth = clamp(width * 0.115, 88, Math.min(176, rowHeightBudget));
  const gap = clamp(options.gap ?? tileWidth * gapRatio, 0, 120);
  const columns = clamp(
    Math.round(options.columns ?? (Math.PI * 2 * radius) / (tileWidth + gap)),
    MIN_COLUMNS,
    MAX_COLUMNS,
  );

  return {
    tileWidth,
    tileHeight: tileWidth / TILE_ASPECT_RATIO,
    gap,
    radius,
    perspective,
    rows,
    columns,
    tilt: options.tilt ?? DEFAULT_TILT,
    borderRadius: clamp(
      options.borderRadius ?? DEFAULT_BORDER_RADIUS,
      0,
      Math.min(tileWidth, tileWidth / TILE_ASPECT_RATIO) / 2,
    ),
    stepRad: (Math.PI * 2) / columns,
  };
}

/**
 * A continuously rotating cylinder of images built with CSS 3D transforms.
 * Tiles share one curved surface, repeat seamlessly, and stop for reduced
 * motion or while the gallery is offscreen.
 */
export function InfiniteImageGallery({
  images,
  speed = DEFAULT_SPEED,
  direction = "left",
  radius,
  perspective,
  gap,
  borderRadius,
  imageFit = "cover",
  autoplay = true,
  showControls = true,
  rows,
  columns,
  tilt,
  className,
  style,
  ...props
}: InfiniteImageGalleryProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const rotorRef = React.useRef<HTMLDivElement>(null);
  const rotationRef = React.useRef(0);
  const [size, setSize] = React.useState<GallerySize>({
    width: 0,
    height: 0,
  });
  const [inView, setInView] = React.useState(true);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const instructionsId = React.useId();

  const geometry = React.useMemo(
    () =>
      buildGeometry(
        size.width || FALLBACK_WIDTH,
        size.height || FALLBACK_HEIGHT,
        {
          radius,
          perspective,
          gap,
          borderRadius,
          rows,
          columns,
          tilt,
        },
      ),
    [
      borderRadius,
      columns,
      gap,
      perspective,
      radius,
      rows,
      size.height,
      size.width,
      tilt,
    ],
  );

  const tiles = React.useMemo(() => {
    if (!images.length) return [];

    const nextTiles: GalleryTile[] = [];
    for (let row = 0; row < geometry.rows; row += 1) {
      for (let column = 0; column < geometry.columns; column += 1) {
        const angle = column * geometry.stepRad;
        const image = images[(row * geometry.columns + column) % images.length];

        if (!image) continue;

        nextTiles.push({
          key: `${row}-${column}`,
          image,
          x: geometry.radius * Math.sin(angle),
          y:
            (row - (geometry.rows - 1) / 2) *
            (geometry.tileHeight + geometry.gap),
          z: geometry.radius * Math.cos(angle),
          angle: (angle * 180) / Math.PI,
        });
      }
    }

    return nextTiles;
  }, [geometry, images]);

  React.useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (!width || !height) return;

      setSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      );
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);

    sync();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", sync);
      return () => query.removeEventListener("change", sync);
    }

    query.addListener(sync);
    return () => query.removeListener(sync);
  }, []);

  const shouldAnimate =
    autoplay && !paused && !reducedMotion && inView && size.width > 0;

  React.useEffect(() => {
    if (!shouldAnimate) return;

    let frame = 0;
    let last = 0;
    const sign = direction === "left" ? -1 : 1;

    const tick = (now: number) => {
      if (!last) last = now;
      const delta = Math.min((now - last) / 1000, 0.08);
      last = now;

      rotationRef.current =
        (rotationRef.current + sign * Math.abs(speed) * delta) % 360;

      if (rotorRef.current) {
        rotorRef.current.style.transform = `rotateY(${rotationRef.current}deg)`;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [direction, shouldAnimate, speed]);

  React.useEffect(() => {
    if (rotorRef.current) {
      rotorRef.current.style.transform = `rotateY(${rotationRef.current}deg)`;
    }
  });

  const showPauseControl = showControls && autoplay && !reducedMotion;
  const ariaLabel = props["aria-label"] ?? "Infinite 3D image gallery";
  const tiltRad = (geometry.tilt * Math.PI) / 180;
  const verticalOffset = geometry.radius * Math.sin(tiltRad);
  const motionDescription =
    !autoplay || reducedMotion
      ? "Motion is currently off."
      : paused
        ? "The rotation is paused. Press the play button to resume."
        : showPauseControl
          ? "Press the pause button to stop the rotation."
          : "The gallery rotates continuously.";

  return (
    <div
      {...props}
      ref={rootRef}
      role="region"
      aria-label={ariaLabel}
      aria-describedby={instructionsId}
      data-slot="infinite-image-gallery"
      className={cn(
        "infinite-image-gallery relative isolate h-full min-h-[480px] w-full touch-pan-y select-none overflow-hidden bg-[#f3f1ec] text-neutral-950 transition-colors duration-300 dark:bg-[#11100e] dark:text-neutral-100",
        className,
      )}
      style={{
        ...style,
        perspective: `${geometry.perspective}px`,
        perspectiveOrigin: "50% 50%",
      }}
    >
      <p id={instructionsId} className="sr-only">
        A continuously rotating 3D gallery of {images.length} images.{" "}
        {motionDescription}
      </p>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateY(${verticalOffset}px)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${geometry.tilt}deg)`,
          }}
        >
          <div
            ref={rotorRef}
            data-slot="infinite-image-gallery-rotor"
            className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {size.width > 0
              ? tiles.map((tile) => (
                  <div
                    key={tile.key}
                    data-slot="infinite-image-gallery-tile"
                    className="absolute overflow-hidden bg-[#e5e1d8] dark:bg-[#26231f]"
                    style={{
                      left: -geometry.tileWidth / 2,
                      top: -geometry.tileHeight / 2,
                      width: geometry.tileWidth,
                      height: geometry.tileHeight,
                      borderRadius: geometry.borderRadius,
                      backfaceVisibility: "hidden",
                      transform: `translate3d(${tile.x}px, ${tile.y}px, ${tile.z}px) rotateY(${tile.angle}deg)`,
                    }}
                  >
                    <img
                      src={tile.image.src}
                      alt=""
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      className="block h-full w-full select-none"
                      style={{ objectFit: imageFit }}
                      onError={(event) => {
                        event.currentTarget.style.opacity = "0";
                      }}
                    />
                  </div>
                ))
              : null}
          </div>
        </div>
      </div>

      {showPauseControl ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center">
          <button
            type="button"
            onClick={() => setPaused((current) => !current)}
            className="pointer-events-none rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-700 opacity-0 outline-none transition-opacity duration-150 focus:pointer-events-auto focus:opacity-100 focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:bg-[#1b1916]/90 dark:text-neutral-100 dark:ring-white/25"
          >
            {paused ? "Play gallery motion" : "Pause gallery motion"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default InfiniteImageGallery;
