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

export async function VerticalImageMarqueeDocs() {
  const sourceCode =
    (await readComponentSource("vertical-image-marquee")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
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
      props={[
        { name: "items", type: "readonly VerticalImageMarqueeItem[]", description: "Portrait sources and their alt text, repeated into the seamless loop." },
        { name: "duration", type: "number", default: "15.2", description: "Seconds for one full image sequence to travel through the stage." },
        { name: "gap", type: "number", default: "72", description: "White or black gutter between consecutive panels, in pixels." },
        { name: "imageWidth", type: "string", default: '"min(88%, 31rem)"', description: "CSS width used for every panel." },
        { name: "aspectRatio", type: "string", default: '"0.61"', description: "Width divided by height for each portrait panel." },
        { name: "pauseOnHover", type: "boolean", default: "false", description: "Pause the decorative loop while a pointer is over the stage." },
        { name: "className", type: "string", description: "Additional classes for the themed marquee stage." },
      ]}
    />
  );
}
