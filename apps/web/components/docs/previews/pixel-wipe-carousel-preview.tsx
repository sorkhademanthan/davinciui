"use client";

import { PixelWipeCarousel } from "@workspace/ui/components/pixel-wipe-carousel";
import { pixelWipeSlides } from "@/components/docs/previews/pixel-wipe-carousel-slides";

export function PixelWipeCarouselPreview() {
  return (
    <div className="flex h-full min-h-[660px] w-full items-center justify-center bg-[#eceef1] p-5 transition-colors duration-300 dark:bg-[#08090d] sm:p-9">
      <div className="relative aspect-[4/5] h-[min(78vh,760px)] max-h-full max-w-full overflow-hidden border border-black/10 bg-white p-1.5 shadow-[0_24px_70px_rgba(24,28,38,0.18)] transition-colors duration-300 dark:border-white/12 dark:bg-[#15171d] dark:shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
        <PixelWipeCarousel
          slides={pixelWipeSlides}
          label="DAVINCI"
          caption={
            <>
              <span className="font-normal">image&nbsp;</span>
              <span className="font-bold">STUDIES</span>
            </>
          }
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
