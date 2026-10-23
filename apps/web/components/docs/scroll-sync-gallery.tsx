import React from "react";
import { DemoFrame } from "@/components/docs/previews/demo-frame";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import { ScrollSyncGalleryPreview } from "@/components/docs/previews/scroll-sync-gallery-preview";

const defaultCode = `import { ScrollSyncGallery } from "@/components/ui/scroll-sync-gallery"

const columns = [
  {
    id: "column-1",
    direction: "up",
    speed: 1,
    images: [
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80", alt: "Mountain above the clouds", aspectRatio: 0.72 },
      { src: "/images/spiral-3d-slider/blue-double.jpg", alt: "Blue double-exposure portrait in a dark studio", aspectRatio: 0.72 },
    ],
  },
  {
    id: "column-2",
    direction: "down",
    speed: 0.72,
    images: [
      { src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80", alt: "Bright-wall editorial", aspectRatio: 1.4 },
      { src: "/images/spiral-3d-slider/red-echo.jpg", alt: "Red fashion portrait swept through a long exposure", aspectRatio: 0.72 },
    ],
  },
]

export default function Demo() {
  return (
    <div className="w-full bg-[#0b0b0c]">
      <ScrollSyncGallery columns={columns} preset="alternating" />
    </div>
  )
}`;

export async function ScrollSyncGalleryDocs() {
  const sourceCode =
    (await readComponentSource("scroll-sync-gallery")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Scroll Sync Gallery"
      description="Full-width pinned image wall — four vertical columns travel at different speeds and alternating directions, all driven by one normalized scroll progress. Fully reversible, GPU-friendly, with responsive redistribution and reduced-motion fallback."
      preview={
        <ScrollSyncGalleryPreview
          src="/demo/scroll-sync-gallery"
          title="Scroll Sync Gallery Demo"
        />
      }
      previewCode={defaultCode}
      installPackageName="scroll-sync-gallery"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/scroll-sync-gallery.tsx"
      usageCode={defaultCode}
      examples={[
        {
          title: "Full-page demo",
          preview: (
            <DemoFrame
              src="/demo/scroll-sync-gallery"
              title="Scroll Sync Gallery demo"
            />
          ),
          code: `import { ScrollSyncGallery } from "@/components/ui/scroll-sync-gallery"

<ScrollSyncGallery columns={columns} />`,
        },
      ]}
      fullWidthPreview={true}
      props={[
        {
          name: "columns",
          type: "ScrollSyncGalleryColumn[]",
          description:
            "Desktop column definitions. Each entry has id, direction ('up' | 'down'), speed multiplier, offset phase shift (-0.5…0.5) and an images array of { src, alt, aspectRatio }. On smaller screens images redistribute round-robin into fewer columns.",
        },
        {
          name: "preset",
          type: '"alternating" | "flow" | "mixed"',
          default: '"alternating"',
          description:
            "Motion preset for columns without explicit config and for redistributed mobile/tablet columns. Alternating opposes neighbors, flow moves all up at varied speeds, mixed varies direction, speed and offset.",
        },
        {
          name: "scrollHeight",
          type: "number",
          default: "400",
          description:
            "Height of the tall scroll track in vh. The viewport stays pinned at viewportHeight while scrolling through it.",
        },
        {
          name: "viewportHeight",
          type: "string",
          default: '"100vh"',
          description: "Height of the pinned viewport (any CSS length).",
        },
        {
          name: "gap",
          type: "number",
          default: "0",
          description: "Horizontal gap (px) between columns.",
        },
        {
          name: "rowGap",
          type: "number",
          default: "0",
          description: "Vertical gap (px) between images inside a column.",
        },
        {
          name: "travel",
          type: "number",
          default: "0.65",
          description:
            "Base travel distance as a fraction of viewport height. Per-column travel = travel × speed, clamped to measured content headroom so no gaps ever appear.",
        },
        {
          name: "smoothing",
          type: "number",
          default: "0.12",
          description:
            "Scroll-follow smoothing 0 (direct) to 1. Interpolates rendered progress toward actual scroll progress each frame for a weighted cinematic feel.",
        },
        {
          name: "objectFit",
          type: '"cover" | "contain" | "fill"',
          default: '"cover"',
          description: "How images fill their frame.",
        },
        {
          name: "objectPosition",
          type: "string",
          default: '"50% 50%"',
          description: "Image focal point (CSS object-position).",
        },
        {
          name: "desktopColumns",
          type: "number",
          default: "4",
          description: "Column count on desktop.",
        },
        {
          name: "tabletColumns",
          type: "number",
          default: "3",
          description: "Column count below tabletBreakpoint.",
        },
        {
          name: "mobileColumns",
          type: "number",
          default: "2",
          description: "Column count below mobileBreakpoint.",
        },
        {
          name: "duplicateCount",
          type: "number",
          default: "2",
          description:
            "How many times each column's image set repeats. Extra copies provide travel headroom so columns never expose empty background.",
        },
        {
          name: "introZoom",
          type: "boolean",
          default: "true",
          description:
            "Subtle scale-in of the whole wall during the first 12% of scroll progress so the gallery eases into view.",
        },
        {
          name: "enabled",
          type: "boolean",
          default: "true",
          description:
            "When false, renders a static accessible editorial grid instead of the pinned scroll effect.",
        },
        {
          name: "pauseWhenOffscreen",
          type: "boolean",
          default: "true",
          description:
            "Pause transform work while the gallery is far offscreen (IntersectionObserver with 600px margin).",
        },
      ]}
    />
  );
}
