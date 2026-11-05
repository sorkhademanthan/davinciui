"use client";

import { useTheme } from "next-themes";
import { StreamlineCarousel } from "@workspace/ui/components/streamline-carousel";
import { streamlineCarouselDemoItems } from "./streamline-carousel-items";

export function StreamlineCarouselCardPreview() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  return (
    <StreamlineCarousel
      items={streamlineCarouselDemoItems}
      background={dark ? "#0d0d10" : "#ececec"}
      cardHeight={96}
      gap={4}
      curvature={1.8}
      colorFringe={0.5}
      autoplay
      autoSpeed={45}
      className="h-full min-h-0"
    />
  );
}
