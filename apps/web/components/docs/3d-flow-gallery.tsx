import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import {
  FlowGallery,
  FLOW_GALLERY_DEFAULT_IMAGES,
} from "@workspace/ui/components/3d-flow-gallery";

const defaultCode = `import { FlowGallery } from "@/components/ui/3d-flow-gallery"

export function Gallery() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-white">
      <FlowGallery className="h-full w-full" />
    </main>
  )
}`;

const usageCode = `"use client"

import { FlowGallery } from "@/components/ui/3d-flow-gallery"

const images = [
  "/images/gallery/photo-01.jpg",
  "/images/gallery/photo-02.jpg",
  "/images/gallery/photo-03.jpg",
  "/images/gallery/photo-04.jpg",
  "/images/gallery/photo-05.jpg",
  "/images/gallery/photo-06.jpg",
]

export default function Page() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-white">
      <FlowGallery
        images={images}
        autoSpeed={2}
        wheelSensitivity={0.02}
        dragSensitivity={0.05}
        ariaLabel="Featured portraits"
        className="h-full w-full"
      />
    </main>
  )
}`;

export async function FlowGalleryDocs() {
  const sourceCode =
    (await readComponentSource("3d-flow-gallery")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      fullWidthPreview
      title="3D Flow Gallery"
      description="An infinite tunnel built from image panels and a hairline grid. Wheel, drag, or auto-flow streams the rings toward the camera with no roll or horizon line. Light and dark themes are supported."
      preview={
        <FlowGallery
          images={FLOW_GALLERY_DEFAULT_IMAGES}
          className="h-full w-full"
          ariaLabel="3D flow gallery preview"
        />
      }
      previewCode={defaultCode}
      installPackageName="3d-flow-gallery"
      installDependencies="three clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/3d-flow-gallery.tsx"
      usageCode={usageCode}
      usageNote={
        <p className="text-sm leading-6 text-muted-foreground">
          {`Place the gallery in a full-viewport container. Panels cycle through the image list, so six photographs are enough to fill the default 32-ring loop. Wheel input is owned by the gallery while the pointer is over it; pass wheelSensitivity={0} for embedded previews that should let the page scroll. The tunnel follows the site theme by default; pass theme="light" or theme="dark" to pin it.`}
        </p>
      }
      props={[
        {
          name: "images",
          type: "string[]",
          description:
            "Image sources cycled through the filled slots. The default list uses six portraits.",
        },
        {
          name: "tunnelRadius",
          type: "number",
          default: "20",
          description: "Radius of the cylindrical tunnel wall in world units.",
        },
        {
          name: "ringCount",
          type: "number",
          default: "32",
          description:
            "Number of ring segments in the loop. Rounded up to an even number so the checkerboard stays aligned.",
        },
        {
          name: "ringSpacing",
          type: "number",
          default: "20",
          description:
            "Distance between adjacent rings along Z. Also sets the panel length.",
        },
        {
          name: "panelsPerRing",
          type: "number",
          default: "5",
          description:
            "Filled image panels per ring. The ring has twice as many 36° slots.",
        },
        {
          name: "fov",
          type: "number",
          default: "60",
          description: "Perspective camera field of view in degrees.",
        },
        {
          name: "autoSpeed",
          type: "number",
          default: "2",
          description:
            "Automatic flow toward the camera in world units per second. Disabled under prefers-reduced-motion.",
        },
        {
          name: "wheelSensitivity",
          type: "number",
          default: "0.02",
          description:
            "World units added per pixel of wheel delta. Set to 0 to let the page scroll.",
        },
        {
          name: "dragSensitivity",
          type: "number",
          default: "0.05",
          description:
            "World units removed per pixel of vertical drag. Release adds inertia.",
        },
        {
          name: "theme",
          type: '"light" | "dark" | "system"',
          default: '"system"',
          description:
            "Colour scheme for the tunnel. `system` follows the site's dark class or prefers-color-scheme.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"#ffffff" / "#080808"',
          description:
            "Scene and canvas clear colour. Defaults to the active theme background.",
        },
        {
          name: "gridColor",
          type: "string",
          default: '"#555555" / "#8a8a8a"',
          description:
            "Hairline grid colour, drawn at 90% opacity. Defaults to the active theme grid colour.",
        },
        {
          name: "borderRadius",
          type: "number",
          default: "12",
          description: "Corner radius of the clipping surface in pixels.",
        },
        {
          name: "ariaLabel",
          type: "string",
          default: '"3D flow gallery"',
          description: "Accessible name for the canvas host.",
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
