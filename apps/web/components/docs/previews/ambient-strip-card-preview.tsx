"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";

import { AmbientStrip } from "@workspace/ui/components/ambient-strip";

import { ambientStripDemoItems } from "./ambient-strip-items";

const MINI_ITEMS = ambientStripDemoItems
  .filter((item) => item.type !== "video")
  .slice(0, 7);

const ACTIVE_ORDER = [2, 3, 4, 5, 6, 5, 4, 3];

export function AmbientStripCardPreview() {
  const reduceMotion = useReducedMotion() ?? false;
  const { resolvedTheme } = useTheme();
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
    <AmbientStrip
      items={MINI_ITEMS}
      activeIndex={activeIndex}
      cardWidth={92}
      gap={8}
      blur={44}
      restColor={resolvedTheme === "dark" ? "#101012" : "#c8c8c8"}
      className="pointer-events-none absolute inset-0 h-full min-h-0"
    />
  );
}
