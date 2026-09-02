import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  TogglePreview,
  ToggleOutlinePreview,
  ToggleWithTextPreview,
  ToggleSizePreview,
  ToggleDisabledPreview,
  ToggleRtlPreview,
} from "@/components/docs/previews/toggle-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Toggle } from "@/components/ui/toggle"`;
const defaultCode = `<Toggle aria-label="Toggle">
  <Bold className="size-4" />
</Toggle>`;

export async function ToggleDocs() {
  const sourceCode = (await readComponentSource("toggle")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Toggle"
      description="A two-state button that can be either on or off."
      preview={<TogglePreview />}
      previewCode={defaultCode}
      installPackageName="toggle"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/toggle.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Outline", preview: <ToggleOutlinePreview />, code: `<Toggle variant="outline">\n  <Bold />\n</Toggle>` },
        { title: "With Text", preview: <ToggleWithTextPreview />, code: `<Toggle variant="outline">\n  <Bold /> Bold\n</Toggle>` },
        { title: "Size", preview: <ToggleSizePreview />, code: `<Toggle size="sm">Small</Toggle>\n<Toggle>Default</Toggle>\n<Toggle size="lg">Large</Toggle>` },
        { title: "Disabled", preview: <ToggleDisabledPreview />, code: `<Toggle disabled>\n  <Bold />\n</Toggle>` },
        { title: "RTL", preview: <ToggleRtlPreview />, code: `<div dir="rtl">\n  <Toggle><Bold /></Toggle>\n</div>` },
      ]}
      props={[
        { name: "variant", type: '"default" | "outline"', default: '"default"', description: "Visual variant." },
        { name: "size", type: '"default" | "sm" | "lg"', default: '"default"', description: "Size of the toggle." },
        { name: "pressed", type: "boolean", description: "Controlled pressed state." },
        { name: "defaultPressed", type: "boolean", default: "false", description: "Default pressed state." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the toggle." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
