import { DocsPageLayout } from "@/components/docs-page-layout";
import { PixelWipeCarouselPreview } from "@/components/docs/previews/pixel-wipe-carousel-preview";
import { readComponentSource } from "@/lib/source-code";

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

export async function PixelWipeCarouselDocs() {
  const sourceCode =
    (await readComponentSource("pixel-wipe-carousel")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Pixel Wipe Carousel"
      description="An autoplaying editorial image carousel that sweeps each new frame in from the right through a deliberately coarse, resolving pixel mosaic."
      preview={<PixelWipeCarouselPreview />}
      previewCode={defaultCode}
      installPackageName="pixel-wipe-carousel"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/pixel-wipe-carousel.tsx"
      usageCode={defaultCode}
      fullWidthPreview
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
