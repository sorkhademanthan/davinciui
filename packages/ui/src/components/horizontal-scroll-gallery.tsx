"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ---------------------------------- types --------------------------------- */

export interface HorizontalScrollGalleryItem {
  /** Stable key. Falls back to `src-index` when omitted. */
  id?: string;
  /** Image URL. */
  src: string;
  /** Accessible label for the image. */
  alt?: string;
  /** Tiny caption rendered in the bottom-left corner of the card. */
  label?: string;
  /**
   * Explicit card width (px number or any CSS length).
   * Takes precedence over `widthRatio` when provided.
   */
  width?: number | string;
  /**
   * Card width as a fraction of the viewport width (e.g. 0.55 → 55vw).
   * Clamped per breakpoint so partial edge cards are always preserved:
   * desktop 0.45–0.82, tablet 0.60–0.85, mobile 0.75–0.92.
   * @default 0.6
   */
  widthRatio?: number;
}

export interface HorizontalScrollGalleryProps {
  /** Media cards in track order. */
  items?: HorizontalScrollGalleryItem[];
  /** Gap (px) between cards. */
  gap?: number;
  /** Corner radius (px) applied to every card. */
  radius?: number;
  /** Horizontal inset (px) at both track edges. */
  inset?: number;
  /** Card height (any CSS length). Cards share one height for the film-strip look. */
  height?: string;
  /** Height of the pinned viewport (any CSS length). */
  viewportHeight?: string;
  /**
   * Vertical scroll distance multiplier.
   * Section height = viewportHeight + horizontalTravel × scrollDistance.
   * Start around 0.9–1.15; higher feels slower and more cinematic.
   */
  scrollDistance?: number;
  /**
   * Scroll-follow smoothing, 0 (direct) to 1. Drives a critically
   * damped, velocity-compensated spring: the track stays glued to
   * the scroll position mid-motion and decelerates smoothly into
   * stops with no overshoot and no snapping. Keep low so scrubbing
   * stays tight.
   */
  smoothing?: number;
  /** Initial track offset in px (<= 0). Negative values pre-clip the first card. */
  startOffset?: number;
  /** Final track offset adjustment in px. Clamped so no empty space is exposed. */
  endOffset?: number;
  /**
   * Surrounding background color. When omitted, the gallery follows
   * the light/dark theme (white/black). Pass a color to override.
   */
  background?: string;
  /** How images fill their card. */
  objectFit?: "cover" | "contain" | "fill";
  /** Image focal point (CSS object-position). */
  objectPosition?: string;
  /** When false, renders a static accessible row instead of the pinned scroll effect. */
  enabled?: boolean;
  /** Pause transform work while the gallery is far offscreen. */
  pauseWhenOffscreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/* --------------------------------- helpers -------------------------------- */

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const UNSPLASH = "?q=80&w=1600&auto=format&fit=crop";

function item(
  id: string,
  src: string,
  label: string,
  widthRatio: number,
): HorizontalScrollGalleryItem {
  return { id, src: `${src}${UNSPLASH}`, alt: label, label, widthRatio };
}

const DEFAULT_ITEMS: HorizontalScrollGalleryItem[] = [
  item(
    "green-fern",
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    "Green Fern",
    0.55,
  ),
  item(
    "yellow-flower",
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946",
    "Yellow Flower",
    0.72,
  ),
  item(
    "orange-bloom",
    "https://images.unsplash.com/photo-1494972308805-463bc619d34e",
    "Orange Flower",
    0.66,
  ),
  item(
    "purple-field",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    "Purple Flower",
    0.58,
  ),
  item(
    "blossom",
    "https://images.unsplash.com/photo-1522383225653-ed111181a951",
    "Blossom",
    0.7,
  ),
  item(
    "fern-detail",
    "https://images.unsplash.com/photo-1463320726281-696a485928c7",
    "Fern Detail",
    0.52,
  ),
  item(
    "meadow",
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8",
    "Meadow",
    0.78,
  ),
];

type Breakpoint = "desktop" | "tablet" | "mobile";

function clampRatio(ratio: number, breakpoint: Breakpoint) {
  if (breakpoint === "mobile") return clamp(ratio, 0.75, 0.92);
  if (breakpoint === "tablet") return clamp(ratio, 0.6, 0.85);
  return clamp(ratio, 0.45, 0.82);
}

function cardWidth(
  entry: HorizontalScrollGalleryItem,
  breakpoint: Breakpoint,
): string {
  if (typeof entry.width === "number") return `${entry.width}px`;
  if (typeof entry.width === "string" && entry.width.length > 0)
    return entry.width;
  const ratio = clampRatio(entry.widthRatio ?? 0.6, breakpoint);
  return `${(ratio * 100).toFixed(3)}vw`;
}

/* -------------------------------- component ------------------------------- */

export function HorizontalScrollGallery({
  items = DEFAULT_ITEMS,
  gap = 12,
  radius = 10,
  inset = 20,
  height = "clamp(300px, 38vw, 540px)",
  viewportHeight = "100vh",
  scrollDistance = 1,
  smoothing = 0.1,
  startOffset = 0,
  endOffset = 0,
  background,
  objectFit = "cover",
  objectPosition = "50% 50%",
  enabled = true,
  pauseWhenOffscreen = true,
  className,
  style,
}: HorizontalScrollGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Imperative animation state — never in React state so scrolling never rerenders.
  const targetRef = useRef(0);
  const renderedRef = useRef(0);
  const springRef = useRef({
    pos: 0,
    vel: 0,
    last: 0,
    tVel: 0,
    tConf: 0,
    prevTarget: 0,
  });
  const lastXRef = useRef<number | null>(null);
  const inViewRef = useRef(true);
  const metricsRef = useRef({
    viewportH: 0,
    travel: 0,
    startX: 0,
    endX: 0,
    sectionTop: 0,
    scrollable: 1,
  });
  const firstFrameRef = useRef(true);
  const configRef = useRef({ smoothing, startOffset, endOffset, scrollDistance });
  configRef.current = { smoothing, startOffset, endOffset, scrollDistance };

  const [reducedMotion, setReducedMotion] = useState(false);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  const motionActive = enabled && !reducedMotion;
  const list = items.length > 0 ? items : DEFAULT_ITEMS;

  /* Reduced motion preference. */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* Responsive breakpoint for card width clamping + scroll-distance tuning. */
  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 640px)");
    const mqTablet = window.matchMedia("(max-width: 1024px)");
    const update = () =>
      setBreakpoint(
        mqMobile.matches ? "mobile" : mqTablet.matches ? "tablet" : "desktop",
      );
    update();
    mqMobile.addEventListener("change", update);
    mqTablet.addEventListener("change", update);
    return () => {
      mqMobile.removeEventListener("change", update);
      mqTablet.removeEventListener("change", update);
    };
  }, []);

  /* Measure geometry and size the vertical scroll runway. */
  useEffect(() => {
    if (!motionActive) return;
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;

    const measure = () => {
      const { scrollDistance: mult } = configRef.current;
      const viewportW = viewport.clientWidth || 1;
      const viewportH = viewport.clientHeight || window.innerHeight || 1;
      const trackW = track.scrollWidth || viewportW;
      const travel = Math.max(0, trackW - viewportW);
      const effectiveMult =
        (breakpoint === "mobile"
          ? mult * 0.8
          : breakpoint === "tablet"
            ? mult * 0.9
            : mult) || 0;
      const sectionH = Math.max(
        viewportH + 1,
        viewportH + travel * Math.max(0, effectiveMult),
      );
      // Drive the runway with an explicit pixel height so the
      // scroll-to-horizontal ratio stays exact after layout.
      section.style.height = `${sectionH}px`;
      const sectionTop =
        window.scrollY + section.getBoundingClientRect().top;
      metricsRef.current = {
        viewportH,
        travel,
        startX: clamp(configRef.current.startOffset, -travel, 0),
        endX: clamp(-travel + configRef.current.endOffset, -travel, 0),
        sectionTop,
        scrollable: Math.max(1, sectionH - viewportH),
      };
      renderFrame(renderedRef.current);
    };

    measure();

    const onImageLoad = () => measure();
    const imgs = track.querySelectorAll("img");
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", onImageLoad);
    });

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(schedule);
      ro.observe(viewport);
      ro.observe(track);
      ro.observe(section);
    }
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    return () => {
      cancelAnimationFrame(raf);
      imgs.forEach((img) => img.removeEventListener("load", onImageLoad));
      ro?.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
    };
  }, [motionActive, breakpoint, list.length, viewportHeight]);

  /* Pause work while far offscreen. */
  useEffect(() => {
    if (!motionActive || !pauseWhenOffscreen) {
      inViewRef.current = true;
      return;
    }
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry?.isIntersecting ?? true;
      },
      { rootMargin: "400px" },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [motionActive, pauseWhenOffscreen]);

  /* Read normalized vertical progress (cached geometry — no layout per frame). */
  useEffect(() => {
    if (!motionActive) return;
    const updateTarget = () => {
      const m = metricsRef.current;
      targetRef.current = clamp(
        (window.scrollY - m.sectionTop) / m.scrollable,
        0,
        1,
      );
    };
    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);
    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
    };
  }, [motionActive]);

  /* Single rAF loop with spring smoothing; fully reversible. */
  useEffect(() => {
    if (!motionActive) return;
    // Snap to the live position on mount so a refresh inside the
    // section never flashes the wrong frame.
    targetRef.current = clamp(
      (window.scrollY - metricsRef.current.sectionTop) /
        metricsRef.current.scrollable,
      0,
      1,
    );
    springRef.current = {
      pos: targetRef.current,
      vel: 0,
      last: 0,
      tVel: 0,
      tConf: 0,
      prevTarget: targetRef.current,
    };
    renderedRef.current = targetRef.current;
    firstFrameRef.current = true;
    renderFrame(renderedRef.current);
    let raf = 0;

    const tick = (now: number) => {
      const s = springRef.current;
      const dt =
        s.last > 0
          ? Math.min(0.064, Math.max(0.001, (now - s.last) / 1000))
          : 1 / 60;
      s.last = now;
      if (!inViewRef.current && pauseWhenOffscreen) {
        s.pos = targetRef.current;
        s.vel = 0;
        s.tVel = 0;
        s.tConf = 0;
        s.prevTarget = targetRef.current;
        raf = requestAnimationFrame(tick);
        return;
      }
      const k = clamp(configRef.current.smoothing, 0, 1);
      const target = targetRef.current;
      if (k <= 0) {
        s.pos = target;
        s.vel = 0;
        s.tVel = 0;
        s.tConf = 0;
        s.prevTarget = target;
      } else {
        // Critically damped spring with persistence-gated velocity
        // feedforward: the aim point leads the scroll target by the
        // spring's steady-state lag, but only once motion proves
        // sustained — isolated spikes (wheel notches, jank) never
        // fling the aim past the target. Result: the track stays
        // glued mid-motion, stops dead with the page, reverses
        // instantly, and never overshoots (zeta = 1, aim clamped).
        const stiffness = 420 - 350 * k;
        const omega = Math.sqrt(stiffness);
        const damping = 2 * omega;
        const instVel = Math.max(
          -6,
          Math.min(6, (target - s.prevTarget) / dt),
        );
        s.prevTarget = target;
        s.tVel += (instVel - s.tVel) * (1 - Math.exp(-dt / 0.09));
        if (Math.abs(s.tVel) < 0.0005) s.tVel = 0;
        const sameDir =
          s.tVel === 0 ||
          Math.abs(instVel) < 0.02 ||
          Math.sign(instVel) === Math.sign(s.tVel);
        if (Math.abs(instVel) > 0.02 && sameDir) {
          s.tConf = Math.min(1, s.tConf + dt / 0.12);
        } else {
          s.tConf = Math.max(0, s.tConf - dt / 0.08);
        }
        const lead = s.tVel * (2 / omega) * s.tConf;
        const aim = Math.min(1, Math.max(0, target + lead));
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
        const h = dt / steps;
        let { pos, vel } = s;
        for (let i = 0; i < steps; i++) {
          vel += (stiffness * (aim - pos) - damping * vel) * h;
          pos += vel * h;
        }
        // Settle only when parked at the true target, sub-pixel AND
        // nearly stopped — invisible.
        if (
          Math.abs(target - pos) < 0.0002 &&
          Math.abs(vel) < 0.01 &&
          s.tVel === 0
        ) {
          pos = target;
          vel = 0;
        }
        s.pos = pos;
        s.vel = vel;
      }
      renderedRef.current = s.pos;
      renderFrame(s.pos);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motionActive, pauseWhenOffscreen]);

  function renderFrame(progress: number) {
    const track = trackRef.current;
    if (!track) return;
    const m = metricsRef.current;
    const p = clamp(progress, 0, 1);
    const x = lerp(m.startX, m.endX, p);
    if (firstFrameRef.current) {
      firstFrameRef.current = false;
      track.style.opacity = "";
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      lastXRef.current = x;
      return;
    }
    // Skip sub-pixel rewrites so the parked track stays perfectly still.
    if (lastXRef.current !== null && Math.abs(x - lastXRef.current) < 0.01)
      return;
    lastXRef.current = x;
    track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
  }

  /* ------------------------- fallbacks / edge cases ------------------------ */

  if (list.length === 0) return null;

  if (!motionActive) {
    return (
      <section
        aria-label="Horizontal scroll gallery"
        className={cn("w-full bg-white dark:bg-black", className)}
        style={{
          ...(background ? { background } : null),
          overflowX: "clip",
          ...style,
        }}
      >
        <div
          className="flex w-full gap-3 overflow-x-auto px-5 py-16"
          style={{ gap, paddingInline: inset, scrollbarWidth: "thin" }}
        >
          {list.map((entry, i) => (
            <figure
              key={entry.id ?? `${entry.src}-${i}`}
              className="relative w-max max-w-none flex-none overflow-hidden bg-zinc-200 dark:bg-zinc-900"
              style={{
                width: cardWidth(entry, breakpoint),
                maxWidth: "92vw",
                height,
                borderRadius: radius,
              }}
            >
              <img
                src={entry.src}
                alt={entry.alt ?? entry.label ?? "Gallery image"}
                draggable={false}
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
                className="block h-full w-full select-none"
                style={{ objectFit, objectPosition }}
              />
              {entry.label ? (
                <figcaption className="absolute bottom-[9px] left-[10px] rounded-[4px] bg-white/70 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-zinc-900 backdrop-blur-[6px] dark:bg-black/40 dark:text-white/90">
                  {entry.label}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-label="Horizontal scroll gallery"
      data-testid="horizontal-scroll-gallery-track"
      className={cn("relative w-full bg-white dark:bg-black", className)}
      style={{
        ...(background ? { background } : null),
        overflowX: "clip",
        ...style,
      }}
    >
      <div
        ref={viewportRef}
        data-testid="horizontal-scroll-gallery-viewport"
        className="sticky top-0 flex w-full flex-col overflow-hidden bg-white dark:bg-black"
        style={{
          height: viewportHeight,
          ...(background ? { background } : null),
        }}
      >
        {/* Media row centered in the pinned viewport. */}
        <div className="flex w-full flex-1 items-center">
          {/* Hidden until the first imperative frame paints so the track
              never flashes at the wrong offset. */}
          <div
            ref={trackRef}
            className="flex w-max items-stretch"
            style={{
              gap,
              paddingInline: inset,
              opacity: 0,
              willChange: "transform",
            }}
          >
            {list.map((entry, i) => (
              <figure
                key={entry.id ?? `${entry.src}-${i}`}
                className="relative flex-none overflow-hidden bg-zinc-200 dark:bg-zinc-900"
                style={{
                  flex: "0 0 auto",
                  width: cardWidth(entry, breakpoint),
                  height,
                  borderRadius: radius,
                }}
              >
                <img
                  src={entry.src}
                  alt={entry.alt ?? entry.label ?? "Gallery image"}
                  draggable={false}
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                  className="block h-full w-full select-none"
                  style={{ objectFit, objectPosition }}
                />
                {entry.label ? (
                  <figcaption className="absolute bottom-[9px] left-[10px] rounded-[4px] bg-white/70 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-zinc-900 backdrop-blur-[6px] dark:bg-black/40 dark:text-white/90">
                    {entry.label}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HorizontalScrollGallery;
