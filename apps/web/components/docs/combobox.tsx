import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AutoHighlightDemo,
  BasicComboboxDemo,
  ChipsComboboxDemo,
  ClearButtonDemo,
  CustomItemsDemo,
  DisabledDemo,
  GroupsCollectionDemo,
  GroupsDemo,
  InputGroupDemo,
  InvalidDemo,
  MultipleMaxDemo,
  MultipleSelectionDemo,
  PopupDemo,
  RtlComboboxDemo,
  SimpleComboboxDemo,
} from "@/components/docs/previews/combobox-preview";
import { Combobox } from "@workspace/ui/components/combobox";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { Combobox } from "@/components/ui/combobox"

<Combobox
  items={[
    { value: "next", label: "Next.js" },
    { value: "react", label: "React" },
  ]}
  placeholder="Pick a framework…"
/>`;

const compositionNote = (
  <div className="space-y-3">
    <p className="text-sm font-semibold">Composition</p>
    <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
      <p>
        One control, composed through props. The text field, chips, clear button, popup, groups,
        and custom rows are all facets of the same component — no compound imports to wire.
      </p>
    </div>
  </div>
);

export async function ComboboxDocs() {
  const sourceCode =
    (await readComponentSource("combobox")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Combobox"
      description="An autocomplete dropdown with single and multiple selection, chips, grouped collections, custom rows, keyboard navigation, and RTL — dependency-free."
      preview={
        <div className="flex flex-col items-center justify-center">
          <Combobox
            items={[
              { value: "next", label: "Next.js" },
              { value: "react", label: "React" },
              { value: "vue", label: "Vue" },
            ]}
            placeholder="Pick a framework…"
          />
        </div>
      }
      previewCode={defaultCode}
      installPackageName="combobox"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/combobox.tsx"
      usageCode={defaultCode}
      usageNote={compositionNote}
      examples={[
        {
          title: "Simple",
          preview: <SimpleComboboxDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

<Combobox items={frameworks} placeholder="Pick a framework…" />`,
        },
        {
          title: "With chips",
          preview: <ChipsComboboxDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

const [value, setValue] = React.useState(["react", "vue"]);

<Combobox multiple items={frameworks} value={value} onValueChange={setValue} />`,
        },
        {
          title: "With groups and collection",
          preview: <GroupsCollectionDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

<Combobox
  groups={[
    { label: "Popular", items: topFive },
    { label: "Collection", items: allSixty },
  ]}
/>`,
        },
        {
          title: "Custom Items",
          preview: <CustomItemsDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

<Combobox
  items={frameworks}
  renderItem={(item, { selected }) => (
    <span className="flex items-center gap-2.5">
      <span className="size-2.5 rounded-full bg-sky-500" />
      <span className="flex-1">{item.label}</span>
      <span className="font-mono text-[11px] text-muted-foreground">
        {selected ? "active" : item.value}
      </span>
    </span>
  )}
/>`,
        },
        {
          title: "Multiple Selection",
          preview: <MultipleSelectionDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

const [value, setValue] = React.useState(["next"]);

<Combobox multiple items={frameworks} value={value} onValueChange={setValue} />`,
        },
        {
          title: "Basic",
          preview: <BasicComboboxDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

<label className="flex flex-col gap-1.5">
  <span className="text-sm font-medium">Framework</span>
  <Combobox items={frameworks} placeholder="Choose one…" />
</label>`,
        },
        {
          title: "Multiple",
          preview: <MultipleMaxDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

<Combobox multiple maxSelections={3} items={frameworks} />`,
        },
        {
          title: "Clear Button",
          preview: <ClearButtonDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

<Combobox items={frameworks} showClearButton />`,
        },
        {
          title: "Groups",
          preview: <GroupsDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

<Combobox
  groups={[
    { label: "React ecosystem", items: reactItems },
    { label: "Vue ecosystem", items: vueItems },
  ]}
/>`,
        },
        {
          title: "Invalid",
          preview: <InvalidDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

<Combobox items={frameworks} invalid placeholder="Required field…" />`,
        },
        {
          title: "Disabled",
          preview: <DisabledDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

<Combobox items={frameworks} disabled />`,
        },
        {
          title: "Auto Highlight",
          preview: <AutoHighlightDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

<Combobox items={frameworks} autoHighlight />`,
        },
        {
          title: "Popup",
          preview: <PopupDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

// Anchored panel: same width, scrollable, closes on Escape/outside.
<Combobox items={twentyItems} />`,
        },
        {
          title: "Input Group",
          preview: <InputGroupDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

<div className="relative w-72">
  <Search className="absolute start-2.5 ..." />
  <Combobox items={frameworks} inputClassName="ps-8 pe-12" />
  <kbd>⌘K</kbd>
</div>`,
        },
        {
          title: "RTL",
          preview: <RtlComboboxDemo />,
          code: `import { Combobox } from "@/components/ui/combobox"

<Combobox dir="rtl" items={arabicItems} placeholder="اختر…" />`,
        },
      ]}
      props={[
        { name: "items", type: "ComboboxItem[]", description: "Flat options. Ignored when groups is provided." },
        { name: "groups", type: "ComboboxGroup[]", description: "Grouped options with label headers." },
        { name: "multiple", type: "boolean", default: "false", description: "Multi-select with chips." },
        { name: "value", type: "string | string[] | null", default: "—", description: "Controlled selection." },
        { name: "defaultValue", type: "string | string[] | null", default: "null", description: "Uncontrolled initial selection." },
        { name: "onValueChange", type: "(value) => void", description: "Fires on every selection change." },
        { name: "inputValue", type: "string", default: "—", description: "Controlled filter text." },
        { name: "defaultInputValue", type: "string", default: '""', description: "Uncontrolled initial filter text." },
        { name: "onInputChange", type: "(value: string) => void", description: "Fires when the filter text changes." },
        { name: "open", type: "boolean", default: "—", description: "Controlled popup state." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Uncontrolled initial popup state." },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Fires when the popup opens or closes." },
        { name: "maxSelections", type: "number", description: "Cap for multiple mode." },
        { name: "placeholder", type: "string", default: '"Select…"', description: "Input placeholder." },
        { name: "emptyMessage", type: "React.ReactNode", default: '"No results found."', description: "Content for empty filter results." },
        { name: "disabled", type: "boolean", default: "false", description: "Disable the whole control." },
        { name: "invalid", type: "boolean", default: "false", description: "Error state with aria-invalid." },
        { name: "showClearButton", type: "boolean", default: "false", description: "Inline X that clears the selection." },
        { name: "autoHighlight", type: "boolean", default: "false", description: "Highlight the first match on open/type." },
        { name: "filterItems", type: "(items, query) => ComboboxItem[]", description: "Custom filter; defaults to contains-match." },
        { name: "renderItem", type: "(item, { selected, highlighted }) => ReactNode", description: "Custom option renderer." },
        { name: "dir", type: '"ltr" | "rtl"', default: '"ltr"', description: "Text direction." },
        { name: "className", type: "string", description: "Extra classes for the root." },
        { name: "inputClassName", type: "string", description: "Extra classes for the text input." },
      ]}
    />
  );
}
