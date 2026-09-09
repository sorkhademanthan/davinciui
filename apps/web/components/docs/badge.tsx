import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  BadgeColorsPreview,
  BadgeDotPreview,
  BadgeIconPreview,
  BadgeLinkPreview,
  BadgePreview,
  BadgeRemovablePreview,
  BadgeRtlPreview,
  BadgeSizesPreview,
  BadgeSpinnerPreview,
  BadgeVariantsPreview,
} from "@/components/docs/previews/badge-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Badge, BadgeDot } from "@/components/ui/badge"`;

const defaultCode = `import { Badge } from "@/components/ui/badge"

<Badge>Badge</Badge>`;

export async function BadgeDocs() {
  const sourceCode = (await readComponentSource("badge")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Badge"
      description="Pills with unmistakable tones — nine variants, three sizes, status dots, and removable filter chips."
      preview={<BadgePreview />}
      previewCode={defaultCode}
      installPackageName="badge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/badge.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Badges are pills, not boxes — fully rounded with tabular numerals so counts never jitter. Tones carry
            border, surface, and text together; dots inherit the tone automatically. Dismiss buttons stop propagation
            so chips inside clickable rows stay safe.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Badge
├── BadgeDot
└── (dismiss button via onRemove)`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Variants",
          preview: <BadgeVariantsPreview />,
          code: `<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>`,
        },
        {
          title: "Sizes",
          preview: <BadgeSizesPreview />,
          code: `<Badge size="sm">Small</Badge>
<Badge>Default</Badge>
<Badge size="lg">Large</Badge>`,
        },
        {
          title: "With Icon",
          preview: <BadgeIconPreview />,
          code: `<Badge variant="success">
  <Check /> Verified
</Badge>`,
        },
        {
          title: "Status Dot",
          preview: <BadgeDotPreview />,
          code: `<Badge variant="outline">
  <BadgeDot className="bg-emerald-500" /> Live
</Badge>
<Badge variant="outline">
  <BadgeDot pulse className="bg-blue-500" /> Streaming
</Badge>`,
        },
        {
          title: "Removable",
          preview: <BadgeRemovablePreview />,
          code: `const [tags, setTags] = React.useState(["design", "motion"])

{tags.map((tag) => (
  <Badge
    key={tag}
    variant="secondary"
    onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}
    removeLabel={\`Remove \${tag} filter\`}
  >
    {tag}
  </Badge>
))}`,
        },
        {
          title: "With Spinner",
          preview: <BadgeSpinnerPreview />,
          code: `<Badge variant="secondary">
  <Loader2 className="animate-spin" /> Syncing
</Badge>`,
        },
        {
          title: "Link",
          preview: <BadgeLinkPreview />,
          code: `<Badge asChild>
  <a href="#">v2.0 available</a>
</Badge>`,
        },
        {
          title: "Custom Colors",
          preview: <BadgeColorsPreview />,
          code: `<Badge className="border-transparent bg-violet-500/10 text-violet-700">
  Violet
</Badge>`,
        },
        {
          title: "RTL",
          preview: <BadgeRtlPreview />,
          code: `<div dir="rtl">
  <Badge>شارة</Badge>
</div>`,
        },
      ]}
      props={[
        { name: "variant", type: '"default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "info" | "success" | "warning"', default: '"default"', description: "Tone. Semantic tones shift border, surface, and text together." },
        { name: "size", type: '"sm" | "default" | "lg"', default: '"default"', description: "Density of the pill." },
        { name: "onRemove", type: "() => void", default: "—", description: "Renders a dismiss button for filter chips. Ignored with asChild." },
        { name: "removeLabel", type: "string", default: '"Remove"', description: "Accessible label for the dismiss button." },
        { name: "pulse", type: "boolean", default: "false", description: "Ping animation behind the dot (BadgeDot)." },
        { name: "asChild", type: "boolean", default: "false", description: "Render as a link or custom element via Slot." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
