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

// ─── Stacked Scroll Gallery ─────────────────────────────────────────────────

export const {
  Preview: StackedScrollGalleryPlayground,
  PersonalizePanel: StackedScrollGalleryPersonalizePanel,
} = createComponentPlayground({
  slug: "stacked-scroll-gallery",
  component: Noop,
  componentName: "StackedScrollGallery",
  defaults: {
    viewportHeight: "100vh",
    scrollDistancePerItem: 100,
    previewHeight: 44,
    radius: 20,
    fit: "cover",
    position: "50% 50%",
    smoothing: 0.14,
    easing: "linear",
    dimming: true,
    dimStrength: 0.3,
    enabled: true,
    pauseOffscreenVideos: true,
    gutter: 22,
  },
  fields: [
    {
      key: "scrollDistancePerItem",
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
      key: "viewportHeight",
      label: "Viewport Height",
      type: "text",
      section: "Layout",
    },
    {
      key: "previewHeight",
      label: "Preview Height",
      type: "slider",
      min: 0,
      max: 160,
      step: 2,
      unit: "px",
      section: "Layout",
    },
    {
      key: "radius",
      label: "Corner Radius",
      type: "slider",
      min: 0,
      max: 48,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "gutter",
      label: "Gutter",
      type: "slider",
      min: 0,
      max: 80,
      step: 2,
      unit: "px",
      section: "Layout",
    },
    {
      key: "fit",
      label: "Media Fit",
      type: "select",
      options: [
        { label: "Cover", value: "cover" },
        { label: "Contain", value: "contain" },
        { label: "Fill", value: "fill" },
      ],
      section: "Media",
    },
    {
      key: "position",
      label: "Focal Point",
      type: "text",
      section: "Media",
    },
    {
      key: "easing",
      label: "Easing",
      type: "select",
      options: [
        { label: "Linear", value: "linear" },
        { label: "Ease In Out", value: "easeInOut" },
      ],
      section: "Motion",
    },
    {
      key: "dimming",
      label: "Dimming",
      type: "switch",
      section: "Motion",
    },
    {
      key: "dimStrength",
      label: "Dim Strength",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "enabled",
      label: "Enabled",
      type: "switch",
      section: "Motion",
    },
    {
      key: "pauseOffscreenVideos",
      label: "Pause Offscreen Videos",
      type: "switch",
      section: "Performance",
    },
  ],
  stageClassName: "min-h-[620px]",
  iframeSrc: (config) => iframeSource("stacked-scroll-gallery", config as Config),
  iframeTitle: "Stacked Scroll Gallery demo",
  intro: "Adjust the stack depth, preview strip, and dim behavior.",
});
