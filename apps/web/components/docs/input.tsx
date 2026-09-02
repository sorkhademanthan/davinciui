import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  InputPreview,
  InputFieldPreview,
  InputFieldGroupPreview,
  InputDisabledPreview,
  InputInvalidPreview,
  InputFilePreview,
  InputInlinePreview,
  InputGridPreview,
  InputRequiredPreview,
  InputBadgePreview,
  InputGroupPreview,
  InputButtonGroupPreview,
  InputFormPreview,
  InputRtlPreview,
} from "@/components/docs/previews/input-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Input } from "@/components/ui/input"`;
const defaultCode = `<Input placeholder="Enter text" />`;

export async function InputDocs() {
  const sourceCode = (await readComponentSource("input")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Input"
      description="A text input component with support for validation, grouping, and composition."
      preview={<InputPreview />}
      previewCode={defaultCode}
      installPackageName="input"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/input.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Composition", preview: <InputPreview />, code: defaultCode },
        { title: "Basic", preview: <InputPreview />, code: defaultCode },
        { title: "Field", preview: <InputFieldPreview />, code: `<Label>Field</Label>\n<Input placeholder="Field" />` },
        { title: "Field Group", preview: <InputFieldGroupPreview />, code: `<div className="space-y-4">\n  <Input placeholder="First" />\n  <Input placeholder="Last" />\n</div>` },
        { title: "Disabled", preview: <InputDisabledPreview />, code: `<Input disabled placeholder="Disabled" />` },
        { title: "Invalid", preview: <InputInvalidPreview />, code: `<Input aria-invalid placeholder="Invalid" />` },
        { title: "File", preview: <InputFilePreview />, code: `<Input type="file" />` },
        { title: "Inline", preview: <InputInlinePreview />, code: `<div className="flex gap-2">\n  <Input placeholder="Inline" />\n  <Button>Go</Button>\n</div>` },
        { title: "Grid", preview: <InputGridPreview />, code: `<div className="grid grid-cols-2 gap-4">\n  <Input /><Input />\n</div>` },
        { title: "Required", preview: <InputRequiredPreview />, code: `<Input required placeholder="Required" />` },
        { title: "Badge", preview: <InputBadgePreview />, code: `<div className="relative">\n  <Input />\n  <Badge>New</Badge>\n</div>` },
        { title: "Input Group", preview: <InputGroupPreview />, code: `<div className="flex">\n  <Input className="rounded-r-none" />\n  <Button className="rounded-l-none">Search</Button>\n</div>` },
        { title: "Button Group", preview: <InputButtonGroupPreview />, code: `<div className="inline-flex border">\n  <Button>A</Button>\n  <Input />\n  <Button>B</Button>\n</div>` },
        { title: "Form", preview: <InputFormPreview />, code: `<form>\n  <Input type="email" placeholder="email@example.com" />\n  <Button>Submit</Button>\n</form>` },
        { title: "RTL", preview: <InputRtlPreview />, code: `<div dir="rtl">\n  <Input placeholder="نص عربي" />\n</div>` },
      ]}
      props={[
        { name: "type", type: "string", default: '"text"', description: "Input type." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the input." },
        { name: "required", type: "boolean", default: "false", description: "Marks as required." },
        { name: "placeholder", type: "string", description: "Placeholder text." },
        { name: "className", type: "string", description: "Additional CSS classes." },
        { name: "size", type: '"sm" | "default" | "lg"', default: '"default"', description: "Size variant." },
      ]}
    />
  );
}
