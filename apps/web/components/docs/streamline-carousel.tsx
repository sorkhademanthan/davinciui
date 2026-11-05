import { DocsPageLayout } from "@/components/docs-page-layout";
import { StreamlineCarouselPreview } from "@/components/docs/previews/streamline-carousel-preview";
import { streamlineCarouselDemoItems } from "@/components/docs/previews/streamline-carousel-items";
import { readComponentSource } from "@/lib/source-code";
import { StreamlineCarousel } from "@workspace/ui/components/streamline-carousel";

const defaultCode = `import { StreamlineCarousel } from "@/components/ui/streamline-carousel"

const items = [
  { kind: "image", image: { src: "/work/blue-double.jpg", alt: "Blue double exposure" } },
  { kind: "image", image: { src: "/work/red-echo.jpg", alt: "Red echo portrait" } },
]

export default function Work() {
  return (
    <StreamlineCarousel
      items={items}
      cardHeight={260}
      autoplay
      autoSpeed={60}
      className="h-[520px] w-full"
    />
  )
}`;

const usageCode = `"use client"

import {
  StreamlineCarousel,
  type StreamlineItem,
} from "@/components/ui/streamline-carousel"

const items: StreamlineItem[] = [
  {
    kind: "image",
    image: { src: "/work/photo-01.jpg", alt: "Describe the image" },
    link: "/work/photo-01",
  },
  {
    kind: "video",
    url: "/videos/work-loop.mp4",
  },
]

export function WorkCarousel() {
  return (
    <StreamlineCarousel
      items={items}
      cardHeight={280}
      gap={20}
      curvature={1.5}
      colorFringe={0.7}
      autoplay
      autoSpeed={60}
      clickToFocus
      className="h-[560px] w-full"
    />
  )
}`;

export async function StreamlineCarouselDocs() {
  const sourceCode =
    (await readComponentSource("streamline-carousel")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Streamline Carousel"
      description="An infinite WebGL carousel drawn on a single canvas. The centre stays flat while cards grow taller toward the edges and the strip bows outward like a bowl. A red/blue channel split strengthens at the silhouette and with scroll speed. Drag, wheel, keyboard, click-to-focus, autoplay, and video are built in."
      preview={<StreamlineCarouselPreview />}
      previewCode={defaultCode}
      installPackageName="streamline-carousel"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/streamline-carousel.tsx"
      usageCode={usageCode}
      fullWidthPreview
      examples={[
        {
          title: "Dissolve entrance on a dark stage",
          preview: (
            <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-[#101016]">
              <StreamlineCarousel
                items={streamlineCarouselDemoItems}
                background="#101016"
                cardHeight={260}
                gap={14}
                curvature={1.2}
                colorFringe={0.8}
                entrance="dissolve"
                autoplay
                autoSpeed={50}
                className="h-full min-h-0"
              />
            </div>
          ),
          code: `import { StreamlineCarousel } from "@/components/ui/streamline-carousel"

<div className="h-[420px] w-full bg-[#101016]">
  <StreamlineCarousel
    items={items}
    background="#101016"
    cardHeight={260}
    curvature={1.2}
    colorFringe={0.8}
    entrance="dissolve"
    autoplay
  />
</div>`,
        },
        {
          title: "No autoplay, keyboard-driven browsing",
          preview: (
            <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-[#ececec] dark:bg-[#121216]">
              <StreamlineCarousel
                items={streamlineCarouselDemoItems}
                autoplay={false}
                keyboard
                wheel
                clickToFocus
                cardHeight={240}
                gap={18}
                curvature={1.8}
                background="var(--sl-stage, #ececec)"
                className="h-full min-h-0 [--sl-stage:#ececec] dark:[--sl-stage:#121216]"
              />
            </div>
          ),
          code: `import { StreamlineCarousel } from "@/components/ui/streamline-carousel"

<div className="h-[420px] w-full bg-[#ececec] dark:bg-[#121216]">
  <StreamlineCarousel
    items={items}
    autoplay={false}
    keyboard
    wheel
    clickToFocus
    cardHeight={240}
    gap={18}
    curvature={1.8}
    background="#ececec"
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "items",
          type: "StreamlineItem[]",
          description:
            "Slides in the strip. Items without a source render a generated gradient placeholder; an empty list shows seven placeholders. Widths are cloned logically for seamless tiling on wide screens.",
        },
        {
          name: "background",
          type: "string",
          default: '"#ececec"',
          description: "Stage color shown through the transparent canvas.",
        },
        {
          name: "cardHeight",
          type: "number",
          default: "220",
          description: "Card height in pixels; width derives from aspect.",
        },
        {
          name: "fixedAspect",
          type: "boolean",
          default: "true",
          description:
            "Fixed uses aspectRatio for every card; Natural uses each media's intrinsic aspect with a smooth re-layout after load.",
        },
        {
          name: "aspectRatio",
          type: "number",
          default: "1.25",
          description: "Card width / height in Fixed mode.",
        },
        {
          name: "gap",
          type: "number",
          default: "16",
          description: "Space between cards in pixels.",
        },
        {
          name: "radius",
          type: "number",
          default: "0",
          description: "Card corner radius in pixels.",
        },
        {
          name: "flatWidth",
          type: "number",
          default: "0.4",
          description:
            "Fraction of the half-width that stays flat before the curve takes over.",
        },
        {
          name: "curvature",
          type: "number",
          default: "1.4",
          description:
            "How aggressively the edges grow taller. The silhouette bows outward like a bowl.",
        },
        {
          name: "colorFringe",
          type: "number",
          default: "0.6",
          description:
            "Strength of the red/blue channel split. Zero at rest in the flat centre; grows toward the edges and with scroll speed.",
        },
        {
          name: "speedDistortion",
          type: "number",
          default: "0.5",
          description:
            "How much the curve and fringe exaggerate while the strip is moving fast.",
        },
        {
          name: "autoplay",
          type: "boolean",
          default: "true",
          description: "Enable autoplay. Reduced motion disables it.",
        },
        {
          name: "autoSpeed",
          type: "number",
          default: "40",
          description:
            "Strip speed in pixels per second. Negative values move the strip right.",
        },
        {
          name: "pauseOnHover",
          type: "boolean",
          default: "true",
          description: "Pause autoplay while the pointer is over the carousel.",
        },
        {
          name: "momentum",
          type: "number",
          default: "0.6",
          description: "Release momentum weight after a drag.",
        },
        {
          name: "wheel",
          type: "boolean",
          default: "true",
          description:
            "Horizontal wheel (and Shift + vertical) drives the strip; plain vertical scroll is never hijacked.",
        },
        {
          name: "keyboard",
          type: "boolean",
          default: "true",
          description: "Arrow keys focus the previous or next card.",
        },
        {
          name: "clickToFocus",
          type: "boolean",
          default: "true",
          description:
            "Clicking a side card tweens it to the centre. A centred card with a link opens the link instead.",
        },
        {
          name: "entrance",
          type: '"none" | "lift" | "slide" | "dissolve"',
          default: '"lift"',
          description: "Mount animation style for cards.",
        },
        {
          name: "duration",
          type: "number",
          default: "0.9",
          description: "Entrance duration in seconds.",
        },
        {
          name: "stagger",
          type: "number",
          default: "0.08",
          description: "Entrance delay per card step in seconds.",
        },
      ]}
    />
  );
}
