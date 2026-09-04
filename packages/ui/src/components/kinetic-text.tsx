"use client";

import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import * as React from "react";

const MIN_AMOUNT = 3;
const MAX_AMOUNT = 32;

function clampAmount(value: number): number {
  if (!Number.isFinite(value)) return 20;
  return Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, Math.round(value)));
}

function positiveMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface KineticTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text to render — single line preferred, `\n` will preserve breaks. */
  text?: string;
  /** Number of overlapping clone layers. Clamped 3–32. @default 20 */
  sliceCount?: number;
  /** Full loop duration in seconds. @default 2 */
  duration?: number;
  /** Delay before first loop in seconds. @default 0 */
  delay?: number;
  /** Vertical travel range in px (±distance around center). @default 150 */
  amplitude?: number;
  /** Loop continuously. @default true */
  loop?: boolean;
  /** Start automatically. @default true */
  autoplay?: boolean;
  /** Extra classes for the outer component. */
  className?: string;
  /** Extra classes for the outer container (layout, max-width). */
  containerClassName?: string;
}

const KINETIC_TEXT_DEFAULTS = {
  text: "GSAP TEXT",
  fontFamily: '"Inter Display", "Inter Display Placeholder", sans-serif',
  fontSize: 88,
  fontWeight: 600,
  color: "rgb(254, 255, 237)",
  backgroundColor: "#000000",
  amount: 20,
  distance: 150,
  duration: 2,
} as const;

export function KineticText({
  text = KINETIC_TEXT_DEFAULTS.text,
  sliceCount = KINETIC_TEXT_DEFAULTS.amount,
  duration = KINETIC_TEXT_DEFAULTS.duration,
  delay = 0,
  amplitude = KINETIC_TEXT_DEFAULTS.distance,
  loop = true,
  autoplay = true,
  className,
  containerClassName,
  style,
  ...props
}: KineticTextProps) {
  const count = clampAmount(sliceCount);
  const safeDistance = Number.isFinite(amplitude)
    ? Math.max(24, amplitude)
    : KINETIC_TEXT_DEFAULTS.distance;
  const safeDuration = Number.isFinite(duration)
    ? Math.max(0.4, duration)
    : KINETIC_TEXT_DEFAULTS.duration;

  const outerRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const cloneRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const ctxRef = React.useRef<gsap.Context | null>(null);
  const timelineRef = React.useRef<gsap.core.Timeline | null>(null);
  const animState = React.useRef<{ bases: number[]; signs: number[]; total: number }>({
    bases: [],
    signs: [],
    total: 1,
  });
  const pausedRef = React.useRef(false);

  const [motionReduced, setMotionReduced] = React.useState(false);
  const [effDistance, setEffDistance] = React.useState(safeDistance);

  if (cloneRefs.current.length !== count) {
    cloneRefs.current = Array.from({ length: count }, (_, i) => cloneRefs.current[i] ?? null);
  }

  const setCloneRef = React.useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      cloneRefs.current[index] = node;
    },
    [],
  );

  React.useEffect(() => {
    if (!motionReduced || typeof window === "undefined") {
      setMotionReduced(false);
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotionReduced(media.matches);
    const onChange = (event: MediaQueryListEvent) => setMotionReduced(event.matches);
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    media.addListener(onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const resolvedFontSize: string = `clamp(48px, 5.5rem, 88px)`;

  const layerTextStyle: React.CSSProperties = {
    fontFamily: KINETIC_TEXT_DEFAULTS.fontFamily,
    fontSize: resolvedFontSize,
    fontStyle: "normal",
    fontWeight: KINETIC_TEXT_DEFAULTS.fontWeight,
    letterSpacing: "0em",
    lineHeight: "1.1em",
    color: KINETIC_TEXT_DEFAULTS.color,
    backgroundColor: KINETIC_TEXT_DEFAULTS.backgroundColor,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    margin: 0,
    display: "block",
    width: "max-content",
    maxWidth: "none",
  };

  useIsomorphicLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer || typeof window === "undefined") return;

    const compute = () => {
      const w = outer.clientWidth || window.innerWidth || 800;
      const widthScale = Math.min(1, Math.max(0.45, w / 860));
      const next = Math.max(24, Math.round(safeDistance * widthScale));
      setEffDistance((prev) => (Math.abs(prev - next) < 1 ? prev : next));
    };

    compute();

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(compute, 140);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [safeDistance]);

  useIsomorphicLayoutEffect(() => {
    const nodes = cloneRefs.current.filter((n): n is HTMLDivElement => n !== null);
    if (nodes.length === 0 || typeof window === "undefined") return;

    ctxRef.current?.revert();
    ctxRef.current = null;
    timelineRef.current = null;

    const D = effDistance;
    const total = Math.max(1, D * 2);

    const bases: number[] = new Array(nodes.length);
    const signs: number[] = new Array(nodes.length);

    const upIdx: number[] = [];
    const downIdx: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      if (i % 2 === 0) upIdx.push(i);
      else downIdx.push(i);
    }
    upIdx.forEach((_nodeIdx, k) => {
      bases[_nodeIdx] = -D + (upIdx.length > 1 ? (k / upIdx.length) * total : 0);
      signs[_nodeIdx] = -1;
    });
    downIdx.forEach((_nodeIdx, k) => {
      bases[_nodeIdx] = -D + (downIdx.length > 1 ? (k / downIdx.length) * total : 0);
      signs[_nodeIdx] = 1;
    });
    animState.current = { bases, signs, total };

    const render = (travel: number) => {
      const { bases: b, signs: s, total: t } = animState.current;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node) continue;
        const raw = (b[i] ?? 0) + (s[i] ?? -1) * travel;
        const y = positiveMod(raw + D, t) - D;
        node.style.transform = `translate(-50%, -50%) translate3d(0px, ${y.toFixed(2)}px, 0px)`;
      }
    };
    render(0);

    if (motionReduced) return;

    const viewport = viewportRef.current ?? outerRef.current;
    if (!viewport) return;

    const ctx = gsap.context(() => {
      const proxy = { travel: 0 };
      const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
      tl.to(proxy, {
        travel: total,
        duration: safeDuration,
        onUpdate: () => render(proxy.travel),
      });
      tl.paused(pausedRef.current);
      timelineRef.current = tl;
    }, viewport);

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
      if (ctxRef.current === ctx) {
        ctxRef.current = null;
        timelineRef.current = null;
      }
    };
  }, [count, effDistance, safeDuration, motionReduced]);

  React.useEffect(() => {
    if (autoplay && !motionReduced) {
      timelineRef.current?.play();
    } else {
      timelineRef.current?.pause();
    }
  }, [autoplay, motionReduced]);

  return (
    <div
      ref={outerRef}
      data-slot="kinetic-text"
      className={cn("relative inline-flex max-w-full items-center justify-center", containerClassName, className)}
      style={{
        backgroundColor: KINETIC_TEXT_DEFAULTS.backgroundColor,
        width: "max-content",
        maxWidth: "100%",
        ...style,
      }}
      {...props}
    >
      <div
        ref={viewportRef}
        className="relative flex w-max max-w-full items-center justify-center overflow-hidden"
        style={{
          minWidth: "100px",
          minHeight: "100px",
          paddingTop: `${effDistance}px`,
          paddingBottom: `${effDistance}px`,
        }}
      >
        <span
          className="relative block text-center"
          style={{ ...layerTextStyle, zIndex: 100, position: "relative", textAlign: "center" }}
        >
          {text}
        </span>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          {Array.from({ length: count }, (_, i) => (
            <div
              key={i}
              ref={setCloneRef(i)}
              aria-hidden="true"
              className="absolute will-change-transform"
              style={{
                ...layerTextStyle,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%) translate3d(0px, 0px, 0px)",
                zIndex: 10 + i,
                textAlign: "center",
                overflow: "visible",
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KineticText;