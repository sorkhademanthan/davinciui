"use client";

import {
  SpiralMediaGallery,
  SPIRAL_MEDIA_GALLERY_DEFAULT_IMAGES,
} from "@workspace/ui/components/spiral-media-gallery";

/**
 * Live miniature for the component gallery card. A tighter, calmer helix so
 * the diagonal ribbon still reads inside the short card frame.
 */
export function SpiralMediaGalleryCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <SpiralMediaGallery
        images={SPIRAL_MEDIA_GALLERY_DEFAULT_IMAGES}
        cardCount={25}
        cardWidth={118}
        cardHeight={76}
        borderRadius={10}
        cylinderRadius={112}
        verticalSpacing={20}
        perspective={900}
        minScale={0.4}
        minOpacity={0.1}
        autoRotateSpeed={0.12}
        className="h-full min-h-0"
        ariaLabel="Spiral media gallery preview"
      />
    </div>
  );
}
