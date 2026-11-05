"use client";

import { ArcwaveCarousel } from "@workspace/ui/components/arcwave-carousel";
import { arcwaveCarouselDemoItems } from "./arcwave-carousel-items";

export function ArcwaveCarouselCardPreview() {
  return (
    <ArcwaveCarousel
      slides={arcwaveCarouselDemoItems}
      cardWidth={64}
      cardHeight={92}
      gap={2}
      cornerRadius={6}
      captionMode="hover"
      autoplay
      autoplaySpeed={0.7}
      sideOpacity={0.5}
      edgeFade={16}
      className="h-full min-h-0"
      ariaLabel="Arcwave carousel card preview"
    />
  );
}
