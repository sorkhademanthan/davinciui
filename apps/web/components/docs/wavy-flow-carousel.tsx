import { DocsPageLayout } from "@/components/docs-page-layout";
import { WavyFlowCarouselPreview } from "@/components/docs/previews/wavy-flow-carousel-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { WavyFlowCarousel } from "@/components/ui/wavy-flow-carousel"

export default function Hero() {
  return <WavyFlowCarousel />
}`;

const usageCode = `"use client"

import {
  WavyFlowCarousel,
  type WavyFlowCarouselSlide,
} from "@/components/ui/wavy-flow-carousel"

const slides: WavyFlowCarouselSlide[] = [
  { src: "/images/spiral-3d-slider/orange-haze.jpg", type: "image" },
  { src: "/images/spiral-3d-slider/blue-double.jpg", type: "image" },
  { src: "/images/spiral-3d-slider/white-motion.jpg", type: "image" },
  { src: "/images/spiral-3d-slider/camera-reflection.jpg", type: "image" },
  { src: "/images/spiral-3d-slider/silver-motion.jpg", type: "image" },
  { src: "/images/spiral-3d-slider/green-portrait.jpg", type: "image" },
]

export function Hero() {
  return <WavyFlowCarousel slides={slides} />
}`;

export async function WavyFlowCarouselDocs() {
  const sourceCode =
    (await readComponentSource("wavy-flow-carousel")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      fullWidthPreview
      title="Wavy Flow Carousel"
      description="An infinite horizontal ribbon of portrait media that follows your theme background. Slides rise and grow taller on the crests, sink and shrink on the troughs, auto-scroll, drag with momentum, and loop seamlessly."
      preview={<WavyFlowCarouselPreview />}
      previewCode={defaultCode}
      installPackageName="wavy-flow-carousel"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/wavy-flow-carousel.tsx"
      usageCode={usageCode}
      props={[
        {
          name: "slides",
          type: "WavyFlowCarouselSlide[]",
          description:
            "Media rows in play order. Each slide takes a src and an optional type — an image, or a muted looping video. Defaults to the built-in six-portrait composition.",
        },
        {
          name: "slideWidth",
          type: "number",
          default: "0.407",
          description: "Slide width as a fraction of the container height.",
        },
        {
          name: "slideHeight",
          type: "number",
          default: "0.5",
          description: "Slide height at the wave midline, as a fraction of the container height.",
        },
        {
          name: "spacing",
          type: "number",
          default: "0",
          description: "Gap between slides in px (pitch is slideWidth + spacing).",
        },
        {
          name: "waveStretch",
          type: "number",
          default: "0.25",
          description: "Vertical scale swing applied by the wave at crest and trough.",
        },
        {
          name: "waveHeight",
          type: "number",
          default: "0.15",
          description:
            "Vertical centre swing of the ribbon as a fraction of the container height.",
        },
        {
          name: "waveFrequency",
          type: "number",
          default: "1 / 3.86",
          description: "Wave frequency per container height — λ = H / waveFrequency.",
        },
        {
          name: "wavePhase",
          type: "number",
          default: "1.2",
          description: "Wave phase in radians at offset 0.",
        },
        {
          name: "autoRotate",
          type: "boolean",
          default: "true",
          description: "Auto-advance the strip at constant speed.",
        },
        {
          name: "speed",
          type: "number",
          default: "0.149",
          description: "Auto-scroll speed in container heights per second.",
        },
        {
          name: "direction",
          type: '"left" | "right"',
          default: '"left"',
          description: "Direction the strip travels.",
        },
        {
          name: "pauseOnHover",
          type: "boolean",
          default: "false",
          description: "Ease auto-scroll to a stop while the pointer is over the canvas.",
        },
        {
          name: "dragEnabled",
          type: "boolean",
          default: "true",
          description: "Drag the strip 1:1 with the pointer.",
        },
        {
          name: "momentum",
          type: "boolean",
          default: "true",
          description:
            "Keep release velocity with ~0.95 per-frame friction at 60fps.",
        },
        {
          name: "wheelEnabled",
          type: "boolean",
          default: "true",
          description: "Wheel and horizontal trackpad deltas move the strip.",
        },
        {
          name: "background",
          type: "string",
          default: '"var(--background, #ffffff)"',
          description:
            "Stage background. Defaults to your theme's background token.",
        },
        {
          name: "fit",
          type: '"cover" | "contain"',
          default: '"cover"',
          description: "Texture fit inside each slide.",
        },
      ]}
    />
  );
}
