import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  SpinnerPreview,
  SpinnerCustomizationPreview,
  SpinnerSizePreview,
  SpinnerButtonPreview,
  SpinnerBadgePreview,
  SpinnerInputGroupPreview,
  SpinnerEmptyPreview,
  SpinnerRtlPreview,
} from "@/components/docs/previews/spinner-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Spinner } from "@/components/ui/spinner"`;
const defaultCode = `<Spinner />`;

export async function SpinnerDocs() {
  const sourceCode = (await readComponentSource("spinner")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Spinner"
      description="An indicator for loading state."
      preview={<SpinnerPreview />}
      previewCode={defaultCode}
      installPackageName="spinner"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/spinner.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Customization", preview: <SpinnerCustomizationPreview />, code: `<Spinner className="text-primary" />` },
        { title: "Size", preview: <SpinnerSizePreview />, code: `<Spinner size="sm" />\n<Spinner />\n<Spinner size="lg" />` },
        { title: "Button", preview: <SpinnerButtonPreview />, code: `<Button disabled>\n  <Spinner /> Loading\n</Button>` },
        { title: "Badge", preview: <SpinnerBadgePreview />, code: `<Badge>\n  <Spinner /> Badge\n</Badge>` },
        { title: "Input Group", preview: <SpinnerInputGroupPreview />, code: `<div className="relative">\n  <Input />\n  <Spinner className="absolute right-2" />\n</div>` },
        { title: "Empty", preview: <SpinnerEmptyPreview />, code: `<Spinner size="lg" />\n<p>Empty state</p>` },
        { title: "RTL", preview: <SpinnerRtlPreview />, code: `<div dir="rtl">\n  <Spinner />\n</div>` },
      ]}
      props={[
        { name: "size", type: '"sm" | "default" | "lg"', default: '"default"', description: "Size of the spinner." },
        { name: "className", type: "string", description: "Additional CSS classes (custom color)." },
      ]}
    />
  );
}
