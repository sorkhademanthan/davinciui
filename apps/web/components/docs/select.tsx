import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  SelectPreview,
  SelectCompositionPreview,
  SelectAlignPreview,
  SelectGroupsPreview,
  SelectScrollablePreview,
  SelectDisabledPreview,
  SelectInvalidPreview,
  SelectRtlPreview,
} from "@/components/docs/previews/select-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Select, SelectItem, SelectGroup } from "@/components/ui/select"`;
const defaultCode = `<Select>
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
</Select>`;

export async function SelectDocs() {
  const sourceCode = (await readComponentSource("select")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Select"
      description="Displays a list of options for the user to pick from — triggered by a button."
      preview={<SelectPreview />}
      previewCode={defaultCode}
      installPackageName="select"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/select.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        { title: "Composition", preview: <SelectCompositionPreview />, code: `<Select>\n  <option>Option</option>\n</Select>` },
        { title: "Align Item With Trigger", preview: <SelectAlignPreview />, code: `<Select>\n  <option>Align Center</option>\n</Select>` },
        { title: "Groups", preview: <SelectGroupsPreview />, code: `<Select>\n  <optgroup label="Fruits">\n    <option>Apple</option>\n  </optgroup>\n</Select>` },
        { title: "Scrollable", preview: <SelectScrollablePreview />, code: `<Select>\n  {Array.from({length:20}).map(i=> <option>Item {i}</option>)}\n</Select>` },
        { title: "Disabled", preview: <SelectDisabledPreview />, code: `<Select disabled>\n  <option>Disabled</option>\n</Select>` },
        { title: "Invalid", preview: <SelectInvalidPreview />, code: `<Select invalid>\n  <option>Invalid</option>\n</Select>` },
        { title: "RTL", preview: <SelectRtlPreview />, code: `<div dir="rtl">\n  <Select><option>تفاحة</option></Select>\n</div>` },
      ]}
      props={[
        { name: "Select", type: "Component", description: "Root select element." },
        { name: "SelectItem", type: "Component", description: "Individual option." },
        { name: "SelectGroup", type: "Component", description: "Group of options (optgroup)." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the select." },
        { name: "invalid", type: "boolean", default: "false", description: "Marks as invalid." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
