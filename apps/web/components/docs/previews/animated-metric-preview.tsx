"use client";

import { AnimatedMetric } from "@workspace/ui/components/animated-metric";

/** Right-side / fullscreen preview — one centered metric, looping. */
export function AnimatedMetricPreview() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      <AnimatedMetric value={50} suffix="k+" loop />
    </div>
  );
}
