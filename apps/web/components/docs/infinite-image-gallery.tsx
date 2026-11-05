import { DocsPageLayout } from "@/components/docs-page-layout";
import { infiniteImageGalleryItems } from "@/components/docs/previews/infinite-image-gallery-items";
import { readComponentSource } from "@/lib/source-code";
import { InfiniteImageGallery } from "@workspace/ui/components/infinite-image-gallery";

const defaultCode = `import { InfiniteImageGallery } from "@/components/ui/infinite-image-gallery"

const images = [
  { src: "/images/gallery/red-portrait.jpg", alt: "Red portrait" },
  { src: "/images/gallery/blue-portrait.jpg", alt: "Blue portrait" },
  { src: "/images/gallery/green-portrait.jpg", alt: "Green portrait" },
]

<InfiniteImageGallery images={images} />`;

const usageCode = `"use client"

import {
  InfiniteImageGallery,
  type InfiniteImageGalleryImage,
} from "@/components/ui/infinite-image-gallery"

// Add your own files to public/images/gallery, or use remote image URLs.
const images: InfiniteImageGalleryImage[] = [
  { src: "/images/gallery/photo-01.jpg", alt: "Describe the first image" },
  { src: "/images/gallery/photo-02.jpg", alt: "Describe the second image" },
  { src: "/images/gallery/photo-03.jpg", alt: "Describe the third image" },
  { src: "/images/gallery/photo-04.jpg", alt: "Describe the fourth image" },
  { src: "https://example.com/photo-05.jpg", alt: "Remote images work too" },
]

export default function Gallery() {
  return (
    <InfiniteImageGallery
      images={images}
      speed={9}
      direction="left"
      autoplay
      className="h-[600px] w-full"
    />
  )
}`;

export async function InfiniteImageGalleryDocs() {
  const sourceCode =
    (await readComponentSource("infinite-image-gallery")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Infinite Image Gallery"
      description="A continuously rotating cylinder of images built entirely with CSS 3D transforms. Rows of rounded tiles share one curved surface, with adjustable speed, direction, radius, and density — and a static arrangement when reduced motion is requested."
      preview={
        <InfiniteImageGallery
          images={infiniteImageGalleryItems}
          className="h-full min-h-0"
          aria-label="Infinite editorial and architectural image gallery"
        />
      }
      previewCode={defaultCode}
      installPackageName="infinite-image-gallery"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/infinite-image-gallery.tsx"
      importCode={`"use client";

import {
  InfiniteImageGallery,
  type InfiniteImageGalleryImage,
} from "@/components/ui/infinite-image-gallery";`}
      usageCode={usageCode}
      usageNote={
        <p className="text-sm leading-6 text-muted-foreground">
          The gallery repeats your images around the cylinder automatically, so
          the loop never resets. Use portrait sources for the intended rhythm;
          wide images are cropped by the default{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
            imageFit=&quot;cover&quot;
          </code>{" "}
          treatment.
        </p>
      }
      fullWidthPreview
      examples={[
        {
          title: "Reverse and slower",
          preview: (
            <div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-[#f3f1ec] dark:bg-[#11100e]">
              <InfiniteImageGallery
                images={infiniteImageGalleryItems}
                direction="right"
                speed={5}
                radius={380}
                tilt={-4}
                className="h-full min-h-0"
                aria-label="Reverse rotating image gallery"
              />
            </div>
          ),
          code: `import { InfiniteImageGallery } from "@/components/ui/infinite-image-gallery"

<div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-[#f3f1ec] dark:bg-[#11100e]">
  <InfiniteImageGallery
    images={images}
    direction="right"
    speed={5}
    radius={380}
    tilt={-4}
    className="h-full"
  />
</div>`,
        },
        {
          title: "Tight two-row orbit",
          preview: (
            <div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-[#f3f1ec] dark:bg-[#11100e]">
              <InfiniteImageGallery
                images={infiniteImageGalleryItems.slice(4, 16)}
                rows={2}
                columns={24}
                radius={300}
                gap={10}
                speed={12}
                borderRadius={12}
                tilt={-10}
                className="h-full min-h-0"
                aria-label="Compact two-row image gallery"
              />
            </div>
          ),
          code: `import { InfiniteImageGallery } from "@/components/ui/infinite-image-gallery"

<div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-[#f3f1ec] dark:bg-[#11100e]">
  <InfiniteImageGallery
    images={images}
    rows={2}
    columns={24}
    radius={300}
    gap={10}
    speed={12}
    borderRadius={12}
    tilt={-10}
    className="h-full"
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "images",
          type: "InfiniteImageGalleryImage[]",
          description:
            "Images repeated around the cylinder. Each item has a src and optional alt.",
        },
        {
          name: "speed",
          type: "number",
          default: "9",
          description:
            "Rotation speed in degrees per second. The default completes one revolution in 40 seconds.",
        },
        {
          name: "direction",
          type: '"left" | "right"',
          default: '"left"',
          description:
            "Direction the tiles travel across the front of the cylinder.",
        },
        {
          name: "radius",
          type: "number",
          default: "auto",
          description:
            "Cylinder radius in pixels. Defaults to half the stage width so the curved surface fills the frame.",
        },
        {
          name: "perspective",
          type: "number",
          default: "auto",
          description:
            "CSS perspective distance in pixels. Defaults to 3.5 × radius for a pronounced but controlled curve.",
        },
        {
          name: "gap",
          type: "number",
          default: "auto",
          description:
            "Base gap between tiles in pixels. Defaults to 14% of the computed tile width.",
        },
        {
          name: "borderRadius",
          type: "number",
          default: "18",
          description: "Base corner radius applied to every tile.",
        },
        {
          name: "imageFit",
          type: 'React.CSSProperties["objectFit"]',
          default: '"cover"',
          description:
            "Object-fit treatment for the images. Cover preserves the tile rhythm; contain letterboxes them.",
        },
        {
          name: "autoplay",
          type: "boolean",
          default: "true",
          description:
            "Start the rotation automatically. Reduced motion, keyboard pause, and offscreen visibility still stop it.",
        },
        {
          name: "showControls",
          type: "boolean",
          default: "true",
          description:
            "Render the keyboard pause/play control. Disable it for decorative card previews or nested interactive surfaces.",
        },
        {
          name: "rows",
          type: "number",
          default: "3 or 5",
          description:
            "Number of rows wrapped around the cylinder, from 1 to 6. Tall portrait stages default to 5 rows to keep the wall dense.",
        },
        {
          name: "columns",
          type: "number",
          default: "auto",
          description:
            "Number of columns around the cylinder. Derived from radius and tile width by default.",
        },
        {
          name: "tilt",
          type: "number",
          default: "-8",
          description:
            "Camera tilt in degrees. Negative values raise the far edge of the cylinder.",
        },
        {
          name: "aria-label",
          type: "string",
          default: '"Infinite 3D image gallery"',
          description: "Accessible name for the gallery region.",
        },
        {
          name: "className",
          type: "string",
          description:
            "Additional classes for the root. Give the gallery a height context or use the built-in minimum.",
        },
      ]}
    />
  );
}
