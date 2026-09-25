"use client";

import { AnimatedPillButton } from "@workspace/ui/components/animated-pill-button";

/** Gallery card miniature — same component, scaled by container queries. */
export function AnimatedPillButtonCardPreview() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden px-4"
      style={{ containerType: "inline-size" }}
    >
      <AnimatedPillButton>Reserve Now</AnimatedPillButton>
    </div>
  );
}
