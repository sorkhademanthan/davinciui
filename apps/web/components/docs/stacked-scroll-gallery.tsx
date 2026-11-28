import React from "react";
import {DemoFrame} from "@/components/docs/previews/demo-frame";
import {DocsPageLayout} from "@/components/docs-page-layout";
import {readComponentSource} from "@/lib/source-code";
import { StackedScrollGalleryPlayground, StackedScrollGalleryPersonalizePanel } from "@/components/docs/previews/playgrounds/stacked-scroll-gallery";


const defaultCode = `import { StackedScrollGallery } from "@/components/ui/stacked-scroll-gallery"

const items = [
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&q=80", alt: "Matterhorn above the clouds" },
  { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1800&q=80", alt: "Sunlit mountain valley" },
  { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1800&q=80", alt: "Fog over green hills" },
  { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1800&q=80", alt: "Golden forest light" },
  { src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1800&q=80", alt: "Waterfall gorge" },
]

export default function Demo() {
  return (
    <div className="w-full bg-zinc-100 dark:bg-[#0a0a0b]">
      <StackedScrollGallery items={items} />
    </div>
  )
}`;

export async function StackedScrollGalleryDocs() {
  const sourceCode =
    (await readComponentSource("stacked-scroll-gallery")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Stacked Scroll Gallery"
      description="Pinned layered media stack — the next panel rises from the bottom and physically covers the current one, driven directly by scroll. Fully reversible, with per-card rounding and a live next-card preview strip."
      preview={<StackedScrollGalleryPlayground />}
      personalizeContent={<StackedScrollGalleryPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="stacked-scroll-gallery"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/stacked-scroll-gallery.tsx"
      usageCode={defaultCode}
      examples={[
        {
          title: "Full-page demo",
          preview: (
            <DemoFrame
              src="/demo/stacked-scroll-gallery"
              title="Stacked Scroll Gallery demo"
            />
          ),
          code: `import { StackedScrollGallery } from "@/components/ui/stacked-scroll-gallery"

<StackedScrollGallery items={items} />`,
        },
      ]}
      fullWidthPreview={true}
      props={[
        {
          name: "items",
          type: "StackedScrollGalleryItem[]",
          description:
            "Media panels in stack order. Each item needs src (image or video URL), optional type ('auto' | 'image' | 'video'), alt and poster. Supports any item count.",
        },
        {
          name: "viewportHeight",
          type: "string",
          default: '"100vh"',
          description: "Height of the pinned viewport (any CSS length).",
        },
        {
          name: "scrollDistancePerItem",
          type: "number",
          default: "100",
          description:
            "Scroll distance devoted to each transition, in vh. Total track = viewport + distance × (items − 1).",
        },
        {
          name: "previewHeight",
          type: "number",
          default: "44",
          description:
            "Preview strip (px) of the incoming card visible at rest. Scales down automatically on small screens.",
        },
        {
          name: "radius",
          type: "number",
          default: "20",
          description:
            "Corner radius (px) applied to every card independently.",
        },
        {
          name: "gutter",
          type: "number",
          default: "22",
          description:
            "Inset (px) between the viewport edge and the cards on every side.",
        },
        {
          name: "fit",
          type: '"cover" | "contain" | "fill"',
          default: '"cover"',
          description: "How media fills its card.",
        },
        {
          name: "position",
          type: "string",
          default: '"50% 50%"',
          description: "Media focal point (CSS object-position).",
        },
        {
          name: "smoothing",
          type: "number",
          default: "0.14",
          description:
            "Scroll-follow smoothing 0 (direct) to 1. Kept low so scrubbing stays responsive; 0 disables interpolation.",
        },
        {
          name: "easing",
          type: '"linear" | "easeInOut" | ((t: number) => number)',
          default: '"linear"',
          description: "Easing applied to each transition's local progress.",
        },
        {
          name: "dimming",
          type: "boolean",
          default: "true",
          description:
            "Dim outgoing cards as the next panel travels over them.",
        },
        {
          name: "dimStrength",
          type: "number",
          default: "0.3",
          description:
            "Max dim overlay opacity (0–1) when a card is fully covered.",
        },
        {
          name: "enabled",
          type: "boolean",
          default: "true",
          description:
            "When false, renders a static accessible list instead of the pinned scroll effect.",
        },
        {
          name: "pauseOffscreenVideos",
          type: "boolean",
          default: "true",
          description:
            "Pause videos that are not the active (or adjacent) panel.",
        },
        {
          name: "background",
          type: "string",
          description:
            "Surrounding background color. When omitted, the gallery follows the theme (light zinc in light mode, near-black in dark mode).",
        },
      ]}
    />
  );
}
