import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AspectRatioPreview,
  AspectRatioSquarePreview,
  AspectRatioPortraitPreview,
  AspectRatioRtlPreview,
} from "@/components/docs/previews/aspect-ratio-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { AspectRatio } from "@/components/ui/aspect-ratio"`;
const defaultCode = `<AspectRatio ratio={16 / 9}>
  <img src="..." alt="Image" className="h-full w-full object-cover" />
</AspectRatio>`;

export async function AspectRatioDocs() {
  const sourceCode = (await readComponentSource("aspect-ratio")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Aspect Ratio"
      description="Displays content within a desired ratio."
      preview={<AspectRatioPreview />}
      previewCode={defaultCode}
      installPackageName="aspect-ratio"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/aspect-ratio.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Square", preview: <AspectRatioSquarePreview />, code: `<AspectRatio ratio={1}>\n  <img src="..." />\n</AspectRatio>` },
        { title: "Portrait", preview: <AspectRatioPortraitPreview />, code: `<AspectRatio ratio={3 / 4}>\n  <img src="..." />\n</AspectRatio>` },
        { title: "RTL", preview: <AspectRatioRtlPreview />, code: `<div dir="rtl">\n  <AspectRatio ratio={16 / 9}>\n    <img src="..." />\n  </AspectRatio>\n</div>` },
      ]}
      props={[
        { name: "ratio", type: "number", default: "1", description: "Desired ratio (width / height)." },
        { name: "AspectRatio", type: "Component", description: "Container that maintains aspect ratio." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
