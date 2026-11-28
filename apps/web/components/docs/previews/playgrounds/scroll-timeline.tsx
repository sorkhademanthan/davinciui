"use client";

import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type Config = Record<string, unknown>;

function Noop() {
  return null;
}

function iframeSource(slug: string, config: Config) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `/demo/${slug}?${query}` : `/demo/${slug}`;
}

// ─── Scroll Timeline ────────────────────────────────────────────────────────

export const {
  Preview: ScrollTimelinePlayground,
  PersonalizePanel: ScrollTimelinePersonalizePanel,
} = createComponentPlayground({
  slug: "scroll-timeline",
  component: Noop,
  componentName: "ScrollTimeline",
  defaults: {
    scrollPerItem: 100,
    rotationAmount: 82,
    yearSize: "clamp(9rem, 19vw, 20rem)",
    descriptionWidth: "min(28rem, 30vw)",
    easing: "smooth",
    viewportHeight: "100vh",
    smoothing: 0,
    disableAnimation: false,
    pauseWhenOffscreen: true,
  },
  fields: [
    {
      key: "scrollPerItem",
      label: "Scroll Per Item",
      type: "slider",
      min: 25,
      max: 300,
      step: 5,
      unit: "vh",
      section: "Scroll",
    },
    {
      key: "smoothing",
      label: "Smoothing",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Scroll",
    },
    {
      key: "rotationAmount",
      label: "Year Rotation",
      type: "slider",
      min: 0,
      max: 180,
      step: 1,
      unit: "°",
      section: "Layout",
    },
    {
      key: "yearSize",
      label: "Year Size",
      type: "text",
      section: "Typography",
    },
    {
      key: "descriptionWidth",
      label: "Description Width",
      type: "text",
      section: "Typography",
    },
    {
      key: "easing",
      label: "Easing",
      type: "select",
      options: [
        { label: "Smooth", value: "smooth" },
        { label: "Linear", value: "linear" },
      ],
      section: "Motion",
    },
    {
      key: "viewportHeight",
      label: "Viewport Height",
      type: "text",
      section: "Layout",
    },
    {
      key: "disableAnimation",
      label: "Disable Animation",
      type: "switch",
      section: "Motion",
    },
    {
      key: "pauseWhenOffscreen",
      label: "Pause Offscreen",
      type: "switch",
      section: "Performance",
    },
  ],
  stageClassName: "min-h-[620px]",
  iframeSrc: (config) => iframeSource("scroll-timeline", config as Config),
  iframeTitle: "Scroll Timeline demo",
  intro: "Tune the pinned scroll distance, year rotation, and easing.",
});
