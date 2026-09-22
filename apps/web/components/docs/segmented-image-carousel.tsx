import { DocsPageLayout } from "@/components/docs-page-layout";
import { SegmentedImageCarouselPreview } from "@/components/docs/previews/segmented-image-carousel-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { SegmentedImageCarousel } from "@/components/ui/segmented-image-carousel"

const slides = [
  {
    src: "/images/spiral-staircase.jpg",
    alt: "Sculptural concrete spiral staircase",
  },
  {
    src: "/images/coastal-tree.jpg",
    alt: "Wind-bent tree on a coastal dune",
  },
  {
    src: "/images/chrome-chair.jpg",
    alt: "Chrome chair casting a geometric shadow",
  },
]

<SegmentedImageCarousel
  slides={slides}
  rows={9}
  columns={2}
  interval={1500}
  transitionDuration={680}
  className="aspect-[4/5] w-full max-w-xl"
/>`;

export async function SegmentedImageCarouselDocs() {
  const sourceCode =
    (await readComponentSource("segmented-image-carousel")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Segmented Image Carousel"
      description="An autoplaying editorial image carousel that reconstructs each new frame through a staggered grid of monochrome slices."
      preview={<SegmentedImageCarouselPreview />}
      previewCode={defaultCode}
      installPackageName="segmented-image-carousel"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/segmented-image-carousel.tsx"
      usageCode={defaultCode}
      fullWidthPreview
      props={[
        {
          name: "slides",
          type: "readonly SegmentedImageSlide[]",
          description:
            "Image sources, alt text, and optional focal points shown in sequence.",
        },
        {
          name: "rows",
          type: "number",
          default: "9",
          description: "Number of horizontal slices in the transition grid.",
        },
        {
          name: "columns",
          type: "number",
          default: "2",
          description: "Number of vertical slices in the transition grid.",
        },
        {
          name: "interval",
          type: "number",
          default: "1500",
          description:
            "Milliseconds between the beginning of consecutive transitions.",
        },
        {
          name: "transitionDuration",
          type: "number",
          default: "680",
          description: "Milliseconds used by one segmented image handoff.",
        },
        {
          name: "autoPlay",
          type: "boolean",
          default: "true",
          description: "Automatically advances after the images are loaded.",
        },
        {
          name: "pauseOnHover",
          type: "boolean",
          default: "false",
          description:
            "Optionally pauses the next transition while the pointer is over the carousel.",
        },
        {
          name: "showGrid",
          type: "boolean",
          default: "true",
          description:
            "Keeps the faint editorial segment grid visible between transitions.",
        },
        {
          name: "ariaLabel",
          type: "string",
          default: '"Segmented image carousel"',
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
