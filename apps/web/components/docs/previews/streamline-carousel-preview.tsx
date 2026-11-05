"use client";

import { useTheme } from "next-themes";
import { StreamlineCarousel } from "@workspace/ui/components/streamline-carousel";
import { streamlineCarouselDemoItems } from "./streamline-carousel-items";

export function StreamlineCarouselPreview() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  return (
    <StreamlineCarousel
      items={streamlineCarouselDemoItems}
      background={dark ? "#0d0d10" : "#ececec"}
      autoplay
      autoSpeed={60}
      cardHeight={300}
      gap={18}
      curvature={1.6}
      colorFringe={0.7}
      className="h-full min-h-[420px]"
    />
  );
}
