"use client";

import { GlassSceneDock } from "@workspace/ui/components/glass-scene-dock";

/**
 * Miniature for the component gallery card. Same component in card mode —
 * container queries scale the dock down while the background keeps filling
 * the card. Wheel intent over the card scrubs scenes instead of the page.
 */
export function GlassSceneDockCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-zinc-200 dark:bg-[#0b0b0d]">
      <GlassSceneDock mode="card" />
    </div>
  );
}
