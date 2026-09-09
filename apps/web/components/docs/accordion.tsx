import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AccordionPreview,
  AccordionBasicPreview,
  AccordionBordersPreview,
  AccordionCardPreview,
  AccordionControlledPreview,
  AccordionDisabledPreview,
  AccordionMultiplePreview,
  AccordionRtlPreview,
} from "@/components/docs/previews/accordion-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"`;
const defaultCode = `<Accordion defaultValue="item-1">
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
      description="A vertically stacked set of interactive headings that each reveal a section of content — keyboard navigable, animated, and honest about it."
      preview={<AccordionPreview />}
      previewCode={defaultCode}
      installPackageName="accordion"
      installDependencies="@base-ui/react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/accordion.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Powered by Base UI primitives: triggers expose{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">aria-expanded</code>, panels are
            labelled regions, and arrow keys move focus between headings. Panels animate with pure CSS grid rows —
            no height measurement, and reduced-motion users get an instant toggle.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Accordion
└── AccordionItem
    ├── AccordionTrigger
    └── AccordionContent`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Basic",
          preview: <AccordionBasicPreview />,
          code: `<Accordion defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>How do I reset my password?</AccordionTrigger>
    <AccordionContent>Click ‘Forgot Password’ — the link expires in 24 hours.</AccordionContent>
  </AccordionItem>
</Accordion>`,
        },
        {
          title: "Multiple",
          preview: <AccordionMultiplePreview />,
          code: `<Accordion multiple defaultValue={["item-1"]}>
  <AccordionItem value="item-1">
    <AccordionTrigger>Notification Settings</AccordionTrigger>
    <AccordionContent>Email alerts or push notifications.</AccordionContent>
  </AccordionItem>
</Accordion>`,
        },
        {
          title: "Disabled",
          preview: <AccordionDisabledPreview />,
          code: `<AccordionItem value="item-2" disabled>
  <AccordionTrigger>Premium feature information</AccordionTrigger>
  <AccordionContent>This content is unavailable on your plan.</AccordionContent>
</AccordionItem>`,
        },
        {
          title: "Borders",
          preview: <AccordionBordersPreview />,
          code: `<Accordion variant="bordered" defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>How does billing work?</AccordionTrigger>
    <AccordionContent>Monthly or annual, cancel anytime.</AccordionContent>
  </AccordionItem>
</Accordion>`,
        },
        {
          title: "Card",
          preview: <AccordionCardPreview />,
          code: `<Accordion variant="card" defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>What plans do you offer?</AccordionTrigger>
    <AccordionContent>Starter, Professional, Enterprise.</AccordionContent>
  </AccordionItem>
</Accordion>`,
        },
        {
          title: "Controlled",
          preview: <AccordionControlledPreview />,
          code: `const [value, setValue] = React.useState("item-1")

<Accordion value={value} onValueChange={setValue}>
  <AccordionItem value="item-1">{/* … */}</AccordionItem>
  <AccordionItem value="item-2">{/* … */}</AccordionItem>
</Accordion>

// Single mode emits a string ("" when all closed);
// multiple mode emits string[].`,
        },
        {
          title: "RTL",
          preview: <AccordionRtlPreview />,
          code: `<div dir="rtl">
  <Accordion defaultValue="item-1">
    <AccordionItem value="item-1">
      <AccordionTrigger>كيف يمكنني إعادة تعيين كلمة المرور؟</AccordionTrigger>
      <AccordionContent>انقر على ‘نسيت كلمة المرور’.</AccordionContent>
    </AccordionItem>
  </Accordion>
</div>`,
        },
      ]}
      props={[
        { name: "multiple", type: "boolean", default: "false", description: "Allow more than one item open at once." },
        { name: "value", type: "string | string[]", default: "—", description: "Controlled open value(s). Single mode uses a string." },
        { name: "defaultValue", type: "string | string[]", default: "—", description: "Uncontrolled initial open value(s)." },
        { name: "onValueChange", type: "(value: string | string[]) => void", default: "—", description: "Fires when the open value(s) change." },
        { name: "disabled", type: "boolean", default: "false", description: "Disable the whole accordion, or one item." },
        { name: "variant", type: '"default" | "bordered" | "card"', default: '"default"', description: "Divider rows, bordered container, or lifted cards." },
        { name: "value (item)", type: "string", default: "—", description: "Unique value identifying the item." },
        { name: "hideIcon", type: "boolean", default: "false", description: "Hide the chevron indicator on the trigger." },
        { name: "keepMounted", type: "boolean", default: "false", description: "Keep panel mounted when closed (find-in-page support)." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
