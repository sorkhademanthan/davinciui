import { DocsPageLayout } from "@/components/docs-page-layout";
import { Section } from "@/components/component-layout";
import {
  ToggleGroupBasicPreview,
  ToggleGroupCustomPreview,
  ToggleGroupDisabledPreview,
  ToggleGroupOutlinePreview,
  ToggleGroupRtlPreview,
  ToggleGroupSizePreview,
  ToggleGroupSpacingPreview,
  ToggleGroupVerticalPreview,
} from "@/components/docs/previews/toggle-group-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"`;
const defaultCode = `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function Example() {
  const [value, setValue] = React.useState("center")

  return (
    <ToggleGroup type="single" value={value} onValueChange={setValue} aria-label="Text alignment">
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeft className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenter className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRight className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}`;

const CHANGELOG = [
  {
    version: "1.0.0",
    date: "2026-09-07",
    notes: [
      "Single and multiple selection with roving arrow-key navigation.",
      "Default and outline variants with sm, default, and lg sizes.",
      "Segmented and spaced layouts plus vertical orientation.",
      "Logical rounding and direction-aware keyboard handling for RTL.",
    ],
  },
];

function AfterContent() {
  return (
    <>
      <Section title="Changelog" className="pt-8">
        <div className="space-y-4">
          {CHANGELOG.map((entry) => (
            <div key={entry.version} className="rounded-xl border bg-card p-5">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm font-semibold">v{entry.version}</span>
                <span className="font-mono text-xs text-muted-foreground">{entry.date}</span>
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                {entry.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="RTL Support" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p>
            Wrap the group in{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">dir=&quot;rtl&quot;</code>.
            Segments use logical rounding so the first and last items mirror automatically, shared borders follow
            the inline direction, and arrow-key navigation follows the reading direction. Nothing else changes —
            selection, spacing, and disabled logic are direction-agnostic.
          </p>
        </div>
      </Section>
    </>
  );
}

export async function ToggleGroupDocs() {
  const sourceCode =
    (await readComponentSource("toggle-group")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Toggle Group"
      description="A set of two-state buttons that can be toggled individually or exclusively. Single or multiple selection with full keyboard support."
      preview={<ToggleGroupBasicPreview />}
      previewCode={defaultCode}
      installPackageName="toggle-group"
      installDependencies="@base-ui/react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/toggle-group.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            The group owns selection and keyboard navigation; items inherit its variant and size unless overridden.
            Use <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">type=&quot;multiple&quot;</code> with
            array values when more than one item may stay pressed.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`ToggleGroup
└── ToggleGroupItem`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Outline",
          preview: <ToggleGroupOutlinePreview />,
          code: `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

<ToggleGroup type="multiple" variant="outline" value={value} onValueChange={setValue} aria-label="Text style">
  <ToggleGroupItem value="bold" aria-label="Bold">
    <Bold className="size-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Italic">
    <Italic className="size-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="underline" aria-label="Underline">
    <Underline className="size-4" />
  </ToggleGroupItem>
</ToggleGroup>`,
        },
        {
          title: "Size",
          preview: <ToggleGroupSizePreview />,
          code: `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

<ToggleGroup size="sm" aria-label="Small">{/* items */}</ToggleGroup>
<ToggleGroup size="default" aria-label="Default">{/* items */}</ToggleGroup>
<ToggleGroup size="lg" aria-label="Large">{/* items */}</ToggleGroup>`,
        },
        {
          title: "Spacing",
          preview: <ToggleGroupSpacingPreview />,
          code: `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// spacing="sm" | "lg" separates segments into pills
// with full rounding on every item.
<ToggleGroup variant="outline" spacing="lg" type="multiple" aria-label="Devices">
  <ToggleGroupItem value="phone" aria-label="Phone">
    <Smartphone className="size-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="tablet" aria-label="Tablet">
    <Tablet className="size-4" />
  </ToggleGroupItem>
</ToggleGroup>`,
        },
        {
          title: "Vertical",
          preview: <ToggleGroupVerticalPreview />,
          code: `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

<ToggleGroup orientation="vertical" value={value} onValueChange={setValue} aria-label="Text alignment">
  <ToggleGroupItem value="left" aria-label="Align left">
    <AlignLeft className="size-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="center" aria-label="Align center">
    <AlignCenter className="size-4" />
  </ToggleGroupItem>
</ToggleGroup>`,
        },
        {
          title: "Disabled",
          preview: <ToggleGroupDisabledPreview />,
          code: `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// Disable the whole group or individual items.
<ToggleGroup disabled aria-label="Disabled group">{/* items */}</ToggleGroup>

<ToggleGroup variant="outline" aria-label="One disabled item">
  <ToggleGroupItem value="bold">…</ToggleGroupItem>
  <ToggleGroupItem value="underline" disabled aria-label="Underline (unavailable)">…</ToggleGroupItem>
</ToggleGroup>`,
        },
        {
          title: "Custom",
          preview: <ToggleGroupCustomPreview />,
          code: `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// Style the pressed state per item with data-[pressed].
<ToggleGroup variant="outline" spacing="sm" aria-label="Editor view">
  <ToggleGroupItem
    value="edit"
    className="px-4 data-[pressed]:border-indigo-500 data-[pressed]:bg-indigo-500/10 data-[pressed]:text-indigo-600"
  >
    Edit
  </ToggleGroupItem>
  <ToggleGroupItem
    value="preview"
    className="px-4 data-[pressed]:border-emerald-500 data-[pressed]:bg-emerald-500/10 data-[pressed]:text-emerald-600"
  >
    Preview
  </ToggleGroupItem>
</ToggleGroup>`,
        },
        {
          title: "RTL",
          preview: <ToggleGroupRtlPreview />,
          code: `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

<div dir="rtl">
  <ToggleGroup variant="outline" aria-label="محاذاة النص">
    <ToggleGroupItem value="right" aria-label="يمين">…</ToggleGroupItem>
    <ToggleGroupItem value="center" aria-label="وسط">…</ToggleGroupItem>
    <ToggleGroupItem value="left" aria-label="يسار">…</ToggleGroupItem>
  </ToggleGroup>
</div>`,
        },
      ]}
      props={[
        { name: "type", type: '"single" | "multiple"', default: '"single"', description: "Selection mode. Multiple uses array values." },
        { name: "value", type: "string | string[]", default: "—", description: "Controlled pressed value(s). Empty string means nothing pressed in single mode." },
        { name: "defaultValue", type: "string | string[]", default: "—", description: "Uncontrolled initial pressed value(s)." },
        { name: "onValueChange", type: "(value: string | string[]) => void", default: "—", description: "Fires when the pressed value(s) change." },
        { name: "variant", type: '"default" | "outline"', default: '"default"', description: "Visual treatment, inherited by items." },
        { name: "size", type: '"default" | "sm" | "lg"', default: '"default"', description: "Item size, inherited by items." },
        { name: "spacing", type: '"none" | "sm" | "lg"', default: '"none"', description: "Gap between items. Spaced items get full rounding." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Layout direction and arrow-key axis." },
        { name: "disabled", type: "boolean", default: "false", description: "Disable the whole group or a single item." },
        { name: "value (item)", type: "string", default: "—", description: "Unique value identifying the item within the group." },
      ]}
      afterContent={<AfterContent />}
    />
  );
}
