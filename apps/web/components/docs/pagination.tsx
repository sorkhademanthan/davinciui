import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  PaginationCompactPreview,
  PaginationFirstLastPreview,
  PaginationIconsOnlyPreview,
  PaginationPillPreview,
  PaginationPreview,
  PaginationRtlPreview,
  PaginationSimplePreview,
  PaginationSizesPreview,
  PaginationTreatmentsPreview,
} from "@/components/docs/previews/pagination-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"`;
const defaultCode = `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink isActive>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext />
    </PaginationItem>
  </PaginationContent>
</Pagination>`;

export async function PaginationDocs() {
  const sourceCode = (await readComponentSource("pagination")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Pagination"
      description="Page navigation with numbered links, first/last jumps, pill and compact layouts, and three active treatments — wired to state or real URLs."
      preview={<PaginationPreview />}
      previewCode={defaultCode}
      installPackageName="pagination"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/pagination.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Interactive", preview: <PaginationPreview />, code: defaultCode },
        {
          title: "Treatments",
          preview: <PaginationTreatmentsPreview />,
          code: `<PaginationLink variant="solid" isActive>2</PaginationLink>\n<PaginationLink variant="ghost" isActive>2</PaginationLink>`,
        },
        {
          title: "Pill",
          preview: <PaginationPillPreview />,
          code: `<Pagination variant="pill">\n  <PaginationContent>…</PaginationContent>\n</Pagination>`,
        },
        {
          title: "First / Last",
          preview: <PaginationFirstLastPreview />,
          code: `<PaginationFirst onClick={() => setPage(1)} />\n<PaginationLast onClick={() => setPage(total)} />`,
        },
        {
          title: "Compact",
          preview: <PaginationCompactPreview />,
          code: `<PaginationPrevious />\n<span>{page} / {total}</span>\n<PaginationNext />`,
        },
        {
          title: "Sizes",
          preview: <PaginationSizesPreview />,
          code: `<PaginationLink size="icon-sm">1</PaginationLink>`,
        },
        { title: "Simple", preview: <PaginationSimplePreview />, code: `<Pagination><PaginationLink>1</PaginationLink></Pagination>` },
        { title: "Icons Only", preview: <PaginationIconsOnlyPreview />, code: `<PaginationPrevious showText={false} />\n<PaginationNext showText={false} />` },
        { title: "RTL", preview: <PaginationRtlPreview />, code: `<div dir="rtl">\n  <Pagination>...</Pagination>\n</div>` },
      ]}
      props={[
        { name: "Pagination · variant", type: '"default" | "pill"', default: '"default"', description: "Pill renders a floating bordered bar." },
        { name: "PaginationLink · variant", type: '"outline" | "solid" | "ghost"', default: '"outline"', description: "Active-page treatment: ring, filled, or tonal." },
        { name: "PaginationLink · isActive", type: "boolean", default: "false", description: "Current page with aria-current." },
        { name: "PaginationLink · size", type: "Button sizes", default: '"icon"', description: "icon-sm/icon for compact rows." },
        { name: "PaginationPrevious · text", type: "string", default: '"Previous"', description: "Label, collapsed on small screens." },
        { name: "PaginationNext · text", type: "string", default: '"Next"', description: "Label, collapsed on small screens." },
        { name: "showText", type: "boolean", default: "true", description: "Render the Previous/Next label." },
        { name: "PaginationFirst / Last", type: "Component", description: "Jump to the first/last page." },
        { name: "PaginationEllipsis", type: "Component", description: "Skipped-range indicator, aria-hidden." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
