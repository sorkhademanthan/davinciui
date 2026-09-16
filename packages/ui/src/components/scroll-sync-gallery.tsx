"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ---------------------------------- types --------------------------------- */

export type ScrollSyncDirection = "up" | "down";
export type ScrollSyncPreset = "alternating" | "flow" | "mixed";

export interface ScrollSyncGalleryImage {
  /** Image URL. */
  src: string;
  /** Accessible label. */
  alt?: string;
  /**
   * Width / height ratio. Mixed values across a column create the
   * editorial collage look (e.g. 0.7 tall portrait, 1 portrait-square,
   * 1.5 landscape). Defaults to 0.8.
   */
  aspectRatio?: number;
}

export interface ScrollSyncGalleryColumn {
  /** Stable id used for React keys. */
  id?: string;
  /** Travel direction of this column. */
  direction?: ScrollSyncDirection;
  /** Speed multiplier relative to the base travel distance. */
  speed?: number;
  /** Static phase shift in viewport-height fractions (-0.5 … 0.5). */
  offset?: number;
  images: ScrollSyncGalleryImage[];
}

export interface ScrollSyncGalleryProps {
  /**
   * Desktop column definitions. Each entry carries its own images plus
   * motion config. On smaller screens images are redistributed into
   * fewer columns (see desktop/tablet/mobileColumns).
   */
  columns?: ScrollSyncGalleryColumn[];
  /**
   * Motion preset used for columns without explicit config and when
   * columns are redistributed on smaller screens.
   * @default "alternating"
   */
  preset?: ScrollSyncPreset;
  /** Height of the tall scroll track, in vh. Pinned viewport stays 100vh. */
  scrollHeight?: number;
  /** Height of the pinned viewport (any CSS length). */
  viewportHeight?: string;
  /** Horizontal gap between columns (px). */
  gap?: number;
  /** Vertical gap between images inside a column (px). */
  rowGap?: number;
  /**
   * Base travel distance as a fraction of the viewport height.
   * Actual per-column travel = travel * speed, clamped to measured
   * content so no empty background is ever exposed.
   */
  travel?: number;
  /** Scroll-follow smoothing, 0 (direct) to 1. */
  smoothing?: number;
  /** How images fill their frame. */
  objectFit?: "cover" | "contain" | "fill";
  /** Image focal point (CSS object-position). */
  objectPosition?: string;
  /** Surrounding background color. */
  background?: string;
  /** Column count on desktop. */
  desktopColumns?: number;
  /** Column count on tablet. */
  tabletColumns?: number;
  /** Column count on mobile. */
  mobileColumns?: number;
  /** Viewport width (px) below which tabletColumns applies. */
  tabletBreakpoint?: number;
  /** Viewport width (px) below which mobileColumns applies. */
  mobileBreakpoint?: number;
  /** How many times each column's image set is repeated for travel headroom. */
  duplicateCount?: number;
  /** Subtle scale-in of the whole wall during the first 12% of progress. */
  introZoom?: boolean;
  /** When false, renders a static editorial grid instead of the scroll effect. */
  enabled?: boolean;
  /** Pause the RAF loop while the gallery is far offscreen. */
  pauseWhenOffscreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/* --------------------------------- defaults ------------------------------- */

const UNSPLASH = "?q=80&w=900&auto=format&fit=crop";

function img(id: string, aspectRatio: number, alt: string): ScrollSyncGalleryImage {
  return { src: `https://images.unsplash.com/${id}${UNSPLASH}`, aspectRatio, alt };
}

const DEFAULT_COLUMNS: ScrollSyncGalleryColumn[] = [
  {
    id: "column-1",
    direction: "up",
    speed: 1,
    offset: 0,
    images: [
      img("photo-1506905925346-21bda4d32df4", 0.72, "Matterhorn peak above a sea of clouds"),
      img("photo-1529139574466-a303027c1d8b", 1.35, "Editorial fashion portrait in warm light"),
      img("photo-1493863641943-9b68992a8d07", 0.78, "Photographer holding a vintage camera"),
      img("photo-1470229722913-7c0e2dbbafd3", 1.5, "Concert stage washed in amber light"),
      img("photo-1487958449943-2429e8be8625", 0.7, "White concrete architecture detail"),
      img("photo-1534528741775-53994a69daeb", 0.8, "Studio portrait with soft shadow"),
    ],
  },
  {
    id: "column-2",
    direction: "down",
    speed: 0.72,
    offset: 0.1,
    images: [
      img("photo-1490481651871-ab68de25d43d", 1.4, "Fashion editorial against a bright wall"),
      img("photo-1506794778202-cad84cf45f1d", 0.72, "Noir studio portrait on black"),
      img("photo-1449157291145-7efd050a4d0e", 1.2, "Glass high-rise facade from below"),
      img("photo-1517841905240-472988babdf9", 0.75, "Smiling portrait in natural light"),
      img("photo-1473580044384-7ba9967e16a0", 1.6, "Desert dunes at golden hour"),
      img("photo-1516035069371-29a1b244cc32", 0.85, "Film camera on a wooden table"),
    ],
  },
  {
    id: "column-3",
    direction: "up",
    speed: 1.22,
    offset: -0.08,
    images: [
      img("photo-1469334031218-e382a71b716b", 0.8, "Fashion look with sunglasses"),
      img("photo-1501281668745-f7f57925c3b4", 1.45, "Crowd with raised hands at a festival"),
      img("photo-1483985988355-763728e1935b", 0.7, "Editorial shopping-street style"),
      img("photo-1470071459604-3b5ec3a7fe05", 1.3, "Morning fog over layered hills"),
      img("photo-1496747611176-843222e1e57c", 0.78, "Minimal fashion portrait in white"),
      img("photo-1486718448742-163732cd1544", 1.55, "Curved concrete interior"),
    ],
  },
  {
    id: "column-4",
    direction: "down",
    speed: 0.88,
    offset: 0.05,
    images: [
      img("photo-1445205170230-053b83016050", 1.35, "Clothing rack in a sunlit store"),
      img("photo-1531123897727-8f129e1688ce", 0.72, "Ember portrait against a red wall"),
      img("photo-1469474968028-56623f02e42e", 1.25, "Sunlight breaking through a valley"),
      img("photo-1515886657613-9f3515b0c78f", 0.75, "High-fashion pose in pink light"),
      img("photo-1514525253161-7a46d19cd819", 1.5, "DJ decks under club lights"),
      img("photo-1500648767791-00dcc994a43e", 0.82, "Portrait of a man in soft daylight"),
    ],
  },
];

interface ResolvedColumn {
  id: string;
  direction: ScrollSyncDirection;
  speed: number;
  offset: number;
  images: ScrollSyncGalleryImage[];
}

const PRESET_CONFIGS: Record<ScrollSyncPreset, Array<Pick<ResolvedColumn, "direction" | "speed" | "offset">>> = {
  alternating: [
    { direction: "up", speed: 1, offset: 0 },
    { direction: "down", speed: 0.8, offset: 0 },
    { direction: "up", speed: 1.12, offset: 0 },
    { direction: "down", speed: 0.9, offset: 0 },
  ],
  flow: [
    { direction: "up", speed: 0.85, offset: 0 },
    { direction: "up", speed: 1, offset: 0 },
    { direction: "up", speed: 1.15, offset: 0 },
    { direction: "up", speed: 0.95, offset: 0 },
  ],
  mixed: [
    { direction: "up", speed: 1, offset: 0 },
    { direction: "down", speed: 0.7, offset: 0.12 },
    { direction: "up", speed: 1.25, offset: -0.1 },
    { direction: "down", speed: 0.9, offset: 0.06 },
  ],
};

/* --------------------------------- helpers -------------------------------- */

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ------------------------------ sub-components ---------------------------- */

export function GalleryItem({
  image,
  objectFit,
  objectPosition,
  priority,
}: {
  image: ScrollSyncGalleryImage;
  objectFit: "cover" | "contain" | "fill";
  objectPosition: string;
  priority: boolean;
}) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${image.aspectRatio ?? 0.8}` }}
    >
      <img
        src={image.src}
        alt={image.alt ?? "Gallery image"}
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="block h-full w-full select-none"
        style={{ objectFit, objectPosition }}
      />
    </div>
  );
}

export function GalleryColumn({
  column,
  repeat,
  objectFit,
  objectPosition,
  rowGap,
  moverRef,
  eagerCount,
}: {
  column: ResolvedColumn;
  repeat: number;
  objectFit: "cover" | "contain" | "fill";
  objectPosition: string;
  rowGap: number;
  moverRef: (el: HTMLDivElement | null) => void;
  eagerCount: number;
}) {
  const repeated = useMemo(() => {
    const out: ScrollSyncGalleryImage[] = [];
    for (let r = 0; r < repeat; r++) out.push(...column.images);
    return out;
  }, [column.images, repeat]);

  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden" data-testid={`scroll-sync-gallery-column-${column.id}`}>
      <div
        ref={moverRef}
        className="flex w-full flex-col"
        style={{ gap: rowGap, willChange: "transform" }}
      >
        {repeated.map((image, i) => (
          <GalleryItem
            key={`${image.src}-${i}`}
            image={image}
            objectFit={objectFit}
            objectPosition={objectPosition}
            priority={i < eagerCount}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- component ------------------------------- */

export function ScrollSyncGallery({
  columns = DEFAULT_COLUMNS,
  preset = "alternating",
  scrollHeight = 400,
  viewportHeight = "100vh",
  gap = 0,
  rowGap = 0,
  travel = 0.65,
  smoothing = 0.12,
  objectFit = "cover",
  objectPosition = "50% 50%",
  background = "#0b0b0c",
  desktopColumns = 4,
  tabletColumns = 3,
  mobileColumns = 2,
  tabletBreakpoint = 1024,
  mobileBreakpoint = 640,
  duplicateCount = 2,
  introZoom = true,
  enabled = true,
  pauseWhenOffscreen = true,
  className,
  style,
}: ScrollSyncGalleryProps) {
  const safeScrollHeight = Math.max(150, scrollHeight);
  const safeTravel = clamp(travel, 0, 2);
  const safeGap = Math.max(0, gap);
  const safeRowGap = Math.max(0, rowGap);
  const safeRepeat = Math.max(2, Math.min(4, Math.floor(duplicateCount) || 2));
  const smoothFactor = clamp(smoothing, 0, 1);

  const trackRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const moverRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Imperative animation state — never in React state so scrolling never rerenders.
  const targetRef = useRef(0);
  const renderedRef = useRef(0);
  const inViewRef = useRef(true);
  const metricsRef = useRef({ viewportH: 0, maxSafe: [] as number[] });
  const firstFrameRef = useRef(true);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [columnCount, setColumnCount] = useState(() =>
    Math.max(1, columns.length > 0 ? Math.min(desktopColumns, 8) : desktopColumns),
  );

  const motionActive = enabled && !reducedMotion;

  /* Resolve effective columns: use explicit configs when counts match,
     otherwise redistribute every image round-robin and cycle motion configs. */
  const effectiveColumns = useMemo<ResolvedColumn[]>(() => {
    const source = columns.length > 0 ? columns : DEFAULT_COLUMNS;
    const fallback = PRESET_CONFIGS[preset] ?? PRESET_CONFIGS.alternating;
    const count = Math.max(1, columnCount);

    if (source.length === count) {
      return source.map((col, i) => {
        const fb = fallback[i % fallback.length]!;
        return {
          id: col.id ?? `column-${i + 1}`,
          direction: col.direction ?? fb.direction,
          speed: col.speed ?? fb.speed,
          offset: clamp(col.offset ?? fb.offset, -0.5, 0.5),
          images: col.images.length > 0 ? col.images : (DEFAULT_COLUMNS[i % DEFAULT_COLUMNS.length]?.images ?? []),
        };
      });
    }

    const flat = source.flatMap((col) => col.images);
    const images = flat.length > 0 ? flat : DEFAULT_COLUMNS.flatMap((col) => col.images);
    return Array.from({ length: count }, (_, i) => {
      const own = source[i];
      const fb = fallback[i % fallback.length]!;
      const bucket = images.filter((_, idx) => idx % count === i);
      return {
        id: own?.id ?? `column-${i + 1}`,
        direction: own?.direction ?? fb.direction,
        speed: own?.speed ?? fb.speed,
        offset: clamp(own?.offset ?? fb.offset, -0.5, 0.5),
        images: bucket.length > 0 ? bucket : images.slice(i, i + 1),
      };
    });
  }, [columns, preset, columnCount]);

  /* Live motion config for the rAF loop (prop changes apply without resubscribing). */
  const configRef = useRef({
    count: effectiveColumns.length,
    travel: safeTravel,
    introZoom,
    directions: effectiveColumns.map((c) => c.direction),
    speeds: effectiveColumns.map((c) => c.speed),
    offsets: effectiveColumns.map((c) => c.offset),
  });
  configRef.current = {
    count: effectiveColumns.length,
    travel: safeTravel,
    introZoom,
    directions: effectiveColumns.map((c) => c.direction),
    speeds: effectiveColumns.map((c) => c.speed),
    offsets: effectiveColumns.map((c) => c.offset),
  };

  /* Reduced motion: static grid, no interpolation. */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* Responsive column counts. */
  useEffect(() => {
    const mqTablet = window.matchMedia(`(max-width: ${tabletBreakpoint}px)`);
    const mqMobile = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
    const update = () =>
      setColumnCount(
        mqMobile.matches
          ? Math.max(1, mobileColumns)
          : mqTablet.matches
            ? Math.max(1, tabletColumns)
            : Math.max(1, desktopColumns),
      );
    update();
    mqTablet.addEventListener("change", update);
    mqMobile.addEventListener("change", update);
    return () => {
      mqTablet.removeEventListener("change", update);
      mqMobile.removeEventListener("change", update);
    };
  }, [desktopColumns, tabletColumns, mobileColumns, tabletBreakpoint, mobileBreakpoint]);

  /* Measure viewport + per-column travel headroom; never per frame. */
  useEffect(() => {
    if (!motionActive) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => {
      const viewportH = viewport.clientHeight || 1;
      const maxSafe = configRef.current.directions.map((_, i) => {
        const mover = moverRefs.current[i];
        const moverH = mover ? mover.scrollHeight : viewportH;
        return Math.max(0, moverH - viewportH);
      });
      metricsRef.current = { viewportH, maxSafe };
      renderFrame(renderedRef.current);
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    moverRefs.current.forEach((m) => m && ro.observe(m));
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionActive, effectiveColumns.length, safeRepeat, viewportHeight, columnCount]);

  /* Pause work while far offscreen. */
  useEffect(() => {
    if (!motionActive || !pauseWhenOffscreen) {
      inViewRef.current = true;
      return;
    }
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry?.isIntersecting ?? true;
      },
      { rootMargin: "600px" },
    );
    io.observe(track);
    return () => io.disconnect();
  }, [motionActive, pauseWhenOffscreen]);

  /* Imperative render: every column transform derives from one progress value. */
  function renderFrame(progress: number) {
    const cfg = configRef.current;
    const { viewportH, maxSafe } = metricsRef.current;
    if (viewportH <= 0) return;
    const p = clamp(progress, 0, 1);

    for (let i = 0; i < cfg.count; i++) {
      const mover = moverRefs.current[i];
      if (!mover) continue;
      const safe = maxSafe[i] ?? 0;
      if (safe <= 0) {
        mover.style.transform = "translate3d(0, 0, 0)";
        continue;
      }
      // Desired travel from the viewport-relative amplitude, then clamp to
      // measured headroom so content always covers the viewport.
      const desired = viewportH * cfg.travel * Math.max(0, cfg.speeds[i] ?? 1);
      const travelPx = Math.min(desired, safe * 0.92);
      const offsetPx = clamp((cfg.offsets[i] ?? 0) * viewportH, -safe * 0.2, safe * 0.2);
      // "up": rest at 0, travels to -travel. "down": rest at -travel, travels to 0.
      const from = cfg.directions[i] === "down" ? -travelPx : 0;
      const to = cfg.directions[i] === "down" ? 0 : -travelPx;
      const y = clamp(lerp(from, to, p) + offsetPx, -safe, 0);
      mover.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    }

    if (introZoom && gridRef.current) {
      const t = clamp(p / 0.12, 0, 1);
      const scale = lerp(1.045, 1, t * t * (3 - 2 * t));
      gridRef.current.style.transform = `scale(${scale.toFixed(4)})`;
    }

    if (firstFrameRef.current) {
      firstFrameRef.current = false;
      const grid = gridRef.current;
      if (grid) grid.style.opacity = "";
    }
  }

  /* Read normalized scroll progress from the track position. */
  useEffect(() => {
    if (!motionActive || effectiveColumns.length === 0) return;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const updateTarget = () => {
      const scrollable = track.offsetHeight - viewport.offsetHeight;
      if (scrollable <= 0) {
        targetRef.current = 0;
        return;
      }
      const y = -track.getBoundingClientRect().top;
      targetRef.current = clamp(y / scrollable, 0, 1);
    };

    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);
    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
    };
  }, [motionActive, effectiveColumns.length, safeScrollHeight, viewportHeight]);

  /* Single rAF loop with cinematic smoothing; fully reversible. */
  useEffect(() => {
    if (!motionActive || effectiveColumns.length === 0) return;
    firstFrameRef.current = true;
    renderFrame(targetRef.current);
    let raf = 0;

    const tick = () => {
      if (!inViewRef.current && pauseWhenOffscreen) {
        // Keep progress in sync even while paused so resume never jumps.
        renderedRef.current = targetRef.current;
        raf = requestAnimationFrame(tick);
        return;
      }
      const target = targetRef.current;
      let rendered = renderedRef.current;
      if (smoothFactor <= 0) {
        rendered = target;
      } else {
        rendered += (target - rendered) * smoothFactor;
        if (Math.abs(target - rendered) < 0.0004) rendered = target;
      }
      renderedRef.current = rendered;
      renderFrame(rendered);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionActive, effectiveColumns.length, smoothFactor, pauseWhenOffscreen]);

  /* ------------------------- fallbacks / edge cases ------------------------ */

  const totalImages = effectiveColumns.reduce((n, c) => n + c.images.length, 0);
  if (totalImages === 0) return null;

  if (!motionActive) {
    return (
      <section
        aria-label="Scrolling image gallery"
        className={cn("w-full", className)}
        style={{ background, ...style }}
      >
        <div
          className="grid w-full"
          style={{ gridTemplateColumns: `repeat(${effectiveColumns.length}, 1fr)`, gap: safeGap }}
        >
          {effectiveColumns.map((column) => (
            <div key={column.id} className="flex min-w-0 flex-col" style={{ gap: safeRowGap }}>
              {column.images.map((image, i) => (
                <GalleryItem
                  key={`${image.src}-${i}`}
                  image={image}
                  objectFit={objectFit}
                  objectPosition={objectPosition}
                  priority={i < 2}
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={trackRef}
      aria-label="Scroll synchronized image gallery"
      data-testid="scroll-sync-gallery-track"
      className={cn("relative w-full", className)}
      style={{ height: `${safeScrollHeight}vh`, background, ...style }}
    >
      <div
        ref={viewportRef}
        data-testid="scroll-sync-gallery-viewport"
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: viewportHeight, background }}
      >
        {/* Hidden until the first imperative frame paints so columns never
            flash in the wrong position. */}
        <div
          ref={gridRef}
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${effectiveColumns.length}, 1fr)`,
            gap: safeGap,
            opacity: 0,
          }}
        >
          {effectiveColumns.map((column, i) => (
            <GalleryColumn
              key={column.id}
              column={column}
              repeat={safeRepeat}
              objectFit={objectFit}
              objectPosition={objectPosition}
              rowGap={safeRowGap}
              eagerCount={2}
              moverRef={(el) => {
                moverRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ScrollSyncGallery;

/* Registry / Framer property-controls bridge. */
export const ScrollSyncGalleryPropertyControls = {
  preset: {
    type: "enum",
    title: "Motion Preset",
    options: ["alternating", "flow", "mixed"],
    defaultValue: "alternating",
  },
  scrollHeight: {
    type: "number",
    title: "Scroll Height (vh)",
    defaultValue: 400,
    min: 150,
    max: 800,
  },
  viewportHeight: { type: "string", title: "Viewport Height", defaultValue: "100vh" },
  gap: { type: "number", title: "Column Gap", defaultValue: 0, min: 0, max: 48 },
  rowGap: { type: "number", title: "Row Gap", defaultValue: 0, min: 0, max: 48 },
  travel: {
    type: "number",
    title: "Travel Distance (× viewport)",
    defaultValue: 0.65,
    min: 0,
    max: 2,
  },
  smoothing: {
    type: "number",
    title: "Scroll Smoothing",
    defaultValue: 0.12,
    min: 0,
    max: 1,
  },
  objectFit: {
    type: "enum",
    title: "Image Fit",
    options: ["cover", "contain", "fill"],
    defaultValue: "cover",
  },
  desktopColumns: {
    type: "number",
    title: "Desktop Columns",
    defaultValue: 4,
    min: 1,
    max: 8,
  },
  tabletColumns: {
    type: "number",
    title: "Tablet Columns",
    defaultValue: 3,
    min: 1,
    max: 8,
  },
  mobileColumns: {
    type: "number",
    title: "Mobile Columns",
    defaultValue: 2,
    min: 1,
    max: 8,
  },
  duplicateCount: {
    type: "number",
    title: "Content Duplication",
    defaultValue: 2,
    min: 2,
    max: 4,
  },
  introZoom: { type: "boolean", title: "Intro Zoom", defaultValue: true },
  enabled: { type: "boolean", title: "Enable Scroll Animation", defaultValue: true },
  pauseWhenOffscreen: { type: "boolean", title: "Pause Offscreen", defaultValue: true },
};
