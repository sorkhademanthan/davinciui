"use client";

import {
  RollingText,
  type RollingTextHandle,
} from "@workspace/ui/components/rolling-text";
import { useReducedMotion } from "framer-motion";
import * as React from "react";

/**
 * Looping mini RollingText for gallery cards.
 * The component itself plays once per mount, so this wrapper replays it
 * on a fixed cycle (roll duration + hold) and only while the card is
 * visible — returning to view replays immediately instead of sitting
 * static on the resting state.
 */
export function RollingTextCardPreview() {
  const reduceMotion = useReducedMotion() ?? false;
  const ref = React.useRef<RollingTextHandle>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const inViewRef = React.useRef(true);

  React.useEffect(() => {
    if (reduceMotion) return;
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? true;
        const wasHidden = !inViewRef.current && visible;
        inViewRef.current = visible;
        if (visible && wasHidden) ref.current?.play();
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduceMotion]);

  React.useEffect(() => {
    if (reduceMotion) return;
    // 8 glyphs × 0.035s stagger + 1.25s roll ≈ 1.53s per pass + hold.
    const id = window.setInterval(() => {
      if (inViewRef.current) ref.current?.play();
    }, 3200);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div ref={hostRef} aria-hidden="true" className="w-full px-4">
      <RollingText
        ref={ref}
        text="DAVINCIUI"
        pattern="alternating"
        duplicateCount={7}
        rollDuration={1.25}
        staggerDelay={0.035}
        blurIntensity={2}
        fontFamily="inherit"
        fontSize="clamp(1.35rem, 2.7vw, 2.1rem)"
        fontWeight={800}
        letterSpacing="-0.055em"
        textColor="var(--foreground)"
        backgroundColor="transparent"
        className="px-4"
      />
    </div>
  );
}
