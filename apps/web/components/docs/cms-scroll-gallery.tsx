import React from "react";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import { CMSScrollGalleryPreview } from "@/components/docs/previews/cms-scroll-gallery-preview";

const defaultCode = `import { CMSScrollGallery } from "@/components/ui/cms-scroll-gallery"

const items = [
  { title: "Prism", media: "/images/spiral-3d-slider/prism-portrait.jpg" },
  { title: "Ember", media: "/images/spiral-3d-slider/red-echo.jpg" },
  { title: "Azure", media: "/images/spiral-3d-slider/blue-double.jpg" },
  { title: "Oculus", media: "/images/segmented-image-carousel/concrete-oculus.jpg" },
  { title: "Crimson", media: "/images/spiral-3d-slider/crimson-profile.jpg" },
  { title: "Verde", media: "/images/spiral-3d-slider/green-portrait.jpg" },
  { title: "Coast", media: "/images/segmented-image-carousel/coastal-tree.jpg" },
  { title: "Ghost", media: "/images/spiral-3d-slider/ghosted-portrait.jpg" },
]

export default function Demo() {
  return (
    <div className="w-full">
      <CMSScrollGallery items={items} />
    </div>
  )
}`;

export async function CMSScrollGalleryDocs() {
  const sourceCode =
    (await readComponentSource("cms-scroll-gallery")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="CMS Scroll Gallery"
      description="Sticky fullscreen scroll gallery — a long scroll track pins one viewport while page scroll drives synchronized background media + centered title transitions, tracked by a draggable glass thumbnail dock."
      preview={
        <CMSScrollGalleryPreview
          src="/demo/cms-scroll-gallery"
          title="CMS Scroll Gallery Demo"
        />
      }
      previewCode={defaultCode}
      installPackageName="cms-scroll-gallery"
      installDependencies="framer-motion"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/cms-scroll-gallery.tsx"
      usageCode={defaultCode}
      fullWidthPreview={true}
      props={[
        {
          name: "items",
          type: "CMSScrollGalleryItem[]",
          description:
            "Gallery data. Each item needs title + media (image or video URL), optional mediaType ('auto' | 'image' | 'video') and alt. Works with any item count.",
        },
        {
          name: "scrollLengthPerItem",
          type: "number",
          default: "100",
          description:
            "Scroll distance per item in vh. 8 items × 100vh ≈ 800vh journey.",
        },
        {
          name: "transitionSmoothing",
          type: "number",
          default: "0.55",
          description: "Visual smoothing 0–1 applied on top of native scroll.",
        },
        {
          name: "transitionStyle",
          type: '"zoom-fade" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "blur-fade" | "scale-reveal"',
          default: '"zoom-fade"',
          description:
            "Scroll-driven transition preset. Zoom Fade matches the reference (opacity + scale 1.2→1).",
        },
        {
          name: "mediaScale",
          type: "number",
          default: "1.2",
          description: "Incoming media scale for zoom-based presets.",
        },
        {
          name: "textScale",
          type: "number",
          default: "1.2",
          description: "Incoming title scale, kept in sync with media.",
        },
        {
          name: "dockPosition",
          type: '"center" | "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "custom"',
          default: '"center"',
          description: "Floating thumbnail dock placement preset.",
        },
        {
          name: "orientation",
          type: '"vertical" | "horizontal"',
          default: '"vertical"',
          description: "Thumbnail rail direction.",
        },
        {
          name: "draggable",
          type: "boolean",
          default: "true",
          description:
            "Allow repositioning the dock via its handle. Dragging never changes gallery progress.",
        },
        {
          name: "showThumbnails",
          type: "boolean",
          default: "true",
          description: "Toggle the floating thumbnail rail.",
        },
      ]}
    />
  );
}
