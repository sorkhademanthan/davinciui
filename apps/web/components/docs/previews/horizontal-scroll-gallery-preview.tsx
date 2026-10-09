"use client";

import { HorizontalScrollGallery } from "@workspace/ui/components/horizontal-scroll-gallery";

/**
 * Direct-render docs embed (no iframe). The component is scroll-driven by
 * design, and an iframe isolates it from page scroll — which left the docs
 * preview dead. Rendered inline, the outer page scroll scrubs the track
 * natively. Travel is tamed for docs (4 cards, 0.7 distance, 62vh stage)
 * so the pinned section stays a reasonable length.
 */
export function HorizontalScrollGalleryPreview() {
  return (
    <HorizontalScrollGallery
      items={[
        {
          id: "green-fern",
          src: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80",
          alt: "Green Fern",
          label: "Green Fern",
          widthRatio: 0.5,
        },
        {
          id: "yellow-flower",
          src: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=80",
          alt: "Yellow Flower",
          label: "Yellow Flower",
          widthRatio: 0.55,
        },
        {
          id: "orange-bloom",
          src: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1600&q=80",
          alt: "Orange Flower",
          label: "Orange Flower",
          widthRatio: 0.48,
        },
        {
          id: "purple-field",
          src: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1600&q=80",
          alt: "Purple Flower",
          label: "Purple Flower",
          widthRatio: 0.52,
        },
      ]}
      viewportHeight="62vh"
      scrollDistance={0.7}
    />
  );
}
