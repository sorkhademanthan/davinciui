"use client";

import { ArcCarousel } from "@workspace/ui/components/arc-carousel";
import { arcCarouselDemoItems } from "./arc-carousel-items";

export function ArcCarouselCardPreview() {
  return (
    <ArcCarousel
      items={arcCarouselDemoItems}
      tileSize={64}
      radius={210}
      stepAngle={20}
      autoPlay
      className="h-full min-h-0"
    >
      {null}
    </ArcCarousel>
  );
}
