"use client";

import * as React from "react";
import { VerticalImageMarquee } from "@workspace/ui/components/vertical-image-marquee";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";
import { verticalImageMarqueeItems } from "@/components/docs/previews/vertical-image-marquee-preview";

type StageProps = Record<string, unknown>;

// ─── Vertical Image Marquee ─────────────────────────────────────────────────

export const {
  Preview: VerticalImageMarqueePlayground,
  PersonalizePanel: VerticalImageMarqueePersonalizePanel,
} = createComponentPlayground({
  slug: "vertical-image-marquee",
  component: VerticalImageMarquee as unknown as React.ComponentType<StageProps>,
  componentName: "VerticalImageMarquee",
  defaults: {
    duration: 15.2,
    gap: 72,
    imageWidth: "min(88%, 31rem)",
    aspectRatio: "0.61",
    pauseOnHover: false,
  },
  fields: [
    {
      key: "duration",
      label: "Loop Duration",
      type: "slider",
      min: 4,
      max: 60,
      step: 0.2,
      unit: "s",
      section: "Motion",
    },
    {
      key: "gap",
      label: "Gap",
      type: "slider",
      min: 0,
      max: 160,
      step: 2,
      unit: "px",
      section: "Layout",
    },
    {
      key: "imageWidth",
      label: "Image Width",
      type: "text",
      section: "Layout",
    },
    {
      key: "aspectRatio",
      label: "Aspect Ratio",
      type: "text",
      section: "Layout",
    },
    {
      key: "pauseOnHover",
      label: "Pause On Hover",
      type: "switch",
      section: "Motion",
    },
  ],
  fixedProps: { items: verticalImageMarqueeItems },
  elementClassName: "min-h-[560px]",
  stageClassName: "min-h-[560px]",
  intro: "Control the portrait loop's speed, spacing, and scale.",
});
