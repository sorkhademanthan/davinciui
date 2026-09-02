import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  TextareaPreview,
  TextareaFieldPreview,
  TextareaDisabledPreview,
  TextareaInvalidPreview,
  TextareaButtonPreview,
  TextareaRtlPreview,
} from "@/components/docs/previews/textarea-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Textarea } from "@/components/ui/textarea"`;
const defaultCode = `<Textarea placeholder="Type your message" />`;

export async function TextareaDocs() {
  const sourceCode = (await readComponentSource("textarea")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Textarea"
      description="A multi-line text input for longer content."
      preview={<TextareaPreview />}
      previewCode={defaultCode}
      installPackageName="textarea"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/textarea.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Field", preview: <TextareaFieldPreview />, code: `<Label>Field</Label>\n<Textarea placeholder="Field" />` },
        { title: "Disabled", preview: <TextareaDisabledPreview />, code: `<Textarea disabled placeholder="Disabled" />` },
        { title: "Invalid", preview: <TextareaInvalidPreview />, code: `<Textarea aria-invalid placeholder="Invalid" />` },
        { title: "Button", preview: <TextareaButtonPreview />, code: `<Textarea placeholder="With button" />\n<Button>Submit</Button>` },
        { title: "RTL", preview: <TextareaRtlPreview />, code: `<div dir="rtl">\n  <Textarea placeholder="نص عربي" />\n</div>` },
      ]}
      props={[
        { name: "placeholder", type: "string", description: "Placeholder text." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the textarea." },
        { name: "required", type: "boolean", default: "false", description: "Marks as required." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
