"use client";

import { LiquidRevealButton } from "@workspace/ui/components/liquid-reveal-button";

/**
 * Right-side / fullscreen preview. No demo background — the preview shell
 * supplies the theme-aware surface, so light and dark mode just work.
 */
export function LiquidRevealButtonPreview() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ containerType: "inline-size" }}
    >
      <LiquidRevealButton mode="preview" showDemoCursor>
        View all projects
      </LiquidRevealButton>
    </div>
  );
}
