"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */

export interface AnimatedMetricProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  startValue?: number;
  duration?: number;
  decimals?: number;
  /** Stagger offset before counting starts (ms). */
  delay?: number;
  /** True → animate once and stay. False → reset on exit, replay on enter. */
  once?: boolean;
  /** True → replay indefinitely while visible (takes precedence over once). */
  loop?: boolean;
  /** Pause on the final value between loops (ms). */
  loopDelay?: number;
  /** Fraction of the component visible before triggering (0–1). */
  threshold?: number;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
}

/* ------------------------------------------------------------------ */
/* easing — cubic-bezier(0.22, 1, 0.36, 1), fast start, long settle    */
/* ------------------------------------------------------------------ */

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 5; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) break;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return sampleY(t);
  };
}

const EASE = cubicBezier(0.22, 1, 0.36, 1);

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

export function AnimatedMetric({
  value,
  prefix = "",
  suffix = "",
  label,
  startValue = 0,
  duration = 1500,
  decimals = 0,
  delay = 0,
  once = true,
  loop = false,
  loopDelay = 1500,
  threshold = 0.25,
  className,
  valueClassName,
  labelClassName,
}: AnimatedMetricProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const numRef = React.useRef<HTMLSpanElement>(null);
  const [entered, setEntered] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  const format = React.useCallback(
    (v: number) => v.toFixed(decimals),
    [decimals],
  );
  const finalText = `${prefix}${format(value)}${suffix}`;

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* Counting writes straight to the DOM — no React re-renders per frame. */
  React.useEffect(() => {
    if (reducedMotion) {
      setEntered(true);
      return;
    }
    const root = rootRef.current;
    const num = numRef.current;
    if (!root || !num) return;

    let raf = 0;
    let timer = 0;
    let disposed = false;
    let visible = false;
    const render = (v: number) => {
      num.textContent = v.toFixed(decimals);
    };
    render(startValue);

    const play = () => {
      if (disposed) return;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      setEntered(true);
      render(startValue);
      timer = window.setTimeout(() => {
        if (disposed) return;
        const t0 = performance.now();
        const from = startValue;
        const to = value;
        const tick = (now: number) => {
          if (disposed) return;
          const p = clamp((now - t0) / Math.max(1, duration), 0, 1);
          render(from + (to - from) * EASE(p));
          if (p < 1) {
            raf = requestAnimationFrame(tick);
          } else {
            render(to); // exact final value — never 2.9999999
            if (loop) {
              timer = window.setTimeout(() => {
                if (!disposed && visible) play();
              }, Math.max(0, loopDelay));
            }
          }
        };
        raf = requestAnimationFrame(tick);
      }, Math.max(0, delay));
    };

    const reset = () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      render(startValue);
      setEntered(false);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (disposed || !entry) return;
        visible = entry.isIntersecting;
        if (entry.isIntersecting) {
          play();
          if (once && !loop) io.disconnect();
        } else {
          // Hidden: stop any in-flight count or pending replay.
          cancelAnimationFrame(raf);
          window.clearTimeout(timer);
          if (!loop && !once) reset();
        }
      },
      { threshold: clamp(threshold, 0, 1) },
    );
    io.observe(root);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, [reducedMotion, value, startValue, duration, decimals, delay, once, loop, loopDelay, threshold]);

  const accessibleLabel = label
    ? `${finalText} — ${label}`
    : finalText;

  return (
    <div
      ref={rootRef}
      data-slot="animated-metric"
      role="img"
      aria-label={accessibleLabel}
      className={cn("am-root", entered && "am-entered", className)}
    >
      <style>{AM_CSS}</style>
      <div aria-hidden="true">
        <div className={cn("am-value", valueClassName)}>
          {prefix}
          <span ref={numRef}>
            {reducedMotion ? format(value) : startValue.toFixed(decimals)}
          </span>
          {suffix}
        </div>
        {label ? (
          <p className={cn("am-label", labelClassName)}>{label}</p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* demo — the four reference statistics, each its own instance         */
/* ------------------------------------------------------------------ */

export function AnimatedMetricDemo({ className }: { className?: string }) {
  return (
    <div className={cn("am-demo", className)}>
      <AnimatedMetric value={3} suffix="m+" label="Ad impressions managed" delay={0} />
      <AnimatedMetric value={27} suffix="+" label="Successful projects launched" delay={100} />
      <AnimatedMetric value={98} suffix="%" label="Client satisfaction rate" delay={200} />
      <AnimatedMetric value={50} suffix="k+" label="Monthly visitors driven through SEO" delay={300} />
    </div>
  );
}

const AM_CSS = `
.am-root {
  container-type: inline-size;
  width: 100%;
  text-align: center;
  color: inherit;
}
.am-value {
  font-size: clamp(2.5rem, 16cqi, 6.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  opacity: 0;
  transform: translateY(14px);
}
.am-entered .am-value {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 600ms ease,
    transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
}
.am-label {
  margin: 0.7rem 0 0;
  font-size: clamp(0.8rem, 3.4cqi, 1.05rem);
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0;
  text-wrap: balance;
  color: var(--muted-foreground, #71717a);
  opacity: 0;
  transform: translateY(6px);
}
.am-entered .am-label {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 500ms ease 150ms,
    transform 500ms cubic-bezier(0.22, 1, 0.36, 1) 150ms;
}
.am-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(170px, 100%), 1fr));
  gap: clamp(1.5rem, 4cqi, 3rem);
  align-items: start;
  width: 100%;
}
@media (prefers-reduced-motion: reduce) {
  .am-value, .am-label { opacity: 1; transform: none; transition: none; }
}
`;

export default AnimatedMetric;
