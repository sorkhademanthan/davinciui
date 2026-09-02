import { DocsPageLayout } from "@/components/docs-page-layout";
import { ToastPreview, ToastTypesPreview, ToastActionPreview, ToastPromisePreview } from "@/components/docs/previews/toast-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Toaster, toast, toastPromise } from "@/components/ui/toast"`;
const defaultCode = `<Toaster />
<Button onClick={() => toast("Hello!", { description: "This is a toast." })}>Show Toast</Button>`;

export async function ToastDocs() {
  const sourceCode = (await readComponentSource("toast")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Toast"
      description="A succinct message that is displayed temporarily."
      preview={<ToastPreview />}
      previewCode={defaultCode}
      installPackageName="toast"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/toast.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Types", preview: <ToastTypesPreview />, code: `toast("Default")\ntoast("Success!", { type: "success" })\ntoast("Error!", { type: "error" })` },
        { title: "Action", preview: <ToastActionPreview />, code: `toast("Action", { action: <Button>Undo</Button> })` },
        { title: "Promise", preview: <ToastPromisePreview />, code: `toastPromise(promise, { loading: "Loading...", success: "Success!", error: "Error!" })` },
      ]}
      props={[
        { name: "type", type: '"default" | "success" | "error" | "info"', default: '"default"', description: "Toast type." },
        { name: "title", type: "string", description: "Toast title." },
        { name: "description", type: "string", description: "Toast description." },
        { name: "action", type: "ReactNode", description: "Action element." },
        { name: "Toaster", type: "Component", description: "Container to render toasts." },
        { name: "toastPromise", type: "function", description: "Promise-based toast helper." },
      ]}
    />
  );
}
