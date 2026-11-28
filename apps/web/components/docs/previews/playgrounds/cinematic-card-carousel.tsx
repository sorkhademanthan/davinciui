"use client";

import * as React from "react";
import { CinematicCardCarousel } from "@workspace/ui/components/cinematic-card-carousel";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";
import { cinematicDemoCards } from "@/components/docs/previews/cinematic-card-carousel-items";

type StageProps = Record<string, unknown>;

// ─── Cinematic Card Carousel ────────────────────────────────────────────────

export const {
  Preview: CinematicCardCarouselPlayground,
  PersonalizePanel: CinematicCardCarouselPersonalizePanel,
} = createComponentPlayground({
  slug: "cinematic-card-carousel",
  component: CinematicCardCarousel as unknown as React.ComponentType<StageProps>,
  componentName: "CinematicCardCarousel",
  defaults: {
    initialIndex: 2,
    loop: true,
    autoPlayInterval: 0,
    wheelNavigation: "horizontal",
    showArrows: true,
  },
  fields: [
    {
      key: "initialIndex",
      label: "Initial Index",
      type: "slider",
      min: 0,
      max: Math.max(0, cinematicDemoCards.length - 1),
      step: 1,
      section: "Navigation",
    },
    {
      key: "autoPlayInterval",
      label: "Auto Play",
      type: "slider",
      min: 0,
      max: 8000,
      step: 100,
      unit: "ms",
      section: "Navigation",
    },
    {
      key: "wheelNavigation",
      label: "Wheel Navigation",
      type: "select",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Both Axes", value: "both" },
      ],
      section: "Navigation",
    },
    { key: "loop", label: "Loop", type: "switch", section: "Navigation" },
    {
      key: "showArrows",
      label: "Show Arrows",
      type: "switch",
      section: "Chrome",
    },
  ],
  fixedProps: { items: cinematicDemoCards },
  elementClassName: "h-full min-h-0",
  intro: "Tune the cinematic deck's navigation and autoplay.",
});
