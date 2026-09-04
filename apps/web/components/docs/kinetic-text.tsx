import { DocsPageLayout } from "@/components/docs-page-layout";
import { LiveCodeBlock } from "@/components/live-code-block";
import { KineticTextPersonalizePanel, KineticTextPlayground } from "@/components/docs/previews/kinetic-text-preview";
import { readComponentSource } from "@/lib/source-code";

const basicCode = `import { KineticText } from "@/components/ui/kinetic-text"

<KineticText text="GSAP TEXT" />`;

export async function KineticTextDocs() {
  const sourceCode = (await readComponentSource("kinetic-text")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Kinetic Text"
      description="A compact kinetic typography composition where overlapping text clones move continuously around a stable central anchor, creating a layered slicing effect."
      preview={<KineticTextPlayground />}
      personalizeContent={<KineticTextPersonalizePanel />}
      previewCode={basicCode}
      installPackageName="kinetic-text"
      installDependencies="gsap"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/kinetic-text.tsx"
      usageCode={<LiveCodeBlock defaultCode={basicCode} />}
      props={[
        { name: "text", type: "string", description: "Text to render. Supports \\n for line breaks.", default: '"GSAP TEXT"' },
        { name: "sliceCount", type: "number", default: "20", description: "Number of overlapping clone layers. Clamped 3–32." },
        { name: "duration", type: "number", default: "2", description: "Full loop duration in seconds." },
        { name: "delay", type: "number", default: "0", description: "Delay before first loop in seconds." },
        { name: "amplitude", type: "number", default: "150", description: "Vertical travel range in pixels (±distance around center)." },
        { name: "loop", type: "boolean", default: "true", description: "Loop continuously." },
        { name: "autoplay", type: "boolean", default: "true", description: "Start automatically." },
        { name: "className", type: "string", description: "Layout classes for the outer container." },
        { name: "containerClassName", type: "string", description: "Extra classes applied to the outer container." },
      ]}
    />
  );
}