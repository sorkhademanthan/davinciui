import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  BreadcrumbPreview,
  BreadcrumbCustomSeparatorPreview,
  BreadcrumbDropdownPreview,
  BreadcrumbCollapsedPreview,
  BreadcrumbLinkComponentPreview,
  BreadcrumbRtlPreview,
} from "@/components/docs/previews/breadcrumb-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb"`;
const defaultCode = `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="#">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbLink href="#">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`;

export async function BreadcrumbDocs() {
  const sourceCode = (await readComponentSource("breadcrumb")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Breadcrumb"
      description="Trail hierarchy without the busywork — separators appear on their own, long trails collapse themselves, and chevrons mirror in RTL."
      preview={<BreadcrumbPreview />}
      previewCode={defaultCode}
      installPackageName="breadcrumb"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/breadcrumb.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            The list owns the separators: write only items and chevrons appear between them. Pass{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">separator</code> for a custom mark,{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">maxItems</code> to collapse long
            trails behind an expander, or drop in explicit{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">BreadcrumbSeparator</code> rows for
            full manual control.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Breadcrumb
└── BreadcrumbList
    ├── BreadcrumbItem → BreadcrumbLink
    └── BreadcrumbItem → BreadcrumbPage`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Custom Separator",
          preview: <BreadcrumbCustomSeparatorPreview />,
          code: `import { BreadcrumbList } from "@/components/ui/breadcrumb"

// One prop replaces every manual separator row.
<BreadcrumbList separator={<DotIcon />}>
  <BreadcrumbItem>
    <BreadcrumbLink href="#">Home</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbPage>Custom</BreadcrumbPage>
  </BreadcrumbItem>
</BreadcrumbList>`,
        },
        {
          title: "Dropdown",
          preview: <BreadcrumbDropdownPreview />,
          code: `import { DropdownMenu } from "@/components/ui/dropdown-menu"

// Menus compose inside any item; separators keep working.
<BreadcrumbItem>
  <DropdownMenu>
    <DropdownMenuTrigger>Components</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>Documentation</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</BreadcrumbItem>`,
        },
        {
          title: "Collapsed",
          preview: <BreadcrumbCollapsedPreview />,
          code: `import { BreadcrumbList } from "@/components/ui/breadcrumb"

// maxItems keeps first + last rows, collapsing the middle
// behind an expander button with a real count label.
<BreadcrumbList maxItems={3}>
  {/* …six trail items… */}
</BreadcrumbList>`,
        },
        {
          title: "Link Component",
          preview: <BreadcrumbLinkComponentPreview />,
          code: `<BreadcrumbLink asChild>
  <a href="/components">Components</a>
</BreadcrumbLink>`,
        },
        {
          title: "RTL",
          preview: <BreadcrumbRtlPreview />,
          code: `<div dir="rtl">
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="#">الرئيسية</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage>مسار التنقل</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</div>`,
        },
      ]}
      props={[
        { name: "separator", type: "ReactNode | null", default: "chevron", description: "Mark rendered between items. Null disables (BreadcrumbList)." },
        { name: "maxItems", type: "number", default: "—", description: "Collapse the middle rows behind a counted expander." },
        { name: "asChild", type: "boolean", default: "false", description: "Adopt your router link (BreadcrumbLink)." },
        { name: "aria-label", type: "string", default: '"breadcrumb"', description: "Landmark label on the nav root." },
        { name: "aria-current", type: '"page"', default: '"page"', description: "Marks the current row (BreadcrumbPage)." },
        { name: "className", type: "string", description: "Additional CSS classes on any part." },
      ]}
    />
  );
}
