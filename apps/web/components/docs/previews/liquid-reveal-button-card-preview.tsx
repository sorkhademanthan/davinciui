"use client";

import { LiquidRevealButton } from "@workspace/ui/components/liquid-reveal-button";

/**
 * Gallery card miniature: same component, card mode, no demo cursor
 * (fixed-position cursor must not leak into neighbouring cards).
 * No demo background — inherits the theme-aware card surface.
 */
export function LiquidRevealButtonCardPreview() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ containerType: "inline-size" }}
    >
      <LiquidRevealButton mode="card">View all projects</LiquidRevealButton>
    </div>
  );
}
