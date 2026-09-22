"use client";

import { PixelWipeCarousel } from "@workspace/ui/components/pixel-wipe-carousel";
import { pixelWipeCardSlides } from "@/components/docs/previews/pixel-wipe-carousel-slides";

export function PixelWipeCarouselCardPreview() {
  return (
    <div className="h-full w-full bg-[#e9ebef] p-1.5 transition-colors duration-300 dark:bg-[#090a0e]">
      <PixelWipeCarousel
        slides={pixelWipeCardSlides}
        interval={1500}
        transitionDuration={660}
        pixelSize={18}
        label={null}
        caption={null}
        className="h-full w-full ring-1 ring-black/8 dark:ring-white/12"
        ariaLabel="Pixel wipe carousel preview"
      />
    </div>
  );
}
