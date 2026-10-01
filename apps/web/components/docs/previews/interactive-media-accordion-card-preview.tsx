"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { InteractiveMediaAccordion } from "@workspace/ui/components/interactive-media-accordion";

const ITEMS = [
  {
    id: "mist",
    media:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
    title: "Mountains of Mist",
  },
  {
    id: "dunes",
    media:
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=600&auto=format&fit=crop",
    title: "Golden Dunes",
  },
  {
    id: "tide",
    media:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
    title: "Emerald Tide",
  },
  {
    id: "aurora",
    media:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=600&auto=format&fit=crop",
    title: "Northern Aurora",
  },
];

/**
 * Display-only catalog preview. A timer gives each card time to settle,
 * and pauses when the preview is offscreen or the document is hidden.
 */
export function InteractiveMediaAccordionCardPreview() {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [active, setActive] = React.useState(0);
  const activeRef = React.useRef(0);

  React.useEffect(() => {
    if (reduceMotion) return;
    const host = hostRef.current;
    if (!host) return;

    let timer = 0;
    let visible = false;
    let direction = 1;
    const DWELL_MS = 2300;

    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };
    const start = () => {
      stop();
      if (!visible || document.hidden) return;
      timer = window.setInterval(() => {
        const current = activeRef.current;
        let next = current + direction;
        if (next >= ITEMS.length) {
          direction = -1;
          next = ITEMS.length - 2;
        } else if (next < 0) {
          direction = 1;
          next = 1;
        }
        activeRef.current = next;
        setActive(next);
      }, DWELL_MS);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        start();
      },
      { threshold: 0.05 },
    );
    observer.observe(host);
    document.addEventListener("visibilitychange", start);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={hostRef}
      inert
      className="pointer-events-none absolute inset-0 overflow-hidden bg-white dark:bg-black"
    >
      <InteractiveMediaAccordion
        items={ITEMS}
        trigger="hover"
        activeIndex={active}
        height={184}
        gap={6}
        collapsedWidth={44}
        tabletCollapsedWidth={36}
        mobileCollapsedWidth={30}
        radius={14}
        outerPadding={8}
        titleSize={22}
        contentPadding={[16, 50]}
        duration={720}
        easing="cubic-bezier(0.22, 1, 0.36, 1)"
        reducedMotion={reduceMotion}
      />
    </div>
  );
}
