import { DocsPageLayout } from "@/components/docs-page-layout"
import {
  ScrollAreaPreview,
  ScrollAreaHorizontalPreview,
  ScrollAreaRtlPreview,
} from "@/components/docs/previews/scroll-area-preview"
import { readComponentSource } from "@/lib/source-code"

const importCode = `import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"`

const defaultCode = `import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
      Jokester began sneaking into the castle in the middle of the night and
      leaving jokes all over the place: under the king&apos;s pillow, in his
      soup, even in the royal toilet. The king was furious, but he couldn&apos;t
      seem to stop Jokester. And then there was the time Jokester wore a
      disguise and went to a fancy dress party...
    </ScrollArea>
  )
}`

export async function ScrollAreaDocs() {
  const sourceCode = (await readComponentSource("scroll-area")) || "// Unable to load source code"

  return (
    <DocsPageLayout
      title="Scroll Area"
      description="Augments native scroll functionality for custom, cross-browser styling."
      preview={<ScrollAreaPreview />}
      previewCode={defaultCode}
      installPackageName="scroll-area"
      installDependencies="@base-ui/react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/scroll-area.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Composition:</strong>{" "}
            <code className="font-mono text-xs">ScrollArea</code> wraps content and renders{" "}
            <code className="font-mono text-xs">ScrollBar</code> +{" "}
            <code className="font-mono text-xs">Corner</code> automatically. Use{" "}
            <code className="font-mono text-xs">orientation=&quot;horizontal&quot;</code> on{" "}
            <code className="font-mono text-xs">ScrollBar</code> for horizontal scrolling.
          </p>
        </div>
      }
      examples={[
        {
          title: "Horizontal",
          preview: <ScrollAreaHorizontalPreview />,
          code: `<ScrollArea className="w-96 whitespace-nowrap rounded-md border">
  <div className="flex w-max space-x-4 p-4">
    <figure className="shrink-0">
      <img src="/photo1.jpg" alt="Photo" className="h-[200px] w-[300px] object-cover" />
    </figure>
    <figure className="shrink-0">
      <img src="/photo2.jpg" alt="Photo" className="h-[200px] w-[300px] object-cover" />
    </figure>
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>`,
        },
        {
          title: "RTL",
          preview: <ScrollAreaRtlPreview />,
          code: `<div dir="rtl">
  <ScrollArea className="h-72 w-48 rounded-md border">
    <div className="p-4">Scrollable RTL content</div>
  </ScrollArea>
</div>`,
        },
      ]}
      props={[
        {
          name: "ScrollArea",
          type: "Component",
          description: "Root container. Renders Viewport + ScrollBar + Corner. Accepts className and Base UI Root props.",
        },
        {
          name: "ScrollBar",
          type: "Component",
          description: "Scrollbar thumb track. Use orientation=\"vertical\" (default) or \"horizontal\".",
        },
        {
          name: "orientation",
          type: '"vertical" | "horizontal"',
          default: '"vertical"',
          description: "Orientation of the scrollbar.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes.",
        },
      ]}
    />
  )
}
