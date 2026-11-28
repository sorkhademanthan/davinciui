"use client";

import * as React from "react";
import { FocusCarousel } from "@workspace/ui/components/focus-carousel";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";
import { focusCarouselDemoItems } from "@/components/docs/previews/focus-carousel-items";

type StageProps = Record<string, unknown>;

// ─── Focus Carousel ─────────────────────────────────────────────────────────

export const {
  Preview: FocusCarouselPlayground,
  PersonalizePanel: FocusCarouselPersonalizePanel,
} = createComponentPlayground({
  slug: "focus-carousel",
  component: FocusCarousel as unknown as React.ComponentType<StageProps>,
  componentName: "FocusCarousel",
  defaults: {
    defaultIndex: 0,
    activeWidth: 320,
    sideWidth: 166,
    aspectRatio: 0.75,
    gap: 18,
    maxBlur: 9,
    duration: 0.55,
    showToggle: false,
    showCaption: false,
    draggable: true,
  },
  fields: [
    {
      key: "activeWidth",
      label: "Active Width",
      type: "slider",
      min: 160,
      max: 640,
      step: 4,
      unit: "px",
      section: "Layout",
    },
    {
      key: "sideWidth",
      label: "Side Width",
      type: "slider",
      min: 80,
      max: 320,
      step: 2,
      unit: "px",
      section: "Layout",
    },
    {
      key: "aspectRatio",
      label: "Aspect Ratio",
      type: "slider",
      min: 0.4,
      max: 1.8,
      step: 0.01,
      section: "Layout",
    },
    {
      key: "gap",
      label: "Gap",
      type: "slider",
      min: 0,
      max: 60,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "maxBlur",
      label: "Max Blur",
      type: "slider",
      min: 0,
      max: 24,
      step: 0.5,
      unit: "px",
      section: "Finish",
    },
    {
      key: "duration",
      label: "Transition",
      type: "slider",
      min: 0.1,
      max: 1.5,
      step: 0.01,
      unit: "s",
      section: "Motion",
    },
    { key: "draggable", label: "Draggable", type: "switch", section: "Motion" },
    {
      key: "showToggle",
      label: "Media Toggle",
      type: "switch",
      section: "Chrome",
    },
    {
      key: "showCaption",
      label: "Caption",
      type: "switch",
      section: "Chrome",
    },
  ],
  fixedProps: { items: focusCarouselDemoItems, defaultIndex: 0 },
  elementClassName: "w-full",
  intro: "Adjust the focus deck's layout, blur, and transition.",
});
