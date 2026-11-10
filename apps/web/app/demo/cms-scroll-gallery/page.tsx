"use client";

import { useEffect } from "react";
import { CMSScrollGallery } from "@workspace/ui/components/cms-scroll-gallery";
import {
  demoBoolean,
  demoEnum,
  demoNumber,
  demoString,
  useDemoSearchParams,
} from "@/lib/demo-search-params";

/**
 * Fullscreen demo — also embedded in the docs right-side preview.
 * Autoplays with a slow eased ping-pong page scroll so backdrops and
 * titles crossfade with no manual input. Any real wheel / touch / press
 * takes over for a beat. Respects prefers-reduced-motion.
 */
export default function CMSScrollGalleryDemoPage() {
  const params = useDemoSearchParams();

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

  if (!params) return null;

  return (
    <CMSScrollGallery
      scrollLengthPerItem={demoNumber(params, "scrollLengthPerItem", 100)}
      transitionSmoothing={demoNumber(params, "transitionSmoothing", 0.55)}
      initialItem={demoNumber(params, "initialItem", 0)}
      fit={demoEnum(params, "fit", ["cover", "contain"], "cover")}
      positionX={demoNumber(params, "positionX", 50)}
      positionY={demoNumber(params, "positionY", 50)}
      fallbackColor={demoString(params, "fallbackColor", "#dddddd")}
      overlayColor={demoString(params, "overlayColor", "#000000")}
      overlayOpacity={demoNumber(params, "overlayOpacity", 0)}
      fontSize={demoNumber(params, "fontSize", 168)}
      fontWeight={demoNumber(params, "fontWeight", 800)}
      lineHeight={demoNumber(params, "lineHeight", 1)}
      titleColor={demoString(params, "titleColor", "#FFFFFF")}
      titleAlign={demoEnum(
        params,
        "titleAlign",
        ["center", "left", "right"],
        "center",
      )}
      showThumbnails={demoBoolean(params, "showThumbnails", true)}
      orientation={demoEnum(
        params,
        "orientation",
        ["vertical", "horizontal"],
        "vertical",
      )}
      thumbnailWidth={demoNumber(params, "thumbnailWidth", 56)}
      thumbnailHeight={demoNumber(params, "thumbnailHeight", 56)}
      thumbnailRadius={demoNumber(params, "thumbnailRadius", 10)}
      gap={demoNumber(params, "gap", 10)}
      dockPadding={demoNumber(params, "dockPadding", 12)}
      activeBorderColor={demoString(params, "activeBorderColor", "#ffffff")}
      activeBorderWidth={demoNumber(params, "activeBorderWidth", 2)}
      activeBorderOffset={demoNumber(params, "activeBorderOffset", 5)}
      activeBorderRadius={demoNumber(params, "activeBorderRadius", 14)}
    />
  );
}
