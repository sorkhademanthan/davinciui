"use client";

import { useEffect } from "react";
import { CMSScrollGallery } from "@workspace/ui/components/cms-scroll-gallery";

/**
 * Fullscreen demo — also embedded in the docs right-side preview.
 * Autoplays with a slow eased ping-pong page scroll so backdrops and
 * titles crossfade with no manual input. Any real wheel / touch / press
 * takes over for a beat. Respects prefers-reduced-motion.
 */
export default function CMSScrollGalleryDemoPage() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    // Grace period on load before the first sweep begins.
    let lastRealInput = performance.now();
    const start = performance.now();
    const durationMs = 16000;
    const resumeDelayMs = 4000;

    const onRealInput = () => {
      lastRealInput = performance.now();
    };
    window.addEventListener("wheel", onRealInput, { passive: true });
    window.addEventListener("touchstart", onRealInput, { passive: true });
    window.addEventListener("pointerdown", onRealInput, { passive: true });

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      if (now - lastRealInput < resumeDelayMs) return;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 2) return;
      // Triangle wave: top → bottom → top, eased so ends linger.
      const cycle = ((now - start) / durationMs) % 2;
      const p = cycle < 1 ? cycle : 2 - cycle;
      const eased = p * p * (3 - 2 * p);
      window.scrollTo(0, eased * max);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onRealInput);
      window.removeEventListener("touchstart", onRealInput);
      window.removeEventListener("pointerdown", onRealInput);
    };
  }, []);

  return <CMSScrollGallery />;
}
