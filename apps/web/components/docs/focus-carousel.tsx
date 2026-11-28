import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import { FocusCarouselPlayground, FocusCarouselPersonalizePanel } from "@/components/docs/previews/playgrounds/focus-carousel";

const defaultCode = `import { FocusCarousel } from "@/components/ui/focus-carousel"

const items = [
  {
    id: "tessellate",
    title: "Tessellate",
    subtitle: "Glass Form Study",
    image: { src: "/portraits/tessellate.jpg", alt: "Prism portrait" },
  },
  {
    id: "salvia",
    title: "Salvia",
    subtitle: "Garden Room Session",
    image: { src: "/portraits/salvia.jpg", alt: "Green portrait" },
  },
]

<FocusCarousel items={items} defaultIndex={0} />`;

const usageCode = `import {
  FocusCarousel,
  type FocusCarouselItem,
} from "@/components/ui/focus-carousel"

const items: FocusCarouselItem[] = [
  {
    id: "tessellate",
    title: "Tessellate",
    subtitle: "Glass Form Study",
    image: { src: "/portraits/tessellate.jpg", alt: "Prism portrait" },
    video: {
      src: "/videos/tessellate.mp4",
      poster: "/portraits/tessellate.jpg",
    },
  },
  {
    id: "salvia",
    title: "Salvia",
    subtitle: "Garden Room Session",
    image: { src: "/portraits/salvia.jpg", alt: "Green portrait" },
  },
]

export function Gallery() {
  return (
    <FocusCarousel
      items={items}
      defaultIndex={0}
      onIndexChange={(index) => console.log("active card:", index)}
    />
  )
}`;

const mechanicNote = (
  <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
    <p>
      Every card is a continuous function of{" "}
      <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
        d = |index − position|
      </code>
      , where{" "}
      <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
        position
      </code>{" "}
      is one animated float. There are no active, hover, or far states.
    </p>
    <p>
      Width interpolates from{" "}
      <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
        activeWidth
      </code>{" "}
      to{" "}
      <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
        sideWidth
      </code>{" "}
      through a smoothstep across the first slot. Blur begins at{" "}
      <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
        d = 1
      </code>{" "}
      (
      <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
        4 × (d − 1)
      </code>
      , capped by{" "}
      <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
        maxBlur
      </code>
      ), and grayscale saturates between{" "}
      <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
        d = 0.6
      </code>{" "}
      and{" "}
      <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
        d = 1
      </code>
      .
    </p>
    <p>
      Cards are positioned from their interpolated widths plus{" "}
      <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
        gap
      </code>{" "}
      — never fixed slots — and the strip is anchored so the fractional point{" "}
      <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
        position
      </code>{" "}
      lands at the viewport centre. That keeps gaps constant mid-animation.
    </p>
  </div>
);

export async function FocusCarouselDocs() {
  const sourceCode =
    (await readComponentSource("focus-carousel")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Focus Carousel"
      description="An infinite, horizontally centred media gallery where one sharp card holds focus while neighbours shrink, desaturate, and blur as a continuous function of distance. Click, drag, or use the keyboard to move the strip; an Image/Video toggle swaps the media in place."
      preview={<FocusCarouselPlayground />}
      personalizeContent={<FocusCarouselPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="focus-carousel"
      installDependencies="framer-motion clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/focus-carousel.tsx"
      importCode={`"use client";

import {FocusCarousel, type FocusCarouselItem} from "@/components/ui/focus-carousel";`}
      usageCode={usageCode}
      fullWidthPreview
      props={[
        {
          name: "items",
          type: "FocusCarouselItem[]",
          description:
            "Cards in loop order. Each item has id, title, optional subtitle, image { src, alt }, and optional video { src, poster }. Minimum three items is recommended.",
        },
        {
          name: "defaultIndex",
          type: "number",
          default: "0",
          description: "Card that starts in the centre in uncontrolled mode.",
        },
        {
          name: "index",
          type: "number",
          description:
            "Controlled active index. When it changes the deck animates to the shortest wrapped path.",
        },
        {
          name: "onIndexChange",
          type: "(index: number) => void",
          description: "Fires when navigation selects a new active card.",
        },
        {
          name: "mediaMode",
          type: '"image" | "video"',
          description: "Controlled media toggle value.",
        },
        {
          name: "defaultMediaMode",
          type: '"image" | "video"',
          default: '"image"',
          description: "Initial media toggle value in uncontrolled mode.",
        },
        {
          name: "onMediaModeChange",
          type: '(mode: "image" | "video") => void',
          description: "Fires when the Image/Video toggle changes.",
        },
        {
          name: "showToggle",
          type: "boolean",
          default: "true",
          description: "Show the segmented Image/Video control.",
        },
        {
          name: "showCaption",
          type: "boolean",
          default: "true",
          description: "Show the triangle indicator, title, and subtitle.",
        },
        {
          name: "activeWidth",
          type: "number",
          default: "400",
          description:
            "Width of the centred card in CSS pixels. Height follows aspectRatio.",
        },
        {
          name: "sideWidth",
          type: "number",
          default: "208",
          description:
            "Width of cards at distance ≥ 1. The default is 0.52 × activeWidth.",
        },
        {
          name: "aspectRatio",
          type: "number",
          default: "3 / 4",
          description: "Width ÷ height for every card.",
        },
        {
          name: "gap",
          type: "number",
          default: "22",
          description:
            "Edge-to-edge gap between cards, kept constant mid-motion.",
        },
        {
          name: "maxBlur",
          type: "number",
          default: "9",
          description: "Upper bound for the distance-driven blur radius.",
        },
        {
          name: "duration",
          type: "number",
          default: "0.55",
          description: "Navigation travel duration in seconds.",
        },
        {
          name: "draggable",
          type: "boolean",
          default: "true",
          description:
            "Enable pointer dragging with velocity-aware snapping. Clicks under a 4px movement threshold still navigate.",
        },
        {
          name: "responsive",
          type: "boolean",
          default: "true",
          description:
            "Scale the deck down proportionally in containers narrower than 700px. Disable when embedding at a fixed miniature size.",
        },
        {
          name: "aria-label",
          type: "string",
          default: '"Focus carousel"',
          description: "Accessible name for the carousel region.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes for the root element.",
        },
      ]}
      customizationNote={mechanicNote}
      constraintsNote={
        <p>
          The reference viewport is 1455×749 CSS px. Below 700px container
          width, activeWidth, sideWidth, and gap scale down together while the
          toggle and caption keep their fixed type sizes. The strip needs a
          height context: the root fills its parent and falls back to a minimum
          height derived from the active card plus the caption. Images that fail
          to load keep a neutral #EEE 3:4 surface, so layout never jumps.
        </p>
      }
    />
  );
}
