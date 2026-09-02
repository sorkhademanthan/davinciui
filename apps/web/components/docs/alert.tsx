import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AlertPreview,
  AlertDestructivePreview,
  AlertActionPreview,
  AlertCustomColorsPreview,
  AlertRtlPreview,
} from "@/components/docs/previews/alert-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"`;
const defaultCode = `<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
</Alert>`;

export async function AlertDocs() {
  const sourceCode = (await readComponentSource("alert")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Alert"
      description="Displays a callout for user attention."
      preview={<AlertPreview />}
      previewCode={defaultCode}
      installPackageName="alert"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/alert.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-2 text-sm leading-6 text-muted-foreground">
          <p><strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">Alert</code> wraps <code className="font-mono text-xs">AlertTitle</code> + <code className="font-mono text-xs">AlertDescription</code> with optional icon as first child.</p>
        </div>
      }
      examples={[
        { title: "Composition", preview: <AlertPreview />, code: defaultCode },
        { title: "Basic", preview: <AlertPreview />, code: defaultCode },
        { title: "Destructive", preview: <AlertDestructivePreview />, code: `<Alert variant="destructive">\n  <AlertTitle>Error</AlertTitle>\n  <AlertDescription>Your session has expired.</AlertDescription>\n</Alert>` },
        { title: "Action", preview: <AlertActionPreview />, code: `<Alert>\n  <AlertTitle>Update</AlertTitle>\n  <AlertDescription>New version ready.</AlertDescription>\n  <Button size="sm">Action</Button>\n</Alert>` },
        { title: "Custom Colors", preview: <AlertCustomColorsPreview />, code: `<Alert className="border-emerald-500/20 bg-emerald-50">\n  <AlertTitle>Custom</AlertTitle>\n</Alert>` },
        { title: "RTL", preview: <AlertRtlPreview />, code: `<div dir="rtl">\n  <Alert>\n    <AlertTitle>تنبيه</AlertTitle>\n  </Alert>\n</div>` },
      ]}
      props={[
        { name: "variant", type: '"default" | "destructive"', default: '"default"', description: "Visual style." },
        { name: "Alert", type: "Component", description: "Root alert container (role=alert)." },
        { name: "AlertTitle", type: "Component", description: "Title element inside Alert." },
        { name: "AlertDescription", type: "Component", description: "Description element inside Alert." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
