import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  ToastActionPreview,
  ToastPersistentPreview,
  ToastPreview,
  ToastPromisePreview,
  ToastStackPreview,
  ToastTypesPreview,
} from "@/components/docs/previews/toast-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Toaster, toast, toastPromise } from "@/components/ui/toast"`;
const defaultCode = `<Toaster />
<Button onClick={() => toast("Hello!", { description: "This is a toast." })}>Show Toast</Button>`;

export async function ToastDocs() {
  const sourceCode = (await readComponentSource("toast")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Toast"
      description="Stacked notifications with status icons, per-type durations, pause on hover, actions, and in-place promise updates — one engine, zero setup."
      preview={<ToastPreview />}
      previewCode={defaultCode}
      installPackageName="toast"
      installDependencies="lucide-react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/toast.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        {
          title: "Types",
          preview: <ToastTypesPreview />,
          code: `toast("Default")\ntoast.success("Deployed")\ntoast.error("Build failed")\ntoast.warning("Review snapshots")\ntoast.info("Syncing…")\ntoast.loading("Uploading…")`,
        },
        {
          title: "Action",
          preview: <ToastActionPreview />,
          code: `toast("Message deleted", {\n  description: "You have 8 seconds.",\n  action: { label: "Undo", onClick: restore },\n})`,
        },
        {
          title: "Promise",
          preview: <ToastPromisePreview />,
          code: `toastPromise(deploy(), {\n  loading: "Deploying…",\n  success: (slug) => \`Live at \${slug}\`,\n  error: (err) => \`Failed — \${err.message}\`,\n})`,
        },
        {
          title: "Persistent",
          preview: <ToastPersistentPreview />,
          code: `toast.error("Payment failed", {\n  duration: Number.POSITIVE_INFINITY,\n  action: { label: "Update billing", onClick: openBilling },\n})`,
        },
        {
          title: "Stacking",
          preview: <ToastStackPreview />,
          code: `// Bursts cap at five — oldest drops first.\nfor (let i = 1; i <= 8; i++) toast(\`Burst \${i}\`)`,
        },
      ]}
      props={[
        { name: "type", type: '"default" | "success" | "error" | "warning" | "info" | "loading"', default: '"default"', description: "Status icon and tint. Loading never auto-dismisses." },
        { name: "duration", type: "number", default: "by type (3–6s)", description: "Auto-dismiss ms. Infinity stays. Actions extend to 8s for keyboard users." },
        { name: "action", type: "{ label, onClick } | ReactNode", description: "Inline action button or custom element." },
        { name: "id", type: "string | number", description: "Re-uses the matching toast instead of stacking." },
        { name: "Toaster · position", type: "six corners + centers", default: '"bottom-right"', description: "Stack anchor with matching entrance motion." },
        { name: "toastPromise", type: "function", description: "Updates one toast loading → success/error. Messages accept functions." },
        { name: "toast.dismiss", type: "(id?) => void", description: "Dismiss one toast, or all when id is omitted." },
      ]}
    />
  );
}
