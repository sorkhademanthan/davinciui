import { DocsPageLayout } from "@/components/docs-page-layout";
import { FannedDeckPreview } from "@/components/docs/previews/fanned-deck-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { FannedDeck } from "@/components/ui/fanned-deck"

const items = [
  {
    image: { src: "/work/portrait-01.jpg", alt: "Portrait" },
    label: "@inkhouse",
    color: "#2f6bff",
  },
  {
    image: { src: "/work/portrait-02.jpg", alt: "Portrait" },
    label: "@paperlab",
    color: "#ff5a3c",
  },
]

export default function Team() {
  return (
    <FannedDeck
      items={items}
      entrance="deal"
      className="h-[560px] w-full"
    />
  )
}`;

const usageCode = `"use client"

import {
  FannedDeck,
  type FannedDeckItem,
} from "@/components/ui/fanned-deck"

const items: FannedDeckItem[] = [
  {
    type: "image",
    image: { src: "/work/portrait-01.jpg", alt: "Describe the image" },
    label: "@inkhouse",
    color: "#2f6bff",
    link: "https://example.com",
    newTab: true,
  },
  {
    type: "video",
    video: "/videos/reel.mp4",
    label: "@paperlab",
    color: "#ff5a3c",
    pinned: true,
  },
]

export function CreatorDeck() {
  return (
    <FannedDeck
      items={items}
      entrance="deal"
      arc={0.31}
      tilt={4.3333}
      overlap={0.6}
      className="h-[560px] w-full"
    />
  )
}`;

export async function FannedDeckDocs() {
  const sourceCode =
    (await readComponentSource("fanned-deck")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Fanned Deck"
      description="A 3D fan of up to 14 portrait cards arranged on a curved arc. Each card is bent like a curved sheet (14 vertical slices, each rotated in 3D), the deck overlaps 40%, tilts outward, and bobs gently. Hovering a card lifts it to the front, straightens and uncurls it, spreads its neighbours, dims the rest, and pops a coloured username bubble. Deal, flip, rise, and sweep entrances replay on viewport re-entry."
      preview={<FannedDeckPreview />}
      previewCode={defaultCode}
      installPackageName="fanned-deck"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/fanned-deck.tsx"
      usageCode={usageCode}
      fullWidthPreview
      props={[
        {
          name: "items",
          type: "FannedDeckItem[]",
          description:
            "Up to 14 cards, back to front. Each takes an image (or video), label, bubble colour, link, and a pinned flag that keeps its bubble visible.",
        },
        {
          name: "background",
          type: "string",
          default: '"#efefef"',
          description: "Stage colour behind the fan.",
        },
        {
          name: "overlap",
          type: "number",
          default: "0.6",
          description:
            "Horizontal card step as a fraction of card width; 0.6 means 40% overlap.",
        },
        {
          name: "arc",
          type: "number",
          default: "0.31",
          description:
            "How far the outer cards sit below the centre, as a fraction of card size.",
        },
        {
          name: "tilt",
          type: "number",
          default: "4.3333",
          description:
            "Y rotation per card in degrees; the live fan is asymmetric, so the whole deck leans -3.5deg.",
        },
        {
          name: "curve",
          type: "number",
          default: "3.1429",
          description: "Y rotation per slice in degrees; bends each card.",
        },
        {
          name: "sag",
          type: "number",
          default: "0.0819",
          description:
            "How far slice edges push toward the viewer, as a fraction of card size.",
        },
        {
          name: "depth",
          type: "number",
          default: "2.8",
          description: "CSS perspective, in multiples of card size.",
        },
        {
          name: "cardRadius",
          type: "number",
          default: "22",
          description: "Card corner radius in pixels.",
        },
        {
          name: "shadow",
          type: "boolean",
          default: "true",
          description: "Drop shadow under each card; deepens on hover.",
        },
        {
          name: "outline",
          type: "boolean",
          default: "false",
          description: "Show a focus ring on focused cards.",
        },
        {
          name: "hoverLift",
          type: "number",
          default: "18",
          description: "Vertical lift of the hovered card in pixels.",
        },
        {
          name: "hoverScale",
          type: "number",
          default: "1.06",
          description: "Scale multiplier on the hovered card.",
        },
        {
          name: "hoverSpread",
          type: "number",
          default: "0.16",
          description:
            "Neighbour push on hover; decays geometrically (x0.62) per card of distance.",
        },
        {
          name: "hoverStraighten",
          type: "boolean",
          default: "true",
          description: "Hovered cards keep 40% of their tilt.",
        },
        {
          name: "hoverUncurl",
          type: "boolean",
          default: "true",
          description: "Hovered cards uncurl to 45% of their curvature.",
        },
        {
          name: "edgeScale",
          type: "number",
          default: "1",
          description:
            "Scale of the outer cards relative to the centre (0.84 at centre); lower it for flatter fans.",
        },
        {
          name: "bubbleScale",
          type: "number",
          default: "1",
          description:
            "Scale of the username bubble; it shrinks toward the tail, so lower values also sit it closer to the card.",
        },
        {
          name: "dimOthers",
          type: "number",
          default: "0.12",
          description: "Dark overlay strength on non-hovered cards.",
        },
        {
          name: "entrance",
          type: '"deal" | "flip" | "rise" | "sweep"',
          default: '"deal"',
          description:
            "Entrance animation; plays on load and replays on viewport re-entry.",
        },
        {
          name: "bob",
          type: "boolean",
          default: "true",
          description: "Gentle per-card bob (5px, staggered).",
        },
        {
          name: "stackingOrder",
          type: '"right-on-top" | "left-on-top"',
          default: '"right-on-top"',
          description: "Which end of the fan stacks on top.",
        },
      ]}
    />
  );
}
