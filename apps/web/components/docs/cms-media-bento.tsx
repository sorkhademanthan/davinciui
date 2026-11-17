import { DemoFrame } from "@/components/docs/previews/demo-frame";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `"use client"

import { CMSMediaBento, type BentoItem } from "@/components/ui/cms-media-bento"

const items: BentoItem[] = [
  {
    src: "/images/spiral-3d-slider/visor-portrait.webp",
    title: "Visor",
    category: "Portrait",
    size: "hero",
  },
  {
    src: "/images/spiral-3d-slider/blue-double.webp",
    title: "Blue Double",
    size: "large",
  },
  {
    src: "/images/spiral-3d-slider/prism-portrait.webp",
    title: "Prism",
    size: "regular",
  },
  // Add as many items as you like.
]

export default function Page() {
  return (
    <main className="h-dvh w-full bg-background">
      <CMSMediaBento
        items={items}
        gap={10}
        radius={14}
        captions="hover"
        hoverGrow={1.8}
        focusDim={0.35}
        openLightbox
      />
    </main>
  )
}`;

export async function CmsMediaBentoDocs() {
  const sourceCode =
    (await readComponentSource("cms-media-bento")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      fullWidthPreview
      hideExamples
      hideDefaultPreviewVariant
      title="CMS Media Bento"
      description="A CMS-ready media bento whose weighted slicing tree re-solves the whole composition around the tile you hover. Ten color portraits from the Spiral Media Gallery set, adaptive captions, and a keyboard-friendly lightbox."
      preview={
        <DemoFrame
          src="/demo/cms-media-bento"
          title="CMS Media Bento demo"
          fill
        />
      }
      previewCode={usageCode}
      installPackageName="cms-media-bento"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/cms-media-bento.tsx"
      usageCode={usageCode}
      usageNote={
        <p className="text-sm leading-6 text-muted-foreground">
          {`Give the component a sized parent. The default ten-item layout switches between wide and tall slicing trees from the measured aspect ratio, collapses to a two-column grid below 520px, and re-solves every split when a tile is hovered. All media is lazy-loaded imagery and the lightbox is keyboard accessible.`}
        </p>
      }
      props={[
        {
          name: "items",
          type: "BentoItem[]",
          description:
            "Image entries. The first ten drive the canonical bento; other counts receive a balanced weighted tree. Each item needs src, plus optional title, category, description, link, size, and alt.",
        },
        {
          name: "gap",
          type: "number",
          default: "10",
          description: "Space between tiles and around the stage, in pixels.",
        },
        {
          name: "radius",
          type: "number",
          default: "14",
          description:
            "Corner radius applied to every tile and lightbox media.",
        },
        {
          name: "background",
          type: "string",
          default: "var(--bento-surface)",
          description:
            "Overrides the themed stage surface. Defaults to a warm off-white in light mode and near-black in dark mode.",
        },
        {
          name: "captions",
          type: '"always" | "hover" | "hidden"',
          default: '"hover"',
          description:
            "Caption visibility. Mobile grids show captions whenever they are not hidden.",
        },
        {
          name: "hoverGrow",
          type: "number",
          default: "1.8",
          description:
            "Weight multiplier for the hovered tile. The entire layout re-solves, not just the tile.",
        },
        {
          name: "focusDim",
          type: "number",
          default: "0.35",
          description:
            "Opacity of the focus veil over non-hovered tiles while one tile is active. Uses the current surface token.",
        },
        {
          name: "hoverZoom",
          type: "number",
          default: "1.04",
          description: "Media scale while its tile is hovered.",
        },
        {
          name: "mirror",
          type: "boolean",
          default: "false",
          description:
            "Mirror the layout horizontally without mirroring media.",
        },
        {
          name: "openLightbox",
          type: "boolean",
          default: "true",
          description:
            "Open the focused media in a dialog. When false, item links navigate.",
        },
        {
          name: "transitionMs",
          type: "number",
          default: "420",
          description: "Layout re-solve duration in milliseconds.",
        },
        {
          name: "minHeight",
          type: "number",
          default: "520",
          description: "Minimum root height in pixels.",
        },
        {
          name: "mobileBreakpoint",
          type: "number",
          default: "520",
          description:
            "Width below which the layout collapses to the scrolling two-column grid. Set to 0 to keep the bento composition at any size.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the root element.",
        },
      ]}
    />
  );
}
