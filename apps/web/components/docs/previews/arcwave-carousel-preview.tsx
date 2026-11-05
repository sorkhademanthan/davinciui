"use client";

import { useTheme } from "next-themes";
import { ArcwaveCarousel } from "@workspace/ui/components/arcwave-carousel";
import { arcwaveCarouselDemoItems } from "./arcwave-carousel-items";

export function ArcwaveCarouselPreview() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  return (
    <ArcwaveCarousel
      slides={arcwaveCarouselDemoItems}
      cardSizeMode="fillHeight"
      heightPercent={82}
      gap={6}
      cornerRadius={10}
      captionMode="center"
      reveal="slide"
      autoplay
      autoplaySpeed={0.8}
      background={dark ? "#000000" : "#ececec"}
      className="h-full min-h-[420px]"
      ariaLabel="Arcwave carousel preview"
    />
  );
}
