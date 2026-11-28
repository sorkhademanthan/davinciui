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

// ─── Curved Inline Type ─────────────────────────────────────────────────────

export const {
  Preview: CurvedInlineTypePlayground,
  PersonalizePanel: CurvedInlineTypePersonalizePanel,
} = createComponentPlayground({
  slug: "curved-inline-type",
  component: Noop,
  componentName: "CurvedInlineType",
  defaults: {
    sweepDeg: 260,
    ringHeight: 0.8,
    ringDepth: 1.25,
    perspective: 1200,
    textRotation: 1.15,
    fadeExponent: 1.5,
    minOpacity: 0.06,
    blurAmount: 3,
    mediaHeight: 0.9,
    mediaWidth: 1.035,
    mediaRadius: 10,
    mediaFit: "cover",
    gap: 0.05,
    scrollLength: "400vh",
    direction: "forward",
    mapping: "live",
    sweepFrom: -140,
    sweepTo: 140,
  },
  fields: [
    {
      key: "sweepDeg",
      label: "Sweep",
      type: "slider",
      min: 60,
      max: 480,
      step: 5,
      unit: "°",
      section: "Drum",
    },
    {
      key: "ringHeight",
      label: "Ring Height",
      type: "slider",
      min: 0.2,
      max: 2,
      step: 0.05,
      section: "Drum",
    },
    {
      key: "ringDepth",
      label: "Ring Depth",
      type: "slider",
      min: 0.2,
      max: 3,
      step: 0.05,
      section: "Drum",
    },
    {
      key: "textRotation",
      label: "Text Rotation",
      type: "slider",
      min: 0,
      max: 3,
      step: 0.05,
      section: "Drum",
    },
    {
      key: "minOpacity",
      label: "Min Opacity",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Fade",
    },
    {
      key: "blurAmount",
      label: "Blur",
      type: "slider",
      min: 0,
      max: 12,
      step: 0.5,
      unit: "px",
      section: "Fade",
    },
    {
      key: "fadeExponent",
      label: "Fade Exponent",
      type: "slider",
      min: 0.5,
      max: 4,
      step: 0.1,
      section: "Fade",
    },
    {
      key: "mediaHeight",
      label: "Media Height",
      type: "slider",
      min: 0.2,
      max: 2,
      step: 0.05,
      section: "Media",
    },
    {
      key: "mediaWidth",
      label: "Media Width",
      type: "slider",
      min: 0.2,
      max: 2,
      step: 0.05,
      section: "Media",
    },
    {
      key: "mediaRadius",
      label: "Media Radius",
      type: "slider",
      min: 0,
      max: 48,
      step: 1,
      unit: "px",
      section: "Media",
    },
    {
      key: "mediaFit",
      label: "Media Fit",
      type: "select",
      options: [
        { label: "Cover", value: "cover" },
        { label: "Contain", value: "contain" },
      ],
      section: "Media",
    },
    {
      key: "scrollLength",
      label: "Scroll Length",
      type: "text",
      section: "Scroll",
    },
    {
      key: "direction",
      label: "Direction",
      type: "select",
      options: [
        { label: "Forward", value: "forward" },
        { label: "Reverse", value: "reverse" },
      ],
      section: "Scroll",
    },
    {
      key: "mapping",
      label: "Mapping",
      type: "select",
      options: [
        { label: "Live", value: "live" },
        { label: "Spec", value: "spec" },
      ],
      section: "Scroll",
    },
  ],
  stageClassName: "min-h-[620px]",
  iframeSrc: (config) => iframeSource("curved-inline-type", config as Config),
  iframeTitle: "Curved Inline Type demo",
  intro: "Tune the drum geometry, fade falloff, and scroll length.",
});
