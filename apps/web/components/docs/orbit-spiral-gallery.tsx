import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import {
  OrbitSpiralGalleryPlayground,
  OrbitSpiralGalleryPersonalizePanel,
} from "@/components/docs/previews/premium-playgrounds";

const defaultCode = `import { OrbitSpiralGallery } from "@/components/ui/orbit-spiral-gallery"

const slides = [
  { src: "/images/spiral-3d-slider/red-echo.webp", alt: "Red fashion portrait swept through a long exposure" },
  { src: "/images/spiral-3d-slider/blue-profile.webp", alt: "Profile illuminated by vivid blue motion trails" },
  { src: "/images/spiral-3d-slider/ghosted-portrait.webp", alt: "Portrait fragmented by layered horizontal motion" },
  { src: "/images/spiral-3d-slider/teal-echo.webp", alt: "Teal portrait captured with an expressive camera blur" },
]

<OrbitSpiralGallery items={slides} />`;

const usageCode = `"use client"

import {
  OrbitSpiralGallery,
  type OrbitSpiralSlide,
} from "@/components/ui/orbit-spiral-gallery"

const slides: OrbitSpiralSlide[] = [
  { src: "/images/spiral-3d-slider/red-echo.webp", alt: "Red fashion portrait swept through a long exposure" },
  { src: "/images/spiral-3d-slider/blue-profile.webp", alt: "Profile illuminated by vivid blue motion trails" },
  { src: "/images/spiral-3d-slider/ghosted-portrait.webp", alt: "Portrait fragmented by layered horizontal motion" },
  { src: "/images/spiral-3d-slider/teal-echo.webp", alt: "Teal portrait captured with an expressive camera blur" },
  { src: "/images/spiral-3d-slider/camera-reflection.webp", alt: "Monochrome photographer reflected through moving glass" },
  { src: "/images/spiral-3d-slider/orange-haze.webp", alt: "Warm portrait dissolving through a soft orange exposure" },
]

export default function Gallery() {
  return (
    <OrbitSpiralGallery
      items={slides}
      autoRotate
      rotationSpeed={0.22}
      scrollSensitivity={0.0022}
      dragEnabled
      swipeEnabled
      className="h-[720px]"
    />
  )
}`;

export async function OrbitSpiralGalleryDocs() {
  const sourceCode =
    (await readComponentSource("orbit-spiral-gallery")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Orbit Spiral Gallery"
      description="A cinematic 3D image spiral with continuous rotation, scroll control, drag and swipe interaction, and subtle panel curvature."
      preview={<OrbitSpiralGalleryPlayground />}
      personalizeContent={<OrbitSpiralGalleryPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="orbit-spiral-gallery"
      installDependencies="@react-three/fiber three"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/orbit-spiral-gallery.tsx"
      usageCode={usageCode}
      usageNote={
        <p className="text-sm leading-6 text-muted-foreground">
          Replace the example paths with your own local files or remote image
          URLs. Every image should include meaningful alternative text.
        </p>
      }
      fullWidthPreview
      props={[
        { name: "items / images", type: "OrbitSpiralSlide[]", description: "Images arranged along the 3D spiral." },
        { name: "radius", type: "number", default: "2.85", description: "Horizontal radius of the spiral." },
        { name: "verticalSpacing", type: "number", default: "0.62", description: "Vertical pitch between neighboring panels." },
        { name: "panelWidth", type: "number", default: "3.35", description: "Width of each image panel in world units." },
        { name: "panelHeight", type: "number", default: "2.25", description: "Height of each image panel in world units." },
        { name: "panelCurvature", type: "number", default: "0.35", description: "Subtle curvature applied to panel geometry." },
        { name: "perspective", type: "number", default: "42", description: "Perspective camera field of view in degrees." },
        { name: "cameraDistance", type: "number", default: "9.5", description: "Camera distance from the spiral center." },
        { name: "autoRotate", type: "boolean", default: "true", description: "Automatically advances the spiral while idle." },
        { name: "rotationSpeed", type: "number", default: "0.22", description: "Automatic movement in slides per second." },
        { name: "direction", type: '"clockwise" | "counterclockwise"', default: '"clockwise"', description: "Auto-rotation direction." },
        { name: "scrollSensitivity", type: "number", default: "0.0022", description: "Wheel/scroll movement sensitivity." },
        { name: "dragEnabled", type: "boolean", default: "true", description: "Enables mouse drag rotation." },
        { name: "swipeEnabled", type: "boolean", default: "true", description: "Enables touch swipe rotation." },
        { name: "smoothing", type: "number", default: "0.075", description: "Interpolation strength for motion easing." },
        { name: "ariaLabel", type: "string", default: '"Spiral image gallery"', description: "Accessible name for the gallery region." },
        { name: "className", type: "string", description: "Additional classes for the stage." },
      ]}
    />
  );
}
