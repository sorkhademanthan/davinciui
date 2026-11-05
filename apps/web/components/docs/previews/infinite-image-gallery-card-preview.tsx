"use client";

import { InfiniteImageGallery } from "@workspace/ui/components/infinite-image-gallery";
import { infiniteImageGalleryItems } from "@/components/docs/previews/infinite-image-gallery-items";

const CARD_IMAGES = infiniteImageGalleryItems.slice(0, 12);

export function InfiniteImageGalleryCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f3f1ec] dark:bg-[#11100e]">
      <InfiniteImageGallery
        images={CARD_IMAGES}
        rows={2}
        speed={10}
        tilt={-6}
        showControls={false}
        borderRadius={14}
        className="h-full min-h-0"
        aria-label="Infinite image gallery preview"
      />
    </div>
  );
}
