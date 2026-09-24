"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */

export interface ServiceImage {
  src: string;
  alt: string;
}

export interface Service {
  number: string;
  title: string;
  description: string;
  images: ServiceImage[];
}

export interface ServicesShowcaseProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  services?: Service[];
  /** "comfortable" for full pages, "compact" for small card previews. */
  density?: "comfortable" | "compact";
  /** When false, pointer tilt + hover spread are disabled (card previews). */
  interactive?: boolean;
}

/* ------------------------------------------------------------------ */
/* data                                                                */
/* ------------------------------------------------------------------ */

const DEFAULT_SERVICES: Service[] = [
  {
    number: "01",
    title: "Brand identity",
    description:
      "Logos, systems and guidelines that give ambitious companies a distinctive voice.",
    images: [
      {
        src: "/images/spiral-3d-slider/orange-haze.jpg",
        alt: "Portrait wrapped in warm orange haze",
      },
      {
        src: "/images/spiral-3d-slider/dark-glitch.jpg",
        alt: "Dark graphic texture study",
      },
      {
        src: "/images/spiral-3d-slider/crimson-profile.jpg",
        alt: "Profile rendered in deep crimson",
      },
    ],
  },
  {
    number: "02",
    title: "Art direction & photography",
    description:
      "Editorial imagery and photoshoots with a cinematic, monochrome sensibility.",
    images: [
      {
        src: "/images/spiral-3d-slider/silver-motion.jpg",
        alt: "Monochrome editorial portrait in motion",
      },
      {
        src: "/images/spiral-3d-slider/white-motion.jpg",
        alt: "Figure in white captured through long exposure",
      },
      {
        src: "/images/spiral-3d-slider/camera-reflection.jpg",
        alt: "Camera reflected in studio glass",
      },
    ],
  },
  {
    number: "03",
    title: "Motion & film",
    description:
      "Title sequences, short films and kinetic stories cut for every screen.",
    images: [
      {
        src: "/images/spiral-3d-slider/blue-profile.jpg",
        alt: "Profile drawn in saturated electric blue",
      },
      {
        src: "/images/spiral-3d-slider/blue-motion.jpg",
        alt: "Blue motion blur study",
      },
      {
        src: "/images/spiral-3d-slider/teal-echo.jpg",
        alt: "Teal echo portrait still",
      },
    ],
  },
  {
    number: "04",
    title: "Content systems",
    description:
      "Modular templates and toolkits that keep every channel sharp and on-brand.",
    images: [
      {
        src: "/images/spiral-3d-slider/prism-portrait.jpg",
        alt: "Portrait refracted through a glass prism",
      },
      {
        src: "/images/segmented-image-carousel/chrome-chair.jpg",
        alt: "Chrome product study in a studio",
      },
      {
        src: "/images/spiral-3d-slider/green-portrait.jpg",
        alt: "Portrait graded in deep green tones",
      },
    ],
  },
];

/* Per-service stack geometry. Each entry positions one card inside the
   visual stage (percentages of stage size). Slot 0 = front, slot 2 = rear.
   `h*` = hover spread delta for the middle (hover) layer. */
interface CardGeometry {
  w: number;
  aspect: string;
  x: number;
  y: number;
  r: number;
  hx: number;
  hy: number;
  hr: number;
}

const STACK_GEOMETRY: CardGeometry[][] = [
  // 01 — small portrait with darker graphic cards layered behind
  [
    { w: 47, aspect: "3 / 4", x: 6, y: 14, r: -4, hx: -5, hy: 2.5, hr: -2 },
    { w: 44, aspect: "3 / 4", x: 29, y: 6, r: 3, hx: 1.5, hy: -1, hr: 1 },
    { w: 40, aspect: "3 / 4", x: 52, y: 18, r: 8, hx: 6, hy: -2.5, hr: 2.5 },
  ],
  // 02 — large monochrome face with secondary cards behind
  [
    { w: 60, aspect: "4 / 5", x: 22, y: 5, r: 2, hx: 0, hy: 2.5, hr: 0.5 },
    { w: 38, aspect: "3 / 4", x: 0, y: 26, r: -7, hx: -6, hy: 1, hr: -2 },
    { w: 35, aspect: "3 / 4", x: 63, y: 0, r: 7, hx: 6, hy: -1.5, hr: 2 },
  ],
  // 03 — narrow overlapping cinematic strips
  [
    { w: 34, aspect: "3 / 4.4", x: 33, y: 8, r: -2, hx: -1, hy: 3, hr: -1 },
    { w: 30, aspect: "3 / 4.4", x: 10, y: 16, r: -8, hx: -6, hy: 0.5, hr: -2.5 },
    { w: 30, aspect: "3 / 4.4", x: 58, y: 16, r: 7, hx: 6, hy: 0.5, hr: 2.5 },
  ],
  // 04 — device / product-style layered set
  [
    { w: 30, aspect: "9 / 17", x: 36, y: 2, r: 0, hx: 0, hy: 3, hr: 0 },
    { w: 33, aspect: "4 / 5", x: 8, y: 22, r: -6, hx: -6, hy: -1, hr: -2 },
    { w: 35, aspect: "4 / 5", x: 59, y: 20, r: 6, hx: 6, hy: -1, hr: 2 },
  ],
];

/* Scroll travel per card depth (front → rear), px at full width. */
const SCROLL_AMP = [14, 26, 38];
const SCROLL_LAT = [0, -7, -12];

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/** The preview panel scrolls inside its own element — measure against it,
    not window, so right-side preview parallax stays correct. */
function findScrollParent(el: HTMLElement): HTMLElement | Window {
  let p: HTMLElement | null = el.parentElement;
  while (p) {
    if (p.hasAttribute("data-text-reveal-preview-scroll")) return p;
    const s = getComputedStyle(p);
    if (/(auto|scroll)/.test(s.overflowY)) return p;
    p = p.parentElement;
  }
  return window;
}

/* ------------------------------------------------------------------ */
/* visual — transform layers compose without overwriting each other:   */
/*   .svc-s  (outer)  → scroll parallax, written imperatively          */
/*   .svc-h  (middle) → hover spread, CSS transition                   */
/*   .svc-rest        → static resting geometry                        */
/*   .svc-img(inner)  → pointer micro-tilt via CSS vars                */
/* ------------------------------------------------------------------ */

function ServiceVisual({
  service,
  geometry,
  rowIndex,
  interactive,
  collectCard,
  tiltRef,
}: {
  service: Service;
  geometry: CardGeometry[];
  rowIndex: number;
  interactive: boolean;
  collectCard: (el: HTMLDivElement | null) => void;
  tiltRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={tiltRef}
      data-svc-tilt={interactive ? "true" : undefined}
      className="svc-visual relative w-full overflow-visible"
      style={{ aspectRatio: "4 / 3.4" }}
    >
      {[0, 1, 2].map((slot) => {
        const image = service.images[slot % service.images.length]!;
        const geo = geometry[slot]!;
        return (
          <div
            key={slot}
            ref={collectCard}
            data-svc-scroll={rowIndex * 3 + slot}
            className="svc-s absolute left-0 top-0 will-change-transform"
            style={{
              width: `${geo.w}%`,
              aspectRatio: geo.aspect,
              left: `${geo.x}%`,
              top: `${geo.y}%`,
              zIndex: 3 - slot,
            }}
          >
            <div
              className="svc-h h-full w-full"
              style={
                {
                  ["--hx" as string]: `${geo.hx}%`,
                  ["--hy" as string]: `${geo.hy}%`,
                  ["--hr" as string]: `${geo.hr}deg`,
                } as React.CSSProperties
              }
            >
              <div
                className="svc-rest h-full w-full overflow-hidden rounded-[10px] bg-zinc-800"
                style={{ transform: `rotate(${geo.r}deg)` }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  draggable={false}
                  loading={rowIndex === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="svc-img block h-full w-full select-none object-cover"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

export function ServicesShowcase({
  services = DEFAULT_SERVICES,
  density = "comfortable",
  interactive = true,
  className,
  style,
  ...props
}: ServicesShowcaseProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const rowRefs = React.useRef<Array<HTMLElement | null>>([]);
  const cardRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const textRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const tiltRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const widthRef = React.useRef(1100);
  const lastProgress = React.useRef<number[]>([]);

  const collectCard = React.useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const id = Number(el.dataset.svcScroll);
    if (Number.isFinite(id)) cardRefs.current[id] = el;
  }, []);

  /* ---- scroll-driven parallax: one rAF loop, zero react state ---- */
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scrollParent = findScrollParent(root);
    let raf = 0;
    let scheduled = false;
    let disposed = false;

    const measureWidth = () => {
      widthRef.current = root.clientWidth || 1100;
    };
    measureWidth();

    const update = () => {
      scheduled = false;
      if (disposed) return;
      const rows = rowRefs.current;
      if (!rows.length) return;

      let vh = window.innerHeight;
      let viewTop = 0;
      let viewBottom = vh;
      if (scrollParent instanceof HTMLElement) {
        const pr = scrollParent.getBoundingClientRect();
        vh = pr.height;
        viewTop = pr.top;
        viewBottom = pr.bottom;
      }
      if (vh <= 0) return;

      // Smaller containers (card / right preview) travel less.
      const unit = clamp(widthRef.current / 1100, 0.3, 1);

      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        const rect = row.getBoundingClientRect();
        if (rect.bottom < viewTop - vh * 0.5 || rect.top > viewBottom + vh * 0.5)
          continue;

        // 0 = entering, 0.5 = centered, 1 = exiting. Reverses on scroll-up.
        const t = clamp((viewBottom - rect.top) / (vh + rect.height), 0, 1);
        if (Math.abs((lastProgress.current[r] ?? -1) - t) < 0.0005) continue;
        lastProgress.current[r] = t;

        const c = t - 0.5;
        for (let s = 0; s < 3; s++) {
          const el = cardRefs.current[r * 3 + s];
          if (!el) continue;
          const y = -c * 2 * SCROLL_AMP[s]! * unit;
          const x = -c * 2 * SCROLL_LAT[s]! * unit;
          const scale = 1 - Math.abs(c) * 2 * s * 0.012;
          el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        }
        const text = textRefs.current[r];
        if (text) {
          const ty = -c * 2 * 10 * unit;
          text.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`;
        }
      }
    };

    const requestUpdate = () => {
      if (scheduled || disposed) return;
      scheduled = true;
      raf = requestAnimationFrame(update);
    };

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            measureWidth();
            requestUpdate();
          })
        : null;
    ro?.observe(root);

    const target: Window | HTMLElement =
      scrollParent instanceof HTMLElement ? scrollParent : window;
    target.addEventListener("scroll", requestUpdate, { passive: true });
    if (target !== window)
      window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    requestUpdate();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      target.removeEventListener("scroll", requestUpdate);
      if (target !== window)
        window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  /* ---- pointer micro-tilt: fine pointers only, CSS vars on .svc-img ---- */
  React.useEffect(() => {
    if (!interactive) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cleanups: Array<() => void> = [];
    for (const visual of tiltRefs.current) {
      if (!visual || visual.dataset.svcTilt !== "true") continue;
      let raf = 0;
      let tx = 0;
      let ty = 0;
      let rx = 0;
      let ry = 0;
      const apply = () => {
        raf = 0;
        visual.style.setProperty("--tx", `${tx.toFixed(2)}px`);
        visual.style.setProperty("--ty", `${ty.toFixed(2)}px`);
        visual.style.setProperty("--rx", `${rx.toFixed(3)}deg`);
        visual.style.setProperty("--ry", `${ry.toFixed(3)}deg`);
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
        const rect = visual.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
        const ny = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
        tx = nx * 5;
        ty = ny * 4;
        ry = nx * 3.5;
        rx = -ny * 3;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      const onLeave = () => {
        tx = 0;
        ty = 0;
        rx = 0;
        ry = 0;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      visual.addEventListener("pointermove", onMove, { passive: true });
      visual.addEventListener("pointerleave", onLeave, { passive: true });
      cleanups.push(() => {
        visual.removeEventListener("pointermove", onMove);
        visual.removeEventListener("pointerleave", onLeave);
        cancelAnimationFrame(raf);
      });
    }
    return () => {
      for (const fn of cleanups) fn();
    };
  }, [interactive, services.length]);

  return (
    <section
      ref={rootRef}
      data-slot="services-showcase"
      data-density={density}
      className={cn(
        "svc-root relative w-full overflow-hidden bg-[#0a0a0b] text-zinc-100",
        className,
      )}
      style={{ containerType: "inline-size", containerName: "svc", ...style }}
      {...props}
    >
      <style>{SVC_CSS}</style>

      <div className="svc-rows mx-auto w-full max-w-[1200px] px-6 pb-16 pt-6 sm:px-10 sm:pb-24 sm:pt-10">
        {services.map((service, i) => {
          const geometry = STACK_GEOMETRY[i % STACK_GEOMETRY.length]!;
          return (
            <React.Fragment key={`${service.number}-${i}`}>
              <div
                aria-hidden="true"
                className="svc-divider h-px w-full bg-white/10"
              />
              <article
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className="svc-row relative grid grid-cols-1 items-center gap-x-8 gap-y-6 py-10 sm:py-12"
              >
                <span
                  aria-hidden="true"
                  className="svc-number order-1 font-sans font-medium leading-none tracking-[-0.03em] text-zinc-700"
                >
                  {service.number}
                </span>

                <div className="svc-visual-col order-2 min-w-0">
                  <ServiceVisual
                    service={service}
                    geometry={geometry}
                    rowIndex={i}
                    interactive={interactive}
                    collectCard={collectCard}
                    tiltRef={(el) => {
                      tiltRefs.current[i] = el;
                    }}
                  />
                </div>

                <div
                  ref={(el) => {
                    textRefs.current[i] = el;
                  }}
                  className="svc-text-col order-3 min-w-0 will-change-transform"
                >
                  <h3 className="svc-title font-sans font-medium leading-[1.05] tracking-[-0.02em] text-zinc-50">
                    {service.title}
                  </h3>
                  <p className="svc-desc mt-3 max-w-[30ch] font-sans leading-[1.6] text-zinc-500">
                    {service.description}
                  </p>
                </div>
              </article>
            </React.Fragment>
          );
        })}
        <div
          aria-hidden="true"
          className="svc-divider h-px w-full bg-white/10"
        />
      </div>
    </section>
  );
}

const SVC_CSS = `
.svc-root { --svc-ease: cubic-bezier(0.22, 1, 0.36, 1); }
.svc-number { font-size: clamp(2.6rem, 6cqi, 4.6rem); }
.svc-title { font-size: clamp(1.35rem, 2.6cqi, 2rem); }
.svc-desc { font-size: clamp(0.68rem, 1.15cqi, 0.82rem); }

/* rows: [number] [visual] [content] */
.svc-row { grid-template-columns: 1fr; }
@container svc (min-width: 560px) {
  .svc-row { grid-template-columns: 3.4rem minmax(0, 1.15fr) minmax(0, 0.85fr); }
  .svc-row .svc-number { order: 1; align-self: start; padding-top: 0.4rem; }
  .svc-row .svc-visual-col { order: 2; }
  .svc-row .svc-text-col { order: 3; align-self: center; }
}
@container svc (min-width: 900px) {
  .svc-row { grid-template-columns: 5rem minmax(0, 1.2fr) minmax(0, 0.8fr); column-gap: 3.5rem; }
}

/* compact density (component card preview) */
.svc-root[data-density="compact"] .svc-rows { padding-bottom: 1rem; }
.svc-root[data-density="compact"] .svc-row { padding-top: 0.7rem; padding-bottom: 0.7rem; gap-y: 0.4rem; }
.svc-root[data-density="compact"] .svc-desc { display: none; }
@container svc (max-width: 559px) {
  .svc-root[data-density="compact"] .svc-row { grid-template-columns: 2rem minmax(0,1fr); }
  .svc-root[data-density="compact"] .svc-visual-col { grid-column: 2; }
  .svc-root[data-density="compact"] .svc-text-col { grid-column: 2; }
}

/* small containers: number / visual / text stack */
@container svc (max-width: 559px) {
  .svc-number { font-size: 2.4rem; }
}

/* hover spread — middle layer only, never touches scroll/pointer layers */
.svc-h { transition: transform 380ms var(--svc-ease); will-change: transform; }
@media (hover: hover) and (pointer: fine) {
  .svc-visual:hover .svc-h {
    transform: translate(var(--hx, 0%), var(--hy, 0%)) rotate(var(--hr, 0deg)) scale(1.015);
  }
}

/* pointer micro-tilt — innermost image only */
.svc-visual[data-svc-tilt="true"] .svc-img {
  transform: perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translate3d(var(--tx, 0px), var(--ty, 0px), 0);
  transition: transform 520ms var(--svc-ease);
  transform-origin: center center;
}

/* scroll layers keep a stable origin */
.svc-s { transform-origin: center center; }

@media (prefers-reduced-motion: reduce) {
  .svc-h, .svc-visual[data-svc-tilt="true"] .svc-img { transition: none; }
}
`;

export default ServicesShowcase;
