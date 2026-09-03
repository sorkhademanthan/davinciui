import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  BadgeColorsPreview,
  BadgeIconPreview,
  BadgeLinkPreview,
  BadgePreview,
  BadgeRtlPreview,
  BadgeSpinnerPreview,
  BadgeVariantsPreview,
} from "@/components/docs/previews/badge-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Badge } from "@/components/ui/badge"`;

const defaultCode = `<Badge>Badge</Badge>`;

export async function BadgeDocs() {
  const sourceCode = (await readComponentSource("badge")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Badge"
      description="Displays a badge or a component that looks like a badge."
      preview={<BadgePreview />}
      previewCode={defaultCode}
      installPackageName="badge"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/badge.tsx"
      importCode={importCode}
      usageCode={`<Badge variant="default | outline | secondary | destructive">Badge</Badge>`}
      hideExamples
      usageNote={
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Variants:</strong> Use the{" "}
            <code className="font-mono text-xs">variant</code> prop —{" "}
            <code className="font-mono text-xs">default | secondary | destructive | outline</code> (plus{" "}
            <code className="font-mono text-xs">ghost | link</code>).
          </p>
          <p>
            <strong className="text-foreground">Icons & spinners:</strong> Render an icon or a spinning loader
            directly inside the badge — icons are sized automatically, spinners just need{" "}
            <code className="font-mono text-xs">className=&quot;animate-spin&quot;</code>.
          </p>
          <p>
            <strong className="text-foreground">Link:</strong> Render a link as a badge with{" "}
            <code className="font-mono text-xs">asChild</code>:{" "}
            <code className="font-mono text-xs">&lt;Badge asChild&gt;&lt;a href=&quot;...&quot;&gt;...&lt;/a&gt;&lt;/Badge&gt;</code>.
          </p>
          <p>
            <strong className="text-foreground">Custom colors:</strong> Override with custom classes such as{" "}
            <code className="font-mono text-xs">bg-green-50 dark:bg-green-800</code>.
          </p>
        </div>
      }
      examples={[
        { title: "Variants", preview: <BadgeVariantsPreview />, code: `<Badge>Default</Badge>\n<Badge variant="secondary">Secondary</Badge>\n<Badge variant="destructive">Destructive</Badge>\n<Badge variant="outline">Outline</Badge>` },
        { title: "With Icon", preview: <BadgeIconPreview />, code: `<Badge variant="secondary">\n  <Check /> Verified\n</Badge>` },
        { title: "With Spinner", preview: <BadgeSpinnerPreview />, code: `<Badge variant="secondary">\n  <Loader2 className="animate-spin" /> Syncing\n</Badge>` },
        { title: "Link", preview: <BadgeLinkPreview />, code: `<Badge asChild>\n  <a href="#">v2.0 available</a>\n</Badge>` },
        { title: "Custom Colors", preview: <BadgeColorsPreview />, code: `<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">\n  Custom green\n</Badge>` },
        { title: "RTL", preview: <BadgeRtlPreview />, code: `<div dir="rtl">\n  <Badge>شارة</Badge>\n</div>` },
      ]}
      props={[
        { name: "Badge", type: "Component", description: "Root. Renders a div, or the child element with asChild." },
        { name: "variant", type: '"default" | "secondary" | "destructive" | "outline" | "ghost" | "link"', default: '"default"', description: "Visual style of the badge." },
        { name: "asChild", type: "boolean", default: "false", description: "Render the child element (e.g. a link) as the badge." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
