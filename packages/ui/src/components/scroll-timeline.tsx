"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ---------------------------------- types --------------------------------- */

export interface TimelineItem {
  /** Oversized year rendered bottom-left, e.g. "2018". */
  year: string;
  /** Small index label, e.g. "01". Rendered with the title when present. */
  index?: string;
  /** Small editorial headline, e.g. "FOUNDATIONS". */
  title?: string;
  /** Small annotation copy in the upper-right region. */
  description?: string;
  /** Panel background (any CSS color). */
  background: string;
  /** Year + description foreground (any CSS color). */
  foreground: string;
}

export interface ScrollTimelineProps {
  /** Timeline entries in order. First item starts fullscreen. */
  items?: TimelineItem[];
  /** Vertical scroll distance devoted to each transition, in vh units. */
  scrollPerItem?: number;
  /** Final year rotation (degrees, counter-clockwise). @default 82 */
  rotationAmount?: number;
          /** CSS font-size for the oversized year. @default "clamp(9rem, 19vw, 20rem)" */
  yearSize?: string;
  /** CSS width for the description block. @default "min(28rem, 30vw)" */
  descriptionWidth?: string;
  /** Easing applied to each transition's local progress. */
  easing?: "linear" | "smooth";
  /** Height of the pinned viewport (any CSS length). @default "100vh" */
  viewportHeight?: string;
  /**
   * Scroll-follow smoothing, 0 (direct scrub) to 1. Defaults to 0 so the
   * visual state literally IS the scroll position: stopping scroll stops
   * the animation at exactly that frame with no settle motion.
   * @default 0
   */
  smoothing?: number;
  /** When true, renders a static accessible list instead of the scroll effect. */
  disableAnimation?: boolean;
  /** Pause transform work while the section is far offscreen. @default true */
  pauseWhenOffscreen?: boolean;
  /** Accessible label for the timeline section. */
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

/* --------------------------------- helpers -------------------------------- */

const DEFAULT_ITEMS: TimelineItem[] = [
  {
    year: "2015",
    index: "01",
    title: "ORIGINS",
    description:
      "Founded as a three-person design collective crafting brand identities, editorial layouts, and early web experiments for local cultural institutions.",
    background: "#1D4ED8",
    foreground: "#FFFFFF",
  },
  {
    year: "2017",
    index: "02",
    title: "BREAKTHROUGH",
    description:
      "Won our first international commission and grew into a full-service product studio, shipping mobile apps and e-commerce experiences used by millions.",
    background: "#F97316",
    foreground: "#111111",
  },
  {
    year: "2020",
    index: "03",
    title: "REMOTE-FIRST",
    description:
      "Rebuilt the studio around distributed collaboration and launched an R&D lab exploring WebGL, real-time 3D, and immersive storytelling formats.",
    background: "#0D9488",
    foreground: "#FFFFFF",
  },
  {
    year: "2022",
    index: "04",
    title: "SCALE & CRAFT",
    description:
      "Scaled to a twenty-person team across three time zones while doubling down on craft — motion systems, design engineering, and creative technology.",
    background: "#FACC15",
    foreground: "#111111",
  },
  {
    year: "2024",
    index: "05",
    title: "AWARD SEASON",
    description:
      "Recognised with international design awards and long-term partnerships with forward-thinking brands, festivals, and cultural organisations.",
    background: "#7C3AED",
    foreground: "#FFFFFF",
  },
  {
    year: "2026",
    index: "06",
    title: "WHAT'S NEXT",
    description:
      "Building adaptive interfaces, AI-assisted workflows, and bold interactive narratives for the next generation of ambitious teams and founders.",
    background: "#FAF7F2",
    foreground: "#111111",
  },
];

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Smoothstep 0 → 1 across [start, end]. Eased, deterministic, reversible. */
function smoothstep(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
}

/* -------------------------------- component ------------------------------- */

export function ScrollTimeline({
  items = DEFAULT_ITEMS,
  scrollPerItem = 100,
  rotationAmount = 82,
  yearSize = "clamp(9rem, 19vw, 20rem)",
  descriptionWidth = "min(28rem, 30vw)",
  easing = "smooth",
  viewportHeight = "100vh",
  smoothing = 0,
  disableAnimation = false,
  pauseWhenOffscreen = true,
  ariaLabel = "Company timeline",
  className,
  style,
}: ScrollTimelineProps) {
  const count = items.length;

  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const yearRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Imperative animation state — never in React state, scrolling never rerenders.
  const targetRef = useRef(0);
  const renderedRef = useRef(0);
  const inViewRef = useRef(true);
  const firstFrameRef = useRef(true);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef(0);

  const safeScrollPerItem = Math.max(0, scrollPerItem);
  const smoothFactor = clamp(smoothing, 0, 1);
  const motionActive = !disableAnimation && !reducedMotion && count > 1;

  // Live config for the imperative loop. Assigned during render so prop
  // changes apply without re-subscribing scroll listeners.
  const configRef = useRef({ easing, rotationAmount });
  configRef.current = { easing, rotationAmount };

  /* Reduced motion: static list, no interpolation. */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

  /* Imperative render: the entire visual state derives from one progress
     value, so render(progress) is complete and reversing scroll reconstructs
     every intermediate state exactly. */
  function renderFrame(progress: number) {
    const { easing: easeMode, rotationAmount: maxRotation } = configRef.current;
    const n = panelRefs.current.length;
    if (n === 0) return;
    const t = Math.max(1, n - 1);
    const seg = clamp(progress, 0, 1) * t;
    const ease = (x: number) =>
      easeMode === "smooth" ? smoothstep(0, 1, x) : clamp(x, 0, 1);

    for (let i = 0; i < n; i++) {
      const panel = panelRefs.current[i];
      if (!panel) continue;
      const isLast = i === n - 1;
      // Local transition progress for panel i: 0 while a previous panel
      // covers it, 0 → 1 while it collapses, 1 once it is gone. The last
      // panel never collapses — it is the final resting state.
      const local = isLast ? 0 : clamp(seg - i, 0, 1);
      const eased = ease(local);

      // Collapse the visible region from RIGHT → LEFT, anchored to the
      // left edge. clip-path crops the panel in place — the content keeps
      // its full-viewport coordinate system, so the oversized year is
      // progressively sliced rather than squeezed.
      const hidden = eased >= 0.999;
      panel.style.clipPath = hidden
        ? "inset(0 100% 0 0)"
        : `inset(0 ${(eased * 100).toFixed(3)}% 0 0)`;
      panel.style.visibility = hidden ? "hidden" : "visible";

      const year = yearRefs.current[i];
      if (year && !isLast) {
        // Rotation trails the collapse: it holds at 0° briefly, then
        // rotates counter-clockwise around the bottom-left anchor as a
        // consequence of the panel narrowing.
        const rotationP = smoothstep(0.08, 1, eased);
        const rotation = lerp(0, -Math.abs(maxRotation), rotationP);
        year.style.transform = `rotate(${rotation.toFixed(3)}deg)`;
      } else if (year) {
        year.style.transform = "rotate(0deg)";
      }
    }

    const nextActive = clamp(Math.round(seg), 0, Math.max(0, n - 1));
    if (nextActive !== activeRef.current) {
      activeRef.current = nextActive;
      setActiveIndex(nextActive);
    }

    if (firstFrameRef.current) {
      firstFrameRef.current = false;
      const stage = stageRef.current;
      if (stage) stage.style.opacity = "";
    }
  }

  /* Read normalized scroll progress from the track position. Plain window
     scroll math — compatible with native scrolling and Lenis alike; this
     component never owns global scrolling. */
  useEffect(() => {
    if (!motionActive) return;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const updateTarget = () => {
      const scrollable = track.offsetHeight - stage.offsetHeight;
      if (scrollable <= 0) {
        targetRef.current = 0;
      } else {
        const y = -track.getBoundingClientRect().top;
        targetRef.current = clamp(y / scrollable, 0, 1);
      }
      // Direct scrub: the timeline IS the scroll position — no lag, no settle.
      if (smoothFactor <= 0) {
        renderedRef.current = targetRef.current;
        if (inViewRef.current || !pauseWhenOffscreen) {
          renderFrame(targetRef.current);
        }
      }
    };

    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);
    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
    };
  }, [motionActive, smoothFactor, pauseWhenOffscreen, safeScrollPerItem]);

  /* rAF loop only when smoothing is requested; otherwise scroll writes directly. */
  useEffect(() => {
    if (!motionActive || smoothFactor <= 0) return;
    firstFrameRef.current = true;
    renderFrame(targetRef.current);
    let raf = 0;

    const tick = () => {
      if (!inViewRef.current && pauseWhenOffscreen) {
        renderedRef.current = targetRef.current;
        raf = requestAnimationFrame(tick);
        return;
      }
      const target = targetRef.current;
      let rendered = renderedRef.current;
      rendered += (target - rendered) * smoothFactor;
      if (Math.abs(target - rendered) < 0.0004) rendered = target;
      renderedRef.current = rendered;
      renderFrame(rendered);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motionActive, smoothFactor, pauseWhenOffscreen]);

  /* ------------------------- fallbacks / edge cases ------------------------ */

  if (count === 0) return null;

  if (!motionActive) {
    return (
      <section
        aria-label={ariaLabel}
        className={cn("relative w-full", className)}
        style={style}
      >
        {items.map((item, i) => (
          <article
            key={`${item.year}-${i}`}
            aria-label={`${item.year}${item.title ? ` — ${item.title}` : ""}`}
            className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden p-6 md:p-10"
            style={{ background: item.background, color: item.foreground }}
          >
            {(item.index || item.title || item.description) && (
              <div
                className="ml-auto w-full"
                style={{ maxWidth: descriptionWidth }}
              >
                {(item.index || item.title) && (
                  <p className="text-sm font-medium uppercase tracking-[0.18em] opacity-70 md:text-base">
                    {[item.index, item.title].filter(Boolean).join(" / ")}
                  </p>
                )}
                {item.description && (
                  <p className="mt-4 text-base leading-relaxed opacity-90 md:text-lg">
                    {item.description}
                  </p>
                )}
              </div>
            )}
            <h2
              aria-hidden={false}
              className="m-0 leading-[0.8]"
              style={{
                fontSize: yearSize,
                fontWeight: 400,
                letterSpacing: "-0.06em",
              }}
            >
              {item.year}
            </h2>
          </article>
        ))}
      </section>
    );
  }

  const trackHeight =
    count > 1
      ? `calc(${viewportHeight} + ${safeScrollPerItem * (count - 1)}vh)`
      : viewportHeight;

  return (
    <section
      ref={trackRef}
      aria-label={ariaLabel}
      data-testid="scroll-timeline-track"
      className={cn("scroll-timeline relative w-full", className)}
      style={{ height: trackHeight, overflowX: "clip", ...style }}
    >
      <div
        ref={stageRef}
        data-testid="scroll-timeline-stage"
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: viewportHeight, opacity: 0 }}
      >
        {items.map((item, i) => (
          <div
            key={`${item.year}-${i}`}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            data-testid={`scroll-timeline-panel-${i}`}
            aria-hidden={i === 0 ? undefined : i !== activeIndex}
            className="absolute inset-0 overflow-hidden"
            style={{
              background: item.background,
              color: item.foreground,
              // Reverse stack order: earlier panels sit above later ones so
              // each outgoing panel collapses to expose the next one
              // already waiting underneath at full size.
              zIndex: count - i,
              clipPath: i === 0 ? "inset(0 0% 0 0)" : undefined,
              willChange: "clip-path",
            }}
          >
            {(item.index || item.title || item.description) && (
              <div
                className="absolute"
                style={{
                  top: "6%",
                  right: "6%",
                  width: descriptionWidth,
                  maxWidth: "45vw",
                }}
              >
                {(item.index || item.title) && (
                  <p className="m-0 text-sm font-medium uppercase tracking-[0.18em] opacity-70 md:text-base">
                    {[item.index, item.title].filter(Boolean).join(" / ")}
                  </p>
                )}
                {item.description && (
                  <p className="m-0 mt-4 text-base leading-relaxed opacity-90 md:text-lg">
                    {item.description}
                  </p>
                )}
              </div>
            )}
            <div
              ref={(el) => {
                yearRefs.current[i] = el;
              }}
              aria-hidden="true"
              className="absolute whitespace-nowrap leading-[0.8]"
              style={{
                left: "1.5vw",
                bottom: "1.5vh",
                fontSize: yearSize,
                fontWeight: 400,
                letterSpacing: "-0.06em",
                transformOrigin: "left bottom",
                willChange: "transform",
              }}
            >
              {item.year}
            </div>
            <span className="sr-only">
              {`${item.year}${item.title ? ` — ${item.title}` : ""}${item.description ? `. ${item.description}` : ""}`}
            </span>
          </div>
        ))}
        <span className="sr-only" aria-live="polite">
          {items[activeIndex]
            ? `${items[activeIndex].year}${items[activeIndex].title ? ` — ${items[activeIndex].title}` : ""}`
            : ""}
        </span>
      </div>
    </section>
  );
}

export default ScrollTimeline;

/* Registry / Framer property-controls bridge. */
export const ScrollTimelinePropertyControls = {
  scrollPerItem: {
    type: "number",
    title: "Scroll Per Item (vh)",
    defaultValue: 100,
    min: 0,
    max: 300,
  },
  rotationAmount: {
    type: "number",
    title: "Year Rotation (deg)",
    defaultValue: 82,
    min: 0,
    max: 120,
  },
  yearSize: {
    type: "string",
    title: "Year Font Size",
    defaultValue: "clamp(9rem, 19vw, 20rem)",
  },
  descriptionWidth: {
    type: "string",
    title: "Description Width",
    defaultValue: "min(28rem, 30vw)",
  },
  easing: {
    type: "enum",
    title: "Easing",
    options: ["linear", "smooth"],
    defaultValue: "smooth",
  },
  viewportHeight: {
    type: "string",
    title: "Viewport Height",
    defaultValue: "100vh",
  },
  smoothing: {
    type: "number",
    title: "Scroll Smoothing",
    defaultValue: 0,
    min: 0,
    max: 1,
  },
  disableAnimation: {
    type: "boolean",
    title: "Disable Animation",
    defaultValue: false,
  },
  pauseWhenOffscreen: {
    type: "boolean",
    title: "Pause Offscreen",
    defaultValue: true,
  },
};
