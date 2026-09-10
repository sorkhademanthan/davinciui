import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  InputPreview,
  InputFieldPreview,
  InputFieldGroupPreview,
  InputVariantsPreview,
  InputSizesPreview,
  InputSearchPreview,
  InputPasswordPreview,
  InputClearablePreview,
  InputLoadingPreview,
  InputTypesPreview,
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
      description="A precision-built text field — hairline chrome with an inner top-light, soft focus halo, autofill-safe backgrounds, and first-class file, search, number, date, and password refinements."
      preview={<InputPreview />}
      previewCode={defaultCode}
      installPackageName="input"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/input.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Basic", preview: <InputPreview />, code: defaultCode },
        { title: "Field", preview: <InputFieldPreview />, code: `<Label>Field</Label>\n<Input placeholder="Field" />` },
        { title: "Field Group", preview: <InputFieldGroupPreview />, code: `<div className="space-y-4">\n  <Input placeholder="First" />\n  <Input placeholder="Last" />\n</div>` },
        { title: "Variants", preview: <InputVariantsPreview />, code: `<Input placeholder="Default" />\n<Input variant="filled" placeholder="Filled" />\n<Input variant="ghost" placeholder="Ghost" />\n<Input variant="underline" placeholder="Underline" />` },
        { title: "Sizes", preview: <InputSizesPreview />, code: `<Input size="sm" placeholder="Small" />\n<Input placeholder="Default" />\n<Input size="lg" placeholder="Large" />` },
        { title: "Search", preview: <InputSearchPreview />, code: `<Input type="search" placeholder="Search…" />` },
        { title: "Password", preview: <InputPasswordPreview />, code: `<Input type="password" placeholder="Password" />` },
        { title: "Clearable", preview: <InputClearablePreview />, code: `<Input value={value} onChange={…} />` },
        { title: "Loading", preview: <InputLoadingPreview />, code: `<Input disabled placeholder="Loading…" />` },
        { title: "Types", preview: <InputTypesPreview />, code: `<Input type="email" />\n<Input type="number" />\n<Input type="date" />` },
        { title: "Disabled", preview: <InputDisabledPreview />, code: `<Input disabled placeholder="Disabled" />` },
        { title: "Invalid", preview: <InputInvalidPreview />, code: `<Input invalid placeholder="Invalid" />` },
        { title: "File", preview: <InputFilePreview />, code: `<Input type="file" />` },
        { title: "Inline", preview: <InputInlinePreview />, code: `<div className="flex gap-2">\n  <Input placeholder="Inline" />\n  <Button>Go</Button>\n</div>` },
        { title: "Grid", preview: <InputGridPreview />, code: `<div className="grid grid-cols-2 gap-4">\n  <Input /><Input />\n</div>` },
        { title: "Required", preview: <InputRequiredPreview />, code: `<Input required placeholder="Required" />` },
        { title: "Badge", preview: <InputBadgePreview />, code: `<div className="relative">\n  <Input inputClassName="pe-14" />\n  <Badge>New</Badge>\n</div>` },
        { title: "Input Group", preview: <InputGroupPreview />, code: `<div className="flex">\n  <Input className="rounded-r-none" />\n  <Button className="rounded-l-none">Search</Button>\n</div>` },
        { title: "Button Group", preview: <InputButtonGroupPreview />, code: `<div className="inline-flex border">\n  <Button>A</Button>\n  <Input unstyled />\n  <Button>B</Button>\n</div>` },
        { title: "Form", preview: <InputFormPreview />, code: `<form onSubmit={(e) => e.preventDefault()}>\n  <Input type="email" placeholder="email@example.com" />\n  <Button>Submit</Button>\n</form>` },
        { title: "RTL", preview: <InputRtlPreview />, code: `<div dir="rtl">\n  <Input placeholder="نص عربي" />\n</div>` },
      ]}
      props={[
        { name: "type", type: "string", default: '"text"', description: "Native input type — email, search, password, file, number, and date are refined out of the box." },
        { name: "variant", type: '"default" | "filled" | "ghost" | "underline"', default: '"default"', description: "Visual treatment for toolbars, quiet surfaces, and minimal forms." },
        { name: "size", type: '"sm" | "default" | "lg" | number', default: '"default"', description: "Height / density. Numbers map to the native size attribute." },
        { name: "invalid", type: "boolean", default: "false", description: "Shorthand for aria-invalid — paints the error ring and tint." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the input with a muted, non-interactive frame." },
        { name: "required", type: "boolean", default: "false", description: "Marks as required." },
        { name: "placeholder", type: "string", description: "Placeholder text — softens further on focus." },
        { name: "inputClassName", type: "string", description: "Extra classes for the inner <input> (e.g. pe-9 for trailing overlays)." },
        { name: "unstyled", type: "boolean", default: "false", description: "Strips frame chrome for composing custom fields." },
        { name: "nativeInput", type: "boolean", default: "false", description: "Renders a native <input> instead of the Base UI primitive." },
        { name: "className", type: "string", description: "Additional CSS classes for the frame." },
      ]}
    />
  );
}
