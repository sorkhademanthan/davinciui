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

// ─── Scroll Reveal Image ────────────────────────────────────────────────────

export const {
  Preview: ScrollRevealImagePlayground,
  PersonalizePanel: ScrollRevealImagePersonalizePanel,
} = createComponentPlayground({
  slug: "scroll-reveal-image",
  component: Noop,
  componentName: "ScrollRevealImage",
  defaults: {
    sectionHeight: "300vh",
    imageWidth: "clamp(15rem, 30vw, 38rem)",
    imageHeight: "clamp(22rem, 78vh, 52rem)",
    borderRadius: "0rem",
    backgroundScale: 1.08,
    imageScale: 1.04,
    scrub: 0.18,
  },
  fields: [
    {
      key: "sectionHeight",
      label: "Section Height",
      type: "text",
      section: "Scroll",
    },
    {
      key: "imageWidth",
      label: "Image Width",
      type: "text",
      section: "Layout",
    },
    {
      key: "imageHeight",
      label: "Image Height",
      type: "text",
      section: "Layout",
    },
    {
      key: "borderRadius",
      label: "Border Radius",
      type: "text",
      section: "Layout",
    },
    {
      key: "backgroundScale",
      label: "Background Scale",
      type: "slider",
      min: 1,
      max: 1.5,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "imageScale",
      label: "Image Scale",
      type: "slider",
      min: 1,
      max: 1.4,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "scrub",
      label: "Scrub",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
  ],
  stageClassName: "min-h-[620px]",
  iframeSrc: (config) => iframeSource("scroll-reveal-image", config as Config),
  iframeTitle: "Scroll Reveal Image demo",
  intro: "Adjust the sticky image dimensions, scaling, and scrub smoothing.",
});
