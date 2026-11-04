import { DocsPageLayout } from "@/components/docs-page-layout";
import { DepthCarousel3DPreview } from "@/components/docs/previews/depth-carousel-3d-preview";
import { depthCarousel3dDemoItems } from "@/components/docs/previews/depth-carousel-3d-items";
import { readComponentSource } from "@/lib/source-code";
import { DepthCarousel3D } from "@workspace/ui/components/depth-carousel-3d";

const defaultCode = `import { DepthCarousel3D } from "@/components/ui/depth-carousel-3d"

const items = [
  { image: { src: "/work/blue-double.jpg", alt: "Blue double exposure" } },
  { image: { src: "/work/red-echo.jpg", alt: "Red echo portrait" } },
]

export default function Work() {
  return (
    <DepthCarousel3D
      items={items}
      ariaLabel="Selected work"
      className="h-[560px] w-full"
    />
  )
}`;

const usageCode = `"use client"

import {
  DepthCarousel3D,
  type DepthCarousel3DItem,
} from "@/components/ui/depth-carousel-3d"

const items: DepthCarousel3DItem[] = [
  {
    image: { src: "/work/photo-01.jpg", alt: "Describe the image" },
    link: "/work/photo-01",
    alt: "Case study photo",
  },
  {
    image: { src: "/work/photo-02.jpg", alt: "Second study" },
    link: "/work/photo-02",
    alt: "Second study",
  },
]

export function WorkDeck() {
  return (
    <DepthCarousel3D
      items={items}
      ariaLabel="Case studies"
      keyboard
      wheel
      clickToFocus
      className="h-[560px] w-full"
    />
  )
}`;

export async function DepthCarousel3DDocs() {
  const sourceCode =
    (await readComponentSource("depth-carousel-3d")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Depth Carousel 3D"
      description="An infinite 3D image carousel in plain DOM and CSS 3D transforms — no canvas, no WebGL. The active card sits centred, larger and flat; neighbours fan out smaller, rotated, and pushed back in Z, swinging edge-on and disappearing. Frosted-glass edge blur, drag, swipe, wheel, keyboard, click-to-focus and optional autoplay are built in."
      preview={<DepthCarousel3DPreview />}
      previewCode={defaultCode}
      installPackageName="depth-carousel-3d"
      installDependencies="framer-motion"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/depth-carousel-3d.tsx"
      usageCode={usageCode}
      fullWidthPreview
      examples={[
        {
          title: "Slow spring on a studio backdrop",
          preview: (
            <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-[#e8e4de] dark:bg-[#14141a]">
              <DepthCarousel3D
                items={depthCarousel3dDemoItems}
                ariaLabel="Studio depth carousel"
                stiffness={120}
                damping={26}
                mass={1.2}
                itemWidth={260}
                itemHeight={340}
                radius={12}
                className="h-full"
              />
            </div>
          ),
          code: `import { DepthCarousel3D } from "@/components/ui/depth-carousel-3d"

<div className="h-[420px] w-full bg-[#e8e4de] dark:bg-[#14141a]">
  <DepthCarousel3D
    items={items}
    stiffness={120}
    damping={26}
    mass={1.2}
    itemWidth={260}
    itemHeight={340}
    radius={12}
  />
</div>`,
        },
        {
          title: "No edge blur, tight spacing",
          preview: (
            <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-[#ececec] dark:bg-[#101016]">
              <DepthCarousel3D
                items={depthCarousel3dDemoItems}
                ariaLabel="Minimal depth carousel"
                edgeBlur={false}
                gap={12}
                spacingOverlap={0.7}
                rotation={28}
                className="h-full"
              />
            </div>
          ),
          code: `import { DepthCarousel3D } from "@/components/ui/depth-carousel-3d"

<div className="h-[420px] w-full bg-[#ececec] dark:bg-[#101016]">
  <DepthCarousel3D
    items={items}
    edgeBlur={false}
    gap={12}
    spacingOverlap={0.7}
    rotation={28}
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "items",
          type: "DepthCarousel3DItem[]",
          description:
            "Slides in the deck. Fewer than 20 render enough clones to tile seamlessly; items without an image show a generated gradient placeholder.",
        },
        {
          name: "ariaLabel",
          type: "string",
          default: '"3D image carousel"',
          description: "Accessible label for the carousel region.",
        },
        {
          name: "itemWidth",
          type: "number",
          default: "300",
          description: "Side-card width in pixels; the active card scales up.",
        },
        {
          name: "itemHeight",
          type: "number",
          default: "250",
          description: "Side-card height in pixels; the active card scales up.",
        },
        {
          name: "activeWidthScale",
          type: "number",
          default: "1.5",
          description: "Active card width multiplier.",
        },
        {
          name: "activeHeightScale",
          type: "number",
          default: "1.2",
          description: "Active card height multiplier.",
        },
        {
          name: "gap",
          type: "number",
          default: "40",
          description: "Space between cards in pixels before overlap.",
        },
        {
          name: "spacingOverlap",
          type: "number",
          default: "0.85",
          description:
            "Multiplier on (itemWidth + gap) for per-slot spacing; lower values pack cards tighter.",
        },
        {
          name: "radius",
          type: "number",
          default: "18",
          description: "Card corner radius in pixels.",
        },
        {
          name: "responsiveScale",
          type: "boolean",
          default: "true",
          description:
            "Scale item sizes by container width (clamped between 0.55 and 1 at 1000px+).",
        },
        {
          name: "perspective",
          type: "number",
          default: "550",
          description: "CSS perspective on the root in pixels.",
        },
        {
          name: "rotation",
          type: "number",
          default: "35",
          description: "Y rotation per slot in degrees.",
        },
        {
          name: "maxRotation",
          type: "number",
          default: "90",
          description: "Rotation cap in degrees; 90 swings far cards edge-on.",
        },
        {
          name: "depth",
          type: "number",
          default: "200",
          description: "Z push per slot in pixels.",
        },
        {
          name: "edgeBlur",
          type: "boolean",
          default: "true",
          description:
            "Frosted-glass blur at the outer edges, fading out toward the centre.",
        },
        {
          name: "blurAmount",
          type: "number",
          default: "25",
          description: "backdrop-filter blur radius in pixels.",
        },
        {
          name: "blurWidth",
          type: "number",
          default: "25",
          description: "Width of each frosted edge band in percent.",
        },
        {
          name: "stiffness",
          type: "number",
          default: "170",
          description: "Spring stiffness for slot motion.",
        },
        {
          name: "damping",
          type: "number",
          default: "26",
          description:
            "Spring damping for slot motion (labeled “Scroll damping” in the panel).",
        },
        {
          name: "mass",
          type: "number",
          default: "1",
          description: "Spring mass for slot motion.",
        },
        {
          name: "dragPxPerSlot",
          type: "number",
          default: "300",
          description: "Pixels of drag that advance one slot.",
        },
        {
          name: "wheel",
          type: "boolean",
          default: "true",
          description:
            "Horizontal wheel (Shift + vertical works too); plain vertical scroll is never hijacked.",
        },
        {
          name: "wheelAxis",
          type: '"horizontal" | "both"',
          default: '"horizontal"',
          description: "Which wheel axes drive the deck.",
        },
        {
          name: "keyboard",
          type: "boolean",
          default: "true",
          description:
            "Arrow keys move one slot; Home/End jump to the first/last slot.",
        },
        {
          name: "clickToFocus",
          type: "boolean",
          default: "true",
          description:
            "Clicking a side card springs it to the centre. The active card opens its link instead, if it has one.",
        },
        {
          name: "autoplay",
          type: "boolean",
          default: "false",
          description: "Advance one slot on an interval; pauses on hover and after interaction. Reduced motion disables it.",
        },
        {
          name: "autoplayInterval",
          type: "number",
          default: "3",
          description: "Seconds between autoplay advances.",
        },
        {
          name: "minLoopCount",
          type: "number",
          default: "20",
          description: "Minimum virtual slides in the loop; clones repeat evenly.",
        },
      ]}
    />
  );
}
