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

// ─── Scroll Media Expand ────────────────────────────────────────────────────

export const {
  Preview: ScrollMediaExpandPlayground,
  PersonalizePanel: ScrollMediaExpandPersonalizePanel,
} = createComponentPlayground({
  slug: "scroll-media-expand",
  component: Noop,
  componentName: "ScrollMediaExpand",
  defaults: {
    leftLabel: "©2026",
    rightLabel: "Showreel",
    overlayText: "Play showreel",
    objectPosition: "50% 35%",
    objectFit: "cover",
    initialWidth: 280,
    initialHeight: 72,
    sectionHeight: "300vh",
    viewportHeight: "100svh",
    startRadius: 999,
    endRadius: 0,
    showOverlay: true,
    showScrollHint: false,
    smoothing: 0,
    enabled: true,
  },
  fields: [
    { key: "leftLabel", label: "Left Label", type: "text", section: "Content" },
    {
      key: "rightLabel",
      label: "Right Label",
      type: "text",
      section: "Content",
    },
    {
      key: "overlayText",
      label: "Overlay Text",
      type: "text",
      section: "Content",
    },
    {
      key: "showOverlay",
      label: "Show Overlay",
      type: "switch",
      section: "Content",
    },
    {
      key: "showScrollHint",
      label: "Scroll Hint",
      type: "switch",
      section: "Content",
    },
    {
      key: "sectionHeight",
      label: "Section Height",
      type: "text",
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
      key: "initialWidth",
      label: "Rest Width",
      type: "slider",
      min: 120,
      max: 520,
      step: 4,
      unit: "px",
      section: "Layout",
    },
    {
      key: "initialHeight",
      label: "Rest Height",
      type: "slider",
      min: 40,
      max: 240,
      step: 2,
      unit: "px",
      section: "Layout",
    },
    {
      key: "startRadius",
      label: "Start Radius",
      type: "slider",
      min: 0,
      max: 999,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "endRadius",
      label: "End Radius",
      type: "slider",
      min: 0,
      max: 120,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "objectFit",
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
      key: "objectPosition",
      label: "Focal Point",
      type: "text",
      section: "Media",
    },
    {
      key: "viewportHeight",
      label: "Viewport Height",
      type: "text",
      section: "Layout",
    },
    { key: "enabled", label: "Enabled", type: "switch", section: "Motion" },
  ],
  stageClassName: "min-h-[620px]",
  iframeSrc: (config) => iframeSource("scroll-media-expand", config as Config),
  iframeTitle: "Scroll Media Expand demo",
  intro: "Tune the rest pill, labels, and expansion scrub.",
});
