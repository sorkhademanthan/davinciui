"use client";

import { RadialFanDeck } from "@workspace/ui/components/radial-fan-deck";
import { useCallback, useEffect, useRef, useState } from "react";

export function RadialFanDeckPreview() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const updateProgress = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const range = container.scrollHeight - container.clientHeight;
    setProgress(range > 0 ? container.scrollTop / range : 0);
  }, []);

  useEffect(() => {
    updateProgress();
  }, [updateProgress]);

  return (
    <div
      ref={scrollRef}
      onScroll={updateProgress}
      className="h-full min-h-[660px] overflow-y-auto overscroll-contain"
      aria-label="Scroll to open the radial fan deck"
    >
      <div className="relative min-h-[1120px]">
        <RadialFanDeck
          cardWidth={360}
          scrollProgress={progress}
          className="sticky top-0 h-[660px] min-h-0"
          ariaLabel="Radial fan deck demonstration"
        />
      </div>
    </div>
  );
}
