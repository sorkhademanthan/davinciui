"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

import { AmbientStrip } from "@workspace/ui/components/ambient-strip";

import { ambientStripDemoItems } from "./ambient-strip-items";

const MINI_ITEMS = ambientStripDemoItems
  .filter((item) => item.type !== "video")
  .slice(0, 7);

const ACTIVE_ORDER = [2, 3, 4, 5, 6, 5, 4, 3];

export function AmbientStripCardPreview() {
  const reduceMotion = useReducedMotion() ?? false;
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setStep((current) => (current + 1) % ACTIVE_ORDER.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  const activeIndex = reduceMotion ? 3 : (ACTIVE_ORDER[step] ?? 3);

  return (
    <div className="absolute inset-0 bg-[#f0efec] p-2.5 transition-colors duration-300 dark:bg-[#08080a]">
      <div className="relative h-full w-full overflow-hidden rounded-[8px] ring-1 ring-black/5 dark:ring-white/10">
        <AmbientStrip
          items={MINI_ITEMS}
          activeIndex={activeIndex}
          cardWidth={92}
          gap={8}
          blur={44}
          className="pointer-events-none absolute inset-0 h-full min-h-0"
        />
      </div>
    </div>
  );
}
