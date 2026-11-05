"use client";

import { ArcwaveCarousel } from "@workspace/ui/components/arcwave-carousel";
import { arcwaveCarouselDemoItems } from "./arcwave-carousel-items";

export function ArcwaveCarouselPreview() {
  return (
    <ArcwaveCarousel
      slides={arcwaveCarouselDemoItems}
      cardSizeMode="fillHeight"
      heightPercent={82}
      gap={6}
      cornerRadius={10}
      captionMode="center"
      reveal="slide"
      autoplay
      autoplaySpeed={0.8}
      className="h-full min-h-[420px]"
      ariaLabel="Arcwave carousel preview"
    />
  );
}
