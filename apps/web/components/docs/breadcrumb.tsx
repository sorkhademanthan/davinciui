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

const importCode = `import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb"`;
const defaultCode = `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="#">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Components</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`;

export async function BreadcrumbDocs() {
  const sourceCode = (await readComponentSource("breadcrumb")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Breadcrumb"
      description="Displays the path to the current resource using a hierarchy of links."
      preview={<BreadcrumbPreview />}
      previewCode={defaultCode}
      installPackageName="breadcrumb"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/breadcrumb.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Composition", preview: <BreadcrumbPreview />, code: defaultCode },
        { title: "Basic", preview: <BreadcrumbPreview />, code: defaultCode },
        { title: "Custom separator", preview: <BreadcrumbCustomSeparatorPreview />, code: `<BreadcrumbSeparator><span>/</span></BreadcrumbSeparator>` },
        { title: "Dropdown", preview: <BreadcrumbDropdownPreview />, code: `<Breadcrumb><BreadcrumbPage>Dropdown</BreadcrumbPage></Breadcrumb>` },
        { title: "Collapsed", preview: <BreadcrumbCollapsedPreview />, code: `<BreadcrumbEllipsis />` },
        { title: "Link component", preview: <BreadcrumbLinkComponentPreview />, code: `<BreadcrumbLink asChild><a href="#">As Child</a></BreadcrumbLink>` },
        { title: "RTL", preview: <BreadcrumbRtlPreview />, code: `<div dir="rtl">\n  <Breadcrumb>...</Breadcrumb>\n</div>` },
      ]}
      props={[
        { name: "Breadcrumb", type: "Component", description: "Root nav container (aria-label breadcrumb)." },
        { name: "BreadcrumbList", type: "Component", description: "Ordered list container." },
        { name: "BreadcrumbItem", type: "Component", description: "List item." },
        { name: "BreadcrumbLink", type: "Component", description: "Link inside item (asChild supported)." },
        { name: "BreadcrumbPage", type: "Component", description: "Current page (aria-current)." },
        { name: "BreadcrumbSeparator", type: "Component", description: "Separator between items." },
        { name: "BreadcrumbEllipsis", type: "Component", description: "Collapsed ellipsis." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
