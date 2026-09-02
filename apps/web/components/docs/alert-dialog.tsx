import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AlertDialogPreview,
  AlertDialogSmallPreview,
  AlertDialogMediaPreview,
  AlertDialogSmallMediaPreview,
  AlertDialogDestructivePreview,
  AlertDialogRtlPreview,
} from "@/components/docs/previews/alert-dialog-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"`;
const defaultCode = `<AlertDialog>
  <AlertDialogTrigger>Show Dialog</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`;

export async function AlertDialogDocs() {
  const sourceCode = (await readComponentSource("alert-dialog")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Alert Dialog"
      description="A modal dialog that interrupts the user with important content and expects a response."
      preview={<AlertDialogPreview />}
      previewCode={defaultCode}
      installPackageName="alert-dialog"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/alert-dialog.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-2 text-sm leading-6 text-muted-foreground">
          <p><strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">AlertDialog</code> → <code className="font-mono text-xs">Trigger</code> + <code className="font-mono text-xs">Content</code> (Header/Title/Description + Footer/Action/Cancel).</p>
        </div>
      }
      examples={[
        { title: "Composition", preview: <AlertDialogPreview />, code: defaultCode },
        { title: "Basic", preview: <AlertDialogPreview />, code: defaultCode },
        { title: "Small", preview: <AlertDialogSmallPreview />, code: `<AlertDialogContent className="max-w-sm">...</AlertDialogContent>` },
        { title: "Media", preview: <AlertDialogMediaPreview />, code: `<AlertDialogContent>\n  <div>⚠️</div>\n  <AlertDialogTitle>Media</AlertDialogTitle>\n</AlertDialogContent>` },
        { title: "Small with Media", preview: <AlertDialogSmallMediaPreview />, code: `<AlertDialogContent className="max-w-sm">\n  <div>⚠️</div>\n  <AlertDialogTitle>Small + Media</AlertDialogTitle>\n</AlertDialogContent>` },
        { title: "Destructive", preview: <AlertDialogDestructivePreview />, code: `<AlertDialogAction className="bg-destructive">Delete</AlertDialogAction>` },
        { title: "RTL", preview: <AlertDialogRtlPreview />, code: `<div dir="rtl">\n  <AlertDialog>...</AlertDialog>\n</div>` },
      ]}
      props={[
        { name: "AlertDialog", type: "Component", description: "Root dialog." },
        { name: "AlertDialogTrigger", type: "Component", description: "Button that opens the dialog." },
        { name: "AlertDialogContent", type: "Component", description: "Container for dialog content." },
        { name: "AlertDialogTitle", type: "Component", description: "Accessible title." },
        { name: "AlertDialogDescription", type: "Component", description: "Accessible description." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
