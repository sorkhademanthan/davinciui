"use client";

import * as React from "react";
import { RadialFanDeck } from "@workspace/ui/components/radial-fan-deck";

/**
 * Gallery card for the radial fan deck. Drives `scrollProgress` with a slow
 * ping-pong loop (stacked → fully fanned → stacked) so the fan animation
 * plays automatically without any scrolling or interaction. Honors
 * prefers-reduced-motion by leaving the deck in its static stacked state.
 */
export function RadialFanDeckCardPreview() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const start = performance.now();
    const CYCLE_MS = 7000;

    const easeInOutQuad = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const tick = (now: number) => {
      const t = ((now - start) % CYCLE_MS) / CYCLE_MS;
      const raw = t < 0.5 ? t * 2 : (1 - t) * 2;
      setProgress(easeInOutQuad(raw));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <RadialFanDeck
      cardWidth={142}
      scrollProgress={progress}
      className="h-full min-h-0"
      ariaLabel="Radial fan deck card preview"
    />
  );
}
