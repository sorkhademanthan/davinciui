import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  FormPreview,
  FormDisabledPreview,
  FormInvalidPreview,
  FormInlinePreview,
  FormGridPreview,
  FormRtlPreview,
} from "@/components/docs/previews/form-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"`;
const defaultCode = `<Form>
  <FormItem>
    <FormLabel>Email</FormLabel>
    <FormControl>
      <Input placeholder="email@example.com" />
    </FormControl>
    <FormDescription>We'll never share your email.</FormDescription>
  </FormItem>
</Form>`;

export async function FormDocs() {
  const sourceCode = (await readComponentSource("form")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Form"
      description="Building forms with validation and composition."
      preview={<FormPreview />}
      previewCode={defaultCode}
      installPackageName="form"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/form.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Field", preview: <FormPreview />, code: defaultCode },
        { title: "Disabled", preview: <FormDisabledPreview />, code: `<FormItem>\n  <FormLabel>Disabled</FormLabel>\n  <Input disabled />\n</FormItem>` },
        { title: "Invalid", preview: <FormInvalidPreview />, code: `<FormItem>\n  <Input aria-invalid />\n  <FormMessage>Required</FormMessage>\n</FormItem>` },
        { title: "Inline", preview: <FormInlinePreview />, code: `<Form className="flex gap-2">\n  <Input />\n  <Button>Go</Button>\n</Form>` },
        { title: "Grid", preview: <FormGridPreview />, code: `<Form className="grid grid-cols-2 gap-4">\n  <FormItem>...</FormItem>\n</Form>` },
        { title: "RTL", preview: <FormRtlPreview />, code: `<div dir="rtl">\n  <Form>...</Form>\n</div>` },
      ]}
      props={[
        { name: "Form", type: "Component", description: "Root form element." },
        { name: "FormItem", type: "Component", description: "Item wrapper with label/control/message." },
        { name: "FormLabel", type: "Component", description: "Label for the field." },
        { name: "FormControl", type: "Component", description: "Control container." },
        { name: "FormMessage", type: "Component", description: "Validation message." },
        { name: "FormDescription", type: "Component", description: "Helper description." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
