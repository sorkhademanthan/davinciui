import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  LabelPreview,
  LabelDisabledPreview,
} from "@/components/docs/previews/label-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Label } from "@/components/ui/label"`;
const defaultCode = `<Label htmlFor="email">Email address</Label>`;

export async function LabelDocs() {
  const sourceCode =
    (await readComponentSource("label")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Label"
      description="Accessible form labels with proper control association and styling."
      preview={<LabelPreview />}
      previewCode={defaultCode}
      installPackageName="label"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/label.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Disabled", preview: <LabelDisabledPreview />, code: `<Label htmlFor="archived">Archived project</Label>` },
      ]}
      props={[
        { name: "htmlFor", type: "string", description: "Associates the label with a control id." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
