"use client";

import { ArcCarousel } from "@workspace/ui/components/arc-carousel";
import { arcCarouselDemoItems } from "./arc-carousel-items";

export function ArcCarouselPreview() {
  return (
    <ArcCarousel
      items={arcCarouselDemoItems}
      stepAngle={20}
      autoPlay
      className="h-full min-h-[420px]"
    >
      {null}
    </ArcCarousel>
  );
}
