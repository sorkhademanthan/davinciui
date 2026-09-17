"use client";

import * as React from "react";
import { InteractiveMediaAccordion } from "@workspace/ui/components/interactive-media-accordion";

const ITEMS = [
  {
    id: "mist",
    media:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop",
    alt: "Mountains of Mist — fog rolling over layered green hills",
    title: "Mountains of Mist",
    description: "Wander into nature's hands.",
  },
  {
    id: "dunes",
    media:
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1600&auto=format&fit=crop",
    alt: "Golden Dunes — wind-shaped sand ripples at dusk",
    title: "Golden Dunes",
    description: "Where the desert breathes.",
  },
  {
    id: "tide",
    media:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
    alt: "Emerald Tide — turquoise waves folding onto the shore",
    title: "Emerald Tide",
    description: "Chase the endless horizon.",
  },
];

const HEIGHT = 340;

/**
 * Production demo iframed as the docs right-side preview.
 * Reduced-size stage (max-w + shorter height) pinned at a dynamic
 * offset so it stays vertically centered in the preview pane —
 * and re-centers when the preview goes fullscreen.
 */
export default function InteractiveMediaAccordionDemoPage() {
  const [stickyTop, setStickyTop] = React.useState(60);

  React.useEffect(() => {
    const update = () =>
      setStickyTop(
        Math.max(24, Math.round((window.innerHeight - HEIGHT) / 2)),
      );
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-10">
      <InteractiveMediaAccordion
        items={ITEMS}
        trigger="scroll"
        height={HEIGHT}
        scrollStep={700}
        stickyTop={stickyTop}
        className="mx-auto max-w-[620px]"
      />
    </main>
  );
}
