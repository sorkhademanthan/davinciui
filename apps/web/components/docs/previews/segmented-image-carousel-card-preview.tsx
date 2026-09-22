"use client";

import { SegmentedImageCarousel } from "@workspace/ui/components/segmented-image-carousel";
import { segmentedImageSlides } from "@/components/docs/previews/segmented-image-carousel-slides";

export function SegmentedImageCarouselCardPreview() {
  return (
    <div className="h-full w-full bg-[#dededb] p-1.5 transition-colors duration-300 dark:bg-[#11110f]">
      <SegmentedImageCarousel
        slides={segmentedImageSlides}
        rows={9}
        columns={2}
        interval={1500}
        transitionDuration={680}
        pauseOnHover={false}
        className="h-full w-full ring-1 ring-black/10 dark:ring-white/12"
        ariaLabel="Segmented image carousel card preview"
      />
    </div>
  );
}
