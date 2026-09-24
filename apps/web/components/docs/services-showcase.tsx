import { DocsPageLayout } from "@/components/docs-page-layout";
import { ServicesShowcasePreview } from "@/components/docs/previews/services-showcase-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { ServicesShowcase } from "@/components/ui/services-showcase"

const services = [
  {
    number: "01",
    title: "Brand identity",
    description: "Logos, systems and guidelines that give ambitious companies a distinctive voice.",
    images: [
      { src: "/images/brand-front.jpg", alt: "Brand identity front artwork" },
      { src: "/images/brand-mid.jpg", alt: "Brand identity middle layer" },
      { src: "/images/brand-rear.jpg", alt: "Brand identity rear layer" },
    ],
  },
  {
    number: "02",
    title: "Art direction & photography",
    description: "Editorial imagery and photoshoots with a cinematic sensibility.",
    images: [
      { src: "/images/photo-front.jpg", alt: "Editorial portrait" },
      { src: "/images/photo-mid.jpg", alt: "Studio portrait study" },
      { src: "/images/photo-rear.jpg", alt: "Glass reflection study" },
    ],
  },
]

export default function ServicesSection() {
  return <ServicesShowcase services={services} />
}`;

export async function ServicesShowcaseDocs() {
  const sourceCode =
    (await readComponentSource("services-showcase")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Services Showcase"
      description="A dark editorial services section — numbered rows with 1px dividers and layered image stacks with scroll-driven parallax, restrained hover spread, and fine-pointer micro-tilt. One container-query component adapts to card, side-panel, and fullscreen sizes."
      preview={<ServicesShowcasePreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="services-showcase"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/services-showcase.tsx"
      fullWidthPreview
      unstyledPreview
      scrollablePreview
      props={[
        {
          name: "services",
          type: "Service[]",
          description:
            "Service rows in order. Each service needs number, title, description, and images (src + alt per card layer).",
        },
        {
          name: "density",
          type: '"comfortable" | "compact"',
          default: '"comfortable"',
          description:
            "Compact compresses rows and hides descriptions for gallery-card sizes. Layout otherwise follows the container width automatically.",
        },
        {
          name: "interactive",
          type: "boolean",
          default: "true",
          description:
            "Enables hover spread and pointer micro-tilt on fine-pointer devices. Disabled automatically on touch and reduced-motion.",
        },
      ]}
    />
  );
}
