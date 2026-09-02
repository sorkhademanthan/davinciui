import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  LinkPreview,
  LinkMutedPreview,
  LinkUnderlinePreview,
  LinkWithIconPreview,
  LinkSizesPreview,
  LinkRtlPreview,
} from "@/components/docs/previews/link-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Link } from "@/components/ui/link"`;
const defaultCode = `<Link href="#">Default Link</Link>`;

export async function LinkDocs() {
  const sourceCode = (await readComponentSource("link")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Link"
      description="A styled anchor element with variants for navigation and inline text links."
      preview={<LinkPreview />}
      previewCode={defaultCode}
      installPackageName="link"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/link.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Muted", preview: <LinkMutedPreview />, code: `<Link href="#" variant="muted">Muted Link</Link>` },
        { title: "Underline", preview: <LinkUnderlinePreview />, code: `<Link href="#" variant="underline">Underline Link</Link>` },
        { title: "With Icon", preview: <LinkWithIconPreview />, code: `<Link href="#">Visit docs <ArrowUpRight /></Link>` },
        { title: "Sizes", preview: <LinkSizesPreview />, code: `<Link size="sm">Small</Link>\n<Link>Default</Link>\n<Link size="lg">Large</Link>` },
        { title: "RTL", preview: <LinkRtlPreview />, code: `<div dir="rtl">\n  <Link href="#">رابط</Link>\n</div>` },
      ]}
      props={[
        { name: "variant", type: '"default" | "muted" | "underline"', default: '"default"', description: "Visual variant." },
        { name: "size", type: '"default" | "sm" | "lg"', default: '"default"', description: "Text size." },
        { name: "href", type: "string", description: "Link URL." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
