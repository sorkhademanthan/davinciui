import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AccordionPreview,
  AccordionBasicPreview,
  AccordionMultiplePreview,
  AccordionDisabledPreview,
  AccordionBordersPreview,
  AccordionCardPreview,
  AccordionRtlPreview,
} from "@/components/docs/previews/accordion-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"`;
const defaultCode = `<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
  </AccordionItem>
</Accordion>`;

export async function AccordionDocs() {
  const sourceCode = (await readComponentSource("accordion")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Accordion"
      description="A vertically stacked set of interactive headings that each reveal a section of content."
      preview={<AccordionPreview />}
      previewCode={defaultCode}
      installPackageName="accordion"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/accordion.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p><strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">Accordion</code> wraps <code className="font-mono text-xs">AccordionItem</code> which contains <code className="font-mono text-xs">AccordionTrigger</code> + <code className="font-mono text-xs">AccordionContent</code>.</p>
          <p><strong className="text-foreground">Accessibility:</strong> Follows WAI-ARIA accordion pattern – trigger has <code className="font-mono text-xs">aria-expanded</code>, content linked via <code className="font-mono text-xs">aria-controls</code>.</p>
        </div>
      }
      examples={[
        { title: "Composition", preview: <AccordionPreview />, code: defaultCode },
        { title: "Basic", preview: <AccordionBasicPreview />, code: `<Accordion type="single" collapsible>\n  <AccordionItem value="item-1">\n    <AccordionTrigger>Basic</AccordionTrigger>\n    <AccordionContent>Basic content</AccordionContent>\n  </AccordionItem>\n</Accordion>` },
        { title: "Multiple", preview: <AccordionMultiplePreview />, code: `<Accordion type="multiple">\n  <AccordionItem value="item-1"><AccordionTrigger>Item 1</AccordionTrigger></AccordionItem>\n</Accordion>` },
        { title: "Disabled", preview: <AccordionDisabledPreview />, code: `<AccordionItem value="item-2" disabled>\n  <AccordionTrigger>Disabled</AccordionTrigger>\n</AccordionItem>` },
        { title: "Borders", preview: <AccordionBordersPreview />, code: `<Accordion variant="bordered">\n  <AccordionItem value="item-1">\n    <AccordionTrigger>Bordered</AccordionTrigger>\n  </AccordionItem>\n</Accordion>` },
        { title: "Card", preview: <AccordionCardPreview />, code: `<Accordion variant="card">\n  <AccordionItem value="item-1">\n    <AccordionTrigger>Card</AccordionTrigger>\n  </AccordionItem>\n</Accordion>` },
        { title: "RTL", preview: <AccordionRtlPreview />, code: `<div dir="rtl">\n  <Accordion>\n    <AccordionItem value="item-1"><AccordionTrigger>عنصر</AccordionTrigger></AccordionItem>\n  </Accordion>\n</div>` },
      ]}
      props={[
        { name: "type", type: '"single" | "multiple"', default: '"single"', description: "Whether one or multiple items can be open." },
        { name: "collapsible", type: "boolean", default: "true", description: "When type is single, allows closing content." },
        { name: "variant", type: '"default" | "bordered" | "card"', default: '"default"', description: "Visual variant." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the item (AccordionItem)." },
        { name: "value", type: "string", description: "Value of the item (AccordionItem)." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
