"use client";

import { ScrollMediaExpand } from "@workspace/ui/components/scroll-media-expand";

export default function ScrollMediaExpandDemoPage() {
  return (
    <ScrollMediaExpand
      src="https://images.unsplash.com/photo-1517796931930-443b6f13cf65?auto=format&fit=crop&w=2400&q=85"
      leftLabel="©2026"
      rightLabel="Showreel"
      overlayText="Play showreel"
    />
  );
}
