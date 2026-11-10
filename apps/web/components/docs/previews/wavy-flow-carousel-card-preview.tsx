"use client";

import { WavyFlowCarousel } from "@workspace/ui/components/wavy-flow-carousel";

export function WavyFlowCarouselCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <WavyFlowCarousel
        dragEnabled={false}
        wheelEnabled={false}
        style={{ pointerEvents: "none" }}
        ariaLabel="Wavy flow carousel preview"
      />
    </div>
  );
}
