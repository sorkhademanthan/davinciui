"use client";

import * as React from "react";

export type GeometricPreloaderPhase =
  | "idle"
  | "loading"
  | "complete"
  | "exiting"
  | "finished";

export interface GeometricPreloaderProps {
  duration?: number;
  holdDuration?: number;
  exitDuration?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  accentColor?: string;
  showLabel?: boolean;
  zIndex?: number;
  className?: string;
  onPhaseChange?: (phase: GeometricPreloaderPhase) => void;
  onComplete?: () => void;
}

const SHAPES = Array.from({ length: 9 }, (_, index) => index);

/**
 * GeometricPreloader — a fullscreen geometric loading takeover.
 *
 * The nested squares rotate while the progress state advances, then the
 * overlay scales away as a diamond to reveal the page underneath.
 * Remount the component to replay it.
 */
export function GeometricPreloader({
  duration = 2200,
  holdDuration = 180,
  exitDuration = 720,
  backgroundColor = "#111111",
  foregroundColor = "#f5f1e8",
  accentColor = "#ff4d23",
  showLabel = true,
  zIndex = 9999,
  className,
  onPhaseChange,
  onComplete,
}: GeometricPreloaderProps) {
  const [phase, setPhase] = React.useState<GeometricPreloaderPhase>("idle");
  const onPhaseChangeRef = React.useRef(onPhaseChange);
  const onCompleteRef = React.useRef(onComplete);
  onPhaseChangeRef.current = onPhaseChange;
  onCompleteRef.current = onComplete;

  const changePhase = React.useCallback((next: GeometricPreloaderPhase) => {
    setPhase(next);
    onPhaseChangeRef.current?.(next);
  }, []);

  React.useEffect(() => {
    const timers = [
      window.setTimeout(() => changePhase("loading"), 0),
      window.setTimeout(() => changePhase("complete"), Math.max(0, duration)),
      window.setTimeout(
        () => changePhase("exiting"),
        Math.max(0, duration + holdDuration),
      ),
      window.setTimeout(
        () => {
          changePhase("finished");
          onCompleteRef.current?.();
        },
        Math.max(0, duration + holdDuration + exitDuration),
      ),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [changePhase, duration, holdDuration, exitDuration]);

  if (phase === "finished") return null;

  const progress = phase === "idle" ? 0 : phase === "loading" ? 0.72 : 1;
  const isExiting = phase === "exiting";

  return (
    <div
      role="progressbar"
      aria-label="Page loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      data-slot="geometric-preloader"
      data-phase={phase}
      className={`fixed inset-0 flex items-center justify-center overflow-hidden ${className ?? ""}`}
      style={{
        backgroundColor,
        color: foregroundColor,
        zIndex,
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "scale(1.35) rotate(45deg)" : "scale(1) rotate(0deg)",
        transition: `opacity ${exitDuration}ms ease, transform ${exitDuration}ms cubic-bezier(.76,0,.24,1)`,
        pointerEvents: isExiting ? "none" : "auto",
      }}
    >
      <div className="relative flex size-[min(48vw,18rem)] items-center justify-center">
        {SHAPES.map((index) => {
          const size = 100 - index * 9;
          return (
            <span
              key={index}
              aria-hidden="true"
              className="absolute border"
              style={{
                width: `${size}%`,
                height: `${size}%`,
                borderColor: index === 0 ? accentColor : `${foregroundColor}55`,
                transform: `rotate(${index % 2 ? -45 : 45}deg)`,
                animation: `geometric-preloader-spin ${2.4 + index * 0.12}s linear infinite`,
                animationDelay: `${index * -0.12}s`,
              }}
            />
          );
        })}
        <span
          className="relative z-10 text-[clamp(1rem,2vw,1.35rem)] font-medium tabular-nums tracking-[0.18em]"
          style={{ color: accentColor }}
        >
          {showLabel ? `${Math.round(progress * 100)}%` : ""}
        </span>
      </div>
      <style>{`@keyframes geometric-preloader-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @media (prefers-reduced-motion: reduce) { [data-slot="geometric-preloader"] span { animation-duration: 0.01ms !important; } }`}</style>
    </div>
  );
}

export default GeometricPreloader;
