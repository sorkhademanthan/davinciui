import {DocsPageLayout} from "@/components/docs-page-layout";
import {readComponentSource} from "@/lib/source-code";
import { SpiralMediaGalleryPlayground, SpiralMediaGalleryPersonalizePanel } from "@/components/docs/previews/playgrounds/spiral-media-gallery";


const defaultCode = `import { SpiralMediaGallery } from "@/components/ui/spiral-media-gallery"

const images = [
  "/images/gallery/photo-01.jpg",
  "/images/gallery/photo-02.jpg",
  "/images/gallery/photo-03.jpg",
  "/images/gallery/photo-04.jpg",
  "/images/gallery/photo-05.jpg",
]

export function Gallery() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <SpiralMediaGallery images={images} />
    </div>
  )
}`;

const usageCode = `"use client"

import { SpiralMediaGallery } from "@/components/ui/spiral-media-gallery"

const images = [
  "/images/gallery/photo-01.jpg",
  "/images/gallery/photo-02.jpg",
  "/images/gallery/photo-03.jpg",
  "/images/gallery/photo-04.jpg",
  "/images/gallery/photo-05.jpg",
]

export default function Page() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      <SpiralMediaGallery
        images={images}
        autoRotate
        autoRotateSpeed={0.08}
        ariaLabel="Featured portraits"
      />
    </main>
  )
}`;

export async function SpiralMediaGalleryDocs() {
  const sourceCode =
    (await readComponentSource("spiral-media-gallery")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      fullWidthPreview
      title="Spiral Media Gallery"
      description="A 3D vertical helix of media cards. The helix spins forever by drag, wheel, or arrow keys, with depth-based scale, opacity, and z-index written straight to the DOM from one requestAnimationFrame loop."
      preview={<SpiralMediaGalleryPlayground />}
      personalizeContent={<SpiralMediaGalleryPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="spiral-media-gallery"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/spiral-media-gallery.tsx"
      usageCode={usageCode}
      usageNote={
        <p className="text-sm leading-6 text-muted-foreground">
          Wrap the gallery in a positioned container with height, or place it
          directly in a full-viewport page. Images repeat automatically, so five
          photographs are enough to fill the whole helix.
        </p>
      }
      props={[
        {
          name: "images",
          type: "string[]",
          description:
            "Image sources arranged around the helix. Cards repeat the list automatically; five images fill the default 25-card spiral.",
        },
        {
          name: "cardCount",
          type: "number",
          default: "25",
          description:
            "Number of cards in the helix. The angle step is 360 divided by this value.",
        },
        {
          name: "cardWidth",
          type: "number",
          default: "220",
          description: "Card width in pixels.",
        },
        {
          name: "cardHeight",
          type: "number",
          default: "140",
          description: "Card height in pixels.",
        },
        {
          name: "borderRadius",
          type: "number",
          default: "16",
          description: "Card corner radius in pixels.",
        },
        {
          name: "cylinderRadius",
          type: "number",
          default: "230",
          description: "Horizontal radius of the helix cylinder in pixels.",
        },
        {
          name: "verticalSpacing",
          type: "number",
          default: "40",
          description:
            "Vertical distance between neighbouring cards. The full revolution pitch is verticalSpacing × cardCount.",
        },
        {
          name: "perspective",
          type: "number",
          default: "1000",
          description: "CSS perspective applied to the stage in pixels.",
        },
        {
          name: "minScale",
          type: "number",
          default: "0.45",
          description: "Scale applied to the card at the back of the cylinder.",
        },
        {
          name: "minOpacity",
          type: "number",
          default: "0.12",
          description:
            "Opacity applied to the card at the back of the cylinder.",
        },
        {
          name: "autoRotate",
          type: "boolean",
          default: "true",
          description:
            "Advances the helix while idle. Automatically disabled under prefers-reduced-motion.",
        },
        {
          name: "autoRotateSpeed",
          type: "number",
          default: "0.08",
          description: "Automatic movement in degrees per frame at 60fps.",
        },
        {
          name: "dragFriction",
          type: "number",
          default: "0.94",
          description: "Per-frame velocity decay after a drag or wheel spin.",
        },
        {
          name: "wheelSpeed",
          type: "number",
          default: "0.08",
          description: "Multiplier applied to wheel input.",
        },
        {
          name: "showNumbers",
          type: "boolean",
          default: "false",
          description: "Shows a small index label in each card corner.",
        },
        {
          name: "background",
          type: "string",
          default: "theme surface",
          description:
            "Overrides the theme-aware stage background. Leave unset to follow light and dark mode.",
        },
        {
          name: "ariaLabel",
          type: "string",
          default: '"Spiral media gallery"',
          description: "Accessible name for the gallery region.",
        },
        {
          name: "imageAlts",
          type: "string[]",
          description:
            "Optional alternative text announced through a screen-reader-only list. The visual stage itself is hidden from assistive technology.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the root stage.",
        },
      ]}
    />
  );
}
