"use client";

import { useEffect } from "react";
import { CurvedInlineType } from "@workspace/ui/components/curved-inline-type";

const fontFaces = `
  @font-face {
    font-family: "Funnel Display";
    src: url("/media/curved-inline-type/fonts/FunnelDisplay-latin.woff2") format("woff2");
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: "Funnel Display";
    src: url("/media/curved-inline-type/fonts/FunnelDisplay-latin-ext.woff2") format("woff2");
    font-weight: 100 900;
    font-style: normal;
    unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
    font-display: swap;
  }
  @font-face {
    font-family: "Inter";
    src: url("/media/curved-inline-type/fonts/Inter-latin.woff2") format("woff2");
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }
  html, body {
    margin: 0;
    background: var(--background, #0b0b0e);
    color: var(--foreground, #f4f2ed);
  }
`;

export default function CurvedInlineTypeDemoPage() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let lastRealInput = performance.now();
    const start = performance.now();
    const durationMs = 18000;
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
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 2) return;
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

  return (
    <>
      <style>{fontFaces}</style>
      <CurvedInlineType showCaption={false} />
    </>
  );
}
