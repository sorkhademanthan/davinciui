import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  SeparatorBasicPreview,
  SeparatorLabelPreview,
  SeparatorListPreview,
  SeparatorMenuPreview,
  SeparatorRtlPreview,
  SeparatorVerticalPreview,
} from "@/components/docs/previews/separator-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Separator } from "@/components/ui/separator"`;
const defaultCode = `<div>
  <p>Above the fold</p>
  <Separator />
  <p>Below the fold</p>
</div>`;

export async function SeparatorDocs() {
  const sourceCode =
    (await readComponentSource("separator")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Separator"
      description="A visual divider between sections. Horizontal by default, vertical inside row layouts — decorative unless announced."
      preview={<SeparatorBasicPreview />}
      previewCode={defaultCode}
      installPackageName="separator"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/separator.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        {
          title: "Vertical",
          preview: <SeparatorVerticalPreview />,
          code: `import { Separator } from "@/components/ui/separator"

<div className="flex h-24 items-stretch gap-4">
  <div>Left panel</div>
  <Separator orientation="vertical" />
  <div>Right panel</div>
</div>`,
        },
        {
          title: "Menu",
          preview: <SeparatorMenuPreview />,
          code: `import { Separator } from "@/components/ui/separator"

// Non-decorative separators expose role="separator"
// so menu sections stay perceivable to screen readers.
<div role="menu" aria-label="Account">
  <div role="menuitem">Profile</div>
  <Separator decorative={false} className="my-1.5" />
  <div role="menuitem">Log out</div>
</div>`,
        },
        {
          title: "List",
          preview: <SeparatorListPreview />,
          code: `import { Separator } from "@/components/ui/separator"

<ul>
  {people.map((person, i) => (
    <li key={person.name}>
      {i > 0 ? <Separator /> : null}
      <div>{person.name}</div>
    </li>
  ))}
</ul>`,
        },
        {
          title: "With Label",
          preview: <SeparatorLabelPreview />,
          code: `import { Separator } from "@/components/ui/separator"

// Labeled dividers stay compositional: two flexible
// separators around a label. Announce the group with
// role="separator" + aria-label on the wrapper.
<div role="separator" aria-label="Sign-in options" className="flex items-center gap-3">
  <Separator className="flex-1" />
  <span className="text-xs uppercase tracking-widest">or continue with</span>
  <Separator className="flex-1" />
</div>`,
        },
        {
          title: "RTL",
          preview: <SeparatorRtlPreview />,
          code: `import { Separator } from "@/components/ui/separator"

<div dir="rtl">
  <p>لوحة التحكم الأولى</p>
  <Separator />
  <div className="flex h-16 items-stretch gap-3">
    <span>الملف الشخصي</span>
    <Separator orientation="vertical" />
    <span>الإعدادات</span>
  </div>
</div>`,
        },
      ]}
      props={[
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Layout direction. Vertical stretches to the row height." },
        { name: "decorative", type: "boolean", default: "true", description: "Purely visual divider. False exposes role=\"separator\" with aria-orientation." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
