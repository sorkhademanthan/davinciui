"use client";

import { AnimatedMetric } from "@workspace/ui/components/animated-metric";

/** Gallery card miniature — same metric as the detail preview, looping. */
export function AnimatedMetricCardPreview() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden px-4"
      style={{ containerType: "inline-size" }}
    >
      <AnimatedMetric value={50} suffix="k+" loop />
    </div>
  );
}
