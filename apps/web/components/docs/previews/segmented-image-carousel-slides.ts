import type { SegmentedImageSlide } from "@workspace/ui/components/segmented-image-carousel";

export const segmentedImageSlides = [
  {
    src: "/images/segmented-image-carousel/spiral-staircase.jpg",
    alt: "Sculptural concrete spiral staircase in directional light",
    positionX: 0.5,
    positionY: 0.52,
  },
  {
    src: "/images/segmented-image-carousel/coastal-tree.jpg",
    alt: "Wind-bent tree on a misty coastal dune",
    positionX: 0.5,
    positionY: 0.48,
  },
  {
    src: "/images/segmented-image-carousel/chrome-chair.jpg",
    alt: "Polished chrome chair casting a geometric shadow",
    positionX: 0.5,
    positionY: 0.51,
  },
  {
    src: "/images/segmented-image-carousel/concrete-oculus.jpg",
    alt: "Concrete atrium spiraling around a circular skylight",
    positionX: 0.5,
    positionY: 0.48,
  },
] satisfies readonly SegmentedImageSlide[];
