"use client";

import { CircularGallery } from "@workspace/ui/components/circular-gallery";

const CARD_ITEMS = [
  {
    src: "/images/spiral-3d-slider/orange-haze.jpg",
    alt: "Soft orange floral haze in macro focus",
  },
  {
    src: "/images/spiral-3d-slider/red-blue-figure.jpg",
    alt: "Figure lit in red against a deep blue sky",
  },
  {
    src: "/images/spiral-3d-slider/silver-motion.jpg",
    alt: "Extreme close-up of a face in silver light",
  },
  {
    src: "/images/spiral-3d-slider/white-motion.jpg",
    alt: "Figure in a white top caught in studio motion",
  },
  {
    src: "/images/spiral-3d-slider/blue-motion.jpg",
    alt: "Glossy blue abstract form on a pale background",
  },
  {
    src: "/images/spiral-3d-slider/prism-portrait.jpg",
    alt: "Portrait washed in a blue-to-pink prism gradient",
  },
];

export function CircularGalleryCardPreview() {
  return (
    <CircularGallery
      items={CARD_ITEMS}
      panelHeight={0.95}
      perspective={{ fov: 20.4, distance: 4.1 }}
      spinSpeed={7}
      interactive={false}
      className="h-full min-h-0"
      ariaLabel="Circular gallery preview"
    />
  );
}
