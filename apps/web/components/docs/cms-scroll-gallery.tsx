import React from "react";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import { CMSScrollGalleryPreview } from "@/components/docs/previews/cms-scroll-gallery-preview";

const defaultCode = `import { CMSScrollGallery } from "@/components/ui/cms-scroll-gallery"

const items = [
  { title: "Aurora", media: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=85" },
  { title: "Kyoto", media: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=85" },
  { title: "Tide", media: "https://assets.mixkit.co/videos/44370/44370-720.mp4", mediaType: "video" },
  { title: "Dunes", media: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1920&q=85" },
  { title: "Neon", media: "https://assets.mixkit.co/videos/4332/4332-720.mp4", mediaType: "video" },
  { title: "Santorini", media: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=85" },
  { title: "Mist", media: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=85" },
  { title: "Muse", media: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1920&q=85" },
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
