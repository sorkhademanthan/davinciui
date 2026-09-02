import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  RadioPreview,
  RadioDescriptionPreview,
  RadioChoiceCardPreview,
  RadioFieldsetPreview,
  RadioDisabledPreview,
  RadioInvalidPreview,
  RadioRtlPreview,
} from "@/components/docs/previews/radio-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { RadioGroup, Radio } from "@/components/ui/radio"`;
const defaultCode = `<RadioGroup>
  <Radio name="group" value="Option 1" />
  <Radio name="group" value="Option 2" />
</RadioGroup>`;

export async function RadioDocs() {
  const sourceCode = (await readComponentSource("radio")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Radio"
      description="A set of checkable buttons where only one can be checked at a time."
      preview={<RadioPreview />}
      previewCode={defaultCode}
      installPackageName="radio"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/radio.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-2 text-sm leading-6 text-muted-foreground">
          <p><strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">RadioGroup</code> wraps <code className="font-mono text-xs">Radio</code> items sharing the same <code className="font-mono text-xs">name</code>.</p>
        </div>
      }
      examples={[
        { title: "Composition", preview: <RadioPreview />, code: defaultCode },
        { title: "Description", preview: <RadioDescriptionPreview />, code: `<Radio value="With description" />\n<p>Description</p>` },
        { title: "Choice Card", preview: <RadioChoiceCardPreview />, code: `<label className="border p-3 has-[input:checked]:border-primary">\n  <input type="radio" /> Choice Card\n</label>` },
        { title: "Fieldset", preview: <RadioFieldsetPreview />, code: `<fieldset>\n  <legend>Fieldset</legend>\n  <RadioGroup>...</RadioGroup>\n</fieldset>` },
        { title: "Disabled", preview: <RadioDisabledPreview />, code: `<Radio disabled value="Disabled" />` },
        { title: "Invalid", preview: <RadioInvalidPreview />, code: `<Radio invalid value="Invalid" />` },
        { title: "RTL", preview: <RadioRtlPreview />, code: `<div dir="rtl">\n  <RadioGroup>...</RadioGroup>\n</div>` },
      ]}
      props={[
        { name: "RadioGroup", type: "Component", description: "Container with role radiogroup." },
        { name: "Radio", type: "Component", description: "Individual radio item." },
        { name: "name", type: "string", description: "Group name (shared across radios)." },
        { name: "value", type: "string", description: "Value of the radio." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the radio." },
        { name: "invalid", type: "boolean", default: "false", description: "Marks as invalid." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
