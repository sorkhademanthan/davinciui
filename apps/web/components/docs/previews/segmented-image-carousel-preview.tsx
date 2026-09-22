"use client";

import { SegmentedImageCarousel } from "@workspace/ui/components/segmented-image-carousel";
import { segmentedImageSlides } from "@/components/docs/previews/segmented-image-carousel-slides";

export function SegmentedImageCarouselPreview() {
  return (
    <div className="flex h-full min-h-[660px] w-full items-center justify-center bg-[#e7e7e5] p-5 transition-colors duration-300 dark:bg-[#10100f] sm:p-9">
      <div className="relative aspect-[397/492] w-full max-w-[min(100%,62.94vh)] overflow-hidden border border-black/12 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)] transition-colors duration-300 dark:border-white/14 dark:bg-[#1a1a18] dark:shadow-[0_28px_90px_rgba(0,0,0,0.58)]">
        <SegmentedImageCarousel
          slides={segmentedImageSlides}
          rows={9}
          columns={2}
          interval={1500}
          transitionDuration={680}
          pauseOnHover={false}
          className="h-full w-full"
          ariaLabel="Segmented editorial image carousel preview"
        />
      </div>
    </div>
  );
}
