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
      description="Native single-select rows with an animated dot, keyboard focus halo, and card composition — free screen-reader and form semantics included."
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
          <p><strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">RadioGroup</code> wraps <code className="font-mono text-xs">Radio</code> items sharing the same <code className="font-mono text-xs">name</code>. Native inputs give arrow-key navigation, screen-reader names, and form submission free — Tab to the group and every dot shows a focus halo.</p>
        </div>
      }
      examples={[
        { title: "Composition", preview: <RadioPreview />, code: defaultCode },
        { title: "Description", preview: <RadioDescriptionPreview />, code: `<Radio value="With description" />\n<p>Description</p>` },
        { title: "Choice Card", preview: <RadioChoiceCardPreview />, code: `<Radio name="plan" value="Hobby" className="rounded-xl border p-3.5 has-[input:checked]:border-primary has-[input:checked]:bg-primary/[0.04]">\n  <span>$0</span>\n</Radio>` },
        { title: "Fieldset", preview: <RadioFieldsetPreview />, code: `<fieldset>\n  <legend>Fieldset</legend>\n  <RadioGroup>...</RadioGroup>\n</fieldset>` },
        { title: "Disabled", preview: <RadioDisabledPreview />, code: `<Radio disabled value="Disabled" />` },
        { title: "Invalid", preview: <RadioInvalidPreview />, code: `<Radio invalid value="Invalid" />` },
        { title: "RTL", preview: <RadioRtlPreview />, code: `<div dir="rtl">\n  <RadioGroup>...</RadioGroup>\n</div>` },
      ]}
      props={[
        { name: "RadioGroup", type: "Component", description: "Container with role radiogroup." },
        { name: "Radio", type: "Component", description: "Label-wrapped native input. Value doubles as the label text; children append." },
        { name: "name", type: "string", description: "Group name (shared across radios)." },
        { name: "value", type: "string", description: "Value of the radio." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the radio." },
        { name: "invalid", type: "boolean", default: "false", description: "Marks as invalid." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
