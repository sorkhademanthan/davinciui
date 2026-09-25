"use client";

import { AnimatedPillButton } from "@workspace/ui/components/animated-pill-button";

/** Right-side / fullscreen preview — centered, theme-aware, no demo chrome. */
export function AnimatedPillButtonPreview() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      <AnimatedPillButton>Reserve Now</AnimatedPillButton>
    </div>
  );
}
