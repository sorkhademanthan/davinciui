import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  PopoverPreview,
  PopoverBasicPreview,
  PopoverAlignPreview,
  PopoverFormPreview,
  PopoverRtlPreview,
} from "@/components/docs/previews/popover-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"`;

const defaultCode = `<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Place content for the popover here.</PopoverContent>
</Popover>`;

export async function PopoverDocs() {
  const sourceCode = (await readComponentSource("popover")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Popover"
      description="Displays rich content in a portal, triggered by a button."
      preview={<PopoverPreview />}
      previewCode={defaultCode}
      installPackageName="popover"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/popover.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">Popover</code> →{" "}
            <code className="font-mono text-xs">PopoverTrigger</code> +{" "}
            <code className="font-mono text-xs">PopoverContent</code> (Portal + Positioner + Popup).
          </p>
          <p>
            <strong className="text-foreground">Positioning:</strong> Use{" "}
            <code className="font-mono text-xs">align=&quot;start | center | end&quot;</code> and{" "}
            <code className="font-mono text-xs">side=&quot;top | right | bottom | left&quot;</code> on{" "}
            <code className="font-mono text-xs">PopoverContent</code>.
          </p>
          <p>
            <strong className="text-foreground">RTL:</strong> Wrap with{" "}
            <code className="font-mono text-xs">dir=&quot;rtl&quot;</code> — alignment flips automatically.
          </p>
        </div>
      }
      examples={[
        { title: "Basic", preview: <PopoverBasicPreview />, code: `<Popover>\n  <PopoverTrigger>Basic</PopoverTrigger>\n  <PopoverContent>Place content here.</PopoverContent>\n</Popover>` },
        { title: "Align", preview: <PopoverAlignPreview />, code: `<PopoverContent align="start">Align start</PopoverContent>\n<PopoverContent align="center">Align center</PopoverContent>\n<PopoverContent align="end">Align end</PopoverContent>` },
        { title: "With Form", preview: <PopoverFormPreview />, code: `<PopoverContent className="w-80">\n  <Label>Project name</Label>\n  <Input placeholder="My project" />\n</PopoverContent>` },
        { title: "RTL", preview: <PopoverRtlPreview />, code: `<div dir="rtl">\n  <Popover>\n    <PopoverTrigger>فتح</PopoverTrigger>\n  </Popover>\n</div>` },
      ]}
      props={[
        { name: "Popover", type: "Component", description: "Root. Controls open state." },
        { name: "PopoverTrigger", type: "Component", description: "Button that anchors the popover. Supports asChild." },
        { name: "PopoverContent", type: "Component", description: "Popup content. Props: align, side, sideOffset, showArrow." },
        { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment relative to trigger." },
        { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Side of trigger." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
