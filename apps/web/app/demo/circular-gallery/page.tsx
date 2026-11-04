"use client";

import {
  CircularGallery,
  type CircularGalleryItem,
} from "@workspace/ui/components/circular-gallery";

const items: CircularGalleryItem[] = [
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
  {
    src: "/images/spiral-3d-slider/green-portrait.jpg",
    alt: "Dark green field crossed by a diagonal light beam",
  },
  {
    src: "/images/spiral-3d-slider/red-echo.jpg",
    alt: "Close-up of red knitted fabric on a warm background",
  },
];

export default function CircularGalleryDemoPage() {
  return (
    <main className="h-[100svh] w-full bg-background">
      <CircularGallery items={items} ariaLabel="CMS circular gallery" />
    </main>
  );
}
