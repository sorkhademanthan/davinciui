"use client";

import { useEffect } from "react";
import { CurvedInlineType } from "@workspace/ui/components/curved-inline-type";
import {
  demoBoolean,
  demoEnum,
  demoNumber,
  demoString,
  useDemoSearchParams,
} from "@/lib/demo-search-params";

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
  const params = useDemoSearchParams();

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
      const lenis = (window as Window & { __lenis?: { scrollTo: (target: number | string | HTMLElement, options?: { offset?: number; immediate?: boolean; force?: boolean }) => void; stop: () => void; start: () => void } }).__lenis
      if (lenis) lenis.scrollTo(eased * max, { immediate: true, force: true })
      else window.scrollTo(0, eased * max);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onRealInput);
      window.removeEventListener("touchstart", onRealInput);
      window.removeEventListener("pointerdown", onRealInput);
    };
  }, []);

  if (!params) return null;

  return (
    <>
      <style>{fontFaces}</style>
      <CurvedInlineType
        sweepDeg={demoNumber(params, "sweepDeg", 260)}
        ringHeight={demoNumber(params, "ringHeight", 0.8)}
        ringDepth={demoNumber(params, "ringDepth", 1.25)}
        perspective={demoNumber(params, "perspective", 1200)}
        textRotation={demoNumber(params, "textRotation", 1.15)}
        fadeExponent={demoNumber(params, "fadeExponent", 1.5)}
        minOpacity={demoNumber(params, "minOpacity", 0.06)}
        blurAmount={demoNumber(params, "blurAmount", 3)}
        mediaHeight={demoNumber(params, "mediaHeight", 0.9)}
        mediaWidth={demoNumber(params, "mediaWidth", 1.035)}
        mediaRadius={demoNumber(params, "mediaRadius", 10)}
        mediaFit={demoEnum(params, "mediaFit", ["cover", "contain"], "cover")}
        gap={demoNumber(params, "gap", 0.05)}
        scrollLength={demoString(params, "scrollLength", "400vh")}
        direction={demoEnum(params, "direction", ["forward", "reverse"], "forward")}
        mapping={demoEnum(params, "mapping", ["live", "spec"], "live")}
        sweepFrom={demoNumber(params, "sweepFrom", -140)}
        sweepTo={demoNumber(params, "sweepTo", 140)}
        showCaption={demoBoolean(params, "showCaption", false)}
      />
    </>
  );
}
