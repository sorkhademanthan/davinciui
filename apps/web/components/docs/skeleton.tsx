import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  SkeletonPreview,
  SkeletonAvatarPreview,
  SkeletonCardPreview,
  SkeletonTextPreview,
  SkeletonFormPreview,
  SkeletonTablePreview,
  SkeletonRtlPreview,
} from "@/components/docs/previews/skeleton-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Skeleton } from "@/components/ui/skeleton"`;
const defaultCode = `<Skeleton className="h-4 w-full" />`;

export async function SkeletonDocs() {
  const sourceCode = (await readComponentSource("skeleton")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Skeleton"
      description="Use to show a placeholder while content loads."
      preview={<SkeletonPreview />}
      previewCode={defaultCode}
      installPackageName="skeleton"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/skeleton.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Avatar", preview: <SkeletonAvatarPreview />, code: `<Skeleton className="size-10 rounded-full" />\n<Skeleton className="h-4 w-32" />` },
        { title: "Card", preview: <SkeletonCardPreview />, code: `<Skeleton className="h-32 w-full" />\n<Skeleton className="h-4 w-3/4" />` },
        { title: "Text", preview: <SkeletonTextPreview />, code: `<Skeleton className="h-4 w-full" />\n<Skeleton className="h-4 w-2/3" />` },
        { title: "Form", preview: <SkeletonFormPreview />, code: `<Skeleton className="h-9 w-full" />\n<Skeleton className="h-20 w-full" />` },
        { title: "Table", preview: <SkeletonTablePreview />, code: `<Skeleton className="h-8 w-full" />\n<Skeleton className="h-6 flex-1" />` },
        { title: "RTL", preview: <SkeletonRtlPreview />, code: `<div dir="rtl">\n  <Skeleton className="h-4 w-full" />\n</div>` },
      ]}
      props={[
        { name: "className", type: "string", description: "Additional CSS classes (size via h-* w-*)." },
      ]}
    />
  );
}
