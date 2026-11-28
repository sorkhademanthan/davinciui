"use client";

import * as React from "react";
import { ArcCarousel } from "@workspace/ui/components/arc-carousel";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";
import { arcCarouselDemoItems } from "@/components/docs/previews/arc-carousel-items";

type StageProps = Record<string, unknown>;

// ─── Arc Carousel ───────────────────────────────────────────────────────────

export const {
  Preview: ArcCarouselPlayground,
  PersonalizePanel: ArcCarouselPersonalizePanel,
} = createComponentPlayground({
  slug: "arc-carousel",
  component: ArcCarousel as unknown as React.ComponentType<StageProps>,
  componentName: "ArcCarousel",
  defaults: {
    stepAngle: 20,
    friction: 0.94,
    snap: true,
    autoPlay: true,
  },
  fields: [
    {
      key: "stepAngle",
      label: "Step Angle",
      type: "slider",
      min: 4,
      max: 60,
      step: 1,
      unit: "°",
      section: "Arc",
    },
    {
      key: "friction",
      label: "Friction",
      type: "slider",
      min: 0.7,
      max: 0.99,
      step: 0.01,
      section: "Motion",
    },
    { key: "snap", label: "Snap To Tile", type: "switch", section: "Motion" },
    { key: "autoPlay", label: "Auto Play", type: "switch", section: "Motion" },
  ],
  fixedProps: { items: arcCarouselDemoItems, children: null },
  elementClassName: "h-full min-h-[420px]",
  stageClassName: "min-h-[420px]",
  intro: "Tune the arc spacing, friction, and auto-advance.",
});
