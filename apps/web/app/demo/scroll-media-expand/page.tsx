"use client";

import { ScrollMediaExpand } from "@workspace/ui/components/scroll-media-expand";

export default function ScrollMediaExpandDemoPage() {
  return (
    <ScrollMediaExpand
      src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80"
      leftLabel="©2026"
      rightLabel="Showreel"
      overlayText="Play showreel"
    />
  );
}
