"use client";

import { FocusCarousel } from "@workspace/ui/components/focus-carousel";
import { focusCarouselDemoItems } from "./focus-carousel-items";

export function FocusCarouselPreview() {
  return (
    <FocusCarousel
      items={focusCarouselDemoItems}
      defaultIndex={0}
      activeWidth={320}
      sideWidth={166}
      gap={18}
      showToggle={false}
      showCaption={false}
      className="w-full"
    />
  );
}
