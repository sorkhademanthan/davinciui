"use client";

import {
  VerticalImageMarquee,
  type VerticalImageMarqueeItem,
} from "@workspace/ui/components/vertical-image-marquee";

export const verticalImageMarqueeItems: readonly VerticalImageMarqueeItem[] = [
  {
    src: "/images/spiral-3d-slider/blue-double.webp",
    alt: "A model in a pale blue double exposure",
  },
  {
    src: "/images/spiral-3d-slider/red-echo.webp",
    alt: "A portrait cast in red light",
  },
  {
    src: "/images/spiral-3d-slider/silver-motion.webp",
    alt: "A silver editorial portrait in motion",
  },
];

export function VerticalImageMarqueePreview() {
  return (
    <VerticalImageMarquee
      items={verticalImageMarqueeItems}
      duration={15.2}
      gap={72}
      imageWidth="min(88%, 31rem)"
      className="min-h-[560px]"
    />
  );
}
