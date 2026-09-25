import { DocsPageLayout } from "@/components/docs-page-layout";
import { ServicesShowcasePreview } from "@/components/docs/previews/services-showcase-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { ServicesShowcase } from "@/components/ui/services-showcase"

const images = [
  {
    src: "/images/brand-front.jpg",
    alt: "Brand identity front artwork",
  },
  {
    src: "/images/brand-mid.jpg",
    alt: "Brand identity middle layer",
  },
  {
    src: "/images/brand-rear.jpg",
    alt: "Brand identity rear layer",
  },
]

export default function ServicesSection() {
  return <ServicesShowcase images={images} />
}`;

export async function ServicesShowcaseDocs() {
  const sourceCode =
    (await readComponentSource("services-showcase")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Services Showcase"
      description="A single theme-aware image stack that unfolds from a compact pile into three portrait cards with a smooth, full-card perspective response."
      preview={<ServicesShowcasePreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="services-showcase"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/services-showcase.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "images",
          type: "ServiceImage[]",
          description:
            "The image layers in front-to-back order. Each image needs src and alt.",
        },
        {
          name: "density",
          type: '"comfortable" | "compact"',
          default: '"comfortable"',
          description:
            "Compact uses the same centered stack at gallery-card size. Layout otherwise follows the container width automatically.",
        },
        {
          name: "interactive",
          type: "boolean",
          default: "true",
          description:
            "Enables the hover unfold and full-card pointer perspective on fine-pointer devices. Disabled automatically on touch and reduced-motion.",
        },
        {
          name: "autoPlay",
          type: "boolean",
          default: "false",
          description:
            "Runs the compact-to-open loop automatically. Useful for display-only previews.",
        },
      ]}
    />
  );
}
