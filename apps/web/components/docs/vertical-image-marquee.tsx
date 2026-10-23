import { VerticalImageMarquee } from "@workspace/ui/components/vertical-image-marquee";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { VerticalImageMarqueePreview } from "@/components/docs/previews/vertical-image-marquee-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { VerticalImageMarquee } from "@/components/ui/vertical-image-marquee"

const portraits = [
  { src: "/images/portrait-01.jpg", alt: "Studio portrait in soft daylight" },
  { src: "/images/portrait-02.jpg", alt: "Portrait lit by red and cyan light" },
  { src: "/images/portrait-03.jpg", alt: "Monochrome editorial portrait" },
]

export default function Gallery() {
  return (
    <VerticalImageMarquee
      items={portraits}
      duration={15.2}
      gap={72}
      imageWidth="min(88%, 31rem)"
    />
  )
}`;

const marqueeItems = [
  {
    src: "/images/spiral-3d-slider/blue-double.jpg",
    alt: "Blue double exposure",
  },
  { src: "/images/spiral-3d-slider/red-echo.jpg", alt: "Red echo portrait" },
  {
    src: "/images/spiral-3d-slider/ghosted-portrait.jpg",
    alt: "Ghosted portrait",
  },
  { src: "/images/spiral-3d-slider/teal-echo.jpg", alt: "Teal echo portrait" },
  {
    src: "/images/spiral-3d-slider/white-motion.jpg",
    alt: "White motion study",
  },
];

export async function VerticalImageMarqueeDocs() {
  const sourceCode =
    (await readComponentSource("vertical-image-marquee")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Vertical Image Marquee"
      description="A seamless editorial portrait strip that rises through a clean light or dark canvas, with unrounded panels and quiet, generous gutters."
      preview={<VerticalImageMarqueePreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="vertical-image-marquee"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/vertical-image-marquee.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Slow, spacious strip",
          preview: (
            <div className="relative h-[480px] w-full overflow-hidden">
              <VerticalImageMarquee
                items={marqueeItems}
                duration={24}
                gap={24}
                aspectRatio="0.75"
              />
            </div>
          ),
          code: `import { VerticalImageMarquee } from "@/components/ui/vertical-image-marquee"

<div className="relative h-[480px] w-full overflow-hidden">
  <VerticalImageMarquee
    items={items}
    duration={24}
    gap={24}
    aspectRatio="0.75"
  />
</div>`,
        },
        {
          title: "Fast, narrow strip",
          preview: (
            <div className="relative h-[480px] w-full overflow-hidden">
              <VerticalImageMarquee
                items={marqueeItems}
                duration={9}
                gap={8}
                imageWidth="min(60%, 20rem)"
              />
            </div>
          ),
          code: `import { VerticalImageMarquee } from "@/components/ui/vertical-image-marquee"

<div className="relative h-[480px] w-full overflow-hidden">
  <VerticalImageMarquee
    items={items}
    duration={9}
    gap={8}
    imageWidth="min(60%, 20rem)"
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "items",
          type: "readonly VerticalImageMarqueeItem[]",
          description:
            "Portrait sources and their alt text, repeated into the seamless loop.",
        },
        {
          name: "duration",
          type: "number",
          default: "15.2",
          description:
            "Seconds for one full image sequence to travel through the stage.",
        },
        {
          name: "gap",
          type: "number",
          default: "72",
          description:
            "White or black gutter between consecutive panels, in pixels.",
        },
        {
          name: "imageWidth",
          type: "string",
          default: '"min(88%, 31rem)"',
          description: "CSS width used for every panel.",
        },
        {
          name: "aspectRatio",
          type: "string",
          default: '"0.61"',
          description: "Width divided by height for each portrait panel.",
        },
        {
          name: "pauseOnHover",
          type: "boolean",
          default: "false",
          description:
            "Pause the decorative loop while a pointer is over the stage.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the themed marquee stage.",
        },
      ]}
    />
  );
}
