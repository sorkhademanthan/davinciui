"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { TiltFlipPolaroid } from "@workspace/ui/components/tilt-flip-polaroid";
import { tiltFlipPolaroidDemoImage } from "./tilt-flip-polaroid-preview";

const FLIP_INTERVAL_MS = 3800;
const RESUME_DELAY_MS = 1400;

export function TiltFlipPolaroidCardPreview() {
  const reduceMotion = useReducedMotion() ?? false;
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const hoveredRef = React.useRef(false);
  const keyboardFocusedRef = React.useRef(false);
  const resumeTimerRef = React.useRef<number | null>(null);
  const pausedRef = React.useRef(false);
  const [flipped, setFlipped] = React.useState(false);
  const [paused, setPaused] = React.useState(false);

  const clearResumeTimer = React.useCallback(() => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const pause = React.useCallback(() => {
    pausedRef.current = true;
    clearResumeTimer();
    setPaused(true);
  }, [clearResumeTimer]);

  const scheduleResume = React.useCallback(() => {
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      resumeTimerRef.current = null;
      if (!hoveredRef.current && !keyboardFocusedRef.current) {
        pausedRef.current = false;
        setPaused(false);
      }
    }, RESUME_DELAY_MS);
  }, [clearResumeTimer]);

  React.useEffect(() => clearResumeTimer, [clearResumeTimer]);

  React.useEffect(() => {
    if (reduceMotion || paused) return;

    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      setFlipped((current) => !current);
    }, FLIP_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  React.useEffect(() => {
    if (reduceMotion || paused) return;

    const card = hostRef.current?.querySelector<HTMLElement>(
      '[data-slot="tilt-flip-polaroid"]',
    );
    if (!card) return;

    let frame = 0;
    const startedAt = performance.now();

    const movePointer = (nx: number, ny: number) => {
      const rect = card.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      card.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width / 2 + (nx * rect.width) / 2,
          clientY: rect.top + rect.height / 2 + (ny * rect.height) / 2,
          pointerType: "mouse",
          pointerId: 1,
          isPrimary: true,
        }),
      );
    };

    const tick = (now: number) => {
      if (pausedRef.current) return;
      const t = (now - startedAt) / 1000;
      movePointer(Math.sin(t * 0.85) * 0.8, Math.sin(t * 1.3) * 0.55);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [paused, reduceMotion]);

  const handlePointerEnter = React.useCallback(() => {
    hoveredRef.current = true;
    pause();
  }, [pause]);

  const handlePointerLeave = React.useCallback(() => {
    hoveredRef.current = false;
    scheduleResume();
  }, [scheduleResume]);

  const handleFocus = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (
        !(event.target instanceof HTMLElement) ||
        !event.target.matches(":focus-visible")
      ) {
        return;
      }

      keyboardFocusedRef.current = true;
      pause();
    },
    [pause],
  );

  const handleBlur = React.useCallback(() => {
    keyboardFocusedRef.current = false;
    scheduleResume();
  }, [scheduleResume]);

  const handleFlippedChange = React.useCallback(
    (next: boolean) => {
      setFlipped(next);
      pause();
    },
    [pause],
  );

  return (
    <div
      ref={hostRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div
        className="scale-[0.42]"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <TiltFlipPolaroid
          image={tiltFlipPolaroidDemoImage}
          maxTilt={8}
          flipped={flipped}
          onFlippedChange={handleFlippedChange}
        />
      </div>
    </div>
  );
}
