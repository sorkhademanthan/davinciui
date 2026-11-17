import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import {
  CircularGallery,
  type CircularGalleryItem,
} from "@workspace/ui/components/circular-gallery";

const items: CircularGalleryItem[] = [
  {
    src: "/images/spiral-3d-slider/orange-haze.webp",
    alt: "Soft orange floral haze in macro focus",
  },
  {
    src: "/images/spiral-3d-slider/red-blue-figure.webp",
    alt: "Figure lit in red against a deep blue sky",
  },
  {
    src: "/images/spiral-3d-slider/silver-motion.webp",
    alt: "Extreme close-up of a face in silver light",
  },
  {
    src: "/images/spiral-3d-slider/white-motion.webp",
    alt: "Figure in a white top caught in studio motion",
  },
  {
    src: "/images/spiral-3d-slider/blue-motion.webp",
    alt: "Glossy blue abstract form on a pale background",
  },
  {
    src: "/images/spiral-3d-slider/prism-portrait.webp",
    alt: "Portrait washed in a blue-to-pink prism gradient",
  },
  {
    src: "/images/spiral-3d-slider/green-portrait.webp",
    alt: "Dark green field crossed by a diagonal light beam",
  },
  {
    src: "/images/spiral-3d-slider/red-echo.webp",
    alt: "Close-up of red knitted fabric on a warm background",
  },
];

const defaultCode = `import { CircularGallery } from "@/components/ui/circular-gallery"

const items = [
  { src: "/images/gallery/photo-01.jpg", alt: "Describe the first panel" },
  { src: "/images/gallery/photo-02.jpg", alt: "Describe the second panel" },
]

<CircularGallery items={items} />`;

const usageCode = `"use client"

import {
  CircularGallery,
  type CircularGalleryItem,
} from "@/components/ui/circular-gallery"

// Add your own files to public/images/gallery, or use remote media URLs.
const items: CircularGalleryItem[] = [
  { src: "/images/gallery/photo-01.jpg", alt: "Describe the first panel" },
  { src: "/images/gallery/photo-02.jpg", alt: "Describe the second panel" },
  { src: "/images/gallery/photo-03.jpg", alt: "Describe the third panel" },
  {
    src: "/images/gallery/clip.mp4",
    type: "video",
    alt: "A looping video panel",
  },
]

export default function Gallery() {
  return (
    <CircularGallery
      items={items}
      className="h-[720px]"
      autoSpin
      spinSpeed={9}
      dragRotation
      wheelRotation
    />
  )
}`;

export async function CircularGalleryDocs() {
  const sourceCode =
    (await readComponentSource("circular-gallery")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Circular Gallery"
      description="A cinematic 3D carousel of curved media panels orbiting on a themed stage, with drag, momentum, wheel, and click-through."
      preview={
        <CircularGallery
          items={items}
          className="h-full min-h-0"
          ariaLabel="CMS circular gallery"
        />
      }
      previewCode={defaultCode}
      installPackageName="circular-gallery"
      installDependencies="three clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/circular-gallery.tsx"
      usageCode={usageCode}
      usageNote={
        <p className="text-sm leading-6 text-muted-foreground">
          Panels support images or muted, looping video. Add an optional{" "}
          <code>href</code> to make a panel a link. Every item should include
          meaningful alternative text.
        </p>
      }
      examples={[
        {
          title: "Reflected stage",
          preview: (
            <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-background">
              <CircularGallery
                items={items.slice(0, 8)}
                reflection
                className="h-full"
              />
            </div>
          ),
          code: `import { CircularGallery } from "@/components/ui/circular-gallery"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-background">
  <CircularGallery items={items} reflection className="h-full" />
</div>`,
        },
        {
          title: "Slow, deep orbit",
          preview: (
            <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-background">
              <CircularGallery
                items={items.slice(0, 6)}
                spinSpeed={4}
                panelHeight={1.7}
                className="h-full"
              />
            </div>
          ),
          code: `import { CircularGallery } from "@/components/ui/circular-gallery"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-background">
  <CircularGallery
    items={items}
    spinSpeed={4}
    panelHeight={1.7}
    className="h-full"
  />
</div>`,
        },
      ]}
      fullWidthPreview
      props={[
        {
          name: "items",
          type: "CircularGalleryItem[]",
          description: "Images or videos arranged around the ring.",
        },
        {
          name: "panelWidth",
          type: "number",
          default: "0.92",
          description: "Angular fill of each 360 / N slot.",
        },
        {
          name: "panelHeight",
          type: "number",
          default: "1.45",
          description: "Panel height relative to the orbit radius.",
        },
        {
          name: "cornerRadius",
          type: "number",
          default: "0",
          description: "Rounded-corner radius relative to the panel height.",
        },
        {
          name: "orbitRadius",
          type: "number",
          default: "1",
          description: "Ring radius in world units.",
        },
        {
          name: "perspective",
          type: "{ fov?: number; distance?: number } | number",
          default: "{ fov: 20.4, distance: 5.5 }",
          description: "Vertical field of view and camera distance.",
        },
        {
          name: "viewOffset",
          type: "number",
          default: "0",
          description: "Vertical offset of the ring.",
        },
        {
          name: "ringTilt",
          type: "number",
          default: "0",
          description: "Ring tilt around the view axis in degrees.",
        },
        {
          name: "depthShading",
          type: "boolean",
          default: "true",
          description: "Darken panels based on distance from the camera.",
        },
        {
          name: "shadeStrength",
          type: "number",
          default: "0.4",
          description: "Maximum darkening applied to the far side.",
        },
        {
          name: "reflection",
          type: "boolean",
          default: "false",
          description: "Render a faded mirror of the ring beneath it.",
        },
        {
          name: "reflectionOpacity",
          type: "number",
          default: "0.25",
          description: "Opacity of the reflection.",
        },
        {
          name: "autoSpin",
          type: "boolean",
          default: "true",
          description: "Rotate the ring while idle.",
        },
        {
          name: "spinSpeed",
          type: "number",
          default: "9",
          description: "Idle rotation speed in degrees per second.",
        },
        {
          name: "pauseOnHover",
          type: "boolean",
          default: "false",
          description: "Pause idle rotation while a panel is hovered.",
        },
        {
          name: "motionSmoothing",
          type: "number",
          default: "8",
          description: "Motion smoothing constant. Higher is snappier.",
        },
        {
          name: "dragRotation",
          type: "boolean",
          default: "true",
          description: "Allow the ring to be dragged.",
        },
        {
          name: "dragMultiplier",
          type: "number",
          default: "1",
          description: "Multiplier applied to drag movement.",
        },
        {
          name: "releaseMomentum",
          type: "boolean | number",
          default: "true",
          description: "Toggle or scale release momentum.",
        },
        {
          name: "alignment",
          type: '"center" | "left" | "right"',
          default: '"center"',
          description: "Horizontal alignment of the ring.",
        },
        {
          name: "wheelRotation",
          type: "boolean",
          default: "true",
          description: "Allow rotation with the mouse wheel / trackpad.",
        },
        {
          name: "interactive",
          type: "boolean",
          default: "true",
          description: "Enable drag, wheel, hover, and link interactions.",
        },
        {
          name: "ariaLabel",
          type: "string",
          default: '"Circular image gallery"',
          description: "Accessible name for the gallery region.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the stage.",
        },
      ]}
    />
  );
}
