"use client";

import { VerticalImageMarquee } from "@workspace/ui/components/vertical-image-marquee";
import { verticalImageMarqueeItems } from "./vertical-image-marquee-preview";

export function VerticalImageMarqueeCardPreview() {
  return (
    <VerticalImageMarquee
      items={verticalImageMarqueeItems}
      duration={15.2}
      gap={22}
      imageWidth="min(78%, 12rem)"
      className="absolute inset-0 min-h-0"
    />
  );
}
