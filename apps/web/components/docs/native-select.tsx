import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  DisabledNativeSelectDemo,
  GroupsDemo,
  InvalidNativeSelectDemo,
  RtlNativeSelectDemo,
  SimpleNativeSelectDemo,
  VsSelectDemo,
  WithGroupsDemo,
} from "@/components/docs/previews/native-select-preview";
import { NativeSelect } from "@workspace/ui/components/native-select";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { NativeSelect } from "@/components/ui/native-select"

export function Example() {
  const [value, setValue] = React.useState("");

  return (
    <NativeSelect value={value} onChange={(e) => setValue(e.target.value)}>
      <option value="" disabled hidden>Choose a role…</option>
      <option value="engineer">Engineer</option>
      <option value="designer">Designer</option>
    </NativeSelect>
  );
}`;

const compositionNote = (
  <div className="space-y-3">
    <p className="text-sm font-semibold">Composition</p>
    <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
      <p>
        A styled native select with an overlaid chevron — the OS picker on mobile, zero JavaScript
        for the popup. Group options with <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">NativeSelectGroup</code> and
        flag placeholder options disabled + hidden.
      </p>
    </div>
  </div>
);

export async function NativeSelectDocs() {
  const sourceCode =
    (await readComponentSource("native-select")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Native Select"
      description="A styled native select with grouped options, invalid and disabled states, and RTL — the OS picker on mobile, zero JavaScript."
      preview={
        <div className="flex flex-col items-center justify-center">
          <NativeSelect defaultValue="react">
            <option value="react">React</option>
            <option value="vue">Vue</option>
          </NativeSelect>
        </div>
      }
      previewCode={defaultCode}
      installPackageName="native-select"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/native-select.tsx"
      usageCode={defaultCode}
      usageNote={compositionNote}
      examples={[
        {
          title: "Simple",
          preview: <SimpleNativeSelectDemo />,
          code: `import { NativeSelect } from "@/components/ui/native-select"

const [value, setValue] = React.useState("");

<NativeSelect value={value} onChange={(e) => setValue(e.target.value)}>
  <option value="" disabled hidden>Choose a role…</option>
  <option value="engineer">Engineer</option>
  <option value="designer">Designer</option>
</NativeSelect>`,
        },
        {
          title: "With groups",
          preview: <WithGroupsDemo />,
          code: `import { NativeSelect, NativeSelectGroup } from "@/components/ui/native-select"

<NativeSelect>
  <NativeSelectGroup label="React ecosystem">
    <option value="react">React</option>
    <option value="next">Next.js</option>
  </NativeSelectGroup>
  <NativeSelectGroup label="Vue ecosystem">
    <option value="vue">Vue</option>
  </NativeSelectGroup>
</NativeSelect>`,
        },
        {
          title: "Groups",
          preview: <GroupsDemo />,
          code: `import { NativeSelect, NativeSelectGroup } from "@/components/ui/native-select"

// Whole groups and single options disable natively.
<NativeSelectGroup label="Backend" disabled>
  <option value="node">Node</option>
</NativeSelectGroup>`,
        },
        {
          title: "Disabled",
          preview: <DisabledNativeSelectDemo />,
          code: `import { NativeSelect } from "@/components/ui/native-select"

<NativeSelect disabled />`,
        },
        {
          title: "Invalid",
          preview: <InvalidNativeSelectDemo />,
          code: `import { NativeSelect } from "@/components/ui/native-select"

<NativeSelect invalid />
<p role="alert">Pick a framework to continue.</p>`,
        },
        {
          title: "Native Select vs Select",
          preview: <VsSelectDemo />,
          code: `import { NativeSelect } from "@/components/ui/native-select";
import { Select } from "@/components/ui/select";

// Native: OS picker, zero JS. Custom: full styling, JS popup.
<NativeSelect defaultValue="react">…</NativeSelect>
<Select defaultValue="react">…</Select>`,
        },
        {
          title: "RTL Native Select",
          preview: <RtlNativeSelectDemo />,
          code: `import { NativeSelect } from "@/components/ui/native-select";

<div dir="rtl">
  <NativeSelect>
    <option>مهندس</option>
  </NativeSelect>
</div>`,
        },
      ]}
      props={[
        { name: "invalid", type: "boolean", default: "false", description: "Error state with aria-invalid and destructive ring." },
        { name: "NativeSelectGroup", type: "optgroup element", description: "Labeled option group; supports native disabled." },
        { name: "NativeSelectOption", type: "option element", description: "Option with native disabled + hidden placeholder support." },
        { name: "className", type: "string", description: "Extra classes for the wrapper." },
      ]}
    />
  );
}
