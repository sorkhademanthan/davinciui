"use client";

import * as React from "react";
import { PixelWipeCarousel } from "@workspace/ui/components/pixel-wipe-carousel";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";
import { pixelWipeSlides } from "@/components/docs/previews/pixel-wipe-carousel-slides";

type StageProps = Record<string, unknown>;

// ─── Pixel Wipe Carousel ────────────────────────────────────────────────────

function PixelWipeStage(props: StageProps) {
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
          {...props}
        />
      </div>
    </div>
  );
}

export const {
  Preview: PixelWipeCarouselPlayground,
  PersonalizePanel: PixelWipeCarouselPersonalizePanel,
} = createComponentPlayground({
  slug: "pixel-wipe-carousel",
  component: PixelWipeStage as unknown as React.ComponentType<StageProps>,
  componentName: "PixelWipeCarousel",
  defaults: {
    interval: 1600,
    transitionDuration: 800,
    pixelSize: 34,
    autoPlay: true,
    pauseOnHover: false,
  },
  fields: [
    {
      key: "interval",
      label: "Interval",
      type: "slider",
      min: 400,
      max: 5000,
      step: 100,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "transitionDuration",
      label: "Wipe Duration",
      type: "slider",
      min: 200,
      max: 2000,
      step: 20,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "pixelSize",
      label: "Pixel Size",
      type: "slider",
      min: 6,
      max: 90,
      step: 1,
      unit: "px",
      section: "Wipe",
    },
    {
      key: "autoPlay",
      label: "Auto Play",
      type: "switch",
      section: "Timing",
    },
    {
      key: "pauseOnHover",
      label: "Pause On Hover",
      type: "switch",
      section: "Timing",
    },
  ],
  stageClassName: "min-h-[660px]",
  intro: "Control the mosaic wipe's cell size and cadence.",
});
