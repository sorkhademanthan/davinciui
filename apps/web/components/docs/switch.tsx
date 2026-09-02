import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  SwitchPreview,
  SwitchDescriptionPreview,
  SwitchChoiceCardPreview,
  SwitchDisabledPreview,
  SwitchInvalidPreview,
  SwitchSizePreview,
  SwitchRtlPreview,
} from "@/components/docs/previews/switch-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Switch } from "@/components/ui/switch"`;
const defaultCode = `<Switch />`;

export async function SwitchDocs() {
  const sourceCode = (await readComponentSource("switch")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Switch"
      description="A control that allows the user to toggle between checked and not checked."
      preview={<SwitchPreview />}
      previewCode={defaultCode}
      installPackageName="switch"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/switch.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Description", preview: <SwitchDescriptionPreview />, code: `<Switch id="airplane" />\n<Label>Airplane mode</Label>` },
        { title: "Choice Card", preview: <SwitchChoiceCardPreview />, code: `<label className="border p-4 has-[button[data-state=checked]]:border-primary">\n  <Switch /> Choice Card\n</label>` },
        { title: "Disabled", preview: <SwitchDisabledPreview />, code: `<Switch disabled />` },
        { title: "Invalid", preview: <SwitchInvalidPreview />, code: `<Switch invalid />` },
        { title: "Size", preview: <SwitchSizePreview />, code: `<Switch size="sm" />\n<Switch />\n<Switch size="lg" />` },
        { title: "RTL", preview: <SwitchRtlPreview />, code: `<div dir="rtl">\n  <Switch />\n</div>` },
      ]}
      props={[
        { name: "checked", type: "boolean", description: "Checked state." },
        { name: "defaultChecked", type: "boolean", default: "false", description: "Default checked." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the switch." },
        { name: "invalid", type: "boolean", default: "false", description: "Marks as invalid." },
        { name: "size", type: '"default" | "sm" | "lg"', default: '"default"', description: "Size variant." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
