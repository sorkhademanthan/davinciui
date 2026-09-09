import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  DialogPreview,
  DialogCustomClosePreview,
  DialogNoClosePreview,
  DialogStickyFooterPreview,
  DialogScrollablePreview,
  DialogRtlPreview,
} from "@/components/docs/previews/dialog-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"`;

const defaultCode = `<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`;

export async function DialogDocs() {
  const sourceCode = (await readComponentSource("dialog")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Dialog"
      description="A window overlaid on either the primary window or another dialog window, rendering the content underneath inert."
      preview={<DialogPreview />}
      previewCode={defaultCode}
      installPackageName="dialog"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/dialog.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">Dialog</code> →{" "}
            <code className="font-mono text-xs">DialogTrigger</code> +{" "}
            <code className="font-mono text-xs">DialogContent</code> →{" "}
            <code className="font-mono text-xs">DialogHeader</code> →{" "}
            <code className="font-mono text-xs">DialogTitle</code> +{" "}
            <code className="font-mono text-xs">DialogDescription</code> +{" "}
            <code className="font-mono text-xs">DialogFooter</code>.
          </p>
          <p>
            <strong className="text-foreground">Close:</strong> Custom close replaces default via{" "}
            <code className="font-mono text-xs">&lt;DialogClose asChild&gt;</code> or hide via{" "}
            <code className="font-mono text-xs">showCloseButton=&#123;false&#125;</code> on{" "}
            <code className="font-mono text-xs">DialogContent</code>.
          </p>
          <p>
            <strong className="text-foreground">Scrolling:</strong> Use{" "}
            <code className="font-mono text-xs">DialogContent className=&quot;flex max-h-[80vh] flex-col&quot;</code> with scrollable inner div for sticky footer/content.
          </p>
        </div>
      }
      examples={[
        { title: "Custom Close Button", preview: <DialogCustomClosePreview />, code: `<DialogContent showCloseButton={false}>\n  <DialogClose asChild><Button>Close</Button></DialogClose>\n</DialogContent>` },
        { title: "No Close Button", preview: <DialogNoClosePreview />, code: `<DialogContent showCloseButton={false}>\n  <DialogTitle>No close button</DialogTitle>\n</DialogContent>` },
        { title: "Sticky Footer", preview: <DialogStickyFooterPreview />, code: `<DialogContent className="flex max-h-[80vh] flex-col p-0">\n  <DialogHeader className="border-b px-6 py-4">...</DialogHeader>\n  <div className="flex-1 overflow-y-auto px-6 py-4">...</div>\n  <DialogFooter className="border-t px-6 py-4">...</DialogFooter>\n</DialogContent>` },
        { title: "Scrollable Content", preview: <DialogScrollablePreview />, code: `<DialogContent className="flex max-h-[80vh] flex-col">\n  <DialogHeader>...</DialogHeader>\n  <div className="overflow-y-auto">Long content...</div>\n</DialogContent>` },
        { title: "RTL", preview: <DialogRtlPreview />, code: `<div dir="rtl">\n  <Dialog>\n    <DialogTrigger>فتح</DialogTrigger>\n  </Dialog>\n</div>` },
      ]}
      props={[
        { name: "Dialog", type: "Component", description: "Root. Controls open state." },
        { name: "DialogTrigger", type: "Component", description: "Button that opens the dialog. Supports asChild." },
        { name: "DialogContent", type: "Component", description: "Centered popup. Props: showCloseButton (default true), size (sm | md | lg | xl, default md)." },
        { name: "DialogHeader", type: "Component", description: "Header wrapper for Title + Description." },
        { name: "DialogBody", type: "Component", description: "Scrollable body region with overlay scrollbar and scroll containment." },
        { name: "DialogTitle", type: "Component", description: "Accessible title." },
        { name: "DialogDescription", type: "Component", description: "Accessible description." },
        { name: "DialogFooter", type: "Component", description: "Footer for actions. Use with sticky layout." },
        { name: "DialogClose", type: "Component", description: "Close button. Supports asChild." },
        { name: "showCloseButton", type: "boolean", default: "true", description: "Show default X close button (DialogContent)." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
