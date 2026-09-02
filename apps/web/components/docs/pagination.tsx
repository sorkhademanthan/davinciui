import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  PaginationPreview,
  PaginationSimplePreview,
  PaginationIconsOnlyPreview,
  PaginationNextJsPreview,
  PaginationRtlPreview,
} from "@/components/docs/previews/pagination-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"`;
const defaultCode = `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>2</PaginationLink>
    </PaginationItem>
  </PaginationContent>
</Pagination>`;

export async function PaginationDocs() {
  const sourceCode = (await readComponentSource("pagination")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Pagination"
      description="Pagination with page navigation, next and previous links."
      preview={<PaginationPreview />}
      previewCode={defaultCode}
      installPackageName="pagination"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/pagination.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Composition", preview: <PaginationPreview />, code: defaultCode },
        { title: "Simple", preview: <PaginationSimplePreview />, code: `<Pagination><PaginationLink>1</PaginationLink></Pagination>` },
        { title: "Icons Only", preview: <PaginationIconsOnlyPreview />, code: `<PaginationPrevious /><PaginationNext />` },
        { title: "Next.js", preview: <PaginationNextJsPreview />, code: `<PaginationLink href="/docs" asChild><Link href="/docs">Docs</Link></PaginationLink>` },
        { title: "RTL", preview: <PaginationRtlPreview />, code: `<div dir="rtl">\n  <Pagination>...</Pagination>\n</div>` },
      ]}
      props={[
        { name: "Pagination", type: "Component", description: "Root nav container." },
        { name: "PaginationContent", type: "Component", description: "List container." },
        { name: "PaginationItem", type: "Component", description: "List item." },
        { name: "PaginationLink", type: "Component", description: "Page link (isActive, asChild)." },
        { name: "PaginationPrevious", type: "Component", description: "Previous page link." },
        { name: "PaginationNext", type: "Component", description: "Next page link." },
        { name: "PaginationEllipsis", type: "Component", description: "Ellipsis indicator." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
