import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  SelectAlignPreview,
  SelectCompositionPreview,
  SelectControlledPreview,
  SelectDisabledPreview,
  SelectGroupsPreview,
  SelectInvalidPreview,
  SelectPreview,
  SelectRtlPreview,
  SelectScrollablePreview,
  SelectSizesPreview,
} from "@/components/docs/previews/select-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"`;
const defaultCode = `<Select defaultValue="apple">
  <SelectTrigger>
    <SelectValue placeholder="Pick a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
  </SelectContent>
</Select>`;

export async function SelectDocs() {
  const sourceCode = (await readComponentSource("select")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Select"
      description="A custom dropdown with grouped items, check indicators, scroll buttons, typeahead, and full keyboard support — for when NativeSelect isn't enough."
      preview={<SelectPreview />}
      previewCode={defaultCode}
      installPackageName="select"
      installDependencies="@base-ui/react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/select.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Composition", preview: <SelectCompositionPreview />, code: defaultCode },
        {
          title: "Groups",
          preview: <SelectGroupsPreview />,
          code: `<SelectContent>\n  <SelectGroup>\n    <SelectGroupLabel>Fruits</SelectGroupLabel>\n    <SelectItem value="apple">Apple</SelectItem>\n  </SelectGroup>\n  <SelectSeparator />\n</SelectContent>`,
        },
        {
          title: "Scrollable",
          preview: <SelectScrollablePreview />,
          code: `<SelectContent>\n  {/* 20 items — chevron buttons appear at the edges */}\n  <SelectItem value="0">Item 1</SelectItem>\n</SelectContent>`,
        },
        {
          title: "Controlled",
          preview: <SelectControlledPreview />,
          code: `const [value, setValue] = useState("designer")\n<Select value={value} onValueChange={(v) => setValue(v as string)}>\n  <SelectTrigger>\n    <SelectValue placeholder="Pick a role" />\n  </SelectTrigger>\n</Select>`,
        },
        {
          title: "Sizes",
          preview: <SelectSizesPreview />,
          code: `<SelectTrigger size="sm">\n  <SelectValue />\n</SelectTrigger>`,
        },
        {
          title: "Invalid",
          preview: <SelectInvalidPreview />,
          code: `<SelectTrigger invalid>\n  <SelectValue placeholder="Required field…" />\n</SelectTrigger>`,
        },
        {
          title: "Disabled",
          preview: <SelectDisabledPreview />,
          code: `<Select disabled>\n  <SelectTrigger>\n    <SelectValue />\n  </SelectTrigger>\n</Select>`,
        },
        {
          title: "Align",
          preview: <SelectAlignPreview />,
          code: `<SelectContent align="start">…</SelectContent>\n<SelectContent align="end">…</SelectContent>`,
        },
        { title: "RTL", preview: <SelectRtlPreview />, code: `<div dir="rtl">\n  <Select>…</Select>\n</div>` },
      ]}
      props={[
        { name: "SelectTrigger · size", type: '"sm" | "default"', default: '"default"', description: "Trigger density." },
        { name: "SelectTrigger · invalid", type: "boolean", default: "false", description: "Destructive ring on the trigger." },
        { name: "SelectValue · placeholder", type: "ReactNode", description: "Gray hint when nothing is selected." },
        { name: "SelectContent", type: "Component", description: "Animated portal panel with edge scroll buttons. Props: align, side, sideOffset." },
        { name: "SelectItem", type: "Component", description: "Option with check indicator, typeahead, and disabled support." },
        { name: "SelectGroup / Label / Separator", type: "Component", description: "Section structure inside the panel." },
        { name: "value / onValueChange", type: "string / fn", description: "Controlled selection." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
