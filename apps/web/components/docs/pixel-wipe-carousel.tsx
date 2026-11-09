import {PixelWipeCarousel} from "@workspace/ui/components/pixel-wipe-carousel";

import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import {PixelWipeCarouselPlayground, PixelWipeCarouselPersonalizePanel} from "@/components/docs/previews/visual-effects-playgrounds";

const defaultCode = `import { PixelWipeCarousel } from "@/components/ui/pixel-wipe-carousel"

const slides = [
  { src: "/images/gallery/android.jpg", alt: "Glossy android portrait" },
  { src: "/images/gallery/architecture.jpg", alt: "Building in a forest" },
  { src: "/images/gallery/editorial.jpg", alt: "Editorial fashion portrait" },
]

<PixelWipeCarousel
  slides={slides}
  label="ACME"
  caption="for SYSTEM MAGAZINE"
  className="aspect-[4/5] w-full max-w-xl"
/>`;

const pixelSlides = [
  { src: "/images/spiral-3d-slider/dark-glitch.jpg", alt: "Dark glitch study" },
  { src: "/images/spiral-3d-slider/visor-portrait.jpg", alt: "Visor portrait" },
  {
    src: "/images/spiral-3d-slider/white-motion.jpg",
    alt: "White motion study",
  },
  {
    src: "/images/spiral-3d-slider/camera-reflection.jpg",
    alt: "Camera reflection",
  },
];

export async function PixelWipeCarouselDocs() {
  const sourceCode =
    (await readComponentSource("pixel-wipe-carousel")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Pixel Wipe Carousel"
      description="An autoplaying editorial image carousel that sweeps each new frame in from the right through a deliberately coarse, resolving pixel mosaic."
      preview={<PixelWipeCarouselPlayground />}
      personalizeContent={<PixelWipeCarouselPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="pixel-wipe-carousel"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/pixel-wipe-carousel.tsx"
      usageCode={defaultCode}
      fullWidthPreview
      examples={[
        {
          title: "Coarse mosaic, longer hold",
          preview: (
            <div className="flex min-h-[440px] items-center justify-center px-6">
              <PixelWipeCarousel
                slides={pixelSlides}
                label="STUDIO"
                caption="Spring 2026"
                pixelSize={90}
                interval={2200}
                className="aspect-[4/5] w-full max-w-sm"
              />
            </div>
          ),
          code: `import { PixelWipeCarousel } from "@/components/ui/pixel-wipe-carousel"

<PixelWipeCarousel
  slides={slides}
  label="STUDIO"
  caption="Spring 2026"
  pixelSize={90}
  interval={2200}
  className="aspect-[4/5] w-full max-w-sm"
/>`,
        },
        {
          title: "Fine mosaic, slower wipe",
          preview: (
            <div className="flex min-h-[440px] items-center justify-center px-6">
              <PixelWipeCarousel
                slides={pixelSlides}
                label="ARCHIVE"
                caption="Contact sheet"
                pixelSize={28}
                transitionDuration={900}
                className="aspect-[4/5] w-full max-w-sm"
              />
            </div>
          ),
          code: `import { PixelWipeCarousel } from "@/components/ui/pixel-wipe-carousel"

<PixelWipeCarousel
  slides={slides}
  label="ARCHIVE"
  caption="Contact sheet"
  pixelSize={28}
  transitionDuration={900}
  className="aspect-[4/5] w-full max-w-sm"
/>`,
        },
      ]}
      props={[
        {
          name: "slides",
          type: "PixelWipeSlide[]",
          description:
            "Image URLs and accessible descriptions shown in sequence.",
        },
        {
          name: "interval",
          type: "number",
          default: "1600",
          description: "Milliseconds between the start of consecutive wipes.",
        },
        {
          name: "transitionDuration",
          type: "number",
          default: "800",
          description: "Milliseconds used by the moving mosaic wipe.",
        },
        {
          name: "pixelSize",
          type: "number",
          default: "34",
          description: "Largest mosaic cell at the transition midpoint.",
        },
        {
          name: "autoPlay",
          type: "boolean",
          default: "true",
          description: "Automatically advances once the images are loaded.",
        },
        {
          name: "pauseOnHover",
          type: "boolean",
          default: "false",
          description: "Pauses the next automatic wipe while hovered.",
        },
        {
          name: "label / caption",
          type: "ReactNode",
          default: '"ACME" / "for SYSTEM MAGAZINE"',
          description:
            "Two compact editorial lines fixed over the lower-left corner.",
        },
        {
          name: "overlay",
          type: "ReactNode",
          description: "Optional custom content placed above the canvas.",
        },
        {
          name: "ariaLabel",
          type: "string",
          default: '"Pixel wipe image carousel"',
          description: "Accessible name for the carousel region.",
        },
        {
          name: "className",
          type: "string",
          description:
            "Controls the carousel dimensions and surrounding surface.",
        },
      ]}
    />
  );
}
