"use client";

import * as React from "react";
import { HoverCards } from "@workspace/ui/components/hover-cards";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";
import { hoverCardsDemoItems } from "@/components/docs/previews/hover-cards-items";

type StageProps = Record<string, unknown>;

// ─── Hover Cards ────────────────────────────────────────────────────────────

export const {
  Preview: HoverCardsPlayground,
  PersonalizePanel: HoverCardsPersonalizePanel,
} = createComponentPlayground({
  slug: "hover-cards",
  component: HoverCards as unknown as React.ComponentType<StageProps>,
  componentName: "HoverCards",
  defaults: {
    backdropBlur: 44,
    autoPlay: false,
    autoPlayInterval: 3000,
    clearOnLeave: true,
    showText: false,
  },
  fields: [
    {
      key: "backdropBlur",
      label: "Backdrop Blur",
      type: "slider",
      min: 0,
      max: 100,
      step: 2,
      unit: "px",
      section: "Finish",
    },
    {
      key: "autoPlay",
      label: "Auto Play",
      type: "switch",
      section: "Motion",
    },
    {
      key: "autoPlayInterval",
      label: "Auto Play Interval",
      type: "slider",
      min: 800,
      max: 8000,
      step: 100,
      unit: "ms",
      section: "Motion",
    },
    {
      key: "pauseAutoPlayOnHover",
      label: "Pause On Hover",
      type: "switch",
      section: "Motion",
    },
    {
      key: "clearOnLeave",
      label: "Clear On Leave",
      type: "switch",
      section: "Motion",
    },
    { key: "showText", label: "Show Text", type: "switch", section: "Chrome" },
  ],
  fixedProps: { items: hoverCardsDemoItems, initialActiveIndex: null },
  elementClassName: "h-full min-h-[560px]",
  stageClassName: "min-h-[560px]",
  intro: "Tune the hover deck's blur, autoplay, and chrome.",
});
