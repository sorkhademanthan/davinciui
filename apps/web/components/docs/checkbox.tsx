import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  CheckboxPreview,
  CheckboxCheckedPreview,
  CheckboxInvalidPreview,
  CheckboxDescriptionPreview,
  CheckboxDisabledPreview,
  CheckboxGroupPreview,
  CheckboxTablePreview,
  CheckboxRtlPreview,
} from "@/components/docs/previews/checkbox-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox"`;
const defaultCode = `<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>`;

export async function CheckboxDocs() {
  const sourceCode = (await readComponentSource("checkbox")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Checkbox"
      description="A control that allows the user to toggle between checked and not checked."
      preview={<CheckboxPreview />}
      previewCode={defaultCode}
      installPackageName="checkbox"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/checkbox.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Checked State", preview: <CheckboxCheckedPreview />, code: `<Checkbox defaultChecked />` },
        { title: "Invalid State", preview: <CheckboxInvalidPreview />, code: `<Checkbox invalid />` },
        { title: "Basic", preview: <CheckboxPreview />, code: defaultCode },
        { title: "Description", preview: <CheckboxDescriptionPreview />, code: `<Checkbox id="check" />\n<Label>With description</Label>\n<p>Description</p>` },
        { title: "Disabled", preview: <CheckboxDisabledPreview />, code: `<Checkbox disabled />` },
        { title: "Group", preview: <CheckboxGroupPreview />, code: `<CheckboxGroup>\n  <Checkbox />\n  <Checkbox />\n</CheckboxGroup>` },
        { title: "Table", preview: <CheckboxTablePreview />, code: `<table>\n  <Checkbox />\n</table>` },
        { title: "RTL", preview: <CheckboxRtlPreview />, code: `<div dir="rtl">\n  <Checkbox />\n</div>` },
      ]}
      props={[
        { name: "checked", type: "boolean", description: "Checked state." },
        { name: "defaultChecked", type: "boolean", default: "false", description: "Default checked." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the checkbox." },
        { name: "invalid", type: "boolean", default: "false", description: "Marks as invalid." },
        { name: "CheckboxGroup", type: "Component", description: "Container for grouped checkboxes." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
